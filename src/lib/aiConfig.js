/**
 * AI Config - API キー管理
 *
 * localStorage で各プロバイダーの API キーを管理
 */

const KEY_PREFIX = 'csv_visualizer_apikey_';

export function setKey(provider, key) {
  try {
    localStorage.setItem(KEY_PREFIX + provider, key);
  } catch {
    // localStorage full or unavailable
  }
}

export function getKey(provider) {
  try {
    return localStorage.getItem(KEY_PREFIX + provider) || '';
  } catch {
    return '';
  }
}

export function hasKey(provider) {
  return getKey(provider).length > 0;
}

export function removeKey(provider) {
  try {
    localStorage.removeItem(KEY_PREFIX + provider);
  } catch {
    // ignore
  }
}

/**
 * 接続テスト - 最小リクエストで API キーの有効性を確認
 * @returns {{ ok: boolean, message: string }}
 */
export async function testConnection(provider, apiKey) {
  try {
    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (res.ok) return { ok: true, message: 'OK' };
      const text = await res.text();
      return { ok: false, message: `${res.status}: ${text}` };
    }
    if (provider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (res.ok) return { ok: true, message: 'OK' };
      const text = await res.text();
      return { ok: false, message: `${res.status}: ${text}` };
    }
    return { ok: false, message: 'Unknown provider' };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}
