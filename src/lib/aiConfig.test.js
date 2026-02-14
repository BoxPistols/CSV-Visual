import { describe, it, expect, beforeEach } from 'vitest';
import { setKey, getKey, hasKey, removeKey } from './aiConfig';

beforeEach(() => {
  localStorage.clear();
});

describe('aiConfig', () => {
  it('returns empty string when no key stored', () => {
    expect(getKey('openai')).toBe('');
  });

  it('hasKey returns false when no key stored', () => {
    expect(hasKey('openai')).toBe(false);
  });

  it('saves and retrieves a key', () => {
    setKey('openai', 'sk-test-123');
    expect(getKey('openai')).toBe('sk-test-123');
    expect(hasKey('openai')).toBe(true);
  });

  it('removes a key', () => {
    setKey('openai', 'sk-test-123');
    removeKey('openai');
    expect(getKey('openai')).toBe('');
    expect(hasKey('openai')).toBe(false);
  });

  it('isolates keys by provider', () => {
    setKey('openai', 'sk-openai');
    setKey('gemini', 'ai-gemini');
    expect(getKey('openai')).toBe('sk-openai');
    expect(getKey('gemini')).toBe('ai-gemini');
  });

  it('overwrites existing key', () => {
    setKey('openai', 'old-key');
    setKey('openai', 'new-key');
    expect(getKey('openai')).toBe('new-key');
  });
});
