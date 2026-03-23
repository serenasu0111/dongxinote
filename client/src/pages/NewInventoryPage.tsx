import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { inventoryAPI } from '../services/api';

export const NewInventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [name, setName] = useState('');
  const [type, setType] = useState<'book' | 'course' | 'other'>('book');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      loadInventory();
    }
  }, [id]);

  const loadInventory = async () => {
    try {
      const res = await inventoryAPI.getOne(id!);
      setName(res.data.name);
      setType(res.data.type);
      setRemark(res.data.remark || '');
    } catch (error) {
      alert('加载失败');
      navigate('/inventories');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('请输入库存名称');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await inventoryAPI.update(id!, { name, type, remark });
      } else {
        await inventoryAPI.create({ name, type, remark });
      }
      navigate('/inventories');
    } catch (error) {
      alert(isEdit ? '更新失败' : '创建失败');
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = [
    { value: 'book', label: '📚 书籍' },
    { value: 'course', label: '🎬 课程' },
    { value: 'other', label: '📝 其他' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:pt-14">
      <div className="max-w-md mx-auto md:max-w-full p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">←</button>
          <h1 className="text-xl font-bold">{isEdit ? '编辑库存' : '新建库存'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">库存名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：Python学习笔记"
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">库存类型 *</label>
            <div className="flex gap-2">
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value as 'book' | 'course' | 'other')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    type === option.value
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">备注（可选）</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="添加备注信息..."
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              maxLength={500}
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
              disabled={loading}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-medium disabled:opacity-50"
            >
              {loading ? '保存中...' : '保存库存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
