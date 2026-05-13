<template>
  <div class="example-box">
    <div class="block">
      <h3>JSON:</h3>
      <textarea :class="{ 'dark-textarea': globalDarkModeState }" v-model="state.val"></textarea>

      <h3>Options:</h3>
      <div class="options">
        <div>
          <label>showLine</label>
          <input v-model="state.showLine" type="checkbox" />
        </div>
        <div>
          <label>editableInput (built-in input)</label>
          <input v-model="state.editableInput" type="checkbox" />
        </div>
        <div>
          <label>theme</label>
          <select v-model="localDarkMode">
            <option value="light">light</option>
            <option value="dark">dark</option>
          </select>
        </div>
      </div>

      <h3>API Reference:</h3>
      <div class="api-reference">
        <p><code>startEdit(path)</code> - Enter edit mode for a node</p>
        <p><code>stopEdit()</code> - Exit edit mode</p>
        <p><code>updateValue(path, value)</code> - Update a node's value</p>
        <p style="margin-top: 8px; color: #999;">
          editableTrigger="custom" disables built-in click/dblclick editing,<br />
          so links can navigate normally. Click the &#9998; icon to edit.
        </p>
      </div>
    </div>
    <div class="block">
      <h3>vue-json-pretty (custom edit via API):</h3>
      <vue-json-pretty
        ref="jsonTreeRef"
        v-model:data="state.data"
        :editable="true"
        :editable-trigger="'custom'"
        :editable-input="state.editableInput"
        :show-line="state.showLine"
        :show-double-quotes="true"
        :deep="4"
        :theme="localDarkMode"
      >
        <template #renderNodeValue="{ node, defaultValue }">
          <span class="custom-value" :class="{ 'is-editing': editingPath === node.path }">
            <a
              v-if="isUrl(node.content)"
              :href="node.content"
              target="_blank"
              rel="noopener noreferrer"
              class="custom-link"
              >{{ node.content }}</a
            >
            <template v-else>{{ defaultValue }}</template>
            <span
              v-if="node.type === 'content'"
              class="edit-icon"
              title="Click to edit"
              @click.stop="handleEditClick(node)"
              >&#9998;</span
            >
          </span>
        </template>
      </vue-json-pretty>

      <div v-if="!state.editableInput && editingPath" class="custom-edit-panel">
        <h4>Editing: {{ editingPath }}</h4>
        <input
          ref="editInputRef"
          v-model="editValue"
          class="custom-edit-input"
          @keyup.enter="handleSave"
          @keyup.escape="handleCancel"
        />
        <button class="btn btn-primary" @click="handleSave">Save</button>
        <button class="btn" @click="handleCancel">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, ref, watch, nextTick } from 'vue';
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
  name: 'CustomEdit',
  components: {
    VueJsonPretty,
  },
  setup() {
    const jsonTreeRef = ref(null);
    const editInputRef = ref(null);
    const editingPath = ref('');
    const editValue = ref('');

    const state = reactive({
      val: JSON.stringify(defaultData),
      data: defaultData,
      showLine: true,
      editableInput: true,
    });

    const { localDarkMode, globalDarkModeState } = useDarkMode();

    const isUrl = (content) =>
      typeof content === 'string' &&
      (content.startsWith('http://') || content.startsWith('https://'));

    const handleEditClick = (node) => {
      editingPath.value = node.path;
      editValue.value =
        node.content === null
          ? 'null'
          : node.content === undefined
          ? 'undefined'
          : String(node.content);
      jsonTreeRef.value?.startEdit(node.path);
      if (!state.editableInput) {
        nextTick(() => {
          editInputRef.value?.focus();
        });
      }
    };

    const handleSave = () => {
      if (!editingPath.value) return;
      let value = editValue.value;
      if (value === 'null') value = null;
      else if (value === 'undefined') value = undefined;
      else if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (!isNaN(Number(value)) && value.trim() !== '') value = Number(value);
      else if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      jsonTreeRef.value?.updateValue(editingPath.value, value);
      handleCancel();
    };

    const handleCancel = () => {
      jsonTreeRef.value?.stopEdit();
      editingPath.value = '';
      editValue.value = '';
    };

    watch(
      () => state.val,
      newVal => {
        try {
          state.data = JSON.parse(newVal);
        } catch (err) {
          // ignore
        }
      },
    );

    watch(
      () => state.data,
      newVal => {
        try {
          state.val = JSON.stringify(newVal);
        } catch (err) {
          // ignore
        }
      },
    );

    return {
      jsonTreeRef,
      editInputRef,
      state,
      localDarkMode,
      globalDarkModeState,
      editingPath,
      editValue,
      isUrl,
      handleEditClick,
      handleSave,
      handleCancel,
    };
  },
});
</script>

<style scoped>
.custom-value {
  position: relative;
  display: inline;
}

.custom-link {
  color: #1890ff;
  text-decoration: underline;
}

.custom-link:hover {
  color: #40a9ff;
}

.custom-value.is-editing {
  background-color: rgba(24, 144, 255, 0.15);
  border-radius: 2px;
}

.edit-icon {
  display: inline-block;
  margin-left: 4px;
  cursor: pointer;
  opacity: 0;
  font-size: 12px;
  color: #999;
  transition: opacity 0.2s, color 0.2s;
  vertical-align: middle;
}

.custom-value:hover .edit-icon {
  opacity: 1;
}

.edit-icon:hover {
  color: #1890ff;
}

.custom-edit-panel {
  margin-top: 16px;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #fafafa;
}

.custom-edit-panel h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #666;
  word-break: break-all;
}

.custom-edit-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 8px;
  box-sizing: border-box;
}

.custom-edit-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.btn {
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  margin-right: 8px;
  background: #fff;
}

.btn-primary {
  background: #1890ff;
  border-color: #1890ff;
  color: #fff;
}

.btn-primary:hover {
  background: #40a9ff;
}

.api-reference {
  font-size: 12px;
  color: #666;
}

.api-reference p {
  margin: 4px 0;
}

.api-reference code {
  background: #f0f0f0;
  padding: 1px 4px;
  border-radius: 2px;
  font-family: monospace;
}
</style>
