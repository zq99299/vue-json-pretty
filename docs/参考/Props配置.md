# Props 配置参考

## 概述

@zhuqiang/vue-json-pretty 组件提供了丰富的配置选项，允许您自定义 JSON 数据的展示方式、交互行为和外观。

## 速查表

### 基础配置

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| [data](#data-v-model) | JSONDataType | 是 | - | 要渲染的 JSON 数据 |
| [rootPath](#rootpath) | string | 否 | `'root'` | 根节点路径名称 |
| [indent](#indent) | number | 否 | `2` | 缩进空格数 |

### 显示配置

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| [showLine](#showline) | boolean | 否 | `true` | 是否显示连接线 |
| [showLineNumber](#showlinenumber) | boolean | 否 | `false` | 是否显示行号 |
| [showIcon](#showicon) | boolean | 否 | `false` | 是否显示图标 |
| [showDoubleQuotes](#showdoublequotes) | boolean | 否 | `true` | 是否显示键的双引号 |
| [showLength](#showlength) | boolean | 否 | `false` | 折叠时是否显示长度 |
| [theme](#theme) | `'light' \| 'dark'` | 否 | `'light'` | 主题模式 |

### 折叠配置

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| [deep](#deep) | number | 否 | `Infinity` | 展开深度 |
| [collapsedNodeLength](#collapsednodelength) | number | 否 | `Infinity` | 折叠阈值 |
| [collapsedOnClickBrackets](#collapsedonclickbrackets) | boolean | 否 | `true` | 点击括号是否可折叠 |

### 虚拟滚动配置

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| [virtual](#virtual) | boolean | 否 | `false` | 是否启用虚拟滚动 |
| [height](#height) | number | 否 | `400` | 虚拟滚动高度 |
| [itemHeight](#itemheight) | number | 否 | `20` | 节点高度 |
| [dynamicHeight](#dynamicheight) | boolean | 否 | `true` | 是否动态高度 |

### 选择功能配置

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| [selectedValue](#selectedvalue-v-model) | string \| string[] | 否 | - | 选中的路径 |
| [selectableType](#selectabletype) | `'multiple' \| 'single'` | 否 | - | 选择类型 |
| [showSelectController](#showselectcontroller) | boolean | 否 | `false` | 是否显示选择器 |
| [selectOnClickNode](#selectonclicknode) | boolean | 否 | `true` | 点击节点是否触发选择 |
| [highlightSelectedNode](#highlightselectednode) | boolean | 否 | `true` | 是否高亮选中节点 |
| [nodeSelectable](#nodeselectable) | (node: NodeData) => boolean | 否 | - | 节点是否可选 |

### 编辑功能配置

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| [editable](#editable) | boolean | 否 | `false` | 是否可编辑 |
| [editableTrigger](#editabletrigger) | `'click' \| 'dblclick' \| 'custom'` | 否 | `'click'` | 触发编辑的方式 |
| [editableInput](#editableinput) | boolean | 否 | `true` | 编辑模式下是否显示内置输入框 |

### 自定义渲染配置

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| [renderNodeKey](#rendernodekey) | Function | 否 | - | 自定义渲染节点键 |
| [renderNodeValue](#rendernodevalue) | Function | 否 | - | 自定义渲染节点值 |
| [renderNodeActions](#rendernodeactions) | boolean \| Function | 否 | `false` | 自定义渲染节点操作 |

## 基础配置

### data (v-model)

**类型**：`JSONDataType`

**必填**：是

**默认值**：无

**说明**：要渲染的 JSON 数据对象。注意不是 JSON 字符串，而是 JavaScript 对象或数组。

**示例**：
```vue
<template>
  <vue-json-pretty :data="jsonData" />
</template>

<script setup>
import { ref } from 'vue';

const jsonData = ref({
  name: '@zhuqiang/vue-json-pretty',
  version: '2.0.0',
  features: ['tree', 'select', 'edit']
});
</script>
```

---

### rootPath

**类型**：`string`

**必填**：否

**默认值**：`'root'`

**说明**：定义最顶层数据路径的名称。

**示例**：
```vue
<template>
  <!-- 默认显示为 root -->
  <vue-json-pretty :data="data" />
  
  <!-- 自定义显示为 response -->
  <vue-json-pretty :data="data" root-path="response" />
  
  <!-- 自定义显示为 data -->
  <vue-json-pretty :data="data" root-path="data" />
</template>
```

---

### indent

**类型**：`number`

**必填**：否

**默认值**：`2`

**说明**：缩进的空格数。

**示例**：
```vue
<template>
  <!-- 使用 2 个空格缩进（默认） -->
  <vue-json-pretty :data="data" :indent="2" />
  
  <!-- 使用 4 个空格缩进 -->
  <vue-json-pretty :data="data" :indent="4" />
  
  <!-- 不使用缩进 -->
  <vue-json-pretty :data="data" :indent="0" />
</template>
```

---

## 显示配置

### showLine

**类型**：`boolean`

**必填**：否

**默认值**：`true`

**说明**：是否展示连接线。

**示例**：
```vue
<template>
  <!-- 显示连接线（默认） -->
  <vue-json-pretty :data="data" :show-line="true" />
  
  <!-- 不显示连接线 -->
  <vue-json-pretty :data="data" :show-line="false" />
</template>
```

---

### showLineNumber

**类型**：`boolean`

**必填**：否

**默认值**：`false`

**说明**：是否展示行号。

**示例**：
```vue
<template>
  <!-- 显示行号 -->
  <vue-json-pretty :data="data" :show-line-number="true" />
</template>
```

---

### showIcon

**类型**：`boolean`

**必填**：否

**默认值**：`false`

**说明**：是否展示图标。

**示例**：
```vue
<template>
  <!-- 显示图标 -->
  <vue-json-pretty :data="data" :show-icon="true" />
</template>
```

---

### showDoubleQuotes

**类型**：`boolean`

**必填**：否

**默认值**：`true`

**说明**：是否展示 key 名的双引号。

**示例**：
```vue
<template>
  <!-- 显示双引号（默认） -->
  <vue-json-pretty :data="data" :show-double-quotes="true" />
  
  <!-- 不显示双引号 -->
  <vue-json-pretty :data="data" :show-double-quotes="false" />
</template>
```

---

### showLength

**类型**：`boolean`

**必填**：否

**默认值**：`false`

**说明**：在数据折叠的时候是否展示长度。

**示例**：
```vue
<template>
  <!-- 折叠时显示长度 -->
  <vue-json-pretty 
    :data="data" 
    :show-length="true"
    :collapsed-node-length="2"
  />
</template>
```

---

### theme

**类型**：`'light' | 'dark'`

**必填**：否

**默认值**：`'light'`

**说明**：主题模式。

**示例**：
```vue
<template>
  <!-- 亮色主题（默认） -->
  <vue-json-pretty :data="data" theme="light" />
  
  <!-- 暗色主题 -->
  <vue-json-pretty :data="data" theme="dark" />
</template>
```

---

## 折叠配置

### deep

**类型**：`number`

**必填**：否

**默认值**：`Infinity`

**说明**：深度，大于该深度的节点将被折叠。

**示例**：
```vue
<template>
  <!-- 只展开前 2 层 -->
  <vue-json-pretty :data="data" :deep="2" />
  
  <!-- 只展开前 3 层 -->
  <vue-json-pretty :data="data" :deep="3" />
  
  <!-- 展开所有层级（默认） -->
  <vue-json-pretty :data="data" :deep="Infinity" />
</template>
```

---

### collapsedNodeLength

**类型**：`number`

**必填**：否

**默认值**：`Infinity`

**说明**：长度大于此阈值的对象或数组将被折叠。

**示例**：
```vue
<template>
  <!-- 子元素超过 5 个时折叠 -->
  <vue-json-pretty :data="data" :collapsed-node-length="5" />
  
  <!-- 子元素超过 10 个时折叠 -->
  <vue-json-pretty :data="data" :collapsed-node-length="10" />
</template>
```

---

### collapsedOnClickBrackets

**类型**：`boolean`

**必填**：否

**默认值**：`true`

**说明**：是否支持点击括号折叠。

**示例**：
```vue
<template>
  <!-- 点击括号可折叠（默认） -->
  <vue-json-pretty :data="data" :collapsed-on-click-brackets="true" />
  
  <!-- 点击括号不可折叠 -->
  <vue-json-pretty :data="data" :collapsed-on-click-brackets="false" />
</template>
```

---

## 虚拟滚动配置

### virtual

**类型**：`boolean`

**必填**：否

**默认值**：`false`

**说明**：是否使用虚拟滚动（大数据量时推荐）。

**示例**：
```vue
<template>
  <!-- 启用虚拟滚动 -->
  <vue-json-pretty 
    :data="largeData" 
    :virtual="true"
    :height="600"
  />
</template>
```

---

### height

**类型**：`number`

**必填**：否

**默认值**：`400`

**说明**：使用虚拟滚动时，定义总高度（单位：像素）。

**示例**：
```vue
<template>
  <vue-json-pretty 
    :data="largeData" 
    :virtual="true"
    :height="800"
  />
</template>
```

---

### itemHeight

**类型**：`number`

**必填**：否

**默认值**：`20`

**说明**：使用虚拟滚动时，定义节点高度（可为预估值）。

**示例**：
```vue
<template>
  <vue-json-pretty 
    :data="largeData" 
    :virtual="true"
    :item-height="24"
  />
</template>
```

---

### dynamicHeight

**类型**：`boolean`

**必填**：否

**默认值**：`true`

**说明**：使用虚拟滚动时，是否开启每一行可为动态高度。

**示例**：
```vue
<template>
  <vue-json-pretty 
    :data="largeData" 
    :virtual="true"
    :dynamic-height="true"
  />
</template>
```

---

## 选择功能配置

### selectedValue (v-model)

**类型**：`string | string[]`

**必填**：否

**默认值**：无

**说明**：双向绑定选中的数据路径。单选时为字符串，多选时为数组。

**示例**：
```vue
<template>
  <vue-json-pretty 
    v-model:selected-value="selectedPath"
    :data="data"
    selectable-type="single"
  />
</template>

<script setup>
import { ref } from 'vue';

// 单选模式
const selectedPath = ref('root.user.name');

// 多选模式
// const selectedPaths = ref(['root.user.name', 'root.user.age']);
</script>
```

---

### selectableType

**类型**：`'multiple' | 'single'`

**必填**：否

**默认值**：无

**说明**：定义选择功能类型。不设置则无选择功能。

**示例**：
```vue
<template>
  <!-- 单选模式 -->
  <vue-json-pretty 
    :data="data"
    selectable-type="single"
    v-model:selected-value="selectedPath"
  />
  
  <!-- 多选模式 -->
  <vue-json-pretty 
    :data="data"
    selectable-type="multiple"
    v-model:selected-value="selectedPaths"
  />
</template>
```

---

### showSelectController

**类型**：`boolean`

**必填**：否

**默认值**：`false`

**说明**：是否展示选择器。

**示例**：
```vue
<template>
  <vue-json-pretty 
    :data="data"
    selectable-type="multiple"
    :show-select-controller="true"
  />
</template>
```

---

### selectOnClickNode

**类型**：`boolean`

**必填**：否

**默认值**：`true`

**说明**：是否支持点击节点的时候触发选择。

**示例**：
```vue
<template>
  <!-- 点击节点触发选择（默认） -->
  <vue-json-pretty 
    :data="data"
    selectable-type="single"
    :select-on-click-node="true"
  />
  
  <!-- 点击节点不触发选择 -->
  <vue-json-pretty 
    :data="data"
    selectable-type="single"
    :select-on-click-node="false"
  />
</template>
```

---

### highlightSelectedNode

**类型**：`boolean`

**必填**：否

**默认值**：`true`

**说明**：是否支持高亮已选择节点。

**示例**：
```vue
<template>
  <!-- 高亮已选择节点（默认） -->
  <vue-json-pretty 
    :data="data"
    selectable-type="single"
    :highlight-selected-node="true"
  />
</template>
```

---

### nodeSelectable

**类型**：`(node: NodeData) => boolean`

**必填**：否

**默认值**：无

**说明**：定义哪些数据节点可以被选择。返回 `true` 表示可选，`false` 表示不可选。

**示例**：
```vue
<template>
  <vue-json-pretty 
    :data="data"
    selectable-type="single"
    :node-selectable="isNodeSelectable"
  />
</template>

<script setup>
// 只允许选择字符串类型的节点
const isNodeSelectable = (node) => {
  return typeof node.content === 'string';
};

// 只允许选择特定路径的节点
const isNodeSelectable = (node) => {
  return node.path.includes('user');
};

// 不允许选择数字类型的节点
const isNodeSelectable = (node) => {
  return typeof node.content !== 'number';
};
</script>
```

---

## 编辑功能配置

### editable

**类型**：`boolean`

**必填**：否

**默认值**：`false`

**说明**：是否支持可编辑。

**示例**：
```vue
<template>
  <vue-json-pretty 
    :data="data"
    :editable="true"
    @update:data="handleUpdate"
  />
</template>

<script setup>
import { ref } from 'vue';

const data = ref({ name: 'test' });

const handleUpdate = (newData) => {
  console.log('数据已更新：', newData);
  data.value = newData;
};
</script>
```

---

### editableTrigger

**类型**：`'click' | 'dblclick' | 'custom'`

**必填**：否

**默认值**：`'click'`

**说明**：触发编辑的时机。

| 值 | 说明 |
|------|------|
| `'click'` | 单击节点值触发编辑（默认） |
| `'dblclick'` | 双击节点值触发编辑 |
| `'custom'` | 不绑定内置触发事件，通过 API（`startEdit`/`stopEdit`）编程控制编辑 |

**示例**：
```vue
<template>
  <!-- 单击触发编辑（默认） -->
  <vue-json-pretty 
    :data="data"
    :editable="true"
    editable-trigger="click"
  />
  
  <!-- 双击触发编辑 -->
  <vue-json-pretty 
    :data="data"
    :editable="true"
    editable-trigger="dblclick"
  />

  <!-- 自定义触发：通过 API 控制编辑 -->
  <vue-json-pretty 
    ref="jsonTreeRef"
    :data="data"
    :editable="true"
    editable-trigger="custom"
  />
</template>

<script setup>
import { ref } from 'vue';

const jsonTreeRef = ref();

// 通过 API 进入编辑模式
const handleEdit = (path) => {
  jsonTreeRef.value?.startEdit(path);
};

// 通过 API 退出编辑模式
const handleStopEdit = () => {
  jsonTreeRef.value?.stopEdit();
};
</script>
```

**注意事项**：

- 使用 `renderNodeValue` 插槽渲染链接等交互元素时，内置触发器（`click`/`dblclick`）会拦截点击事件，导致链接无法正常导航
- 如果需要链接等交互元素正常工作，请使用 `editableTrigger="custom"` 配合 API 控制编辑

---

### editableInput

**类型**：`boolean`

**必填**：否

**默认值**：`true`

**说明**：编辑模式下是否显示内置输入框。

| 值 | 说明 |
|------|------|
| `true` | 编辑模式下显示内置输入框（默认） |
| `false` | 编辑模式下不显示内置输入框，由外部自定义编辑 UI |

**示例**：
```vue
<template>
  <!-- 使用内置输入框（默认） -->
  <vue-json-pretty 
    :data="data"
    :editable="true"
    :editable-input="true"
  />

  <!-- 禁用内置输入框，使用自定义编辑 UI -->
  <vue-json-pretty 
    ref="jsonTreeRef"
    :data="data"
    :editable="true"
    editable-trigger="custom"
    :editable-input="false"
  >
    <template #renderNodeValue="{ node, defaultValue }">
      <span>{{ defaultValue }}</span>
      <span class="edit-icon" @click.stop="handleEditClick(node)">✎</span>
    </template>
  </vue-json-pretty>

  <!-- 自定义编辑面板 -->
  <div v-if="editingPath" class="edit-panel">
    <input v-model="editValue" @keyup.enter="handleSave" />
    <button @click="handleSave">保存</button>
    <button @click="handleCancel">取消</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const jsonTreeRef = ref();
const editingPath = ref('');
const editValue = ref('');

const handleEditClick = (node) => {
  editingPath.value = node.path;
  editValue.value = String(node.content);
  jsonTreeRef.value?.startEdit(node.path);
};

const handleSave = () => {
  jsonTreeRef.value?.updateValue(editingPath.value, editValue.value);
  handleCancel();
};

const handleCancel = () => {
  jsonTreeRef.value?.stopEdit();
  editingPath.value = '';
};
</script>
```

**注意事项**：

- `editableInput` 仅在 `editable` 为 `true` 时生效
- 当 `editableInput` 为 `false` 时，需要通过 `updateValue(path, value)` API 更新数据
- 通常与 `editableTrigger="custom"` 配合使用，实现完全自定义的编辑体验

---

## 自定义渲染配置

### renderNodeKey

**类型**：`(opt: { node: NodeData, defaultKey: VNode }) => VNode`

**必填**：否

**默认值**：无

**说明**：自定义渲染节点键。也可使用 `#renderNodeKey` 插槽。

**示例**：
```vue
<template>
  <!-- 使用函数方式 -->
  <vue-json-pretty 
    :data="data"
    :render-node-key="renderKey"
  />
  
  <!-- 使用插槽方式 -->
  <vue-json-pretty :data="data">
    <template #renderNodeKey="{ node, defaultKey }">
      <span class="custom-key">{{ node.key }}</span>
    </template>
  </vue-json-pretty>
</template>

<script setup>
import { h } from 'vue';

const renderKey = ({ node, defaultKey }) => {
  // 自定义渲染逻辑
  return h('span', { class: 'custom-key' }, node.key);
};
</script>
```

---

### renderNodeValue

**类型**：`(opt: { node: NodeData, defaultValue: VNode }) => VNode`

**必填**：否

**默认值**：无

**说明**：自定义渲染节点值。也可使用 `#renderNodeValue` 插槽。

**示例**：
```vue
<template>
  <!-- 使用函数方式 -->
  <vue-json-pretty 
    :data="data"
    :render-node-value="renderValue"
  />
  
  <!-- 使用插槽方式 -->
  <vue-json-pretty :data="data">
    <template #renderNodeValue="{ node, defaultValue }">
      <span v-if="isUrl(node.content)" class="url-link">
        {{ node.content }}
      </span>
      <span v-else>{{ defaultValue }}</span>
    </template>
  </vue-json-pretty>
</template>

<script setup>
const isUrl = (value) => {
  return typeof value === 'string' && value.startsWith('http');
};

const renderValue = ({ node, defaultValue }) => {
  // 自定义渲染逻辑
};
</script>
```

---

### renderNodeActions

**类型**：`boolean | ((opt: { node: NodeData, defaultActions: { copy: () => void } }) => VNode)`

**必填**：否

**默认值**：`false`

**说明**：自定义渲染节点操作。设为 `true` 显示默认操作按钮，或使用函数/插槽自定义。

**示例**：
```vue
<template>
  <!-- 显示默认操作按钮 -->
  <vue-json-pretty 
    :data="data"
    :render-node-actions="true"
  />
  
  <!-- 使用插槽自定义操作 -->
  <vue-json-pretty :data="data">
    <template #renderNodeActions="{ node, copy }">
      <button @click="copy">📋 复制</button>
    </template>
  </vue-json-pretty>
</template>
```

---

## 完整配置示例

```vue
<template>
  <vue-json-pretty
    v-model:data="data"
    v-model:selected-value="selectedPath"
    
    :root-path="response"
    :indent="2"
    :deep="3"
    :collapsed-node-length="10"
    
    :show-line="true"
    :show-line-number="true"
    :show-icon="true"
    :show-double-quotes="true"
    :show-length="true"
    theme="light"
    
    :virtual="false"
    :height="600"
    :item-height="20"
    :dynamic-height="true"
    
    :selectable-type="single"
    :show-select-controller="false"
    :select-on-click-node="true"
    :highlight-selected-node="true"
    :node-selectable="isNodeSelectable"
    
    :editable="false"
    editable-trigger="click"
    
    :collapsed-on-click-brackets="true"
    
    @node-click="handleNodeClick"
    @update:data="handleDataUpdate"
  >
    <template #renderNodeValue="{ node, defaultValue }">
      <span v-if="isUrl(node.content)" class="url-link">
        {{ node.content }}
      </span>
      <span v-else>{{ defaultValue }}</span>
    </template>
  </vue-json-pretty>
</template>

<script setup>
import { ref } from 'vue';

const data = ref({ /* ... */ });
const selectedPath = ref('');

const isNodeSelectable = (node) => {
  return typeof node.content === 'string';
};

const handleNodeClick = (node) => {
  console.log('点击节点：', node);
};

const handleDataUpdate = (newData) => {
  console.log('数据更新：', newData);
};
</script>
```

## 相关文档

- [Events 事件](Events事件.md) - 组件事件说明
- [Slots 插槽](Slots插槽.md) - 插槽使用说明
- [DataStructures 数据结构](DataStructures数据结构.md) - NodeData 类型说明
