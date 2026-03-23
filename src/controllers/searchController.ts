import { Response } from 'express';
import mongoose from 'mongoose';
import { Note, Inventory } from '../models';
import { AuthRequest } from '../middleware/auth';
import { generateEmbedding, semanticSearch } from '../services/embeddingService';

export const searchNotes = async (req: AuthRequest, res: Response) => {
  try {
    const { keyword, inventoryId, sort = 'relevance', page = 1, limit = 20 } = req.query;

    const query: any = { userId: req.userId };
    if (inventoryId) {
      query.inventoryId = inventoryId;
    }

    let notes;
    let total;

    if (keyword) {
      const keywordStr = keyword as string;
      const keywordQuery = {
        $or: [
          { originalContent: { $regex: keywordStr, $options: 'i' } },
          { ocrContent: { $regex: keywordStr, $options: 'i' } },
          { remark: { $regex: keywordStr, $options: 'i' } },
          { tags: { $in: [new RegExp(keywordStr, 'i')] } }
        ]
      };

      if (sort === 'time') {
        notes = await Note.find({ ...query, ...keywordQuery })
          .populate('inventoryId', 'name type')
          .sort({ createdAt: -1 })
          .skip((Number(page) - 1) * Number(limit))
          .limit(Number(limit));
      } else {
        const embedding = await generateEmbedding(keywordStr);
        const similarNotes = await semanticSearch(req.userId, embedding, Number(limit) * 2);
        
        const noteIds = similarNotes.map(n => n._id);
        const textMatchedNotes = await Note.find({ ...query, ...keywordQuery, _id: { $nin: noteIds } })
          .populate('inventoryId', 'name type');

        const relevanceMap = new Map();
        for (const note of similarNotes) {
          relevanceMap.set(note._id.toString(), { note, score: note.score });
        }
        for (const note of textMatchedNotes) {
          relevanceMap.set(note._id.toString(), { note, score: 0.5 });
        }

        const sortedNotes = Array.from(relevanceMap.values())
          .sort((a, b) => b.score - a.score)
          .slice(0, Number(limit))
          .map(item => item.note);

        return res.json({
          notes: sortedNotes,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: similarNotes.length + textMatchedNotes.length,
            pages: 1
          }
        });
      }

      total = await Note.countDocuments({ ...query, ...keywordQuery });
    } else {
      notes = await Note.find(query)
        .populate('inventoryId', 'name type')
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));
      total = await Note.countDocuments(query);
    }

    res.json({
      notes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: (error as Error).message });
  }
};

export const getTimeline = async (req: AuthRequest, res: Response) => {
  try {
    const notes = await Note.aggregate([
      { $match: { userId: mongoose.Types.ObjectId.createFromHexString(req.userId!) } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: (error as Error).message });
  }
};
