/**
 * View State Manager - ビュー状態の永続化
 *
 * グローバル設定（wideMode, provider, model）と
 * データセット別設定（cols, sortKey, sortDir, pg, pgSize, widths）を分離管理
 */

const GLOBAL_KEY = 'csv_visualizer_view_global';
const DATASET_PREFIX = 'csv_visualizer_view_ds_';

function safeGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage full or unavailable
  }
}

export function getGlobalState() {
  return safeGet(GLOBAL_KEY) || {};
}

export function setGlobalState(partial) {
  const current = getGlobalState();
  safeSet(GLOBAL_KEY, { ...current, ...partial });
}

export function getDatasetState(datasetId) {
  if (!datasetId) return null;
  return safeGet(DATASET_PREFIX + datasetId);
}

export function setDatasetState(datasetId, partial) {
  if (!datasetId) return;
  const current = getDatasetState(datasetId) || {};
  safeSet(DATASET_PREFIX + datasetId, { ...current, ...partial });
}

export function removeDatasetState(datasetId) {
  if (!datasetId) return;
  try {
    localStorage.removeItem(DATASET_PREFIX + datasetId);
  } catch {
    // ignore
  }
}
