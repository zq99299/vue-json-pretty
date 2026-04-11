# Events 事件参考

## 概述

@zhuqiang/vue-json-pretty 组件提供了多个事件，用于响应用户交互和数据变化。

## 速查表

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| [nodeClick](#nodeclick) | 点击节点时触发 | (node: NodeData) => void |
| [nodeMouseover](#nodemouseover) | 鼠标悬浮在节点上时触发 | (node: NodeData) => void |
| [bracketsClick](#bracketsclick) | 点击括号时触发 | (collapsed: boolean, node: NodeData) => void |
| [iconClick](#iconclick) | 点击图标时触发 | (collapsed: boolean, node: NodeData) => void |
| [selectedChange](#selectedchange) | 选中值发生变化时触发 | (newVal: string \| string[], oldVal: string \| string[]) => void |
| [update:data](#updatedata) | 数据更新时触发（可编辑模式） | (newData: JSONDataType) => void |

## 事件列表

### nodeClick

点击节点时触发。

#### 签名

```typescript
(node: NodeData) => void
```

#### 参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| node | NodeData | 被点击的节点数据 |

#### 示例

```vue
<template>
  <vue-json-pretty 
    :data="data"
    @node-click="handleNodeClick"
  />
</template>

<script setup>
const handleNodeClick = (node) => {
  console.log('点击的节点路径：', node.path);
  console.log('节点类型：', node.type);
  console.log('节点内容：', node.content);
  console.log('节点层级：', node.level);
};
</script>
```

#### 使用场景

- 记录用户操作日志
- 实现节点详情展示
- 触发其他组件的联动

---

### nodeMouseover

鼠标悬浮在节点上时触发。

#### 签名

```typescript
(node: NodeData) => void
```

#### 参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| node | NodeData | 鼠标悬浮的节点数据 |

#### 示例

```vue
<template>
  <vue-json-pretty 
    :data="data"
    @node-mouseover="handleNodeMouseover"
  />
</template>

<script setup>
const handleNodeMouseover = (node) => {
  console.log('悬浮节点：', node.path);
  
  // 显示节点提示信息
  showTooltip(node);
};
</script>
```

#### 使用场景

- 显示节点详细信息提示
- 高亮相关节点
- 预览节点内容

---

### bracketsClick

点击括号（`{`、`}`、`[`、`]`）时触发。

#### 签名

```typescript
(collapsed: boolean, node: NodeData) => void
```

#### 参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| collapsed | boolean | 是否折叠。<br>`true`: 节点被折叠<br>`false`: 节点被展开 |
| node | NodeData | 被点击的节点数据 |

#### 示例

```vue
<template>
  <vue-json-pretty 
    :data="data"
    @brackets-click="handleBracketsClick"
  />
</template>

<script setup>
const handleBracketsClick = (collapsed, node) => {
  if (collapsed) {
    console.log('节点被折叠：', node.path);
  } else {
    console.log('节点被展开：', node.path);
  }
  
  // 记录用户操作
  logUserAction({
    action: collapsed ? 'collapse' : 'expand',
    nodePath: node.path
  });
};
</script>
```

#### 使用场景

- 记录折叠/展开操作
- 同步多个组件的展开状态
- 实现自定义折叠逻辑

---

### iconClick

点击图标时触发。

#### 签名

```typescript
(collapsed: boolean, node: NodeData) => void
```

#### 参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| collapsed | boolean | 是否折叠。<br>`true`: 节点被折叠<br>`false`: 节点被展开 |
| node | NodeData | 被点击的节点数据 |

#### 示例

```vue
<template>
  <vue-json-pretty 
    :data="data"
    :show-icon="true"
    @icon-click="handleIconClick"
  />
</template>

<script setup>
const handleIconClick = (collapsed, node) => {
  console.log('点击图标，节点：', node.path);
  console.log('折叠状态：', collapsed);
};
</script>
```

#### 使用场景

- 自定义图标交互
- 记录用户操作
- 实现特殊展开逻辑

---

### selectedChange

选中值发生变化时触发。

#### 签名

```typescript
(newVal: string | string[], oldVal: string | string[]) => void
```

#### 参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| newVal | string \| string[] | 新选中的值。<br>单选模式：字符串路径<br>多选模式：字符串数组 |
| oldVal | string \| string[] | 旧选中的值 |

#### 示例

```vue
<template>
  <!-- 单选模式 -->
  <vue-json-pretty 
    :data="data"
    selectable-type="single"
    @selected-change="handleSelectedChange"
  />
  
  <!-- 多选模式 -->
  <vue-json-pretty 
    :data="data"
    selectable-type="multiple"
    @selected-change="handleSelectedChangeMultiple"
  />
</template>

<script setup>
// 单选模式
const handleSelectedChange = (newVal, oldVal) => {
  console.log('新选中：', newVal);
  console.log('旧选中：', oldVal);
};

// 多选模式
const handleSelectedChangeMultiple = (newVal, oldVal) => {
  console.log('新选中：', newVal); // ['root.user.name', 'root.user.age']
  console.log('旧选中：', oldVal);
  
  // 计算新增和移除的选项
  const added = newVal.filter(path => !oldVal.includes(path));
  const removed = oldVal.filter(path => !newVal.includes(path));
  
  console.log('新增：', added);
  console.log('移除：', removed);
};
</script>
```

#### 使用场景

- 同步选中状态到其他组件
- 实现批量操作
- 记录用户选择

---

### update:data

数据更新时触发（当 `editable` 为 `true` 时）。

#### 签名

```typescript
(newData: JSONDataType) => void
```

#### 参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| newData | JSONDataType | 更新后的数据 |

#### 示例

```vue
<template>
  <vue-json-pretty 
    v-model:data="data"
    :editable="true"
    @update:data="handleDataUpdate"
  />
</template>

<script setup>
import { ref } from 'vue';

const data = ref({
  name: 'test',
  age: 25
});

const handleDataUpdate = (newData) => {
  console.log('数据已更新：', newData);
  
  // 保存到服务器
  saveToServer(newData);
  
  // 或使用 v-model:data 自动更新
  // data.value = newData;
};
</script>
```

#### 使用场景

- 保存编辑后的数据
- 数据验证
- 同步数据到服务器

---

## 完整示例

### 示例 1：记录所有用户操作

```vue
<template>
  <vue-json-pretty
    :data="data"
    :show-icon="true"
    selectable-type="single"
    @node-click="handleNodeClick"
    @node-mouseover="handleNodeMouseover"
    @brackets-click="handleBracketsClick"
    @icon-click="handleIconClick"
    @selected-change="handleSelectedChange"
  />
</template>

<script setup>
import { ref } from 'vue';

const data = ref({ /* ... */ });
const logs = ref([]);

const addLog = (action, details) => {
  logs.value.push({
    timestamp: new Date().toISOString(),
    action,
    details
  });
};

const handleNodeClick = (node) => {
  addLog('click', { path: node.path, type: node.type });
};

const handleNodeMouseover = (node) => {
  addLog('mouseover', { path: node.path });
};

const handleBracketsClick = (collapsed, node) => {
  addLog('bracketsClick', { 
    path: node.path, 
    collapsed 
  });
};

const handleIconClick = (collapsed, node) => {
  addLog('iconClick', { 
    path: node.path, 
    collapsed 
  });
};

const handleSelectedChange = (newVal, oldVal) => {
  addLog('selectedChange', { 
    newVal, 
    oldVal 
  });
};
</script>
```

### 示例 2：实现节点详情面板

```vue
<template>
  <div class="json-viewer-container">
    <vue-json-pretty
      :data="data"
      @node-click="handleNodeClick"
    />
    
    <div class="detail-panel" v-if="selectedNode">
      <h3>节点详情</h3>
      <p><strong>路径：</strong>{{ selectedNode.path }}</p>
      <p><strong>类型：</strong>{{ selectedNode.type }}</p>
      <p><strong>层级：</strong>{{ selectedNode.level }}</p>
      <p><strong>内容：</strong>{{ selectedNode.content }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const data = ref({ /* ... */ });
const selectedNode = ref(null);

const handleNodeClick = (node) => {
  selectedNode.value = node;
};
</script>

<style scoped>
.json-viewer-container {
  display: flex;
  gap: 20px;
}

.detail-panel {
  flex: 0 0 300px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
```

### 示例 3：同步多个组件的展开状态

```vue
<template>
  <div class="container">
    <vue-json-pretty
      :data="data1"
      @brackets-click="handleBracketsClick"
    />
    
    <vue-json-pretty
      :data="data2"
      @brackets-click="handleBracketsClick"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const data1 = ref({ /* ... */ });
const data2 = ref({ /* ... */ });

const handleBracketsClick = (collapsed, node) => {
  // 同步两个组件的展开状态
  console.log('同步展开状态：', node.path, collapsed);
  
  // 可以通过 ref 调用方法同步状态
  // jsonTreeRef1.value?.expandAll(node.path);
  // jsonTreeRef2.value?.expandAll(node.path);
};
</script>
```

### 示例 4：实现搜索高亮

```vue
<template>
  <div>
    <input 
      v-model="searchKeyword" 
      placeholder="搜索..."
      @input="handleSearch"
    />
    
    <vue-json-pretty
      :data="data"
      @node-click="handleNodeClick"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const data = ref({ /* ... */ });
const searchKeyword = ref('');

const handleSearch = () => {
  // 实现搜索逻辑
};

const handleNodeClick = (node) => {
  // 如果节点内容包含搜索关键字，高亮显示
  if (
    searchKeyword.value && 
    String(node.content).includes(searchKeyword.value)
  ) {
    console.log('找到匹配节点：', node.path);
  }
};
</script>
```

## 注意事项

### 1. 事件触发顺序

当用户点击节点时，事件触发顺序为：
1. `nodeClick` - 点击节点
2. `selectedChange` - 如果启用了选择功能

### 2. 性能考虑

- `nodeMouseover` 事件触发频率较高，避免在其中执行耗时操作
- 对于大数据量，建议使用防抖或节流

### 3. 事件冲突

- 如果同时监听 `nodeClick` 和 `bracketsClick`，点击括号时会触发两个事件
- 可以通过判断 `node.type` 来区分

## 相关文档

- [Props 配置](Props配置.md) - 组件属性配置
- [DataStructures 数据结构](DataStructures数据结构.md) - NodeData 类型说明
- [Methods 方法](Methods方法.md) - 通过 ref 调用的方法
