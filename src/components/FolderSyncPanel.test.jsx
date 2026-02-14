import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FolderSyncPanel from './FolderSyncPanel';

describe('FolderSyncPanel', () => {
  it('renders the panel title', () => {
    render(<FolderSyncPanel onLoadFile={() => {}} />);
    // Check for the folder sync label
    const label = screen.getByText(/Local Folder|ローカルフォルダ/);
    expect(label).toBeInTheDocument();
  });

  it('shows not-supported message when API unavailable', () => {
    // jsdom does not have showDirectoryPicker, so isSupported() returns false
    render(<FolderSyncPanel onLoadFile={() => {}} />);
    const msg = screen.getByText(/not supported|非対応/);
    expect(msg).toBeInTheDocument();
  });

  it('shows fallback file input when API unavailable', () => {
    render(<FolderSyncPanel onLoadFile={() => {}} />);
    const label = screen.getByText(/Select folder|フォルダ選択/);
    expect(label).toBeInTheDocument();
  });
});
