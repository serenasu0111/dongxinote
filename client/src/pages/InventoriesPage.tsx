import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../services/api';
import { Inventory } from '../types';

export const InventoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventories();
  }, []);

  const loadInventories = async () => {
    try {
      const res = await inventoryAPI.getAll(true);
      setInventories(res.data);
    } catch (error) {
      console.error('加载库存失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await inventoryAPI.archive(id);
      loadInventories();
    } catch (error) {
      alert('归档失败');
    }
  };

  const typeLabels = { book: '📚', course: '🎬', other: '📝' };
  const typeNames = { book: '书籍', course: '课程', other: '其他' };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:pt-14">
      <div className="max-w-md mx-auto md:max-w-full p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">←</button>
            <h1 className="text-xl font-bold">库存管理</h1>
          </div>
          <button
            onClick={() => navigate('/new-inventory')}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm"
          >
            + 新建库存
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">加载中...</div>
        ) : inventories.length === 0 ? (
          <div className="text-center py-8 text-gray-400">暂无库存</div>
        ) : (
          <div className="space-y-2">
            {inventories.map((inv) => (
              <div
                key={inv._id}
                className={`bg-white rounded-xl p-4 cursor-pointer hover:bg-gray-50 ${
                  inv.isArchived ? 'opacity-60' : ''
                }`}
                onClick={() => navigate(`/inventory/${inv._id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{typeLabels[inv.type]}</span>
                      <span className="font-medium">{inv.name}</span>
                      {inv.isDefault && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">默认</span>
                      )}
                      {inv.isArchived && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-600 text-xs rounded">已归档</span>
                      )}
                    </div>
                    {inv.remark && (
                      <p className="text-sm text-gray-500 mt-1">{inv.remark}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary">{inv.noteCount}</span>
                    <p className="text-xs text-gray-400">条笔记</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
