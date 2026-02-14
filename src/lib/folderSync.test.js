import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isSupported, FolderSync } from './folderSync';

describe('folderSync', () => {
  describe('isSupported', () => {
    it('returns false when showDirectoryPicker is not available', () => {
      // jsdom does not have showDirectoryPicker
      expect(isSupported()).toBe(false);
    });
  });

  describe('FolderSync', () => {
    let sync;

    beforeEach(() => {
      sync = new FolderSync();
    });

    it('starts disconnected', () => {
      expect(sync.connected).toBe(false);
      expect(sync.directoryName).toBe('');
    });

    it('listFiles returns empty when not connected', async () => {
      const files = await sync.listFiles();
      expect(files).toEqual([]);
    });

    it('pickDirectory throws when not supported', async () => {
      await expect(sync.pickDirectory()).rejects.toThrow('not supported');
    });

    it('disconnect resets state', () => {
      sync._dirHandle = { name: 'test' };
      sync.disconnect();
      expect(sync.connected).toBe(false);
      expect(sync.directoryName).toBe('');
    });

    it('stopAutoSync clears interval', () => {
      const clearSpy = vi.spyOn(global, 'clearInterval');
      sync._intervalId = 123;
      sync.stopAutoSync();
      expect(clearSpy).toHaveBeenCalledWith(123);
      expect(sync._intervalId).toBeNull();
      clearSpy.mockRestore();
    });

    describe('with mock directory handle', () => {
      const mockCsvEntry = {
        kind: 'file',
        name: 'data.csv',
        getFile: () =>
          Promise.resolve({
            name: 'data.csv',
            text: () => Promise.resolve('a,b\n1,2'),
            size: 7,
            lastModified: 1000,
          }),
      };
      const mockJsonEntry = {
        kind: 'file',
        name: 'info.json',
        getFile: () =>
          Promise.resolve({
            name: 'info.json',
            text: () => Promise.resolve('[]'),
            size: 2,
            lastModified: 2000,
          }),
      };
      const mockTxtEntry = { kind: 'file', name: 'readme.txt' };
      const mockDirEntry = { kind: 'directory', name: 'subdir' };

      beforeEach(() => {
        sync._dirHandle = {
          name: 'TestFolder',
          async *values() {
            yield mockCsvEntry;
            yield mockJsonEntry;
            yield mockTxtEntry;
            yield mockDirEntry;
          },
        };
      });

      it('connected returns true', () => {
        expect(sync.connected).toBe(true);
        expect(sync.directoryName).toBe('TestFolder');
      });

      it('listFiles returns only csv/json files sorted', async () => {
        const files = await sync.listFiles();
        expect(files).toHaveLength(2);
        expect(files[0].name).toBe('data.csv');
        expect(files[0].type).toBe('CSV');
        expect(files[1].name).toBe('info.json');
        expect(files[1].type).toBe('JSON');
      });

      it('readFile reads file content', async () => {
        const result = await sync.readFile(mockCsvEntry);
        expect(result.name).toBe('data.csv');
        expect(result.text).toBe('a,b\n1,2');
        expect(result.size).toBe(7);
      });
    });
  });
});
