简体中文 | [English](./README.md)

二次修改满足自身需求，[更新日志](docs/更新日志.md)

## 特性

- 一个 JSON 美化工具
- 使用 Typescript，提供类型描述 `d.ts`
- 支持字段层级数据提取
- 支持大数据虚拟滚动
- 支持编辑

## 📚 文档

完整的使用文档请查看 [docs/README.md](docs/README.md)

### 快速导航

- **新手入门**
  - [快速开始](docs/快速开始.md) - 5 分钟上手教程

- **使用指南**
  - [如何展开收缩节点](docs/指南/如何展开收缩节点.md) - 编程方式控制节点展开收缩

- **API 参考**
  - [Methods 方法](docs/参考/Methods方法.md) - 通过 ref 调用的方法
  - [DataStructures 数据结构](docs/参考/DataStructures数据结构.md) - 类型定义和数据结构

## Props

| 属性                     | 说明                                            | 类型                                           | 默认值        |
| ------------------------ | ----------------------------------------------- | ---------------------------------------------- | ------------- |
| data(v-model)            | 源数据，注意不是 `JSON` 字符串                  | `JSON` 数据对象                                | -             |
| indent                   | 缩进                                            | number                                         | 2             |
| collapsedNodeLength      | 长度大于此阈值的对象或数组将被折叠              | number                                         | Infinity      |
| deep                     | 深度，大于该深度的节点将被折叠                  | number                                         | Infinity      |
| showLength               | 在数据折叠的时候展示长度                        | boolean                                        | false         |
| showLine                 | 展示标识线                                      | boolean                                        | true          |
| showLineNumber           | 展示行计数                                      | boolean                                        | false         |
| showIcon                 | 展示图标                                        | boolean                                        | false         |
| showDoubleQuotes         | 展示 key 名的双引号                             | boolean                                        | true          |
| virtual                  | 使用虚拟滚动(大数据量)                          | boolean                                        | false         |
| height                   | 使用虚拟滚动时，定义总高度                      | number                                         | 400           |
| itemHeight               | 使用虚拟滚动时，定义节点高度(可为预估值)        | number                                         | 20            |
| dynamicHeight            | 使用虚拟滚动时，开启每一行可为动态高度          | boolean                                        | true          |
| selectedValue(v-model)   | 双向绑定选中的数据路径                          | string, array                                  | string, array |
| rootPath                 | 定义最顶层数据路径                              | string                                         | `root`        |
| nodeSelectable           | 定义哪些数据节点可以被选择                      | function(node)                                 | -             |
| selectableType           | 定义选择功能，默认无                            | `multiple` \| `single`                         | -             |
| showSelectController     | 展示选择器                                      | boolean                                        | false         |
| selectOnClickNode        | 支持点击节点的时候触发选择                      | boolean                                        | true          |
| highlightSelectedNode    | 支持高亮已选择节点                              | boolean                                        | true          |
| collapsedOnClickBrackets | 支持点击括号折叠                                | boolean                                        | true          |
| renderNodeKey            | 渲染节点键，也可使用 #renderNodeKey             | ({ node, defaultKey }) => vNode                | -             |
| renderNodeValue          | 自定义渲染节点值，也可使用 #renderNodeValue     | ({ node, defaultValue }) => vNode              | -             |
| renderNodeActions        | 自定义渲染节点操作，也可使用 #renderNodeActions | boolean \| ({ node, defaultActions }) => vNode | false         |
| editable                 | 支持可编辑                                      | boolean                                        | false         |
| editableTrigger          | 触发编辑的时机                                  | `click` \| `dblclick`                          | `click`       |
| theme                    | 主题色                                          | `'light' \| 'dark'`                            | `light`       |

## Events

| 事件名称       | 说明                 | 回调参数                             |
| -------------- | -------------------- | ------------------------------------ |
| nodeClick      | 点击节点时触发       | (node: NodeData)                     |
| nodeMouseover  | 悬浮节点时触发       | (node: NodeData)                     |
| bracketsClick  | 点击括号时触发       | (collapsed: boolean, node: NodeData) |
| iconClick      | 点击图标时触发       | (collapsed: boolean, node: NodeData) |
| selectedChange | 选中值发生变化时触发 | (newVal, oldVal)                     |

## Slots

| 插槽名            | 描述         | 参数                   |
| ----------------- | ------------ | ---------------------- |
| renderNodeKey     | 渲染节点键   | { node, defaultKey }   |
| renderNodeValue   | 渲染节点值   | { node, defaultValue } |
| renderNodeActions | 渲染节点操作 | { node, defaultActions } |
