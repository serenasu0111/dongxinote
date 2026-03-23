import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { inventoryAPI, noteAPI } from '../services/api';
import { Inventory } from '../types';

export const NewNotePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  const [noteType, setNoteType] = useState<'text' | 'image' | 'document'>('text');
  const [content, setContent] = useState('');
  const [remark, setRemark] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);

  useEffect(() => {
    loadInventories();
    const inventoryId = location.state?.inventoryId;
    if (inventoryId) {
      const inv = inventories.find(i => i._id === inventoryId);
      if (inv) setSelectedInventory(inv);
    }
  }, [location.state]);

  const loadInventories = async () => {
    try {
      const res = await inventoryAPI.getAll();
      setInventories(res.data.filter((inv: Inventory) => !inv.isArchived));
    } catch (error) {
      console.error('加载库存失败:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setContent(base64);
      setNoteType('image');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInventory) {
      alert('请选择库存');
      return;
    }

    if (!content.trim()) {
      alert('请输入内容或上传图片');
      return;
    }

    setLoading(true);
    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      
      await noteAPI.create({
        inventoryId: selectedInventory._id,
        type: noteType,
        originalContent: content,
        remark,
        tags: tagList,
        isFromImage: noteType === 'image',
        isFromDocument: noteType === 'document',
      });

      navigate(-1);
    } catch (error) {
      alert('创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:pt-14">
      <div className="max-w-md mx-auto md:max-w-full p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">←</button>
          <h1 className="text-xl font-bold">记点东西</h1>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">选择库存 *</label>
          <select
            value={selectedInventory?._id || ''}
            onChange={(e) => {
              const inv = inventories.find(i => i._id === e.target.value);
              setSelectedInventory(inv || null);
            }}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">请选择库存</option>
            {inventories.map((inv) => (
              <option key={inv._id} value={inv._id}>
                {inv.name} ({inv.noteCount} 条笔记)
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">录入方式</label>
          <div className="flex gap-2">
            <button
              onClick={() => { setNoteType('text'); setShowImageInput(false); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                noteType === 'text' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              📝 文字
            </button>
            <button
              onClick={() => { setNoteType('image'); setShowImageInput(true); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                noteType === 'image' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              🖼️ 图片
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 space-y-4">
          {noteType === 'image' ? (
            <div>
              {content ? (
                <div className="relative">
                  <img src={content} alt="上传的图片" className="w-full rounded-lg" />
                  <button
                    type="button"
                    onClick={() => { setContent(''); setShowImageInput(true); }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full text-xs"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="block w-full p-8 border-2 border-dashed rounded-xl text-center cursor-pointer hover:bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <span className="text-4xl">🖼️</span>
                  <p className="text-sm text-gray-500 mt-2">点击上传图片</p>
                </label>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">内容 *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="输入文字内容..."
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                rows={6}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标签（可选）</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="多个标签用逗号分隔，如：Python, 基础, 技巧"
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">备注（可选）</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="添加备注信息..."
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              rows={2}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !selectedInventory || !content}
            className="w-full py-3 bg-primary text-white rounded-xl font-medium disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </form>
      </div>
    </div>
  );
};
