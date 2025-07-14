import { Pattern } from '../types/Pattern';
import { PatternDB } from './database';
import { generateId } from './helpers';

export const PatternStorage = {
  save: async (pattern: Omit<Pattern, 'id' | 'createdAt' | 'updatedAt'>, images: string[]): Promise<void> => {
    const now = Date.now();
    const newPattern: Pattern = {
      ...pattern,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };

    await PatternDB.savePattern(newPattern, images);
  },

  getAll: async (): Promise<Pattern[]> => {
    return PatternDB.getAllPatterns();
  },

  get: async (id: string): Promise<Pattern> => {
    return PatternDB.getPattern(id);
  },

  delete: async (id: string): Promise<void> => {
    return PatternDB.deletePattern(id);
  }
}; 