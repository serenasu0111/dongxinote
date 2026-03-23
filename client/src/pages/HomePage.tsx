import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../hooks/useStore';
import { inventoryAPI, noteAPI } from '../services/api';
import { Inventory } from '../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { recentInventory, setRecentInventory, currentInventory, setCurrentInventory } = useAppStore();
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [lastNoteInventory, setLastNoteInventory] = useState<Inventory | null>(null);

  useEffect(() => {
    loadInventories();
    loadLastNoteInventory();
  }, []);

  const loadInventories = async () => {
    try {
      const res = await inventoryAPI.getAll();
      const activeInventories = res.data.filter((inv: Inventory) => !inv.isArchived);
      setInventories(activeInventories);
      
      if (!currentInventory && activeInventories.length > 0) {
        setCurrentInventory(activeInventories[0]);
      }
    } catch (error) {
      console.error('加载库存失败:', error);
    }
  };

  const loadLastNoteInventory = async () => {
    try {
      const res = await noteAPI.getAll({ limit: 1 });
      if (res.data.notes.length > 0) {
        const lastNote = res.data.notes[0];
        if (typeof lastNote.inventoryId === 'object') {
          setLastNoteInventory(lastNote.inventoryId as any);
          setRecentInventory(lastNote.inventoryId as any);
        }
      }
    } catch (error) {
      console.error('加载最近笔记失败:', error);
    }
  };

  const handleSelectInventory = (inventory: Inventory) => {
    setCurrentInventory(inventory);
    setShowInventoryModal(false);
  };

  const handleNewNote = async (inventory: Inventory) => {
    setCurrentInventory(inventory);
    setRecentInventory(inventory);
    navigate('/new-note', { state: { inventoryId: inventory._id } });
  };

  const currentInventoryName = currentInventory?.name || '请选择库存';
  const currentNoteCount = currentInventory?.noteCount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pb-20 md:pb-0 md:pt-14">
      <div className="max-w-md mx-auto md:max-w-full p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-4 border border-white/50">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              记点东西
            </h1>
            <p className="text-gray-500 text-sm mt-1">让知识留下痕迹</p>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                if (currentInventory) {
                  handleNewNote(currentInventory);
                } else {
                  navigate('/new-note');
                }
              }}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md active:scale-95"
            >
              <span className="text-xl">+</span>
              记点东西
            </button>
            <button
              onClick={() => navigate('/search')}
              className="flex-1 bg-white text-gray-700 py-3.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
            >
              <span className="text-xl">🔍</span>
              全局检索
            </button>
          </div>
        </div>

        {lastNoteInventory && (
          <div 
            className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 cursor-pointer hover:from-amber-100 hover:to-orange-100 transition-colors border border-amber-100"
            onClick={() => navigate(`/inventory/${lastNoteInventory._id}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-amber-500">📌</span>
                <span className="text-sm text-amber-800">最近在记：</span>
                <span className="font-medium text-amber-900">{lastNoteInventory.name}</span>
              </div>
              <span className="text-xs text-amber-600 bg-white/50 px-2 py-1 rounded-full">
                {lastNoteInventory.noteCount} 条笔记 →
              </span>
            </div>
          </div>
        )}

        <div 
          className="bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:bg-gray-50 transition-colors border border-gray-100"
          onClick={() => setShowInventoryModal(true)}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">当前库存</p>
              <p className="font-medium text-gray-800">{currentInventoryName}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-indigo-600">{currentNoteCount}</p>
              <p className="text-xs text-gray-400">笔记数</p>
            </div>
          </div>
        </div>
      </div>

      {showInventoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50" onClick={() => setShowInventoryModal(false)}>
          <div className="bg-white rounded-t-2xl md:rounded-xl w-full max-w-md md:max-w-md max-h-[70vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">选择库存</h3>
              <button onClick={() => setShowInventoryModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-2">
              {inventories.map((inv) => (
                <div
                  key={inv._id}
                  className={`p-3 rounded-lg cursor-pointer flex justify-between items-center ${
                    currentInventory?._id === inv._id ? 'bg-indigo-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectInventory(inv)}
                >
                  <div>
                    <p className="font-medium">{inv.name}</p>
                    <p className="text-xs text-gray-400">
                      {inv.type === 'book' ? '📚 书籍' : inv.type === 'course' ? '🎬 课程' : '📝 其他'}
                    </p>
                  </div>
                  <span className="text-sm text-gray-400">{inv.noteCount} 条</span>
                </div>
              ))}
              <button
                onClick={() => {
                  setShowInventoryModal(false);
                  navigate('/new-inventory');
                }}
                className="w-full p-3 text-center text-indigo-600 border border-dashed border-indigo-600 rounded-lg mt-2 hover:bg-indigo-50"
              >
                + 新建库存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
