interface JSONFlattenOptions {
  key?: string;
  index?: number;
  showComma: boolean;
  length: number;
  type:
    | 'content'
    | 'objectStart'
    | 'objectEnd'
    | 'objectCollapsed'
    | 'arrayStart'
    | 'arrayEnd'
    | 'arrayCollapsed';
}

export type JSONDataType = string | number | boolean | unknown[] | Record<string, unknown> | null;

export interface JSONFlattenReturnType extends JSONFlattenOptions {
  content: string | number | null | boolean;
  level: number;
  path: string;
}

export function emitError(message: string): void {
  throw new Error(`[VueJSONPretty] ${message}`);
}

export function getDataType(value: unknown): string {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

export function jsonFlatten(
  data: JSONDataType,
  path = 'root',
  level = 0,
  options?: JSONFlattenOptions,
): JSONFlattenReturnType[] {
  const {
    key,
    index,
    type = 'content',
    showComma = false,
    length = 1,
  } = options || ({} as JSONFlattenOptions);
  const dataType = getDataType(data);

  if (dataType === 'array') {
    const inner = arrFlat(
      (data as JSONDataType[]).map((item, idx, arr) =>
        jsonFlatten(item, `${path}[${idx}]`, level + 1, {
          index: idx,
          showComma: idx !== arr.length - 1,
          length,
          type,
        }),
      ),
    ) as JSONFlattenReturnType[];
    return [
      jsonFlatten('[', path, level, {
        showComma: false,
        key,
        length: (data as unknown[]).length,
        type: 'arrayStart',
      })[0],
    ].concat(
      inner,
      jsonFlatten(']', path, level, {
        showComma,
        length: (data as unknown[]).length,
        type: 'arrayEnd',
      })[0],
    );
  } else if (dataType === 'object') {
    const keys = Object.keys(data as Record<string, JSONDataType>);
    const inner = arrFlat(
      keys.map((objKey, idx, arr) =>
        jsonFlatten(
          (data as Record<string, JSONDataType>)[objKey],
          /^[a-zA-Z_]\w*$/.test(objKey) ? `${path}.${objKey}` : `${path}["${objKey}"]`,
          level + 1,
          {
            key: objKey,
            showComma: idx !== arr.length - 1,
            length,
            type,
          },
        ),
      ),
    ) as JSONFlattenReturnType[];
    return [
      jsonFlatten('{', path, level, {
        showComma: false,
        key,
        index,
        length: keys.length,
        type: 'objectStart',
      })[0],
    ].concat(
      inner,
      jsonFlatten('}', path, level, { showComma, length: keys.length, type: 'objectEnd' })[0],
    );
  }

  return [
    {
      content: data as JSONFlattenReturnType['content'],
      level,
      key,
      index,
      path,
      showComma,
      length,
      type,
    },
  ];
}

export function arrFlat<T extends unknown[]>(arr: T): unknown[] {
  if (typeof Array.prototype.flat === 'function') {
    return arr.flat();
  }
  const stack = [...arr];
  const result = [];
  while (stack.length) {
    const first = stack.shift();
    if (Array.isArray(first)) {
      stack.unshift(...first);
    } else {
      result.push(first);
    }
  }
  return result;
}

export function cloneDeep<T extends unknown>(source: T, hash = new WeakMap()): T {
  if (source === null || source === undefined) return source;
  if (source instanceof Date) return new Date(source) as T;
  if (source instanceof RegExp) return new RegExp(source) as T;
  if (typeof source !== 'object') return source;
  if (hash.get(source as Record<string, unknown>))
    return hash.get(source as Record<string, unknown>);

  if (Array.isArray(source)) {
    const output = source.map(item => cloneDeep(item, hash));
    hash.set(source, output);
    return output as T;
  }
  const output = {} as T;
  for (const key in source) {
    output[key] = cloneDeep(source[key], hash);
  }
  hash.set(source as Record<string, unknown>, output);
  return output as T;
}

export function stringToAutoType(source: string): unknown {
  let value;
  if (source === 'null') value = null;
  else if (source === 'undefined') value = undefined;
  else if (source === 'true') value = true;
  else if (source === 'false') value = false;
  else if (
    source[0] + source[source.length - 1] === '""' ||
    source[0] + source[source.length - 1] === "''"
  ) {
    value = source.slice(1, -1);
  } else if ((typeof Number(source) === 'number' && !isNaN(Number(source))) || source === 'NaN') {
    value = Number(source);
  } else {
    value = source;
  }
  return value;
}

export function createSearchRegex(
  keyword: string,
  options: { caseSensitive?: boolean; regex?: boolean } = {},
): RegExp | null {
  if (!keyword) return null;

  const { caseSensitive = false, regex = false } = options;

  try {
    const flags = caseSensitive ? 'g' : 'gi';
    if (regex) {
      return new RegExp(keyword, flags);
    }
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(escaped, flags);
  } catch {
    return null;
  }
}

/**
 * 安全地获取嵌套属性值，替代 new Function 以兼容 CSP 环境
 * @param data - 数据源对象
 * @param path - 相对路径（不含 rootPath 前缀），如 ".users[0].name" 或 "[0]"
 */
export function getNestedValue(data: unknown, path: string): unknown {
  if (!path || typeof data !== 'object' || data === null) {
    return data;
  }

  const pathParts = parsePath(path);
  let current: unknown = data;

  for (const part of pathParts) {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (Array.isArray(current)) {
      const index = parseInt(part, 10);
      if (isNaN(index)) return undefined;
      current = current[index];
    } else if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * 安全地设置嵌套属性值，替代 new Function 以兼容 CSP 环境
 * @param data - 数据源对象（会被直接修改）
 * @param path - 相对路径（不含 rootPath 前缀），如 ".users[0].name" 或 "[0]"
 * @param value - 要设置的值
 */
export function setNestedValue(data: unknown, path: string, value: unknown): void {
  if (!path || typeof data !== 'object' || data === null) {
    return;
  }

  const pathParts = parsePath(path);
  let current: unknown = data;

  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    const isLast = i === pathParts.length - 1;

    if (current === null || current === undefined) {
      return;
    }

    if (Array.isArray(current)) {
      const index = parseInt(part, 10);
      if (isNaN(index)) return;
      if (isLast) {
        current[index] = value;
      } else {
        current = current[index];
      }
    } else if (typeof current === 'object') {
      if (isLast) {
        (current as Record<string, unknown>)[part] = value;
      } else {
        current = (current as Record<string, unknown>)[part];
      }
    } else {
      return;
    }
  }
}

/**
 * 将路径字符串解析为路径片段数组
 * 支持三种格式（与 jsonFlatten 生成的路径格式一致）：
 *   - 标识符访问：.key         → ['key']
 *   - 数组索引：[0]           → ['0']
 *   - 特殊键名：["key-name"] → ['key-name']
 * @param path - 路径字符串，如 ".users[0].name" 或 "["special-key"]"
 */
function parsePath(path: string): string[] {
  const parts: string[] = [];
  const regex = /([a-zA-Z_]\w*)|\[(\d+)\]|\["([^"]+)"\]/g;
  let match;

  while ((match = regex.exec(path)) !== null) {
    if (match[1]) {
      parts.push(match[1]);
    } else if (match[2]) {
      parts.push(match[2]);
    } else if (match[3]) {
      parts.push(match[3]);
    }
  }

  return parts;
}
