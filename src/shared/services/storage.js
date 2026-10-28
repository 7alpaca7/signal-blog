/** 浏览器存储是可选能力；隐私模式或格式升级失败时使用默认值。 */
export function readPreference(/** @type {string} */ key, /** @type {boolean} */ fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return value?.version === 1 && typeof value.enabled === 'boolean' ? value.enabled : fallback;
  } catch {
    // 偏好丢失不应影响访问正文。
    return fallback;
  }
}

/** 仅保存非敏感开关，不持久化用户输入或逐帧数据。 */
export function writePreference(/** @type {string} */ key, /** @type {boolean} */ enabled) {
  try {
    localStorage.setItem(key, JSON.stringify({ version: 1, enabled }));
  } catch {
    // 存储不可用时本次会话内的状态仍然有效。
  }
}
