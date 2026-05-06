# JSON 树搜索功能实现计划

## 一、需求分析

### 问题描述

当 JSON 树使用虚拟滚动时，浏览器自带的 Ctrl+F 搜索无法找到不在可视区域的内容，需要组件提供内置搜索功能。

### 核心需求

1. **搜索 API**：提供方法供用户调用搜索功能
2. **滚动定位**：搜索到结果后自动滚动到对应位置
3. **展开目标**：如果搜索结果在折叠节点内，需要自动展开父节点

### 扩展需求

* 支持多个搜索结果导航（上一个/下一个）

* 搜索结果高亮显示

* 支持正则表达式搜索

* 支持大小写敏感选项

## 二、技术方案

### 2.1 数据结构设计

```typescript
// 搜索结果类型
interface SearchResult {
  path: string;           // 节点路径
  nodeIndex: number;      // 在 flatData 中的索引
  matchType: 'key' | 'value' | 'path'; // 匹配类型
  content: string;        // 匹配的内容
  level: number;          // 节点层级
}

// 搜索选项
interface SearchOptions {
  keyword: string;        // 搜索关键词
  caseSensitive?: boolean; // 是否大小写敏感，默认 false
  regex?: boolean;        // 是否使用正则表达式，默认 false
  searchIn?: ('key' | 'value' | 'path')[]; // 搜索范围，默认 ['key', 'value']
}
```

### 2.2 API 设计

#### 方法 API（通过 ref 调用）

```typescript
interface TreeExposeMethods {
  // 现有方法...
  expandAll: (path?: string, depth?: number, cascade?: boolean) => void;
  collapseAll: (path?: string, depth?: number, cascade?: boolean) => void;
  getChildrenPaths: (path: string, depth?: number, cascade?: boolean) => string[];
  
  // 新增搜索方法
  search: (options: SearchOptions) => SearchResult[];  // 执行搜索
  clearSearch: () => void;                             // 清除搜索结果
  scrollToResult: (result: SearchResult) => void;      // 滚动到指定结果
  scrollToNextResult: () => SearchResult | null;       // 滚动到下一个结果
  scrollToPrevResult: () => SearchResult | null;       // 滚动到上一个结果
}
```

#### Props 设计（可选）

```typescript
// 搜索相关 props
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
```

#### Events 设计

```typescript
emits: [
  // 现有事件...
  'searchResultChange',  // (results: SearchResult[]) => void
]
```

### 2.3 核心实现逻辑

#### 搜索流程

```
用户调用 search(options)
    ↓
遍历 originFlatData
    ↓
对每个节点检查 key、value、path 是否匹配
    ↓
收集所有匹配结果
    ↓
返回 SearchResult[]
```

#### 滚动到结果流程

```
用户调用 scrollToResult(result)
    ↓
1. 检查结果节点的所有父节点是否折叠
    ↓
2. 如果折叠，展开所有父节点（从根到目标节点）
    ↓
3. 等待 DOM 更新（nextTick）
    ↓
4. 计算目标节点的滚动位置
    - 非虚拟滚动：直接使用 scrollTop
    - 虚拟滚动：使用 offsets 数组计算
    ↓
5. 平滑滚动到目标位置
    ↓
6. 高亮目标节点
```

### 2.4 关键实现细节

#### 1. 获取父节点路径

```typescript
function getParentPaths(path: string): string[] {
  // root.users[0].name -> ['root', 'root.users', 'root.users[0]']
  const paths: string[] = [];
  const parts = path.split(/[\.\[]/);
  let current = '';
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i].replace(/[\[\]"]/g, '');
    current = current ? `${current}.${part}` : part;
    if (current !== 'root') {
      paths.push(current);
    }
  }
  
  return paths;
}
```

#### 2. 展开到目标节点

```typescript
function expandToNode(path: string) {
  const parentPaths = getParentPaths(path);
  // 从根到目标依次展开
  parentPaths.forEach(parentPath => {
    if (state.hiddenPaths[parentPath]) {
      delete state.hiddenPaths[parentPath];
    }
  });
}
```

#### 3. 计算滚动位置

```typescript
function getScrollPosition(nodeIndex: number): number {
  if (props.virtual && props.dynamicHeight) {
    // 使用 offsets 数组
    return offsets[nodeIndex] || 0;
  } else if (props.virtual) {
    // 固定高度
    return nodeIndex * props.itemHeight;
  } else {
    // 非虚拟滚动，需要获取 DOM 元素位置
    const element = rowRefs[nodeIndex];
    return element?.offsetTop || 0;
  }
}
```

#### 4. 搜索匹配逻辑

```typescript
function matchKeyword(text: string, options: SearchOptions): boolean {
  const { keyword, caseSensitive, regex } = options;
  
  if (regex) {
    const flags = caseSensitive ? 'g' : 'gi';
    const pattern = new RegExp(keyword, flags);
    return pattern.test(text);
  } else {
    const searchText = caseSensitive ? text : text.toLowerCase();
    const searchKeyword = caseSensitive ? keyword : keyword.toLowerCase();
    return searchText.includes(searchKeyword);
  }
}
```

### 2.5 高亮显示实现

#### 方案一：CSS 类高亮（推荐）

```less
.vjs-tree-node.is-search-highlight {
  background-color: #fff3cd;
  animation: highlight-pulse 1s ease-in-out;
}

@keyframes highlight-pulse {
  0%, 100% { background-color: #fff3cd; }
  50% { background-color: #ffe69c; }
}
```

#### 方案二：文本高亮

在 `renderNodeKey` 和 `renderNodeValue` 中，对匹配的文本添加 `<mark>` 标签。

### 2.6 状态管理

在 Tree 组件中添加搜索相关状态：

```typescript
const state = reactive({
  // 现有状态...
  searchResults: [] as SearchResult[],
  currentResultIndex: -1,
  searchKeyword: '',
});
```

## 三、实现步骤

### 第一阶段：核心搜索功能

1. **添加搜索相关类型定义**

   * 在 `src/types/index.ts` 或 `src/components/Tree/index.tsx` 中添加 `SearchResult` 和 `SearchOptions` 类型

2. **实现搜索方法**

   * 在 Tree 组件中实现 `search()` 方法

   * 实现关键词匹配逻辑

   * 收集搜索结果

3. **实现展开父节点功能**

   * 实现 `getParentPaths()` 工具函数

   * 实现 `expandToNode()` 方法

4. **实现滚动定位功能**

   * 实现 `scrollToResult()` 方法

   * 处理虚拟滚动和非虚拟滚动两种情况

   * 实现平滑滚动效果

5. **实现结果导航功能**

   * 实现 `scrollToNextResult()` 方法

   * 实现 `scrollToPrevResult()` 方法

   * 实现 `clearSearch()` 方法

### 第二阶段：高亮显示

1. **添加高亮样式**

   * 添加 `.is-search-highlight` CSS 类

   * 添加高亮动画效果

2. **实现高亮逻辑**

   * 在 TreeNode 组件中添加 `isSearchHighlight` prop

   * 根据搜索结果动态添加高亮类

### 第三阶段：完善功能

1. **添加 Props 支持**

   * 添加 `searchKeyword` 等 props

   * 实现 watch 监听 props 变化自动搜索

2. **添加事件支持**

   * 添加 `searchResultChange` 事件

   * 在搜索结果变化时触发事件

3. **更新类型定义**

   * 更新 `TreeExposeMethods` 接口

   * 更新 TypeScript 类型声明文件

### 第四阶段：文档和示例

1. **编写文档**

   * 更新 `docs/参考/Methods方法.md`

   * 添加搜索功能使用示例

2. **添加示例代码**

   * 在 `example` 目录添加搜索功能示例

## 四、技术难点与解决方案

### 4.1 虚拟滚动中的定位问题

**问题**：虚拟滚动时，不可见的节点没有渲染，无法直接获取 DOM 元素。

**解决方案**：

1. 使用 `offsets` 数组计算目标位置
2. 先滚动到目标位置附近
3. 等待渲染完成后微调滚动位置

### 4.2 折叠节点的搜索问题

**问题**：折叠节点内的内容在 `flatData` 中被合并为 `{...}` 或 `[...]`。

**解决方案**：

1. 搜索时使用 `originFlatData` 而不是 `flatData`
2. 找到结果后，自动展开所有父节点
3. 重新计算 `flatData` 和滚动位置

### 4.3 性能优化

**问题**：大数据量时搜索可能较慢。

**解决方案**：

1. 使用防抖处理搜索输入
2. 限制搜索结果数量（如最多 100 个）
3. 使用 Web Worker 进行搜索（可选）

### 4.4 动态高度计算

**问题**：展开节点后，动态高度需要重新计算。

**解决方案**：

1. 在 `expandToNode` 后调用 `nextTick`
2. 重新初始化 `heights` 和 `offsets` 数组
3. 再次计算滚动位置

## 五、API 使用示例

### 基本使用

```vue
<template>
  <div>
    <input v-model="keyword" placeholder="搜索..." @keyup.enter="handleSearch" />
    <button @click="handleSearch">搜索</button>
    <button @click="handleNext">下一个</button>
    <button @click="handlePrev">上一个</button>
    <button @click="handleClear">清除</button>
    
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

const handleNext = () => {
  const result = jsonTreeRef.value?.scrollToNextResult();
  if (!result) {
    console.log('没有更多结果');
  }
};

const handlePrev = () => {
  const result = jsonTreeRef.value?.scrollToPrevResult();
  if (!result) {
    console.log('没有更多结果');
  }
};

const handleClear = () => {
  jsonTreeRef.value?.clearSearch();
  keyword.value = '';
};
</script>
```

### 使用 Props

```vue
<template>
  <vue-json-pretty 
    :data="data" 
    :search-keyword="keyword"
    @search-result-change="handleResultChange"
  />
</template>

<script setup>
import { ref } from 'vue';

const keyword = ref('test');

const handleResultChange = (results) => {
  console.log('搜索结果:', results);
};
</script>
```

## 六、测试计划

### 单元测试

* 搜索功能测试

* 父节点路径计算测试

* 滚动位置计算测试

### 集成测试

* 虚拟滚动 + 搜索测试

* 折叠节点 + 搜索测试

* 动态高度 + 搜索测试

### E2E 测试

* 完整搜索流程测试

* 多结果导航测试

## 七、时间估算

* 第一阶段（核心功能）：2-3 天

* 第二阶段（高亮显示）：1 天

* 第三阶段（完善功能）：1-2 天

* 第四阶段（文档示例）：1 天

**总计**：5-7 天

## 八、后续优化方向

1. **搜索性能优化**：使用 Web Worker 进行后台搜索
2. **搜索历史**：记录用户搜索历史
3. **高级搜索**：支持按类型筛选（只搜索 key 或只搜索 value）
4. **搜索结果导出**：支持导出搜索结果
5. **快捷键支持**：Ctrl+F 打开搜索框，F3/Shift+F3 导航结果

