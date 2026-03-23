import { Response } from 'express';
import { Inventory, Note, User } from '../models';
import { AuthRequest } from '../middleware/auth';

export const createInventory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, type, remark } = req.body;

    const inventory = new Inventory({
      userId: req.userId,
      name,
      type,
      remark: remark || ''
    });
    await inventory.save();

    res.status(201).json({ message: '库存创建成功', inventory });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: (error as Error).message });
  }
};

export const getInventories = async (req: AuthRequest, res: Response) => {
  try {
    const { includeArchived } = req.query;
    const query: any = { userId: req.userId };
    
    if (!includeArchived) {
      query.isArchived = false;
    }

    const inventories = await Inventory.find(query).sort({ createdAt: -1 });
    res.json(inventories);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: (error as Error).message });
  }
};

export const getInventory = async (req: AuthRequest, res: Response) => {
  try {
    const inventory = await Inventory.findOne({ _id: req.params.id, userId: req.userId });
    if (!inventory) {
      return res.status(404).json({ message: '库存不存在' });
    }
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: (error as Error).message });
  }
};

export const updateInventory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, type, remark } = req.body;
    const inventory = await Inventory.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, type, remark },
      { new: true }
    );
    
    if (!inventory) {
      return res.status(404).json({ message: '库存不存在' });
    }
    res.json({ message: '库存更新成功', inventory });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: (error as Error).message });
  }
};

export const deleteInventory = async (req: AuthRequest, res: Response) => {
  try {
    const { deleteNotes } = req.body;
    const inventory = await Inventory.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!inventory) {
      return res.status(404).json({ message: '库存不存在' });
    }

    if (inventory.isDefault) {
      return res.status(400).json({ message: '默认库存不能删除' });
    }

    if (deleteNotes) {
      await Note.deleteMany({ inventoryId: req.params.id });
    } else {
      const defaultInventory = await Inventory.findOne({ userId: req.userId, isDefault: true });
      if (defaultInventory) {
        await Note.updateMany(
          { inventoryId: req.params.id },
          { inventoryId: defaultInventory._id }
        );
        await Inventory.findByIdAndUpdate(defaultInventory._id, {
          $inc: { noteCount: inventory.noteCount }
        });
      }
    }

    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: '库存删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: (error as Error).message });
  }
};

export const archiveInventory = async (req: AuthRequest, res: Response) => {
  try {
    const inventory = await Inventory.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isArchived: true },
      { new: true }
    );
    
    if (!inventory) {
      return res.status(404).json({ message: '库存不存在' });
    }
    res.json({ message: '库存归档成功', inventory });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: (error as Error).message });
  }
};

export const unarchiveInventory = async (req: AuthRequest, res: Response) => {
  try {
    const inventory = await Inventory.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isArchived: false },
      { new: true }
    );
    
    if (!inventory) {
      return res.status(404).json({ message: '库存不存在' });
    }
    res.json({ message: '库存恢复成功', inventory });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: (error as Error).message });
  }
};
