<template>
  <div class="search-demo">
    <h2>搜索功能示例</h2>
    
    <div class="search-controls">
      <input
        v-model="keyword"
        type="text"
        placeholder="输入搜索关键词..."
        @keyup.enter="handleSearch"
        class="search-input"
      />
      <button @click="handleSearch" class="btn">搜索</button>
      <button @click="handleNext" class="btn" :disabled="!hasResults">下一个</button>
      <button @click="handlePrev" class="btn" :disabled="!hasResults">上一个</button>
      <button @click="handleClear" class="btn btn-secondary">清除</button>
      
      <label class="checkbox-label">
        <input type="checkbox" v-model="caseSensitive" />
        大小写敏感
      </label>
      
      <label class="checkbox-label">
        <input type="checkbox" v-model="useRegex" />
        正则表达式
      </label>
    </div>
    
    <div v-if="resultInfo" class="result-info">
      {{ resultInfo }}
    </div>
    
    <div class="search-tips">
      <strong>搜索提示：</strong>
      <span>试试搜索 "User_50"、"Beijing"、"Engineering"、"email" 等关键词</span>
    </div>
    
    <div class="json-container">
      <vue-json-pretty
        ref="jsonTreeRef"
        :data="data"
        :virtual="useVirtual"
        :height="500"
        :deep="3"
        @search-result-change="handleResultChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import VueJsonPretty from 'src';

const jsonTreeRef = ref();
const keyword = ref('');
const caseSensitive = ref(false);
const useRegex = ref(false);
const useVirtual = ref(true);
const results = ref([]);
const currentIndex = ref(-1);

const generateLargeData = () => {
  const users = [];
  const cities = ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Hangzhou', 'Chengdu', 'Wuhan', 'Xian'];
  const hobbies = ['reading', 'swimming', 'gaming', 'music', 'travel', 'photography', 'cooking', 'sports'];
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
  
  for (let i = 1; i <= 100; i++) {
    users.push({
      id: i,
      name: `User_${i}`,
      email: `user${i}@example.com`,
      age: 20 + (i % 40),
      department: departments[i % departments.length],
      profile: {
        city: cities[i % cities.length],
        hobbies: [hobbies[i % hobbies.length], hobbies[(i + 1) % hobbies.length]],
        score: Math.floor(Math.random() * 1000)
      }
    });
  }
  
  return {
    title: 'Large Dataset Demo',
    description: 'This is a large dataset to demonstrate search functionality with virtual scrolling',
    users: users,
    statistics: {
      totalUsers: users.length,
      averageAge: 40,
      cities: cities,
      departments: departments
    },
    settings: {
      theme: 'dark',
      language: 'zh-CN',
      notifications: {
        email: true,
        push: false,
        sms: true
      },
      features: {
        search: true,
        virtualScroll: true,
        highlight: true
      }
    },
    metadata: {
      version: '2.0.0',
      createdAt: '2024-01-01',
      updatedAt: '2024-12-31',
      author: 'Vue Json Pretty Team'
    }
  };
};

const data = ref(generateLargeData());

const hasResults = computed(() => results.value.length > 0);

const resultInfo = computed(() => {
  if (results.value.length === 0) return '';
  return `找到 ${results.value.length} 个结果，当前第 ${currentIndex.value + 1} 个`;
});

const handleSearch = () => {
  if (!keyword.value.trim()) {
    handleClear();
    return;
  }
  
  const searchResults = jsonTreeRef.value?.search({
    keyword: keyword.value,
    caseSensitive: caseSensitive.value,
    regex: useRegex.value,
  });
  
  results.value = searchResults || [];
  currentIndex.value = results.value.length > 0 ? 0 : -1;
};

const handleNext = () => {
  const result = jsonTreeRef.value?.scrollToNextResult();
  if (result) {
    currentIndex.value = jsonTreeRef.value?.currentResultIndex || 0;
  }
};

const handlePrev = () => {
  const result = jsonTreeRef.value?.scrollToPrevResult();
  if (result) {
    currentIndex.value = jsonTreeRef.value?.currentResultIndex || 0;
  }
};

const handleClear = () => {
  jsonTreeRef.value?.clearSearch();
  keyword.value = '';
  results.value = [];
  currentIndex.value = -1;
};

const handleResultChange = (newResults) => {
  results.value = newResults;
  currentIndex.value = newResults.length > 0 ? 0 : -1;
};
</script>

<style scoped>
.search-demo {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}

.search-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
  align-items: center;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 250px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #4a90d9;
}

.btn {
  padding: 8px 16px;
  background: #4a90d9;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn:hover:not(:disabled) {
  background: #357abd;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
}

.btn-secondary:hover {
  background: #5a6268;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.result-info {
  padding: 10px;
  background: #e7f3ff;
  border-radius: 4px;
  margin-bottom: 15px;
  color: #0066cc;
  font-size: 14px;
}

.search-tips {
  padding: 10px;
  background: #fff8e1;
  border-radius: 4px;
  margin-bottom: 15px;
  color: #856404;
  font-size: 13px;
}

.search-tips strong {
  margin-right: 8px;
}

.json-container {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}
</style>
