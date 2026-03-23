import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { noteAPI } from '../services/api';

export const EditNotePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [remark, setRemark] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNote();
  }, [id]);

  const loadNote = async () => {
    try {
      const res = await noteAPI.getOne(id!);
      setRemark(res.data.remark || '');
      setTags(res.data.tags?.join(', ') || '');
    } catch (error) {
      alert('加载失败');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      await noteAPI.update(id!, { remark, tags: tagList });
      navigate(-1);
    } catch (error) {
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:pt-14">
      <div className="max-w-md mx-auto md:max-w-full p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">←</button>
          <h1 className="text-xl font-bold">编辑笔记</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="多个标签用逗号分隔"
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="添加备注..."
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-medium disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
