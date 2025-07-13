import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pattern } from '../types/Pattern';

const STORAGE_KEY = 'patterns';

export const PatternStorage = {
  async getAll(): Promise<Pattern[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Failed to load patterns:', error);
      return [];
    }
  },

  async save(pattern: Pattern): Promise<void> {
    try {
      const patterns = await this.getAll();
      const existingIndex = patterns.findIndex(p => p.id === pattern.id);
      
      if (existingIndex >= 0) {
        // 更新现有 pattern
        patterns[existingIndex] = {
          ...pattern,
          updatedAt: Date.now()
        };
      } else {
        // 添加新 pattern
        patterns.push({
          ...pattern,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }

      // 按更新时间排序
      patterns.sort((a, b) => b.updatedAt - a.updatedAt);
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
    } catch (error) {
      console.error('Failed to save pattern:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const patterns = await this.getAll();
      const filtered = patterns.filter(p => p.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete pattern:', error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear patterns:', error);
      throw error;
    }
  }
}; 