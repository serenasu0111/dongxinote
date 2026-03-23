import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    
    console.log('收到注册请求:', { username, email });

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: '用户名或邮箱已被使用' });
    }

    console.log('开始加密密码...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('密码加密完成');
    
    console.log('创建用户...');
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    console.log('用户创建成功:', user._id);

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: '注册成功',
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error: any) {
    console.error('注册失败:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: '邮箱或密码错误' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '邮箱或密码错误' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: '登录成功',
      token,
      user: { id: user._id, username: user.username, email: user.email, settings: user.settings }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: (error as Error).message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: (error as Error).message });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { aiAnswerLength, autoBackup } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { settings: { aiAnswerLength, autoBackup } },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: (error as Error).message });
  }
};
