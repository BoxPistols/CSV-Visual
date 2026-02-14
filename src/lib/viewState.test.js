import { describe, it, expect, beforeEach } from 'vitest';
import { getGlobalState, setGlobalState, getDatasetState, setDatasetState, removeDatasetState } from './viewState';

beforeEach(() => {
  localStorage.clear();
});

describe('viewState', () => {
  describe('global state', () => {
    it('returns empty object when nothing stored', () => {
      expect(getGlobalState()).toEqual({});
    });

    it('saves and retrieves global state', () => {
      setGlobalState({ wideMode: true, provider: 'openai', model: 'gpt-5-nano' });
      const state = getGlobalState();
      expect(state.wideMode).toBe(true);
      expect(state.provider).toBe('openai');
      expect(state.model).toBe('gpt-5-nano');
    });

    it('merges partial updates', () => {
      setGlobalState({ wideMode: true, provider: 'openai' });
      setGlobalState({ provider: 'gemini' });
      const state = getGlobalState();
      expect(state.wideMode).toBe(true);
      expect(state.provider).toBe('gemini');
    });
  });

  describe('dataset state', () => {
    it('returns null when nothing stored', () => {
      expect(getDatasetState('ds_123')).toBeNull();
    });

    it('saves and retrieves dataset state', () => {
      setDatasetState('ds_123', { sortKey: 'name', sortDir: 'asc', pg: 2, pgSize: 50 });
      const state = getDatasetState('ds_123');
      expect(state.sortKey).toBe('name');
      expect(state.pg).toBe(2);
    });

    it('merges partial updates', () => {
      setDatasetState('ds_123', { sortKey: 'name', pg: 1 });
      setDatasetState('ds_123', { pg: 3 });
      const state = getDatasetState('ds_123');
      expect(state.sortKey).toBe('name');
      expect(state.pg).toBe(3);
    });

    it('removes dataset state', () => {
      setDatasetState('ds_123', { sortKey: 'name' });
      removeDatasetState('ds_123');
      expect(getDatasetState('ds_123')).toBeNull();
    });

    it('ignores null/undefined datasetId', () => {
      setDatasetState(null, { sortKey: 'name' });
      expect(getDatasetState(null)).toBeNull();
      setDatasetState(undefined, { sortKey: 'name' });
      expect(getDatasetState(undefined)).toBeNull();
    });

    it('isolates different datasets', () => {
      setDatasetState('ds_1', { sortKey: 'a' });
      setDatasetState('ds_2', { sortKey: 'b' });
      expect(getDatasetState('ds_1').sortKey).toBe('a');
      expect(getDatasetState('ds_2').sortKey).toBe('b');
    });
  });
});
