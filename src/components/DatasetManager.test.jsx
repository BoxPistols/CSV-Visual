import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DatasetManager from './DatasetManager';

beforeEach(() => {
  localStorage.clear();
});

const noop = () => {};

describe('DatasetManager', () => {
  describe('save button visibility', () => {
    it('shows save button when headers and rows exist', () => {
      render(
        <DatasetManager
          headers={['a', 'b']}
          rows={[{ a: '1', b: '2' }]}
          fileInfo={{ name: 'test.csv', type: 'CSV' }}
          onLoad={noop}
          onRowAdd={noop}
        />
      );
      const buttons = screen.getAllByRole('button');
      const saveBtn = buttons.find(b => b.textContent.match(/save to library|ライブラリに保存/i));
      expect(saveBtn).toBeTruthy();
    });

    it('does not show save button when no data', () => {
      const { container } = render(
        <DatasetManager
          headers={[]}
          rows={[]}
          fileInfo={null}
          onLoad={noop}
          onRowAdd={noop}
        />
      );
      const buttons = container.querySelectorAll('button');
      const saveBtn = Array.from(buttons).find(b => b.textContent.match(/save to library|ライブラリに保存/i));
      expect(saveBtn).toBeUndefined();
    });

    it('does not show save button when headers exist but rows are empty', () => {
      const { container } = render(
        <DatasetManager
          headers={['a']}
          rows={[]}
          fileInfo={null}
          onLoad={noop}
          onRowAdd={noop}
        />
      );
      const buttons = container.querySelectorAll('button');
      const saveBtn = Array.from(buttons).find(b => b.textContent.match(/save to library|ライブラリに保存/i));
      expect(saveBtn).toBeUndefined();
    });
  });

  describe('save dialog', () => {
    it('opens save dialog on save button click', () => {
      render(
        <DatasetManager
          headers={['a']}
          rows={[{ a: '1' }]}
          fileInfo={{ name: 'data.csv', type: 'CSV' }}
          onLoad={noop}
          onRowAdd={noop}
        />
      );

      const buttons = screen.getAllByRole('button');
      const saveBtn = buttons.find(b => b.textContent.match(/save to library|ライブラリに保存/i));
      fireEvent.click(saveBtn);

      const nameInput = document.querySelector('input[placeholder]');
      expect(nameInput).toBeInTheDocument();
    });

    it('closes save dialog on cancel', () => {
      render(
        <DatasetManager
          headers={['a']}
          rows={[{ a: '1' }]}
          fileInfo={{ name: 'data.csv', type: 'CSV' }}
          onLoad={noop}
          onRowAdd={noop}
        />
      );

      const buttons = screen.getAllByRole('button');
      const saveBtn = buttons.find(b => b.textContent.match(/save to library|ライブラリに保存/i));
      fireEvent.click(saveBtn);

      const nameInput = document.querySelector('input[placeholder]');
      expect(nameInput).toBeInTheDocument();

      const allBtns = screen.getAllByRole('button');
      const cancelBtn = allBtns.find(b => b.textContent.match(/cancel|キャンセル/i));
      fireEvent.click(cancelBtn);

      const saveBtnAfter = screen.getAllByRole('button').find(b => b.textContent.match(/save to library|ライブラリに保存/i));
      expect(saveBtnAfter).toBeTruthy();
    });
  });

  describe('saved datasets accordion', () => {
    it('renders a details element for saved datasets', () => {
      const { container } = render(
        <DatasetManager
          headers={[]}
          rows={[]}
          fileInfo={null}
          onLoad={noop}
          onRowAdd={noop}
        />
      );
      const details = container.querySelector('details');
      expect(details).toBeInTheDocument();
      const summary = container.querySelector('summary');
      expect(summary).toBeInTheDocument();
      expect(summary.textContent).toMatch(/saved datasets|保存済みデータセット/i);
    });

    it('shows empty state inside details when no datasets saved', async () => {
      const { container } = render(
        <DatasetManager
          headers={[]}
          rows={[]}
          fileInfo={null}
          onLoad={noop}
          onRowAdd={noop}
        />
      );
      // DatasetList is always mounted inside <details>
      // Initial state has empty datasets, so empty message shows immediately
      // Use container query to find text regardless of <details> open state
      const detailsDiv = container.querySelector('details > div');
      expect(detailsDiv).toBeInTheDocument();
      // The empty message appears after the async storage.list() resolves
      await vi.waitFor(() => {
        const text = detailsDiv.textContent;
        expect(text).toMatch(/no saved datasets|保存済みのデータセットはありません/i);
      });
    });
  });
});
