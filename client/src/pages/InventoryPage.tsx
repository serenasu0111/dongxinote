import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { inventoryAPI, noteAPI } from '../services/api';
import { Inventory, Note } from '../types';

export const InventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadInventory();
      loadNotes();
    }
  }, [id]);

  const loadInventory = async () => {
    try {
      const res = await inventoryAPI.getOne(id!);
      setInventory(res.data);
    } catch (error) {
      console.error('加载库存失败:', error);
    }
  };

  const loadNotes = async () => {
    try {
      setLoading(true);
      const res = await noteAPI.getAll({ inventoryId: id, limit: 50 });
      setNotes(res.data.notes);
    } catch (error) {
      console.error('加载笔记失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这个库存吗？')) return;
    
    const moveNotes = confirm('是否将笔记移至"未分类"库存？取消则删除所有笔记。');
    
    try {
      await inventoryAPI.delete(id!, !moveNotes);
      navigate('/inventories');
    } catch (error) {
      alert('删除失败');
    }
  };

  const typeLabels = { book: '📚 书籍', course: '🎬 课程', other: '📝 其他' };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:pt-14">
      <div className="max-w-md mx-auto md:max-w-full p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">←</button>
          <h1 className="text-xl font-bold">{inventory?.name}</h1>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="flex gap-2 mb-2">
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
              {inventory && typeLabels[inventory.type]}
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
              {notes.length} 条笔记
            </span>
          </div>
          {inventory?.remark && (
            <p className="text-gray-600 text-sm">{inventory.remark}</p>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => navigate('/new-note', { state: { inventoryId: id } })}
            className="flex-1 bg-primary text-white py-2 rounded-lg"
          >
            + 添加笔记
          </button>
          <button
            onClick={() => navigate(`/edit-inventory/${id}`)}
            className="px-4 bg-gray-100 text-gray-700 rounded-lg"
          >
            编辑
          </button>
          <button
            onClick={handleDelete}
            className="px-4 bg-red-50 text-red-600 rounded-lg"
          >
            删除
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">加载中...</div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 text-gray-400">暂无笔记</div>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <div
                key={note._id}
                className="bg-white rounded-xl p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => navigate(`/note/${note._id}`)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {note.type === 'image' ? '🖼️' : note.type === 'document' ? '📄' : '📝'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 truncate">
                      {note.ocrContent || note.originalContent || '无内容'}
                    </p>
                    {note.tags?.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {note.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(note.createdAt).toLocaleDateString('zh-CN')}
                    </p>
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
