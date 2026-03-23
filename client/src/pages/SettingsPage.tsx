import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../hooks/useStore';
import { authAPI } from '../services/api';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAppStore();
  const [aiLength, setAiLength] = useState(user?.settings?.aiAnswerLength || 'normal');

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout();
      navigate('/login');
    }
  };

  const handleAILengthChange = async (length: string) => {
    setAiLength(length);
    try {
      await authAPI.updateSettings({ aiAnswerLength: length });
    } catch (error) {
      console.error('更新设置失败:', error);
    }
  };

  const aiLengthOptions = [
    { value: 'short', label: '简洁', desc: '约1000字' },
    { value: 'normal', label: '标准', desc: '约2000字' },
    { value: 'long', label: '详细', desc: '约3000字' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:pt-14">
      <div className="max-w-md mx-auto md:max-w-full p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">←</button>
          <h1 className="text-xl font-bold">我的东西</h1>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <p className="font-semibold text-lg">{user?.username}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4">
          <h3 className="font-semibold mb-3">AI 回答长度</h3>
          <div className="space-y-2">
            {aiLengthOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                  aiLength === option.value ? 'bg-primary/10' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="aiLength"
                    checked={aiLength === option.value}
                    onChange={() => handleAILengthChange(option.value)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="font-medium">{option.label}</span>
                </div>
                <span className="text-sm text-gray-500">{option.desc}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4">
          <h3 className="font-semibold mb-3">数据管理</h3>
          <div className="space-y-2">
            <button
              className="w-full p-3 text-left hover:bg-gray-50 rounded-lg flex justify-between items-center"
              onClick={() => alert('数据备份功能开发中')}
            >
              <span>数据备份</span>
              <span className="text-gray-400">→</span>
            </button>
            <button
              className="w-full p-3 text-left hover:bg-gray-50 rounded-lg flex justify-between items-center"
              onClick={() => alert('多端同步功能开发中')}
            >
              <span>多端同步</span>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4">
          <h3 className="font-semibold mb-3">关于</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>东西笔记 v1.0.0</p>
            <p>以「学习库存」为核心的个人知识管理工具</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium"
        >
          退出登录
        </button>
      </div>
    </div>
  );
};
