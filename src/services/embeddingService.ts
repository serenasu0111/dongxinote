import { Note } from '../models';
import { generateEmbedding as generateEmbeddingAI } from './aiService';

export const generateEmbedding = async (text: string): Promise<number[]> => {
  return generateEmbeddingAI(text);
};

export const findSimilarNotes = async (
  userId: string, 
  embedding: number[], 
  excludeNoteId?: string,
  limit: number = 5
) => {
  try {
    const query: any = { 
      userId,
      embedding: { $exists: true, $ne: [] }
    };
    
    if (excludeNoteId) {
      query._id = { $ne: excludeNoteId };
    }

    const notes = await Note.find(query)
      .select('originalContent ocrContent inventoryId embedding')
      .limit(50);

    const scoredNotes = notes.map(note => {
      const similarity = cosineSimilarity(embedding, note.embedding);
      return { note, score: similarity };
    });

    return scoredNotes
      .filter(item => item.score > 0.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({ ...item.note.toObject(), score: item.score }));
  } catch (error) {
    console.error('查找相似笔记失败:', error);
    return [];
  }
};

export const semanticSearch = async (
  userId: string,
  embedding: number[],
  limit: number = 20
) => {
  return findSimilarNotes(userId, embedding, undefined, limit);
};

const cosineSimilarity = (vec1: number[], vec2: number[]): number => {
  if (vec1.length === 0 || vec2.length === 0) return 0;
  
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  
  return dotProduct / (magnitude1 * magnitude2);
};
