import { db } from './database';

export class PhotoStorage {
  static async init() {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pattern_id TEXT NOT NULL,
        photo_uri TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  static async savePhoto(patternId: string, photoUri: string): Promise<void> {
    await db.runAsync(
      'INSERT INTO user_photos (pattern_id, photo_uri) VALUES (?, ?)',
      [patternId, photoUri]
    );
  }

  static async getPhotos(patternId: string): Promise<string[]> {
    const rows = await db.getAllAsync<{ photo_uri: string }>(
      'SELECT photo_uri FROM user_photos WHERE pattern_id = ? ORDER BY created_at ASC',
      [patternId]
    );
    return rows.map(row => row.photo_uri);
  }

  static async deletePhoto(patternId: string, photoUri: string): Promise<void> {
    await db.runAsync(
      'DELETE FROM user_photos WHERE pattern_id = ? AND photo_uri = ?',
      [patternId, photoUri]
    );
  }
} 