import { Response } from 'express';
import { Note, Inventory } from '../models';
import { AuthRequest } from '../middleware/auth';
import { generateEmbedding, findSimilarNotes } from '../services/embeddingService';
import { processImageOCR, processDocument } from '../services/ocrService';

export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const { inventoryId, type, originalContent, remark, tags, isFromImage, isFromDocument } = req.body;

    const inventory = await Inventory.findOne({ _id: inventoryId, userId: req.userId });
    if (!inventory) {
      return res.status(404).json({ message: '库存不存在' });
    }

    let ocrContent = '';
    if (isFromImage) {
      ocrContent = await processImageOCR(originalContent);
    } else if (isFromDocument) {
      ocrContent = await processDocument(originalContent);
    }

    const contentToEmbed = ocrContent || originalContent;
    const embedding = await generateEmbedding(contentToEmbed);

    const note = new Note({
      userId: req.userId,
      inventoryId,
      type,
      originalContent,
      ocrContent,
      remark: remark || '',
      tags: tags || [],
      embedding
    });
    await note.save();

    const relatedNotes = await findSimilarNotes(req.userId, embedding, note._id.toString());
    if (relatedNotes.length > 0) {
      note.relatedNotes = relatedNotes.map(n => n._id);
      await note.save();

      for (const relatedNote of relatedNotes) {
        if (!relatedNote.relatedNotes.includes(note._id)) {
          relatedNote.relatedNotes.push(note._id);
          await relatedNote.save();
        }
      }
    }

    await Inventory.findByIdAndUpdate(inventoryId, { $inc: { noteCount: 1 } });

    res.status(201).json({ message: '笔记创建成功', note });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: (error as Error).message });
  }
};

export const getNotes = async (req: AuthRequest, res: Response) => {
  try {
    const { inventoryId, page = 1, limit = 20, tag } = req.query;
    const query: any = { userId: req.userId };

    if (inventoryId) {
      query.inventoryId = inventoryId;
    }
    if (tag) {
      query.tags = tag;
    }

    const notes = await Note.find(query)
      .populate('inventoryId', 'name type')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Note.countDocuments(query);

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

export const getNote = async (req: AuthRequest, res: Response) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId })
      .populate('inventoryId', 'name type')
      .populate('relatedNotes', 'originalContent type createdAt');
    
    if (!note) {
      return res.status(404).json({ message: '笔记不存在' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: (error as Error).message });
  }
};

export const updateNote = async (req: AuthRequest, res: Response) => {
  try {
    const { remark, tags, relatedNotes } = req.body;
    
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { remark, tags, relatedNotes },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: '笔记不存在' });
    }
    res.json({ message: '笔记更新成功', note });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: (error as Error).message });
  }
};

export const deleteNote = async (req: AuthRequest, res: Response) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!note) {
      return res.status(404).json({ message: '笔记不存在' });
    }

    await Note.updateMany(
      { relatedNotes: note._id },
      { $pull: { relatedNotes: note._id } }
    );

    await Note.findByIdAndDelete(note._id);
    await Inventory.findByIdAndUpdate(note.inventoryId, { $inc: { noteCount: -1 } });

    res.json({ message: '笔记删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: (error as Error).message });
  }
};

export const getRelatedNotes = async (req: AuthRequest, res: Response) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!note) {
      return res.status(404).json({ message: '笔记不存在' });
    }

    const relatedNotes = await Note.find({
      _id: { $in: note.relatedNotes },
      userId: req.userId
    })
      .populate('inventoryId', 'name')
      .limit(5);

    res.json(relatedNotes);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: (error as Error).message });
  }
};

export const getNotesByDate = async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.query;
    const startDate = new Date(date as string);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date as string);
    endDate.setHours(23, 59, 59, 999);

    const notes = await Note.find({
      userId: req.userId,
      createdAt: { $gte: startDate, $lte: endDate }
    })
      .populate('inventoryId', 'name type')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: (error as Error).message });
  }
};
