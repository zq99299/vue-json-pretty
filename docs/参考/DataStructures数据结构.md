# Data Structures 数据结构参考

## 概述

本文档详细说明 @zhuqiang/vue-json-pretty 组件中使用的所有数据结构和类型定义。这些类型用于事件回调、插槽参数和方法参数。

## NodeData

节点数据类型，用于事件回调和插槽参数。

### 类型定义

```typescript
interface NodeData {
  id: number;
  key?: string;
  index?: number;
  path: string;
  level: number;
  type: NodeType;
  content: string | number | null | boolean;
  length: number;
  showComma: boolean;
}
```

### 属性说明

| 属性名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| id | number | 节点唯一标识，由组件内部生成 | `5` |
| key | string \| undefined | 节点键名（对象属性），数组元素时为 undefined | `'name'` |
| index | number \| undefined | 数组索引，对象属性时为 undefined | `0` |
| path | string | 节点完整路径，用于定位节点 | `'root.data[0].name'` |
| level | number | 节点层级，从 0 开始计数 | `2` |
| type | NodeType | 节点类型，详见 NodeType | `'content'` |
| content | string \| number \| null \| boolean | 节点内容值 | `'Alice'` |
| length | number | 子元素数量（对象属性数或数组长度） | `3` |
| showComma | boolean | 是否在节点后显示逗号 | `true` |

### 使用示例

```javascript
// 对象属性节点
{
  id: 5,
  key: 'name',
  index: undefined,
  path: 'root.user.name',
  level: 2,
  type: 'content',
  content: 'Alice',
  length: 1,
  showComma: true
}

// 数组元素节点
{
  id: 10,
  key: undefined,
  index: 0,
  path: 'root.items[0]',
  level: 2,
  type: 'content',
  content: 'Item 1',
  length: 1,
  showComma: true
}

// 对象开始节点
{
  id: 3,
  key: 'user',
  index: undefined,
  path: 'root.user',
  level: 1,
  type: 'objectStart',
  content: null,
  length: 3,  // 对象有 3 个属性
  showComma: false
}

// 数组开始节点
{
  id: 8,
  key: 'items',
  index: undefined,
  path: 'root.items',
  level: 1,
  type: 'arrayStart',
  content: null,
  length: 5,  // 数组有 5 个元素
  showComma: false
}
```

---

## NodeType

节点类型枚举，表示节点在 JSON 结构中的角色。

### 类型定义

```typescript
type NodeType =
  | 'content'          // 普通内容节点
  | 'objectStart'      // 对象开始节点 `{`
  | 'objectEnd'        // 对象结束节点 `}`
  | 'objectCollapsed'  // 对象折叠节点 `{...}`
  | 'arrayStart'       // 数组开始节点 `[`
  | 'arrayEnd'         // 数组结束节点 `]`
  | 'arrayCollapsed';  // 数组折叠节点 `[...]`
```

### 类型说明

| 类型值 | 说明 | 示例 |
|--------|------|------|
| `content` | 普通内容节点，表示基本类型值 | 字符串、数字、布尔值、null |
| `objectStart` | 对象开始节点，显示 `{` | `{ "name": "Alice" }` 中的 `{` |
| `objectEnd` | 对象结束节点，显示 `}` | `{ "name": "Alice" }` 中的 `}` |
| `objectCollapsed` | 对象折叠节点，显示 `{...}` | 折叠后的对象 |
| `arrayStart` | 数组开始节点，显示 `[` | `[1, 2, 3]` 中的 `[` |
| `arrayEnd` | 数组结束节点，显示 `]` | `[1, 2, 3]` 中的 `]` |
| `arrayCollapsed` | 数组折叠节点，显示 `[...]` | 折叠后的数组 |

### 使用场景

```javascript
// 判断节点类型
const handleNodeClick = (node) => {
  if (node.type === 'objectStart' || node.type === 'arrayStart') {
    console.log('点击了对象或数组的开始节点');
  }
  
  if (node.type === 'content') {
    console.log('点击了内容节点，值为：', node.content);
  }
};

// 只在开始节点显示操作按钮
const shouldShowActions = (node) => {
  return node.type === 'objectStart' || node.type === 'arrayStart';
};
```

---

## NodeActions

节点操作类型，用于 `renderNodeActions` 插槽参数。

### 类型定义

```typescript
interface NodeActions {
  copy: () => void;
  expandAll: (depth?: number, cascade?: boolean) => void;
  collapseAll: (depth?: number, cascade?: boolean) => void;
  expandFirstLevel: (cascade?: boolean) => void;
  collapseFirstLevel: (cascade?: boolean) => void;
  expandToLevel: (depth: number) => void;
  collapseToLevel: (depth: number) => void;
}
```

### 方法说明

| 方法名 | 参数 | 说明 |
|--------|------|------|
| copy | 无 | 复制节点数据到剪贴板 |
| expandAll | depth?: number, cascade?: boolean | 展开子节点，可选层级深度和级联参数 |
| collapseAll | depth?: number, cascade?: boolean | 收缩子节点，可选层级深度和级联参数 |
| expandFirstLevel | cascade?: boolean | 展开第 1 级子节点 |
| collapseFirstLevel | cascade?: boolean | 收缩第 1 级子节点 |
| expandToLevel | depth: number | 级联展开前 N 级子节点 |
| collapseToLevel | depth: number | 级联收缩前 N 级子节点 |

### cascade 参数说明

- `cascade: false`（默认）：精确模式，只操作第 N 级
- `cascade: true`：级联模式，操作前 N 级

### 使用示例

```vue
<template>
  <vue-json-pretty :data="data">
    <template #renderNodeActions="{ node, copy, expandAll, collapseAll, expandFirstLevel, collapseFirstLevel, expandToLevel, collapseToLevel }">
      <div class="node-actions">
        <!-- 复制按钮 -->
        <button @click.stop="copy">📋 复制</button>
        
        <!-- 精确模式：只操作第 N 级 -->
        <button @click.stop="expandFirstLevel()">📂 展开第 1 级</button>
        <button @click.stop="collapseFirstLevel()">📁 收缩第 1 级</button>
        
        <!-- 级联模式：操作前 N 级 -->
        <button @click.stop="expandToLevel(2)">📂 展开前 2 级</button>
        <button @click.stop="collapseToLevel(2)">📁 收缩前 2 级</button>
        
        <!-- 全部操作 -->
        <button @click.stop="expandAll()">📂 展开所有</button>
        <button @click.stop="collapseAll()">📁 收缩所有</button>
      </div>
    </template>
  </vue-json-pretty>
</template>
```

---

## RenderNodeActionsParams

`renderNodeActions` 插槽的完整参数类型。

### 类型定义

```typescript
interface RenderNodeActionsParams {
  node: NodeData;
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
```

### 参数说明

| 参数名 | 类型 | 说明 |
|--------|------|------|
| node | NodeData | 当前节点数据 |
| defaultActions | Object | 默认操作对象 |
| defaultActions.copy | Function | 复制节点数据的方法 |
| expandAll | Function | 展开子节点的方法 |
| collapseAll | Function | 收缩子节点的方法 |
| expandFirstLevel | Function | 展开第 1 级子节点 |
| collapseFirstLevel | Function | 收缩第 1 级子节点 |
| expandToLevel | Function | 级联展开前 N 级子节点 |
| collapseToLevel | Function | 级联收缩前 N 级子节点 |

---

## TreeExposeMethods

组件通过 `ref` 暴露的方法类型。

### 类型定义

```typescript
interface TreeExposeMethods {
  expandAll: (path?: string, depth?: number, cascade?: boolean) => void;
  collapseAll: (path?: string, depth?: number, cascade?: boolean) => void;
  getChildrenPaths: (path: string, depth?: number, cascade?: boolean) => string[];
}
```

### 方法说明

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| expandAll | path?: string, depth?: number | void | 展开指定节点下的子节点 |
| collapseAll | path?: string, depth?: number | void | 收缩指定节点下的子节点 |
| getChildrenPaths | path: string, depth?: number | string[] | 获取子节点路径数组 |

### 使用示例

```vue
<template>
  <vue-json-pretty ref="jsonTreeRef" :data="data" />
</template>

<script setup>
import { ref, onMounted } from 'vue';

const jsonTreeRef = ref();

onMounted(() => {
  // 使用 ref 调用方法
  jsonTreeRef.value?.expandAll();
  
  // 获取子节点路径
  const paths = jsonTreeRef.value?.getChildrenPaths('root');
  console.log(paths);
});
</script>
```

---

## 完整示例

### 示例 1：根据节点类型显示不同操作

```vue
<template>
  <vue-json-pretty :data="data" :selected-value="selectedNode">
    <template #renderNodeActions="{ node, expandAll, collapseAll, copy }">
      <div v-if="selectedNode === node.path" class="node-actions">
        <!-- 内容节点：只显示复制按钮 -->
        <button v-if="node.type === 'content'" @click.stop="copy">
          📋 复制
        </button>
        
        <!-- 对象/数组开始节点：显示所有操作 -->
        <template v-if="node.type === 'objectStart' || node.type === 'arrayStart'">
          <button @click.stop="copy">📋 复制</button>
          <button @click.stop="expandAll()">📂 展开所有</button>
          <button @click.stop="collapseAll()">📁 收缩所有</button>
        </template>
      </div>
    </template>
  </vue-json-pretty>
</template>
```

### 示例 2：检查节点是否有可折叠子节点

```vue
<template>
  <vue-json-pretty ref="jsonTreeRef" :data="data">
    <template #renderNodeActions="{ node, expandAll, collapseAll }">
      <div v-if="hasCollapsibleChildren(node)" class="node-actions">
        <button @click.stop="expandAll()">📂 展开</button>
        <button @click.stop="collapseAll()">📁 收缩</button>
      </div>
    </template>
  </vue-json-pretty>
</template>

<script setup>
import { ref } from 'vue';

const jsonTreeRef = ref();

const hasCollapsibleChildren = (node) => {
  // 只检查对象或数组的开始节点
  if (node.type !== 'objectStart' && node.type !== 'arrayStart') {
    return false;
  }
  
  // 获取第 1 级子节点
  const childrenPaths = jsonTreeRef.value?.getChildrenPaths(node.path, 1) || [];
  return childrenPaths.length > 0;
};
</script>
```

### 示例 3：节点路径解析

```javascript
// 解析节点路径
const parseNodePath = (path) => {
  const parts = path.split('.');
  const result = [];
  
  parts.forEach(part => {
    // 处理数组索引：items[0] -> { key: 'items', index: 0 }
    const match = part.match(/^(\w+)\[(\d+)\]$/);
    if (match) {
      result.push({ key: match[1], index: parseInt(match[2]) });
    } else {
      result.push({ key: part, index: null });
    }
  });
  
  return result;
};

// 使用示例
parseNodePath('root.data[0].user.name');
// [
//   { key: 'root', index: null },
//   { key: 'data', index: 0 },
//   { key: 'user', index: null },
//   { key: 'name', index: null }
// ]
```

## 相关文档

- [Methods 方法参考](Methods方法.md) - 查看所有可用方法
- [Slots 插槽](Slots插槽.md) - 查看所有插槽参数
- [Events 事件](Events事件.md) - 查看所有事件回调
