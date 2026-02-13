import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from './storage';

beforeEach(() => {
  localStorage.clear();
});

describe('LocalStorageAdapter', () => {
  const sampleData = {
    name: 'Test Dataset',
    description: 'desc',
    fileType: 'CSV',
    headers: ['id', 'name', 'value'],
    rows: [
      { id: '1', name: 'Alice', value: '100' },
      { id: '2', name: 'Bob', value: '200' },
    ],
  };

  describe('create / getById / list', () => {
    it('creates a dataset and retrieves it by id', async () => {
      const created = await storage.create(sampleData);
      expect(created.id).toBeTruthy();
      expect(created.name).toBe('Test Dataset');
      expect(created.rows).toHaveLength(2);

      const fetched = await storage.getById(created.id);
      expect(fetched).toEqual(created);
    });

    it('list returns metadata without rows', async () => {
      await storage.create(sampleData);
      const list = await storage.list();
      expect(list).toHaveLength(1);
      expect(list[0].rowCount).toBe(2);
      expect(list[0].rows).toBeUndefined();
    });

    it('getById returns null for unknown id', async () => {
      expect(await storage.getById('nonexistent')).toBeNull();
    });
  });

  describe('update', () => {
    it('updates name and description', async () => {
      const ds = await storage.create(sampleData);
      const updated = await storage.update(ds.id, { name: 'Renamed' });
      expect(updated.name).toBe('Renamed');
      expect(updated.description).toBe('desc');
    });

    it('throws on unknown id', async () => {
      await expect(storage.update('bad_id', { name: 'x' })).rejects.toThrow('Dataset not found');
    });
  });

  describe('remove', () => {
    it('removes a dataset', async () => {
      const ds = await storage.create(sampleData);
      await storage.remove(ds.id);
      expect(await storage.getById(ds.id)).toBeNull();
      expect(await storage.list()).toHaveLength(0);
    });
  });

  describe('row operations', () => {
    it('addRow appends a row', async () => {
      const ds = await storage.create(sampleData);
      await storage.addRow(ds.id, { id: '3', name: 'Carol', value: '300' });
      const fetched = await storage.getById(ds.id);
      expect(fetched.rows).toHaveLength(3);
      expect(fetched.rows[2].name).toBe('Carol');
    });

    it('removeRow removes a row by index', async () => {
      const ds = await storage.create(sampleData);
      await storage.removeRow(ds.id, 0);
      const fetched = await storage.getById(ds.id);
      expect(fetched.rows).toHaveLength(1);
      expect(fetched.rows[0].name).toBe('Bob');
    });

    it('updateRow replaces a row at index', async () => {
      const ds = await storage.create(sampleData);
      await storage.updateRow(ds.id, 1, { id: '2', name: 'Bobby', value: '250' });
      const fetched = await storage.getById(ds.id);
      expect(fetched.rows[1].name).toBe('Bobby');
      expect(fetched.rows[1].value).toBe('250');
    });

    it('addRow throws on unknown id', async () => {
      await expect(storage.addRow('bad_id', {})).rejects.toThrow('Dataset not found');
    });
  });

  describe('exportCsv', () => {
    it('exports CSV string', async () => {
      const ds = await storage.create(sampleData);
      const csv = await storage.exportCsv(ds.id);
      const lines = csv.split('\n');
      expect(lines[0]).toBe('id,name,value');
      expect(lines[1]).toBe('1,Alice,100');
      expect(lines[2]).toBe('2,Bob,200');
    });

    it('escapes values with commas and quotes', async () => {
      const ds = await storage.create({
        ...sampleData,
        rows: [{ id: '1', name: 'Al,ice', value: 'say "hi"' }],
      });
      const csv = await storage.exportCsv(ds.id);
      expect(csv).toContain('"Al,ice"');
      expect(csv).toContain('"say ""hi"""');
    });

    it('throws on unknown id', async () => {
      await expect(storage.exportCsv('bad_id')).rejects.toThrow('Dataset not found');
    });
  });

  describe('exportJson', () => {
    it('exports JSON string of rows', async () => {
      const ds = await storage.create(sampleData);
      const json = await storage.exportJson(ds.id);
      const parsed = JSON.parse(json);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].name).toBe('Alice');
    });

    it('throws on unknown id', async () => {
      await expect(storage.exportJson('bad_id')).rejects.toThrow('Dataset not found');
    });
  });
});
