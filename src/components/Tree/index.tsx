import {
  defineComponent,
  reactive,
  computed,
  watchEffect,
  watch,
  ref,
  PropType,
  CSSProperties,
  nextTick,
} from 'vue';
import TreeNode, { treeNodePropsPass, NodeDataType } from 'src/components/TreeNode';
import { emitError, jsonFlatten, cloneDeep } from 'src/utils';
import './styles.less';

export interface SearchResult {
  path: string;
  nodeIndex: number;
  matchType: 'key' | 'value' | 'path';
  content: string;
  level: number;
}

export interface SearchOptions {
  keyword: string;
  caseSensitive?: boolean;
  regex?: boolean;
  searchIn?: ('key' | 'value' | 'path')[];
}

export interface TreeExposeMethods {
  expandAll: (path?: string, depth?: number, cascade?: boolean) => void;
  collapseAll: (path?: string, depth?: number, cascade?: boolean) => void;
  getChildrenPaths: (path: string, depth?: number, cascade?: boolean) => string[];
  search: (options: SearchOptions) => SearchResult[];
  clearSearch: () => void;
  scrollToResult: (result: SearchResult) => void;
  scrollToNextResult: () => SearchResult | null;
  scrollToPrevResult: () => SearchResult | null;
}

export default defineComponent({
  name: 'Tree',

  props: {
    ...treeNodePropsPass,
    collapsedNodeLength: {
      type: Number,
      default: Infinity,
    },
    // Define the depth of the tree, nodes greater than this depth will not be expanded.
    deep: {
      type: Number,
      default: Infinity,
    },
    pathCollapsible: {
      type: Function as PropType<(node: NodeDataType) => boolean>,
      default: (): boolean => false,
    },
    // Whether to use virtual scroll, usually applied to big data.
    virtual: {
      type: Boolean,
      default: false,
    },
    // When using virtual scroll, set the height of tree.
    height: {
      type: Number,
      default: 400,
    },
    // When using virtual scroll without dynamicHeight, define the height of each row.
    itemHeight: {
      type: Number,
      default: 20,
    },
    // Enable dynamic row heights for virtual scroll.
    dynamicHeight: {
      type: Boolean,
      default: true,
    },
    // When there is a selection function, define the selected path.
    // For multiple selections, it is an array ['root.a','root.b'], for single selection, it is a string of 'root.a'.
    selectedValue: {
      type: [String, Array] as PropType<string | string[]>,
      default: () => '',
    },
    // Collapsed control.
    collapsedOnClickBrackets: {
      type: Boolean,
      default: true,
    },
    style: Object as PropType<CSSProperties>,
    onSelectedChange: {
      type: Function as PropType<(newVal: string | string[], oldVal: string | string[]) => void>,
    },
    theme: {
      type: String as PropType<'light' | 'dark'>,
      default: 'light',
    },
    searchKeyword: {
      type: String,
      default: '',
    },
    searchCaseSensitive: {
      type: Boolean,
      default: false,
    },
    searchRegex: {
      type: Boolean,
      default: false,
    },
    highlightSearchResult: {
      type: Boolean,
      default: true,
    },
  },

  slots: ['renderNodeKey', 'renderNodeValue', 'renderNodeActions'],

  emits: [
    'nodeClick',
    'nodeMouseover',
    'bracketsClick',
    'iconClick',
    'selectedChange',
    'update:selectedValue',
    'update:data',
    'searchResultChange',
  ],

  setup(props, { emit, slots, expose }) {
    const treeRef = ref<HTMLElement>();

    const originFlatData = computed(() => jsonFlatten(props.data, props.rootPath));

    const initHiddenPaths = (deep: number, collapsedNodeLength: number) => {
      return originFlatData.value.reduce((acc, item) => {
        const doCollapse = item.level >= deep || item.length >= collapsedNodeLength;
        const pathComparison = props.pathCollapsible?.(item as NodeDataType);
        if (
          (item.type === 'objectStart' || item.type === 'arrayStart') &&
          (doCollapse || pathComparison)
        ) {
          return {
            ...acc,
            [item.path]: 1,
          };
        }
        return acc;
      }, {}) as Record<string, 1>;
    };

    const state = reactive({
      translateY: 0,
      visibleData: null as NodeDataType[] | null,
      hiddenPaths: initHiddenPaths(props.deep, props.collapsedNodeLength),
      startIndex: 0,
      endIndex: 0,
      searchResults: [] as SearchResult[],
      currentResultIndex: -1,
      highlightedPath: '',
    });

    // Dynamic height bookkeeping
    // heights[i] is the measured height of row i in the current flatData (or estimated if not measured yet)
    // offsets[i] is the cumulative offset before row i (offsets[0] = 0, offsets[length] = totalHeight)
    let heights: number[] = [];
    let offsets: number[] = [];
    const totalHeight = ref(0);
    const rowRefs: Record<number, HTMLElement | null> = {};
    const OVERSCAN_COUNT = 5;

    const initDynamicHeights = (length: number) => {
      heights = Array(length)
        .fill(0)
        .map(() => props.itemHeight || 20);
      offsets = new Array(length + 1);
      offsets[0] = 0;
      for (let i = 0; i < length; i++) {
        offsets[i + 1] = offsets[i] + heights[i];
      }
      totalHeight.value = offsets[length] || 0;
    };

    const recomputeOffsetsFrom = (start: number) => {
      const length = heights.length;
      if (start < 0) start = 0;
      if (start > length) start = length;
      for (let i = start; i < length; i++) {
        offsets[i + 1] = offsets[i] + heights[i];
      }
      totalHeight.value = offsets[length] || 0;
    };

    const setRowRef = (index: number, el: HTMLElement | null) => {
      if (el) {
        rowRefs[index] = el;
      } else {
        delete rowRefs[index];
      }
    };

    const lowerBound = (arr: number[], target: number) => {
      // first index i where arr[i] >= target
      let lo = 0;
      let hi = arr.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    };

    const findStartIndexByScrollTop = (scrollTop: number) => {
      // largest i such that offsets[i] <= scrollTop
      const i = lowerBound(offsets, scrollTop + 0.0001); // epsilon to handle exact matches
      return Math.max(0, Math.min(i - 1, heights.length - 1));
    };

    const findEndIndexByViewport = (scrollTop: number, viewportHeight: number) => {
      const target = scrollTop + viewportHeight;
      const i = lowerBound(offsets, target);
      return Math.max(0, Math.min(i + 1, heights.length));
    };

    const flatData = computed(() => {
      let startHiddenItem: null | NodeDataType = null;
      const data = [];
      const length = originFlatData.value.length;
      for (let i = 0; i < length; i++) {
        const cur = originFlatData.value[i];
        const item = {
          ...cur,
          id: i,
        };
        const isHidden = state.hiddenPaths[item.path];
        if (startHiddenItem && startHiddenItem.path === item.path) {
          const isObject = startHiddenItem.type === 'objectStart';
          const mergeItem = {
            ...item,
            ...startHiddenItem,
            showComma: item.showComma,
            content: isObject ? '{...}' : '[...]',
            type: isObject ? 'objectCollapsed' : 'arrayCollapsed',
          } as NodeDataType;
          startHiddenItem = null;
          data.push(mergeItem);
        } else if (isHidden && !startHiddenItem) {
          startHiddenItem = item;
          continue;
        } else {
          if (startHiddenItem) continue;
          else data.push(item);
        }
      }
      return data;
    });

    const selectedPaths = computed(() => {
      const value = props.selectedValue;
      if (value && props.selectableType === 'multiple' && Array.isArray(value)) {
        return value;
      }
      return [value];
    });

    const propsErrorMessage = computed(() => {
      const error = props.selectableType && !props.selectOnClickNode && !props.showSelectController;
      return error
        ? 'When selectableType is not null, selectOnClickNode and showSelectController cannot be false at the same time, because this will cause the selection to fail.'
        : '';
    });

    const listHeight = computed(() => {
      if (props.dynamicHeight) {
        return totalHeight.value || 0;
      }
      return flatData.value.length * props.itemHeight;
    });

    const updateVisibleData = () => {
      const flatDataValue = flatData.value;
      if (!flatDataValue) return;
      if (props.virtual) {
        const scrollTop = treeRef.value?.scrollTop || 0;

        if (props.dynamicHeight) {
          // Ensure dynamic arrays are initialized and consistent with data length
          if (heights.length !== flatDataValue.length) {
            initDynamicHeights(flatDataValue.length);
          }

          const start = findStartIndexByScrollTop(scrollTop);
          const endNoOverscan = findEndIndexByViewport(scrollTop, props.height);
          const startWithOverscan = Math.max(0, start - OVERSCAN_COUNT);
          const endWithOverscan = Math.min(flatDataValue.length, endNoOverscan + OVERSCAN_COUNT);

          state.startIndex = startWithOverscan;
          state.endIndex = endWithOverscan;
          state.translateY = offsets[startWithOverscan] || 0;
          state.visibleData = flatDataValue.slice(startWithOverscan, endWithOverscan);

          // Measure after render and update heights/offets if needed
          nextTick().then(() => {
            let changed = false;
            for (let i = state.startIndex; i < state.endIndex; i++) {
              const el = rowRefs[i];
              if (!el) continue;
              const h = el.offsetHeight;
              if (h && heights[i] !== h) {
                heights[i] = h;
                // Update offsets from i forward
                offsets[i + 1] = offsets[i] + heights[i];
                recomputeOffsetsFrom(i + 1);
                changed = true;
              }
            }
            if (changed) {
              // Recalculate slice based on new offsets
              updateVisibleData();
            }
          });
        } else {
          const visibleCount = props.height / props.itemHeight;
          const scrollCount = Math.floor(scrollTop / props.itemHeight);
          let start =
            scrollCount < 0
              ? 0
              : scrollCount + visibleCount > flatDataValue.length
              ? flatDataValue.length - visibleCount
              : scrollCount;
          if (start < 0) {
            start = 0;
          }
          const end = start + visibleCount;
          state.translateY = start * props.itemHeight;
          state.startIndex = start;
          state.endIndex = end;
          state.visibleData = flatDataValue.slice(start, end);
        }
      } else {
        state.translateY = 0;
        state.startIndex = 0;
        state.endIndex = flatDataValue.length;
        state.visibleData = flatDataValue;
      }
    };

    let rafId: number | null = null;
    const handleTreeScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        updateVisibleData();
      });
    };

    const handleSelectedChange = ({ path }: NodeDataType) => {
      const type = props.selectableType;
      if (type === 'multiple') {
        const index = selectedPaths.value.findIndex(item => item === path);
        const newVal = [...selectedPaths.value];
        if (index !== -1) {
          newVal.splice(index, 1);
        } else {
          newVal.push(path);
        }
        emit('update:selectedValue', newVal);
        emit('selectedChange', newVal, [...selectedPaths.value]);
      } else if (type === 'single') {
        if (selectedPaths.value[0] !== path) {
          const [oldVal] = selectedPaths.value;
          const newVal = path;
          emit('update:selectedValue', newVal);
          emit('selectedChange', newVal, oldVal);
        }
      }
    };

    const handleNodeClick = (node: NodeDataType) => {
      emit('nodeClick', node);
    };

    const handleNodeMouseover = (node: NodeDataType) => {
      emit('nodeMouseover', node);
    };

    const updateCollapsedPaths = (collapsed: boolean, path: string) => {
      if (collapsed) {
        state.hiddenPaths = {
          ...state.hiddenPaths,
          [path]: 1,
        };
      } else {
        const newPaths = { ...state.hiddenPaths };
        delete newPaths[path];
        state.hiddenPaths = newPaths;
      }
    };

    const handleBracketsClick = (collapsed: boolean, node: NodeDataType) => {
      if (props.collapsedOnClickBrackets) {
        updateCollapsedPaths(collapsed, node.path);
      }
      emit('bracketsClick', collapsed, node);
    };

    const handleIconClick = (collapsed: boolean, node: NodeDataType) => {
      updateCollapsedPaths(collapsed, node.path);
      emit('iconClick', collapsed, node);
    };

    const handleValueChange = (value: unknown, path: string) => {
      const newData = cloneDeep(props.data);
      const rootPath = props.rootPath;
      new Function('data', 'val', `data${path.slice(rootPath.length)}=val`)(newData, value);
      emit('update:data', newData);
    };

    const getChildrenPaths = (path: string, depth = Infinity, cascade = false): string[] => {
      const children: string[] = [];
      const originData = originFlatData.value;
      
      const parentNode = originData.find(item => item.path === path);
      if (!parentNode) return children;
      
      const parentLevel = parentNode.level;
      
      if (depth === Infinity) {
        for (let i = 0; i < originData.length; i++) {
          const item = originData[i];
          
          if (
            (item.path.startsWith(path + '.') || item.path.startsWith(path + '[')) &&
            item.path !== path &&
            (item.type === 'objectStart' || item.type === 'arrayStart')
          ) {
            children.push(item.path);
          }
        }
      } else if (cascade) {
        const maxLevel = parentLevel + depth;
        
        for (let i = 0; i < originData.length; i++) {
          const item = originData[i];
          
          if (
            (item.path.startsWith(path + '.') || item.path.startsWith(path + '[')) &&
            item.path !== path &&
            (item.type === 'objectStart' || item.type === 'arrayStart') &&
            item.level <= maxLevel
          ) {
            children.push(item.path);
          }
        }
      } else {
        const targetLevel = parentLevel + depth;
        
        for (let i = 0; i < originData.length; i++) {
          const item = originData[i];
          
          if (
            (item.path.startsWith(path + '.') || item.path.startsWith(path + '[')) &&
            item.path !== path &&
            (item.type === 'objectStart' || item.type === 'arrayStart') &&
            item.level === targetLevel
          ) {
            children.push(item.path);
          }
        }
      }
      
      return children;
    };

    const expandAll = (path?: string, depth = Infinity, cascade = false) => {
      if (!path) {
        state.hiddenPaths = {};
        return;
      }

      const childrenPaths = getChildrenPaths(path, depth, cascade);
      const newHiddenPaths = { ...state.hiddenPaths };
      
      childrenPaths.forEach(childPath => {
        delete newHiddenPaths[childPath];
      });
      
      state.hiddenPaths = newHiddenPaths;
    };

    const collapseAll = (path?: string, depth = Infinity, cascade = false) => {
      if (!path) {
        state.hiddenPaths = initHiddenPaths(props.deep, props.collapsedNodeLength);
        return;
      }

      const childrenPaths = getChildrenPaths(path, depth, cascade);
      const newHiddenPaths = { ...state.hiddenPaths };
      
      childrenPaths.forEach(childPath => {
        newHiddenPaths[childPath] = 1;
      });
      
      state.hiddenPaths = newHiddenPaths;
    };

    const getParentPaths = (path: string): string[] => {
      const paths: string[] = [];
      const parts: string[] = [];
      
      let current = '';
      let i = 0;
      
      while (i < path.length) {
        const char = path[i];
        
        if (char === '.') {
          if (current) {
            parts.push(current);
          }
          current = '';
          i++;
        } else if (char === '[') {
          if (current) {
            parts.push(current);
          }
          current = '';
          let j = i + 1;
          while (j < path.length && path[j] !== ']') {
            j++;
          }
          const index = path.slice(i + 1, j);
          parts.push(`[${index}]`);
          i = j + 1;
        } else {
          current += char;
          i++;
        }
      }
      
      if (current) {
        parts.push(current);
      }
      
      let buildPath = '';
      for (let k = 0; k < parts.length - 1; k++) {
        const part = parts[k];
        if (part.startsWith('[')) {
          buildPath += part;
        } else {
          buildPath = buildPath ? `${buildPath}.${part}` : part;
        }
        if (buildPath) {
          paths.push(buildPath);
        }
      }
      
      return paths;
    };

    const expandToNode = (path: string) => {
      const parentPaths = getParentPaths(path);
      const newHiddenPaths = { ...state.hiddenPaths };
      
      parentPaths.forEach(parentPath => {
        delete newHiddenPaths[parentPath];
      });
      
      state.hiddenPaths = newHiddenPaths;
    };

    const matchKeyword = (text: string, options: SearchOptions): boolean => {
      if (!text || !options.keyword) return false;
      
      const { keyword, caseSensitive = false, regex = false } = options;
      
      try {
        if (regex) {
          const flags = caseSensitive ? 'g' : 'gi';
          const pattern = new RegExp(keyword, flags);
          return pattern.test(String(text));
        } else {
          const searchText = caseSensitive ? String(text) : String(text).toLowerCase();
          const searchKeyword = caseSensitive ? keyword : keyword.toLowerCase();
          return searchText.includes(searchKeyword);
        }
      } catch {
        return false;
      }
    };

    const search = (options: SearchOptions): SearchResult[] => {
      const { keyword, searchIn = ['key', 'value'] } = options;
      
      if (!keyword) {
        state.searchResults = [];
        state.currentResultIndex = -1;
        state.highlightedPath = '';
        return [];
      }
      
      const results: SearchResult[] = [];
      const originData = originFlatData.value;
      
      for (let i = 0; i < originData.length; i++) {
        const item = originData[i];
        
        if (searchIn.includes('key') && item.key && matchKeyword(item.key, options)) {
          results.push({
            path: item.path,
            nodeIndex: i,
            matchType: 'key',
            content: item.key,
            level: item.level,
          });
        }
        
        if (searchIn.includes('value') && item.content !== null && item.content !== undefined) {
          const contentStr = item.type === 'content' ? String(item.content) : '';
          if (contentStr && matchKeyword(contentStr, options)) {
            results.push({
              path: item.path,
              nodeIndex: i,
              matchType: 'value',
              content: contentStr,
              level: item.level,
            });
          }
        }
        
        if (searchIn.includes('path') && matchKeyword(item.path, options)) {
          results.push({
            path: item.path,
            nodeIndex: i,
            matchType: 'path',
            content: item.path,
            level: item.level,
          });
        }
      }
      
      state.searchResults = results;
      state.currentResultIndex = results.length > 0 ? 0 : -1;
      
      if (results.length > 0) {
        scrollToResult(results[0]);
      } else {
        state.highlightedPath = '';
      }
      
      return results;
    };

    const clearSearch = () => {
      state.searchResults = [];
      state.currentResultIndex = -1;
      state.highlightedPath = '';
    };

    const scrollToResult = (result: SearchResult) => {
      expandToNode(result.path);
      
      const attemptScroll = (attempts: number) => {
        if (attempts > 10) return;
        
        if (props.virtual && props.dynamicHeight) {
          if (heights.length !== flatData.value.length) {
            initDynamicHeights(flatData.value.length);
          }
        }
        
        let targetIndex = -1;
        for (let i = 0; i < flatData.value.length; i++) {
          if (flatData.value[i].path === result.path) {
            targetIndex = i;
            break;
          }
        }
        
        if (targetIndex === -1) {
          setTimeout(() => attemptScroll(attempts + 1), 50);
          return;
        }
        
        state.highlightedPath = result.path;
        
        if (props.virtual) {
          let scrollPosition: number;
          
          if (props.dynamicHeight) {
            if (heights.length !== flatData.value.length) {
              initDynamicHeights(flatData.value.length);
            }
            scrollPosition = offsets[targetIndex] || 0;
          } else {
            scrollPosition = targetIndex * props.itemHeight;
          }
          
          if (treeRef.value) {
            const viewportHeight = props.height;
            const maxScroll = Math.max(0, (props.dynamicHeight ? totalHeight.value : flatData.value.length * props.itemHeight) - viewportHeight);
            const finalScroll = Math.min(scrollPosition - viewportHeight / 3, maxScroll);
            treeRef.value.scrollTo({
              top: Math.max(0, finalScroll),
              behavior: 'smooth',
            });
          }
        } else {
          const element = rowRefs[targetIndex];
          if (element && treeRef.value) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
        
        updateVisibleData();
      };
      
      nextTick(() => {
        setTimeout(() => attemptScroll(0), 50);
      });
    };

    const scrollToNextResult = (): SearchResult | null => {
      if (state.searchResults.length === 0) return null;
      
      state.currentResultIndex = (state.currentResultIndex + 1) % state.searchResults.length;
      const result = state.searchResults[state.currentResultIndex];
      scrollToResult(result);
      return result;
    };

    const scrollToPrevResult = (): SearchResult | null => {
      if (state.searchResults.length === 0) return null;
      
      state.currentResultIndex = state.currentResultIndex === 0 
        ? state.searchResults.length - 1 
        : state.currentResultIndex - 1;
      const result = state.searchResults[state.currentResultIndex];
      scrollToResult(result);
      return result;
    };

    watchEffect(() => {
      if (propsErrorMessage.value) {
        emitError(propsErrorMessage.value);
      }
    });

    watchEffect(() => {
      if (flatData.value) {
        if (props.virtual && props.dynamicHeight) {
          if (heights.length !== flatData.value.length) {
            initDynamicHeights(flatData.value.length);
          }
        }
        updateVisibleData();
      }
    });

    // Re-initialize dynamic height arrays when data shape changes significantly
    watch(
      () => [props.dynamicHeight, props.itemHeight, originFlatData.value.length],
      () => {
        if (props.virtual && props.dynamicHeight) {
          initDynamicHeights(flatData.value.length);
          nextTick(updateVisibleData);
        }
      },
    );

    watch(
      () => props.deep,
      val => {
        if (val) state.hiddenPaths = initHiddenPaths(val, props.collapsedNodeLength);
      },
    );

    watch(
      () => props.collapsedNodeLength,
      val => {
        if (val) state.hiddenPaths = initHiddenPaths(props.deep, val);
      },
    );

    watch(
      () => props.searchKeyword,
      (keyword) => {
        if (keyword) {
          const results = search({
            keyword,
            caseSensitive: props.searchCaseSensitive,
            regex: props.searchRegex,
          });
          emit('searchResultChange', results);
        } else {
          clearSearch();
          emit('searchResultChange', []);
        }
      },
    );

    expose({
      expandAll,
      collapseAll,
      getChildrenPaths,
      search,
      clearSearch,
      scrollToResult,
      scrollToNextResult,
      scrollToPrevResult,
    });

    return () => {
      const renderNodeKey = props.renderNodeKey ?? slots.renderNodeKey;
      const renderNodeValue = props.renderNodeValue ?? slots.renderNodeValue;
      const renderNodeActions = props.renderNodeActions ?? slots.renderNodeActions ?? false;

      const nodeContent = state.visibleData?.map((item, localIndex) => {
        const globalIndex = state.startIndex + localIndex;
        return (
          <div key={item.id} ref={el => setRowRef(globalIndex, (el as HTMLElement) || null)}>
            <TreeNode
              data={props.data}
              rootPath={props.rootPath}
              indent={props.indent}
              node={item}
              collapsed={!!state.hiddenPaths[item.path]}
              theme={props.theme}
              showDoubleQuotes={props.showDoubleQuotes}
              showLength={props.showLength}
              checked={selectedPaths.value.includes(item.path)}
              selectableType={props.selectableType}
              showLine={props.showLine}
              showLineNumber={props.showLineNumber}
              showSelectController={props.showSelectController}
              selectOnClickNode={props.selectOnClickNode}
              nodeSelectable={props.nodeSelectable}
              highlightSelectedNode={props.highlightSelectedNode}
              editable={props.editable}
              editableTrigger={props.editableTrigger}
              showIcon={props.showIcon}
              showKeyValueSpace={props.showKeyValueSpace}
              renderNodeKey={renderNodeKey}
              renderNodeValue={renderNodeValue}
              renderNodeActions={renderNodeActions}
              onNodeClick={handleNodeClick}
              onNodeMouseover={handleNodeMouseover}
              onBracketsClick={handleBracketsClick}
              onIconClick={handleIconClick}
              onSelectedChange={handleSelectedChange}
              onValueChange={handleValueChange}
              onExpandAll={(path: string, depth: number, cascade: boolean) => expandAll(path, depth, cascade)}
              onCollapseAll={(path: string, depth: number, cascade: boolean) => collapseAll(path, depth, cascade)}
              isSearchHighlight={state.highlightedPath === item.path}
              class={props.dynamicHeight ? 'dynamic-height' : undefined}
              style={
                props.dynamicHeight
                  ? {}
                  : props.itemHeight && props.itemHeight !== 20
                  ? { lineHeight: `${props.itemHeight}px` }
                  : {}
              }
            />
          </div>
        );
      });

      return (
        <div
          ref={treeRef}
          class={{
            'vjs-tree': true,
            'is-virtual': props.virtual,
            dark: props.theme === 'dark',
          }}
          onScroll={props.virtual ? handleTreeScroll : undefined}
          style={
            props.showLineNumber
              ? {
                  paddingLeft: `${Number(originFlatData.value.length.toString().length) * 12}px`,
                  ...props.style,
                }
              : props.style
          }
        >
          {props.virtual ? (
            <div class="vjs-tree-list" style={{ height: `${props.height}px` }}>
              <div class="vjs-tree-list-holder" style={{ height: `${listHeight.value}px` }}>
                <div
                  class="vjs-tree-list-holder-inner"
                  style={{ transform: `translateY(${state.translateY}px)` }}
                >
                  {nodeContent}
                </div>
              </div>
            </div>
          ) : (
            nodeContent
          )}
        </div>
      );
    };
  },
});
