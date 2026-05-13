import { defineComponent, reactive, computed, watch, ref as vueRef, PropType, CSSProperties } from 'vue';
import Brackets from 'src/components/Brackets';
import CheckController from 'src/components/CheckController';
import Carets from 'src/components/Carets';
import { getDataType, JSONFlattenReturnType, JSONDataType, stringToAutoType, createSearchRegex } from 'src/utils';
import { useClipboard } from 'src/hooks/useClipboard';
import './styles.less';

export interface NodeDataType extends JSONFlattenReturnType {
  id: number;
}

export interface NodeActions {
  copy: () => void;
  expandAll: (depth?: number, cascade?: boolean) => void;
  collapseAll: (depth?: number, cascade?: boolean) => void;
  expandFirstLevel: (cascade?: boolean) => void;
  collapseFirstLevel: (cascade?: boolean) => void;
  expandToLevel: (depth: number) => void;
  collapseToLevel: (depth: number) => void;
}

export interface RenderNodeActionsParams {
  node: NodeDataType;
  defaultActions: {
    copy: () => void;
  };
  expandAll: (depth?: number, cascade?: boolean) => void;
  collapseAll: (depth?: number, cascade?: boolean) => void;
  expandFirstLevel: (cascade?: boolean) => void;
  collapseFirstLevel: (cascade?: boolean) => void;
  expandToLevel: (depth: number) => void;
  collapseToLevel: (depth: number) => void;
}

// The props here will be exposed to the user through the topmost component.
export const treeNodePropsPass = {
  // JSONLike data.
  data: {
    type: [String, Number, Boolean, Array, Object] as PropType<JSONDataType>,
    default: null,
  },
  // Data root path.
  rootPath: {
    type: String,
    default: 'root',
  },
  indent: {
    type: Number,
    default: 2,
  },
  // Whether to display the length of (array|object).
  showLength: {
    type: Boolean,
    default: false,
  },
  // Whether the key name uses double quotes.
  showDoubleQuotes: {
    type: Boolean,
    default: true,
  },
  // Custom render for key.
  renderNodeKey: Function as PropType<
    (opt: { node: NodeDataType; defaultKey: string | JSX.Element; highlightText: (text: string) => (string | JSX.Element)[] }) => unknown
  >,
  // Custom render for value.
  renderNodeValue: Function as PropType<
    (opt: { node: NodeDataType; defaultValue: string | JSX.Element; highlightText: (text: string) => (string | JSX.Element)[] }) => unknown
  >,
  // Custom render for node actions.
  renderNodeActions: {
    type: [Boolean, Function] as PropType<
      boolean | ((opt: RenderNodeActionsParams) => unknown)
    >,
    default: undefined,
  },
  // Define the selection method supported by the data level, which is not available by default.
  selectableType: String as PropType<'multiple' | 'single' | ''>,
  // Whether to display the selection control.
  showSelectController: {
    type: Boolean,
    default: false,
  },
  // Whether to display the data level connection.
  showLine: {
    type: Boolean,
    default: true,
  },
  showLineNumber: {
    type: Boolean,
    default: false,
  },
  // Whether to trigger selection when clicking on the node.
  selectOnClickNode: {
    type: Boolean,
    default: true,
  },
  // When using the selectableType, define whether current path/content is enabled.
  nodeSelectable: {
    type: Function as PropType<(node: NodeDataType) => boolean>,
    default: (): boolean => true,
  },
  // Highlight current node when selected.
  highlightSelectedNode: {
    type: Boolean,
    default: true,
  },
  showIcon: {
    type: Boolean,
    default: false,
  },
  theme: {
    type: String as PropType<'light' | 'dark'>,
    default: 'light',
  },
  showKeyValueSpace: {
    type: Boolean,
    default: true,
  },
  editable: {
    type: Boolean,
    default: false,
  },
  editableTrigger: {
    type: String as PropType<'click' | 'dblclick' | 'custom'>,
    default: 'click',
  },
  editableInput: {
    type: Boolean,
    default: true,
  },
  editingPath: {
    type: String,
    default: '',
  },
  onNodeClick: {
    type: Function as PropType<(node: NodeDataType) => void>,
  },
  onNodeMouseover: {
    type: Function as PropType<(node: NodeDataType) => void>,
  },
  onBracketsClick: {
    type: Function as PropType<(collapsed: boolean, node: NodeDataType) => void>,
  },
  onIconClick: {
    type: Function as PropType<(collapsed: boolean, node: NodeDataType) => void>,
  },
  onValueChange: {
    type: Function as PropType<(value: boolean, path: string) => void>,
  },
};

export default defineComponent({
  name: 'TreeNode',

  props: {
    ...treeNodePropsPass,
    // Current node data.
    node: {
      type: Object as PropType<NodeDataType>,
      required: true,
    },
    // Whether the current node is collapsed.
    collapsed: Boolean,
    // Whether the current node is checked(When using the selection function).
    checked: Boolean,
    // Whether the current node is highlighted by search.
    isSearchHighlight: {
      type: Boolean,
      default: false,
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
    style: Object as PropType<CSSProperties>,
    onSelectedChange: {
      type: Function as PropType<(node: NodeDataType) => void>,
    },
  },

  emits: [
    'nodeClick',
    'nodeMouseover',
    'bracketsClick',
    'iconClick',
    'selectedChange',
    'valueChange',
    'expandAll',
    'collapseAll',
    'editingChange',
  ],

  setup(props, { emit }) {
    const dataType = computed<string>(() => getDataType(props.node.content));

    const valueClass = computed(() => `vjs-value vjs-value-${dataType.value}`);

    const prettyKey = computed(() =>
      props.showDoubleQuotes ? `"${props.node.key}"` : props.node.key,
    );

    const renderHighlightText = (text: string): (string | JSX.Element)[] => {
      const keyword = props.searchKeyword;
      if (!text || !keyword) return [text];

      const matchRegex = createSearchRegex(keyword, {
        caseSensitive: props.searchCaseSensitive,
        regex: props.searchRegex,
      });
      if (!matchRegex) return [text];

      const parts: (string | JSX.Element)[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      let keyIdx = 0;

      while ((match = matchRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(text.slice(lastIndex, match.index));
        }
        parts.push(
          <mark class="vjs-search-match" key={`m-${keyIdx++}`}>
            {match[0]}
          </mark>,
        );
        lastIndex = matchRegex.lastIndex;
        if (match[0].length === 0) matchRegex.lastIndex++;
      }

      if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
      }

      return parts.length > 0 ? parts : [text];
    };

    const renderKey = () => {
      const render = props.renderNodeKey;
      const keyText = prettyKey.value || '';

      if (render) {
        return render({
          node: props.node,
          defaultKey: keyText,
          highlightText: renderHighlightText,
        });
      }

      if (props.searchKeyword && keyText) {
        return renderHighlightText(keyText);
      }

      return keyText;
    };

    const isMultiple = computed(() => props.selectableType === 'multiple');

    const isSingle = computed(() => props.selectableType === 'single');

    // Whether the current node supports the selected function.
    const selectable = computed(
      () => props.nodeSelectable(props.node) && (isMultiple.value || isSingle.value),
    );

    const state = reactive({
      editing: false,
    });

    const handleInputChange = (e: Event) => {
      const source = (e.target as HTMLInputElement)?.value;
      const value = stringToAutoType(source);
      emit('valueChange', value, props.node.path);
    };

    const defaultValue = computed(() => {
      let value = props.node?.content;
      if (value === null) {
        value = 'null';
      } else if (value === undefined) {
        value = 'undefined';
      }
      return dataType.value === 'string' ? `"${value}"` : value + '';
    });

    const renderValue = () => {
      const render = props.renderNodeValue;

      if (render) {
        return render({
          node: props.node,
          defaultValue: defaultValue.value,
          highlightText: renderHighlightText,
        });
      }

      if (props.searchKeyword && defaultValue.value) {
        return renderHighlightText(defaultValue.value);
      }

      return defaultValue.value;
    };

    const handleBracketsClick = () => {
      emit('bracketsClick', !props.collapsed, props.node);
    };

    const handleIconClick = () => {
      emit('iconClick', !props.collapsed, props.node);
    };

    const handleSelectedChange = () => {
      emit('selectedChange', props.node);
    };

    const handleNodeClick = () => {
      emit('nodeClick', props.node);
      if (selectable.value && props.selectOnClickNode) {
        emit('selectedChange', props.node);
      }
    };

    const handleNodeMouseover = () => {
      emit('nodeMouseover', props.node);
    };

    let clickOutsideHandler: ((e: MouseEvent) => void) | null = null;
    const valueRef = vueRef<HTMLElement | null>(null);

    const enterEditMode = (currentTarget?: Element) => {
      if (!props.editable || state.editing) return;
      state.editing = true;
      emit('editingChange', props.node.path);

      const target = currentTarget || valueRef.value;
      clickOutsideHandler = (innerE: MouseEvent) => {
        if (target ? !target.contains(innerE.target as Node) : true) {
          exitEditMode();
        }
      };
      document.addEventListener('click', clickOutsideHandler);
    };

    const exitEditMode = () => {
      state.editing = false;
      emit('editingChange', '');
      if (clickOutsideHandler) {
        document.removeEventListener('click', clickOutsideHandler);
        clickOutsideHandler = null;
      }
    };

    const handleValueEdit = (e: MouseEvent) => {
      if (!props.editable) return;
      enterEditMode(e.currentTarget as Element);
    };

    watch(
      () => props.editingPath,
      (newPath) => {
        if (newPath === props.node.path && !state.editing) {
          enterEditMode();
        } else if (newPath !== props.node.path && state.editing) {
          exitEditMode();
        }
      },
    );

    const { copy } = useClipboard();

    const handleCopy = () => {
      const { key, path } = props.node;
      const rootPath = props.rootPath;
      const content = new Function('data', `return data${path.slice(rootPath.length)}`)(props.data);
      const copiedData = JSON.stringify(key ? { [key]: content } : content, null, 2);
      copy(copiedData);
    };

    const renderNodeActions = () => {
      const render = props.renderNodeActions;
      if (!render) return null;
      const defaultActions = {
        copy: handleCopy,
      };
      
      const nodeActions = {
        expandAll: (depth = Infinity, cascade = false) => emit('expandAll', props.node.path, depth, cascade),
        collapseAll: (depth = Infinity, cascade = false) => emit('collapseAll', props.node.path, depth, cascade),
        expandFirstLevel: (cascade = false) => emit('expandAll', props.node.path, 1, cascade),
        collapseFirstLevel: (cascade = false) => emit('collapseAll', props.node.path, 1, cascade),
        expandToLevel: (depth: number) => emit('expandAll', props.node.path, depth, true),
        collapseToLevel: (depth: number) => emit('collapseAll', props.node.path, depth, true),
      };
      
      return typeof render === 'function' ? (
        render({ 
          node: props.node, 
          defaultActions,
          ...nodeActions
        })
      ) : (
        <span onClick={handleCopy} class="vjs-tree-node-actions-item">
          copy
        </span>
      );
    };

    return () => {
      const { node } = props;

      return (
        <div
          class={{
            'vjs-tree-node': true,
            'has-selector': props.showSelectController,
            'has-carets': props.showIcon,
            'is-highlight': props.highlightSelectedNode && props.checked,
            'is-search-highlight': props.isSearchHighlight,
            dark: props.theme === 'dark',
          }}
          onClick={handleNodeClick}
          onMouseover={handleNodeMouseover}
          style={props.style}
        >
          {props.showLineNumber && <span class="vjs-node-index">{node.id + 1}</span>}

          {props.showSelectController &&
            selectable.value &&
            node.type !== 'objectEnd' &&
            node.type !== 'arrayEnd' && (
              <CheckController
                isMultiple={isMultiple.value}
                checked={props.checked}
                onChange={handleSelectedChange}
              />
            )}

          <div class="vjs-indent">
            {Array.from(Array(node.level)).map((item, index) => (
              <div
                key={index}
                class={{
                  'vjs-indent-unit': true,
                  'has-line': props.showLine,
                }}
              >
                {Array.from(Array(props.indent)).map(() => (
                  <>&nbsp;</>
                ))}
              </div>
            ))}
            {props.showIcon && <Carets nodeType={node.type} onClick={handleIconClick} />}
          </div>

          {node.key && (
            <span class="vjs-key">
              {renderKey()}
              <span class="vjs-colon">{`:${props.showKeyValueSpace ? ' ' : ''}`}</span>
            </span>
          )}

          <span>
            {node.type !== 'content' && node.content ? (
              <Brackets data={node.content.toString()} onClick={handleBracketsClick} />
            ) : (
              <span
                ref={valueRef}
                class={valueClass.value}
                onClick={
                  props.editable && props.editableTrigger === 'click'
                    ? handleValueEdit
                    : undefined
                }
                onDblclick={
                  props.editable && props.editableTrigger === 'dblclick'
                    ? handleValueEdit
                    : undefined
                }
              >
                {props.editable && props.editableInput && state.editing ? (
                  <input
                    value={defaultValue.value}
                    onChange={handleInputChange}
                    style={{
                      padding: '3px 8px',
                      border: '1px solid #eee',
                      boxShadow: 'none',
                      boxSizing: 'border-box',
                      borderRadius: 5,
                      fontFamily: 'inherit',
                    }}
                  />
                ) : (
                  renderValue()
                )}
              </span>
            )}

            {node.showComma && <span>{','}</span>}

            {props.showLength && props.collapsed && (
              <span class="vjs-comment"> // {node.length} items </span>
            )}
          </span>

          {props.renderNodeActions && (
            <span class="vjs-tree-node-actions">{renderNodeActions()}</span>
          )}
        </div>
      );
    };
  },
});
