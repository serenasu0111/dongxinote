import { Response } from 'express';
import { Note, User } from '../models';
import { AuthRequest } from '../middleware/auth';
import { chatWithAI } from '../services/aiService';

export const askAI = async (req: AuthRequest, res: Response) => {
  try {
    const { question, inventoryId } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({ message: '问题不能为空' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const query: any = { userId: req.userId };
    if (inventoryId) {
      query.inventoryId = inventoryId;
    }

    const notes = await Note.find(query)
      .select('originalContent ocrContent inventoryId')
      .populate('inventoryId', 'name')
      .limit(50);

    const noteContents = notes.map(note => {
      const inventoryName = (note.inventoryId as any)?.name || '未分类';
      const content = note.ocrContent || note.originalContent;
      return `【笔记】${content}\n（来自库存：${inventoryName}）`;
    }).join('\n\n');

    const maxLength = user.settings.aiAnswerLength === 'long' ? 3000 : 
                      user.settings.aiAnswerLength === 'short' ? 1000 : 2000;

    const answer = await chatWithAI(question, noteContents, maxLength);

    res.json({
      answer,
      sourceNotes: notes.slice(0, 5).map(n => ({
        id: n._id,
        preview: (n.ocrContent || n.originalContent).substring(0, 100),
        inventoryName: (n.inventoryId as any)?.name
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'AI服务错误', error: (error as Error).message });
  }
};
