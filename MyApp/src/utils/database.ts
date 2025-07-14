import * as SQLite from 'expo-sqlite';
import { Pattern } from '../types/Pattern';
import { Counter, RowCounter, ShapeCounter } from '../components/Counter/CounterTypes';

export const db = SQLite.openDatabaseSync('knitting.db');

export const initDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    
    // 创建 patterns 表
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS patterns (
        id TEXT PRIMARY KEY,
        name TEXT,
        project_name TEXT,
        needle_size TEXT,
        created_at INTEGER,
        updated_at INTEGER
      );
    `);
    console.log('Created patterns table');

    // 创建 pattern_images 表
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS pattern_images (
        id TEXT PRIMARY KEY,
        pattern_id TEXT,
        image_uri TEXT,
        sort_order INTEGER,
        FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE
      );
    `);
    console.log('Created pattern_images table');

    // 创建 user_photos 表
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_photos (
        id TEXT PRIMARY KEY,
        pattern_id TEXT,
        photo_uri TEXT,
        created_at INTEGER,
        FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE
      );
    `);
    console.log('Created user_photos table');

    // 创建 notes 表
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        pattern_id TEXT,
        content TEXT,
        updated_at INTEGER,
        FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE
      );
    `);
    console.log('Created notes table');

    // 创建 counters 表
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS counters (
        id TEXT PRIMARY KEY,
        pattern_id TEXT,
        name TEXT,
        type TEXT CHECK(type IN ('row', 'shape')),
        sort_order INTEGER,
        current_row INTEGER,
        start_row INTEGER,
        end_row INTEGER,
        current_times INTEGER,
        max_times INTEGER,
        current_rows INTEGER,
        max_rows INTEGER,
        created_at INTEGER,
        updated_at INTEGER,
        FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE
      );
    `);
    console.log('Created counters table');
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Pattern相关操作
export const PatternDB = {
  // 保存新的Pattern
  savePattern: async (pattern: Pattern, images: string[]): Promise<void> => {
    console.log('Saving pattern:', pattern);
    await db.withTransactionAsync(async () => {
      // 插入Pattern
      await db.runAsync(
        `INSERT INTO patterns (id, name, project_name, needle_size, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          pattern.id,
          pattern.name,
          pattern.projectName,
          pattern.needleSize,
          pattern.createdAt,
          pattern.updatedAt
        ]
      );
      console.log('Pattern saved to database');

      // 插入图片
      for (let i = 0; i < images.length; i++) {
        await db.runAsync(
          `INSERT INTO pattern_images (id, pattern_id, image_uri, sort_order)
           VALUES (?, ?, ?, ?)`,
          [
            `${pattern.id}_img_${i}`,
            pattern.id,
            images[i],
            i
          ]
        );
      }
      console.log('Pattern images saved:', images.length, 'images');
    });
  },

  // 获取所有Pattern
  getAllPatterns: async (): Promise<Pattern[]> => {
    console.log('Getting all patterns');
    const result = await db.getAllAsync<any>(
      `SELECT p.*, GROUP_CONCAT(pi.image_uri) as images
       FROM patterns p
       LEFT JOIN pattern_images pi ON p.id = pi.pattern_id
       GROUP BY p.id
       ORDER BY p.created_at DESC`
    );
    console.log('Found patterns:', result.length);

    return result.map(row => ({
      id: row.id,
      name: row.name,
      projectName: row.project_name,
      needleSize: row.needle_size,
      images: row.images ? row.images.split(',') : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  },

  // 获取单个Pattern
  getPattern: async (id: string): Promise<Pattern> => {
    const row = await db.getFirstAsync<any>(
      `SELECT p.*, GROUP_CONCAT(pi.image_uri) as images
       FROM patterns p
       LEFT JOIN pattern_images pi ON p.id = pi.pattern_id
       WHERE p.id = ?
       GROUP BY p.id`,
      [id]
    );

    if (!row) {
      throw new Error('Pattern not found');
    }

    return {
      id: row.id,
      name: row.name,
      projectName: row.project_name,
      needleSize: row.needle_size,
      images: row.images ? row.images.split(',') : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  },

  // 删除Pattern
  deletePattern: async (id: string): Promise<void> => {
    await db.runAsync('DELETE FROM patterns WHERE id = ?', [id]);
  }
};

// 计数器相关操作
export const CounterDB = {
  // 保存计数器
  saveCounters: async (patternId: string, counters: Counter[]): Promise<void> => {
    await db.withTransactionAsync(async () => {
      // 先删除该pattern的所有计数器
      await db.runAsync('DELETE FROM counters WHERE pattern_id = ?', [patternId]);

      // 插入新的计数器
      for (const [index, counter] of counters.entries()) {
        await db.runAsync(
          `INSERT INTO counters (
            id, pattern_id, name, type, sort_order,
            current_row, start_row, end_row,
            current_times, max_times, current_rows, max_rows,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            counter.id,
            patternId,
            counter.name,
            counter.type,
            index,
            counter.type === 'row' ? (counter as RowCounter).currentRow : null,
            counter.type === 'row' ? (counter as RowCounter).startRow : null,
            counter.type === 'row' ? (counter as RowCounter).endRow : null,
            counter.type === 'shape' ? (counter as ShapeCounter).currentTimes : null,
            counter.type === 'shape' ? (counter as ShapeCounter).maxTimes : null,
            counter.type === 'shape' ? (counter as ShapeCounter).currentRows : null,
            counter.type === 'shape' ? (counter as ShapeCounter).maxRows : null,
            Date.now(),
            Date.now()
          ]
        );
      }
    });
  },

  // 获取Pattern的所有计数器
  getCounters: async (patternId: string): Promise<Counter[]> => {
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM counters WHERE pattern_id = ? ORDER BY sort_order',
      [patternId]
    );

    return rows.map(row => {
      if (row.type === 'row') {
        return {
          id: row.id,
          name: row.name,
          type: 'row' as const,
          currentRow: row.current_row,
          startRow: row.start_row,
          endRow: row.end_row
        };
      } else {
        return {
          id: row.id,
          name: row.name,
          type: 'shape' as const,
          currentTimes: row.current_times,
          maxTimes: row.max_times,
          currentRows: row.current_rows,
          maxRows: row.max_rows
        };
      }
    });
  }
}; 