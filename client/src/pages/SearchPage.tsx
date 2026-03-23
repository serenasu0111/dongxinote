import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchAPI } from '../services/api';
import { Note, AIResponse } from '../types';

type TabType = 'search' | 'ai';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabType>('search');
  const [keyword, setKeyword] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [aiAnswer, setAiAnswer] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'time'>('relevance');

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setHasSearched(true);
    
    try {
      const res = await searchAPI.searchNotes({ keyword, sort: sortBy });
      setNotes(res.data.notes);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAIChat = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setHasSearched(true);
    setAiAnswer(null);
    
    try {
      const res = await searchAPI.askAI({ question: keyword });
      setAiAnswer(res.data);
    } catch (error: any) {
      console.error('AI问答失败:', error);
      setAiAnswer({
        answer: error.response?.data?.message || 'AI服务暂时不可用',
        sourceNotes: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (tab === 'search') {
      handleSearch();
    } else {
      handleAIChat();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pb-20 md:pb-0 md:pt-14">
      <div className="max-w-md mx-auto md:max-w-full p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">←</button>
          <h1 className="text-xl font-bold">全局检索</h1>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={tab === 'search' ? '搜笔记 / 输入关键词' : 'AI 学习助手智能回答 ing'}
              className="flex-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-4 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
            >
              {tab === 'search' ? '🔍' : '➤'}
            </button>
          </form>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => { setTab('search'); setHasSearched(false); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === 'search' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              搜笔记
            </button>
            <button
              onClick={() => { setTab('ai'); setHasSearched(false); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === 'ai' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              问 AI
            </button>
          </div>
        </div>

        {tab === 'search' && hasSearched && (
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-500">{notes.length} 条结果</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'relevance' | 'time')}
              className="text-sm bg-white border rounded px-2 py-1"
            >
              <option value="relevance">相关度优先</option>
              <option value="time">时间最新</option>
            </select>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-400">
            {tab === 'ai' ? '🤔 AI 思考中...' : '🔍 搜索中...'}
          </div>
        ) : tab === 'search' ? (
          notes.length > 0 ? (
            <div className="space-y-2">
              {notes.map((note) => (
                <div
                  key={note._id}
                  className="bg-white rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm border border-gray-100"
                  onClick={() => navigate(`/note/${note._id}`)}
                >
                  <p className="text-gray-800 line-clamp-3">
                    {note.ocrContent || note.originalContent}
                  </p>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {typeof note.inventoryId === 'object' ? (note.inventoryId as any).name : ''}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(note.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="text-center py-8 text-gray-400">未找到相关笔记</div>
          ) : null
        ) : (
          hasSearched && aiAnswer && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-800">{aiAnswer.answer}</div>
              </div>
              {aiAnswer.sourceNotes.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">参考笔记：</h4>
                  {aiAnswer.sourceNotes.map((note) => (
                    <div
                      key={note.id}
                      className="text-sm text-gray-600 py-1 cursor-pointer hover:text-indigo-600"
                      onClick={() => navigate(`/note/${note.id}`)}
                    >
                      • {note.preview}（{note.inventoryName}）
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};
