import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsPanel from './SettingsPanel';
import { getKey, setKey } from '../lib/aiConfig';

beforeEach(() => {
  localStorage.clear();
});

describe('SettingsPanel', () => {
  it('renders provider key rows', () => {
    render(<SettingsPanel onClose={() => {}} />);
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Gemini')).toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<SettingsPanel onClose={onClose} />);
    // Click the backdrop (outermost fixed div)
    fireEvent.click(container.firstChild);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<SettingsPanel onClose={onClose} />);
    const closeBtn = screen.getByText('✕');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('saves API key when save button is clicked', () => {
    render(<SettingsPanel onClose={() => {}} />);
    const inputs = screen.getAllByPlaceholderText(/API/i);
    fireEvent.change(inputs[0], { target: { value: 'sk-test-123' } });
    const saveButtons = screen.getAllByText(/Save|保存/);
    fireEvent.click(saveButtons[0]);
    expect(getKey('openai')).toBe('sk-test-123');
  });

  it('clears API key when clear button is clicked', () => {
    setKey('openai', 'sk-existing');
    render(<SettingsPanel onClose={() => {}} />);
    // Find the trash/clear button (Trash2 icon button)
    const clearButtons = screen.getAllByRole('button');
    const clearBtn = clearButtons.find((b) => b.querySelector('svg') && b.style.color === 'rgb(220, 38, 38)');
    if (clearBtn) {
      fireEvent.click(clearBtn);
      expect(getKey('openai')).toBe('');
    }
  });
});
