# Slots 插槽参考

## 概述

vue-json-pretty 组件提供了多个插槽，允许您自定义节点的渲染方式和操作按钮。

## 速查表

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| [renderNodeKey](#rendernodekey) | 自定义渲染节点键 | { node, defaultKey } |
| [renderNodeValue](#rendernodevalue) | 自定义渲染节点值 | { node, defaultValue } |
| [renderNodeActions](#rendernodeactions) | 自定义渲染节点操作 | { node, defaultActions, expandAll, collapseAll, expandFirstLevel, collapseFirstLevel } |

## 插槽列表

### renderNodeKey

自定义渲染节点键。

#### 参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| node | NodeData | 当前节点数据 |
| defaultKey | VNode | 默认渲染的键 VNode |

#### 示例

```vue
<template>
  <vue-json-pretty :data="data">
    <template #renderNodeKey="{ node, defaultKey }">
      <!-- 自定义键的样式 -->
      <span class="custom-key" :style="{ color: getKeyColor(node) }">
        {{ node.key }}
      </span>
    </template>
  </vue-json-pretty>
</template>

<script setup>
const getKeyColor = (node) => {
  // 根据节点类型返回不同颜色
  if (node.type === 'objectStart') return '#1890ff';
  if (node.type === 'arrayStart') return '#52c41a';
  return '#333';
};
</script>

<style scoped>
.custom-key {
  font-weight: 500;
}
</style>
```

#### 使用场景

- 自定义键的颜色和样式
- 添加图标或徽章
- 实现键的搜索高亮

---

### renderNodeValue

自定义渲染节点值。

#### 参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| node | NodeData | 当前节点数据 |
| defaultValue | VNode | 默认渲染的值 VNode |

#### 示例

```vue
<template>
  <vue-json-pretty :data="data">
    <template #renderNodeValue="{ node, defaultValue }">
      <!-- URL 显示为链接 -->
      <a 
        v-if="isUrl(node.content)" 
        :href="node.content" 
        target="_blank"
        class="url-link"
      >
        {{ node.content }}
      </a>
      
      <!-- 邮箱显示为邮件链接 -->
      <a 
        v-else-if="isEmail(node.content)" 
        :href="`mailto:${node.content}`"
        class="email-link"
      >
        {{ node.content }}
      </a>
      
      <!-- 其他值使用默认渲染 -->
      <span v-else>{{ defaultValue }}</span>
    </template>
  </vue-json-pretty>
</template>

<script setup>
const isUrl = (value) => {
  return typeof value === 'string' && 
         (value.startsWith('http://') || value.startsWith('https://'));
};

const isEmail = (value) => {
  return typeof value === 'string' && 
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};
</script>

<style scoped>
.url-link,
.email-link {
  color: #1890ff;
  text-decoration: underline;
}

.url-link:hover,
.email-link:hover {
  color: #40a9ff;
}
</style>
```

#### 使用场景

- URL 转换为可点击链接
- 邮箱转换为邮件链接
- 日期格式化显示
- 图片 URL 显示缩略图
- 自定义值的样式

---

### renderNodeActions

自定义渲染节点操作按钮。

#### 参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| node | NodeData | 当前节点数据 |
| defaultActions | Object | 默认操作对象 |
| defaultActions.copy | Function | 复制节点数据的方法 |
| expandAll | Function | 展开子节点的方法，可选参数 depth |
| collapseAll | Function | 收缩子节点的方法，可选参数 depth |
| expandFirstLevel | Function | 展开第 1 级子节点 |
| collapseFirstLevel | Function | 收缩第 1 级子节点 |

#### 示例

**示例 1：基础操作按钮**

```vue
<template>
  <vue-json-pretty :data="data" :selected-value="selectedNode">
    <template #renderNodeActions="{ node, copy }">
      <div v-if="selectedNode === node.path" class="node-actions">
        <button @click.stop="copy">📋 复制</button>
      </div>
    </template>
  </vue-json-pretty>
</template>

<script setup>
import { ref } from 'vue';

const selectedNode = ref('');
const data = ref({ /* ... */ });
</script>
```

**示例 2：展开/收缩操作**

```vue
<template>
  <vue-json-pretty 
    ref="jsonTreeRef"
    :data="data" 
    :selected-value="selectedNode"
  >
    <template #renderNodeActions="{ node, expandAll, collapseAll, expandFirstLevel, collapseFirstLevel }">
      <div 
        v-if="selectedNode === node.path && hasCollapsibleChildren(node)" 
        class="node-actions"
      >
        <button @click.stop="expandFirstLevel()">📂 展开第 1 级</button>
        <button @click.stop="expandAll()">📂 展开所有</button>
        <button @click.stop="collapseFirstLevel()">📁 收缩第 1 级</button>
        <button @click.stop="collapseAll()">📁 收缩所有</button>
      </div>
    </template>
  </vue-json-pretty>
</template>

<script setup>
import { ref } from 'vue';

const jsonTreeRef = ref();
const selectedNode = ref('');
const data = ref({ /* ... */ });

const hasCollapsibleChildren = (node) => {
  if (node.type !== 'objectStart' && node.type !== 'arrayStart') {
    return false;
  }
  
  const childrenPaths = jsonTreeRef.value?.getChildrenPaths(node.path, 1) || [];
  return childrenPaths.length > 0;
};
</script>
```

**示例 3：完整操作按钮**

```vue
<template>
  <vue-json-pretty 
    ref="jsonTreeRef"
    :data="data" 
    :selected-value="selectedNode"
    @node-click="handleNodeClick"
  >
    <template #renderNodeActions="{ node, copy, expandAll, collapseAll }">
      <div v-if="selectedNode === node.path" class="node-actions">
        <!-- 复制操作 -->
        <button class="btn" @click.stop="copy" title="复制值">
          📋 复制
        </button>
        
        <!-- 展开/收缩操作（仅对象和数组） -->
        <template v-if="hasCollapsibleChildren(node)">
          <button class="btn" @click.stop="expandAll()" title="展开所有子节点">
            📂 展开所有
          </button>
          <button class="btn" @click.stop="collapseAll()" title="收缩所有子节点">
            📁 收缩所有
          </button>
        </template>
        
        <!-- 自定义操作 -->
        <button class="btn" @click.stop="handleEdit(node)" title="编辑节点">
          ✏️ 编辑
        </button>
        <button class="btn" @click.stop="handleDelete(node)" title="删除节点">
          🗑️ 删除
        </button>
      </div>
    </template>
  </vue-json-pretty>
</template>

<script setup>
import { ref } from 'vue';

const jsonTreeRef = ref();
const selectedNode = ref('');
const data = ref({ /* ... */ });

const handleNodeClick = (node) => {
  selectedNode.value = node.path;
};

const hasCollapsibleChildren = (node) => {
  if (node.type !== 'objectStart' && node.type !== 'arrayStart') {
    return false;
  }
  
  const childrenPaths = jsonTreeRef.value?.getChildrenPaths(node.path, 1) || [];
  return childrenPaths.length > 0;
};

const handleEdit = (node) => {
  console.log('编辑节点：', node);
  // 实现编辑逻辑
};

const handleDelete = (node) => {
  console.log('删除节点：', node);
  // 实现删除逻辑
};
</script>

<style scoped>
.node-actions {
  display: inline-flex;
  gap: 8px;
  margin-left: 12px;
}

.btn {
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background: #f0f0f0;
  border-color: #999;
}
</style>
```

#### 使用场景

- 添加复制、编辑、删除等操作按钮
- 实现展开/收缩功能
- 添加自定义操作（如导出、分享等）

---

## 完整示例

### 示例 1：JSON 查看器（带链接识别）

```vue
<template>
  <vue-json-pretty :data="data">
    <template #renderNodeValue="{ node, defaultValue }">
      <!-- URL 显示为可点击链接 -->
      <a 
        v-if="isUrl(node.content)" 
        :href="node.content" 
        target="_blank"
        class="link"
      >
        {{ node.content }}
      </a>
      
      <!-- 图片 URL 显示缩略图 -->
      <span 
        v-else-if="isImageUrl(node.content)" 
        class="image-preview"
      >
        {{ node.content }}
        <img :src="node.content" class="thumbnail" />
      </span>
      
      <!-- 其他值使用默认渲染 -->
      <span v-else>{{ defaultValue }}</span>
    </template>
  </vue-json-pretty>
</template>

<script setup>
const isUrl = (value) => {
  return typeof value === 'string' && value.startsWith('http');
};

const isImageUrl = (value) => {
  return typeof value === 'string' && 
         /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(value);
};
</script>

<style scoped>
.link {
  color: #1890ff;
  text-decoration: underline;
}

.image-preview {
  position: relative;
}

.thumbnail {
  position: absolute;
  top: 20px;
  left: 0;
  width: 100px;
  height: 100px;
  object-fit: cover;
  border: 1px solid #ddd;
  border-radius: 4px;
  z-index: 10;
}
</style>
```

### 示例 2：可编辑的 JSON 编辑器

```vue
<template>
  <vue-json-pretty 
    :data="data"
    :selected-value="selectedNode"
    @node-click="handleNodeClick"
  >
    <template #renderNodeKey="{ node }">
      <span class="key">{{ node.key }}</span>
      <button 
        v-if="selectedNode === node.path" 
        class="edit-btn"
        @click.stop="editKey(node)"
      >
        ✏️
      </button>
    </template>
    
    <template #renderNodeValue="{ node, defaultValue }">
      <span v-if="editingNode === node.path">
        <input 
          v-model="editValue" 
          @blur="saveEdit(node)"
          @keyup.enter="saveEdit(node)"
          class="edit-input"
        />
      </span>
      <span v-else>
        {{ defaultValue }}
        <button 
          v-if="selectedNode === node.path" 
          class="edit-btn"
          @click.stop="startEdit(node)"
        >
          ✏️
        </button>
      </span>
    </template>
  </vue-json-pretty>
</template>

<script setup>
import { ref } from 'vue';

const data = ref({ /* ... */ });
const selectedNode = ref('');
const editingNode = ref('');
const editValue = ref('');

const handleNodeClick = (node) => {
  selectedNode.value = node.path;
  editingNode.value = '';
};

const startEdit = (node) => {
  editingNode.value = node.path;
  editValue.value = String(node.content);
};

const saveEdit = (node) => {
  // 更新数据
  console.log('保存编辑：', node.path, editValue.value);
  editingNode.value = '';
};

const editKey = (node) => {
  console.log('编辑键：', node.key);
};
</script>

<style scoped>
.key {
  font-weight: 500;
}

.edit-btn {
  margin-left: 8px;
  padding: 2px 4px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.edit-input {
  padding: 2px 8px;
  border: 1px solid #1890ff;
  border-radius: 4px;
}
</style>
```

### 示例 3：带搜索高亮的 JSON 查看器

```vue
<template>
  <div>
    <input 
      v-model="searchKeyword" 
      placeholder="搜索..."
      class="search-input"
    />
    
    <vue-json-pretty :data="data">
      <template #renderNodeKey="{ node }">
        <span v-html="highlightText(node.key, searchKeyword)"></span>
      </template>
      
      <template #renderNodeValue="{ node, defaultValue }">
        <span v-html="highlightText(String(node.content), searchKeyword)"></span>
      </template>
    </vue-json-pretty>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const data = ref({ /* ... */ });
const searchKeyword = ref('');

const highlightText = (text, keyword) => {
  if (!keyword || !text) return text;
  
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, '<mark class="highlight">$1</mark>');
};
</script>

<style scoped>
.search-input {
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

:deep(.highlight) {
  background: #fff566;
  padding: 0 2px;
}
</style>
```

## 注意事项

### 1. 插槽参数类型

插槽参数中的 `defaultKey` 和 `defaultValue` 是 VNode 类型，需要使用 Vue 的渲染函数或直接在模板中使用。

### 2. 性能考虑

- 避免在插槽中执行复杂的计算
- 对于大数据量，建议使用虚拟滚动

### 3. 事件处理

在插槽中添加事件监听器时，使用 `.stop` 修饰符防止事件冒泡：
```vue
<button @click.stop="handleClick">按钮</button>
```

### 4. 样式作用域

如果使用 `scoped` 样式，需要使用 `:deep()` 选择器来修改组件内部样式：
```vue
<style scoped>
:deep(.custom-class) {
  color: red;
}
</style>
```

## 相关文档

- [Props 配置](Props配置.md) - 组件属性配置
- [Events 事件](Events事件.md) - 组件事件说明
- [DataStructures 数据结构](DataStructures数据结构.md) - NodeData 类型说明
- [如何展开收缩节点](../指南/如何展开收缩节点.md) - 展开收缩功能使用指南
