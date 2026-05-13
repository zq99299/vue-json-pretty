# Methods 方法参考

## 概述

通过 `ref` 可以调用 @zhuqiang/vue-json-pretty 组件暴露的方法，实现编程方式控制组件行为。

## 速查表

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| [expandAll](#expandall) | 展开指定节点下的子节点 | (path?: string, depth?: number, cascade?: boolean) | void |
| [collapseAll](#collapseall) | 收缩指定节点下的子节点 | (path?: string, depth?: number, cascade?: boolean) | void |
| [getChildrenPaths](#getchildrenpaths) | 获取指定节点下的子节点路径 | (path: string, depth?: number, cascade?: boolean) | string[] |
| [search](#search) | 执行搜索 | (options: SearchOptions) | SearchResult[] |
| [clearSearch](#clearsearch) | 清除搜索结果 | () | void |
| [scrollToResult](#scrolltoresult) | 滚动到指定搜索结果 | (result: SearchResult) | void |
| [scrollToNextResult](#scrolltonextresult) | 滚动到下一个搜索结果 | () | SearchResult \| null |
| [scrollToPrevResult](#scrolltoprevresult) | 滚动到上一个搜索结果 | () | SearchResult \| null |
| [startEdit](#startedit) | 进入编辑模式 | (path: string) | void |
| [stopEdit](#stopedit) | 退出编辑模式 | () | void |
| [updateValue](#updatevalue) | 更新节点值 | (path: string, value: unknown) | void |

## 基本用法

```vue
<template>
  <vue-json-pretty ref="jsonTreeRef" :data="data" />
</template>

<script setup>
import { ref } from 'vue';

const jsonTreeRef = ref();

// 调用方法
jsonTreeRef.value?.expandAll();
</script>
```

## 方法列表

### expandAll

展开指定节点下的子节点。

#### 签名

```typescript
expandAll(path?: string, depth?: number, cascade?: boolean): void
```

#### 参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| path | string | 否 | - | 节点路径，不传则展开所有节点 |
| depth | number | 否 | Infinity | 层级深度 |
| cascade | boolean | 否 | false | 是否级联操作 |

#### cascade 参数说明

- `cascade: false`（默认）：精确模式，只操作第 N 级
  - `expandAll('root', 2, false)` - 只展开第 2 级子节点
  - 适用于：精确控制某一层级的展开/折叠

- `cascade: true`：级联模式，操作前 N 级
  - `expandAll('root', 2, true)` - 展开第 1 级和第 2 级子节点
  - 适用于：用户想看到第 N 级内容时，确保父级都已展开

#### depth 参数说明

- `1`：操作第 1 级子节点
- `2`：操作第 2 级子节点
- `Infinity`：操作所有子节点（默认）

**重要**：`depth` 参数的含义取决于 `cascade` 参数：
- `cascade: false`：只操作第 N 级
- `cascade: true`：操作前 N 级

#### 示例

```vue
<template>
  <div>
    <vue-json-pretty ref="jsonTreeRef" :data="data" />
    <button @click="handleExpandAll">展开所有</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const jsonTreeRef = ref();
const data = ref({
  users: [
    { id: 1, name: 'Alice', profile: { age: 25 } },
    { id: 2, name: 'Bob', profile: { age: 30 } }
  ]
});

// 展开所有节点
const handleExpandAll = () => {
  jsonTreeRef.value?.expandAll();
};

// 展开指定节点下的所有子节点
const expandSpecificNode = () => {
  jsonTreeRef.value?.expandAll('root.users');
};

// 精确模式：只展开第 2 级子节点
const expandSecondLevelOnly = () => {
  jsonTreeRef.value?.expandAll('root', 2, false);
};

// 级联模式：展开前 2 级子节点
const expandFirstTwoLevels = () => {
  jsonTreeRef.value?.expandAll('root', 2, true);
};
</script>
```

---

### collapseAll

收缩指定节点下的子节点。

#### 签名

```typescript
collapseAll(path?: string, depth?: number, cascade?: boolean): void
```

#### 参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| path | string | 否 | - | 节点路径，不传则收缩所有节点 |
| depth | number | 否 | Infinity | 层级深度 |
| cascade | boolean | 否 | false | 是否级联操作 |

#### 示例

```javascript
// 收缩所有节点
jsonTreeRef.value?.collapseAll();

// 收缩指定节点下的所有子节点
jsonTreeRef.value?.collapseAll('root.users');

// 精确模式：只收缩第 1 级子节点
jsonTreeRef.value?.collapseAll('root', 1, false);

// 级联模式：收缩前 2 级子节点
jsonTreeRef.value?.collapseAll('root', 2, true);
```

---

### getChildrenPaths

获取指定节点下的子节点路径。

#### 签名

```typescript
getChildrenPaths(path: string, depth?: number, cascade?: boolean): string[]
```

#### 参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| path | string | 是 | - | 节点路径 |
| depth | number | 否 | Infinity | 层级深度 |
| cascade | boolean | 否 | false | 是否级联获取 |

#### 返回值

`string[]` - 子节点路径数组

#### 示例

```vue
<template>
  <vue-json-pretty ref="jsonTreeRef" :data="data" />
</template>

<script setup>
import { ref, onMounted } from 'vue';

const jsonTreeRef = ref();
const data = ref({
  users: [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]
});

onMounted(() => {
  // 获取所有子节点路径
  const allPaths = jsonTreeRef.value?.getChildrenPaths('root.users');
  console.log(allPaths);
  // ['root.users[0]', 'root.users[1]']
  
  // 精确模式：获取第 1 级子节点路径
  const firstLevelPaths = jsonTreeRef.value?.getChildrenPaths('root', 1, false);
  console.log(firstLevelPaths);
  // ['root.users']
  
  // 级联模式：获取前 2 级子节点路径
  const firstTwoLevelPaths = jsonTreeRef.value?.getChildrenPaths('root', 2, true);
  console.log(firstTwoLevelPaths);
  // ['root.users', 'root.users[0]', 'root.users[1]']
});
</script>
```

## 使用场景

### 场景 1：实现展开/收缩所有按钮

```vue
<template>
  <div>
    <div class="controls">
      <button @click="expandAll">展开所有</button>
      <button @click="collapseAll">收缩所有</button>
    </div>
    <vue-json-pretty ref="jsonTreeRef" :data="data" />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const jsonTreeRef = ref();
const data = ref({ /* ... */ });

const expandAll = () => {
  jsonTreeRef.value?.expandAll();
};

const collapseAll = () => {
  jsonTreeRef.value?.collapseAll();
};
</script>
```

### 场景 2：条件性展开节点

```javascript
// 展开包含特定关键字的节点
const expandNodesWithKeyword = (keyword) => {
  const allPaths = jsonTreeRef.value?.getChildrenPaths('root') || [];
  
  allPaths.forEach(path => {
    if (path.includes(keyword)) {
      jsonTreeRef.value?.expandAll(path);
    }
  });
};

// 使用示例
expandNodesWithKeyword('important');
```

### 场景 3：批量操作节点

```javascript
// 展开所有数组节点
const expandAllArrays = () => {
  const allPaths = jsonTreeRef.value?.getChildrenPaths('root') || [];
  
  allPaths.forEach(path => {
    if (path.includes('[')) {
      jsonTreeRef.value?.expandAll(path);
    }
  });
};
```

### 场景 4：保存和恢复展开状态

```javascript
// 获取当前展开的节点
const getExpandedPaths = () => {
  const allPaths = jsonTreeRef.value?.getChildrenPaths('root') || [];
  return allPaths.filter(path => {
    // 检查节点是否展开
    // 这里需要根据实际情况判断
    return true;
  });
};

// 保存展开状态
const saveExpandState = () => {
  const expandedPaths = getExpandedPaths();
  localStorage.setItem('expandedPaths', JSON.stringify(expandedPaths));
};

// 恢复展开状态
const restoreExpandState = () => {
  const expandedPaths = JSON.parse(localStorage.getItem('expandedPaths') || '[]');
  expandedPaths.forEach(path => {
    jsonTreeRef.value?.expandAll(path);
  });
};
```

---

### search

执行搜索，查找 JSON 树中匹配的节点。

#### 签名

```typescript
search(options: SearchOptions): SearchResult[]
```

#### SearchOptions 参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| keyword | string | 是 | - | 搜索关键词 |
| caseSensitive | boolean | 否 | false | 是否大小写敏感 |
| regex | boolean | 否 | false | 是否使用正则表达式 |
| searchIn | ('key' \| 'value' \| 'path')[] | 否 | ['key', 'value'] | 搜索范围 |

#### SearchResult 返回值

```typescript
interface SearchResult {
  path: string;           // 节点路径
  nodeIndex: number;      // 在 flatData 中的索引
  matchType: 'key' | 'value' | 'path'; // 匹配类型
  content: string;        // 匹配的内容
  level: number;          // 节点层级
}
```

#### 示例

```vue
<template>
  <div>
    <input v-model="keyword" @keyup.enter="handleSearch" />
    <button @click="handleSearch">搜索</button>
    <vue-json-pretty ref="jsonTreeRef" :data="data" virtual :height="600" />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const jsonTreeRef = ref();
const keyword = ref('');

const handleSearch = () => {
  const results = jsonTreeRef.value?.search({
    keyword: keyword.value,
    caseSensitive: false,
  });
  console.log(`找到 ${results?.length || 0} 个结果`);
};
</script>
```

---

### clearSearch

清除搜索结果和高亮状态。

#### 签名

```typescript
clearSearch(): void
```

#### 示例

```javascript
jsonTreeRef.value?.clearSearch();
```

---

### scrollToResult

滚动到指定的搜索结果并高亮显示。

#### 签名

```typescript
scrollToResult(result: SearchResult): void
```

#### 参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| result | SearchResult | 是 | 搜索结果对象 |

#### 示例

```javascript
const results = jsonTreeRef.value?.search({ keyword: 'test' });
if (results && results.length > 0) {
  jsonTreeRef.value?.scrollToResult(results[0]);
}
```

---

### scrollToNextResult

滚动到下一个搜索结果。

#### 签名

```typescript
scrollToNextResult(): SearchResult | null
```

#### 返回值

返回下一个搜索结果，如果没有结果则返回 `null`。

#### 示例

```vue
<template>
  <div>
    <button @click="handleNext">下一个</button>
    <vue-json-pretty ref="jsonTreeRef" :data="data" />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const jsonTreeRef = ref();

const handleNext = () => {
  const result = jsonTreeRef.value?.scrollToNextResult();
  if (!result) {
    console.log('没有更多结果');
  }
};
</script>
```

---

### scrollToPrevResult

滚动到上一个搜索结果。

#### 签名

```typescript
scrollToPrevResult(): SearchResult | null
```

#### 返回值

返回上一个搜索结果，如果没有结果则返回 `null`。

#### 示例

```javascript
const result = jsonTreeRef.value?.scrollToPrevResult();
```

---

### startEdit

进入编辑模式，激活指定节点的编辑状态。

#### 签名

```typescript
startEdit(path: string): void
```

#### 参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| path | string | 是 | 要编辑的节点路径 |

#### 示例

```vue
<template>
  <div>
    <vue-json-pretty
      ref="jsonTreeRef"
      :data="data"
      :editable="true"
      editable-trigger="custom"
    >
      <template #renderNodeValue="{ node, defaultValue }">
        <span>{{ defaultValue }}</span>
        <span class="edit-icon" @click.stop="handleEdit(node)">✎</span>
      </template>
    </vue-json-pretty>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const jsonTreeRef = ref();
const data = ref({ name: 'test', age: 25 });

const handleEdit = (node) => {
  jsonTreeRef.value?.startEdit(node.path);
};
</script>
```

#### 使用场景

- 配合 `editableTrigger="custom"` 实现自定义触发编辑
- 在 `renderNodeValue` 插槽中添加编辑图标，点击图标触发编辑
- 编程方式自动进入编辑模式

---

### stopEdit

退出编辑模式，取消当前节点的编辑状态。

#### 签名

```typescript
stopEdit(): void
```

#### 示例

```vue
<template>
  <vue-json-pretty
    ref="jsonTreeRef"
    :data="data"
    :editable="true"
    editable-trigger="custom"
  />
  <button @click="handleCancel">取消编辑</button>
</template>

<script setup>
import { ref } from 'vue';

const jsonTreeRef = ref();

const handleCancel = () => {
  jsonTreeRef.value?.stopEdit();
};
</script>
```

---

### updateValue

更新指定节点的值。

#### 签名

```typescript
updateValue(path: string, value: unknown): void
```

#### 参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| path | string | 是 | 要更新的节点路径 |
| value | unknown | 是 | 新的值，支持字符串、数字、布尔值、null、undefined |

#### 示例

```vue
<template>
  <div>
    <vue-json-pretty
      ref="jsonTreeRef"
      v-model:data="data"
      :editable="true"
      editable-trigger="custom"
      :editable-input="false"
    />

    <!-- 自定义编辑面板 -->
    <div v-if="editingPath" class="edit-panel">
      <input v-model="editValue" @keyup.enter="handleSave" />
      <button @click="handleSave">保存</button>
      <button @click="handleCancel">取消</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const jsonTreeRef = ref();
const data = ref({ name: 'test', age: 25 });
const editingPath = ref('');
const editValue = ref('');

const handleEditClick = (node) => {
  editingPath.value = node.path;
  editValue.value = String(node.content);
  jsonTreeRef.value?.startEdit(node.path);
};

const handleSave = () => {
  if (!editingPath.value) return;
  // 自动类型转换
  let value = editValue.value;
  if (value === 'null') value = null;
  else if (value === 'undefined') value = undefined;
  else if (value === 'true') value = true;
  else if (value === 'false') value = false;
  else if (!isNaN(Number(value)) && value.trim() !== '') value = Number(value);

  jsonTreeRef.value?.updateValue(editingPath.value, value);
  handleCancel();
};

const handleCancel = () => {
  jsonTreeRef.value?.stopEdit();
  editingPath.value = '';
  editValue.value = '';
};
</script>
```

#### 使用场景

- 配合 `editableInput: false` 实现完全自定义的编辑 UI
- 编程方式批量更新节点值
- 在外部编辑面板中保存修改

## 编辑功能使用场景

### 场景 1：使用内置编辑（最简单）

```vue
<template>
  <vue-json-pretty
    v-model:data="data"
    :editable="true"
    editable-trigger="click"
  />
</template>
```

### 场景 2：自定义触发 + 内置输入框

通过图标触发编辑，但使用组件内置的输入框：

```vue
<template>
  <vue-json-pretty
    ref="jsonTreeRef"
    v-model:data="data"
    :editable="true"
    editable-trigger="custom"
    :editable-input="true"
  >
    <template #renderNodeValue="{ node, defaultValue }">
      <span>{{ defaultValue }}</span>
      <span v-if="node.type === 'content'" class="edit-icon" @click.stop="handleEdit(node)">✎</span>
    </template>
  </vue-json-pretty>
</template>

<script setup>
import { ref } from 'vue';

const jsonTreeRef = ref();
const data = ref({ name: 'test' });

const handleEdit = (node) => {
  jsonTreeRef.value?.startEdit(node.path);
};
</script>
```

### 场景 3：完全自定义编辑

禁用内置输入框，使用外部编辑面板：

```vue
<template>
  <vue-json-pretty
    ref="jsonTreeRef"
    v-model:data="data"
    :editable="true"
    editable-trigger="custom"
    :editable-input="false"
  >
    <template #renderNodeValue="{ node, defaultValue }">
      <a v-if="isUrl(node.content)" :href="node.content" target="_blank">{{ node.content }}</a>
      <span v-else>{{ defaultValue }}</span>
      <span v-if="node.type === 'content'" class="edit-icon" @click.stop="handleEditClick(node)">✎</span>
    </template>
  </vue-json-pretty>

  <div v-if="editingPath" class="edit-panel">
    <input v-model="editValue" @keyup.enter="handleSave" @keyup.escape="handleCancel" />
    <button @click="handleSave">保存</button>
    <button @click="handleCancel">取消</button>
  </div>
</template>
```

## 注意事项

### 1. 节点路径格式

路径使用点号和方括号表示：
- 对象属性：`root.user.name`
- 数组元素：`root.items[0]`
- 嵌套结构：`root.data[0].user.name`

### 2. 层级深度理解

`depth` 参数表示只操作指定层级的节点：
- `depth = 1`：只操作第 1 级子节点
- `depth = 2`：只操作第 2 级子节点（不影响第 1 级）
- `depth = Infinity`：操作所有子节点

### 3. 性能考虑

大数据量时建议：
- 使用虚拟滚动（`virtual` prop）
- 避免频繁操作大量节点
- 使用 `depth` 参数限制操作范围

### 4. 方法调用时机

确保在组件挂载后调用方法：
```javascript
import { onMounted } from 'vue';

onMounted(() => {
  jsonTreeRef.value?.expandAll();
});
```

## TypeScript 类型定义

```typescript
interface SearchResult {
  path: string;
  nodeIndex: number;
  matchType: 'key' | 'value' | 'path';
  content: string;
  level: number;
}

interface SearchOptions {
  keyword: string;
  caseSensitive?: boolean;
  regex?: boolean;
  searchIn?: ('key' | 'value' | 'path')[];
}

interface TreeExposeMethods {
  expandAll: (path?: string, depth?: number, cascade?: boolean) => void;
  collapseAll: (path?: string, depth?: number, cascade?: boolean) => void;
  getChildrenPaths: (path: string, depth?: number, cascade?: boolean) => string[];
  search: (options: SearchOptions) => SearchResult[];
  clearSearch: () => void;
  scrollToResult: (result: SearchResult) => void;
  scrollToNextResult: () => SearchResult | null;
  scrollToPrevResult: () => SearchResult | null;
  startEdit: (path: string) => void;
  stopEdit: () => void;
  updateValue: (path: string, value: unknown) => void;
}
```

## 相关文档

- [如何展开收缩节点](../指南/如何展开收缩节点.md) - 详细使用指南
- [DataStructures 数据结构](DataStructures数据结构.md) - 节点数据结构
- [Props 配置](Props配置.md) - 组件属性配置
