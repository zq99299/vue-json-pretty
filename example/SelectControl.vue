<template>
  <div class="example-box">
    <div class="block">
      <h3>JSON:</h3>
      <textarea :class="{ 'dark-textarea': globalDarkModeState }" v-model="state.val"></textarea>

      <h3>Options:</h3>
      <div class="options">
        <div>
          <label>showIcon</label>
          <input v-model="state.showIcon" type="checkbox" />
        </div>
        <div>
          <label>selectableType</label>
          <select v-model="state.selectableType">
            <option>single</option>
            <option>multiple</option>
          </select>
        </div>
        <div>
          <label>showSelectController</label>
          <input v-model="state.showSelectController" type="checkbox" />
        </div>
        <div>
          <label>selectOnClickNode</label>
          <input v-model="state.selectOnClickNode" type="checkbox" />
        </div>
        <div>
          <label>rootPath</label>
          <input v-model="state.rootPath" type="text" />
        </div>
        <div>
          <label>showLength</label>
          <input v-model="state.showLength" type="checkbox" />
        </div>
        <div>
          <label>showLine</label>
          <input v-model="state.showLine" type="checkbox" />
        </div>
        <div>
          <label>showLineNumber</label>
          <input v-model="state.showLineNumber" type="checkbox" />
        </div>
        <div>
          <label>highlightSelectedNode</label>
          <input v-model="state.highlightSelectedNode" type="checkbox" />
        </div>
        <div>
          <label>collapsedOnClickBrackets</label>
          <input v-model="state.collapsedOnClickBrackets" type="checkbox" />
        </div>
        <div>
          <label>deep</label>
          <select v-model="state.deep">
            <option :value="2">2</option>
            <option :value="3">3</option>
            <option :value="4">4</option>
          </select>
        </div>
        <div>
          <label>theme</label>
          <select v-model="localDarkMode">
            <option value="light">light</option>
            <option value="dark">dark</option>
          </select>
        </div>
      </div>
      <h3>v-model:selectedValue:</h3>
      <div>{{ state.selectedValue }}</div>
      <h3>Current Node Click:</h3>
      <div>{{ state.node }}</div>
    </div>
    <div class="block">
      <h3>vue-json-pretty:</h3>
      <vue-json-pretty
        v-if="state.renderOK"
        ref="jsonTreeRef"
        v-model:selectedValue="state.selectedValue"
        :theme="localDarkMode"
        :data="state.data"
        :root-path="state.rootPath"
        :deep="state.deep"
        :show-double-quotes="true"
        :highlight-selected-node="state.highlightSelectedNode"
        :show-length="state.showLength"
        :show-line="state.showLine"
        :show-line-number="state.showLineNumber"
        :select-on-click-node="state.selectOnClickNode"
        :collapsed-on-click-brackets="state.collapsedOnClickBrackets"
        :node-selectable="node => typeof node.content !== 'number'"
        :selectable-type="state.selectableType"
        :show-select-controller="state.showSelectController"
        :show-icon="state.showIcon"
        @node-click="handleNodeClick"
        @node-mouseover="handleAll"
        @brackets-click="handleAll"
        @icon-click="handleAll"
        @selected-change="handleAll"
      >
        <template #renderNodeActions="{ node, expandFirstLevel, collapseFirstLevel, expandAll, collapseAll }">
          <div 
            v-if="state.selectedValue === node.path && hasCollapsibleChildren(node)" 
            class="node-actions-container" 
            style="margin-left: 12px;"
          >
            <button class="action-btn" @click.stop="expandFirstLevel()" title="只展开第 1 级子节点">
              📂 展开第 1 级
            </button>
            <button class="action-btn" @click.stop="expandAll()" title="展开所有子节点">
              📂 展开所有
            </button>
            <button class="action-btn" @click.stop="collapseFirstLevel()" title="只收缩第 1 级子节点">
              📁 收缩第 1 级
            </button>
            <button class="action-btn" @click.stop="collapseAll()" title="收缩所有子节点">
              📁 收缩所有
            </button>
            <div class="custom-depth-control">
              <input 
                v-model.number="state.customDepth" 
                type="number" 
                min="1" 
                max="10" 
                class="depth-input"
                placeholder="层级"
              />
              <button class="action-btn" @click.stop="handleExpandCustomDepth(node)" title="只展开指定层级的子节点">
                📂 展开第N级
              </button>
              <button class="action-btn" @click.stop="handleCollapseCustomDepth(node)" title="只收缩指定层级的子节点">
                📁 收缩第N级
              </button>
            </div>
          </div>
        </template>
      </vue-json-pretty>
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, watch, nextTick, ref } from 'vue';
import VueJsonPretty from 'src';
import { useDarkMode } from './useDarkMode';

const defaultData = {
  status: 200,
  text: '',
  error: null,
  config: undefined,
  data: [
    {
      news_id: 51184,
      title: 'iPhone X Review: Innovative future with real black technology',
      source: 'Netease phone',
    },
    {
      news_id: 51183,
      title:
        'Traffic paradise: How to design streets for people and unmanned vehicles in the future?',
      source: 'Netease smart',
      link: 'http://netease.smart/traffic-paradise/1235',
    },
    {
      news_id: 51182,
      title:
        "Teslamask's American Business Relations: The government does not pay billions to build factories",
      source: 'AI Finance',
      members: ['Daniel', 'Mike', 'John'],
    },
  ],
};

export default defineComponent({
  name: 'SelectControl',
  components: {
    VueJsonPretty,
  },
  setup() {
    const jsonTreeRef = ref();
    
    const state = reactive({
      renderOK: true,
      val: JSON.stringify(defaultData),
      data: defaultData,
      selectedValue: 'res.error',
      selectableType: 'single',
      showSelectController: true,
      showLength: false,
      showLine: true,
      showLineNumber: false,
      highlightSelectedNode: true,
      selectOnClickNode: true,
      collapsedOnClickBrackets: true,
      rootPath: 'res',
      deep: 3,
      node: '',
      showIcon: false,
      customDepth: 2,
    });

    const { localDarkMode, toggleLocalDarkMode, globalDarkModeState } = useDarkMode();

    const handleNodeClick = node => {
      state.node = node;
    };

    const handleAll = (...rest) => {
      // console.log('handleAll: ', rest);
    };

    const handleExpandCustomDepth = (node) => {
      const depth = state.customDepth || 2;
      jsonTreeRef.value?.expandAll(node.path, depth);
    };

    const handleCollapseCustomDepth = (node) => {
      const depth = state.customDepth || 2;
      jsonTreeRef.value?.collapseAll(node.path, depth);
    };

    const hasCollapsibleChildren = (node) => {
      if (node.type !== 'objectStart' && node.type !== 'arrayStart') {
        return false;
      }
      
      const childrenPaths = jsonTreeRef.value?.getChildrenPaths(node.path, 1) || [];
      return childrenPaths.length > 0;
    };

    watch(
      () => state.val,
      newVal => {
        try {
          state.data = JSON.parse(newVal);
        } catch (err) {
          // console.log('JSON ERROR');
        }
      },
    );

    watch(
      () => state.selectableType,
      async newVal => {
        state.renderOK = false;
        if (newVal === 'single') {
          state.selectedValue = 'res.error';
        } else if (newVal === 'multiple') {
          state.selectedValue = ['res.error', 'res.data[0].title'];
        }
        // Re-render because v-model:selectedValue format is different in case 2
        await nextTick();
        state.renderOK = true;
      },
    );

    return {
      state,
      jsonTreeRef,
      handleNodeClick,
      handleAll,
      handleExpandCustomDepth,
      handleCollapseCustomDepth,
      hasCollapsibleChildren,
      localDarkMode,
      toggleLocalDarkMode,
      globalDarkModeState,
    };
  },
});
</script>

<style scoped>
.node-actions-container {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.action-btn {
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f0f0f0;
  border-color: #999;
}

.dark-mode .action-btn {
  background: #333;
  border-color: #555;
  color: #fff;
}

.dark-mode .action-btn:hover {
  background: #444;
  border-color: #777;
}

.custom-depth-control {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid #ddd;
}

.depth-input {
  width: 60px;
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
}

.dark-mode .depth-input {
  background: #333;
  border-color: #555;
  color: #fff;
}
</style>
