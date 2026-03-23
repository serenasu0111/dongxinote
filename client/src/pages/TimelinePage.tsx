import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchAPI, noteAPI } from '../services/api';
import { Note, TimelineItem } from '../types';

export const TimelinePage: React.FC = () => {
  const navigate = useNavigate();
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    try {
      const res = await searchAPI.getTimeline();
      setTimeline(res.data);
    } catch (error) {
      console.error('加载时间轴失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = async (date: string) => {
    setSelectedDate(date);
    try {
      const res = await noteAPI.getByDate(date);
      setNotes(res.data);
    } catch (error) {
      console.error('加载笔记失败:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) return '今天';
    if (dateStr === yesterday.toISOString().split('T')[0]) return '昨天';
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:pt-14">
      <div className="max-w-md mx-auto md:max-w-full p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">←</button>
          <h1 className="text-xl font-bold">东西轨迹</h1>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">加载中...</div>
        ) : timeline.length === 0 ? (
          <div className="text-center py-8 text-gray-400">暂无记录</div>
        ) : (
          <div className="space-y-1">
            {timeline.map((item) => (
              <div key={item._id}>
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                    selectedDate === item._id ? 'bg-primary/10' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleDateClick(item._id)}
                >
                  <div className="w-16 text-sm font-medium text-gray-600">
                    {formatDate(item._id)}
                  </div>
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <div className="text-sm text-gray-500">
                    {item.count} 条
                  </div>
                </div>

                {selectedDate === item._id && notes.length > 0 && (
                  <div className="ml-4 mt-2 space-y-2">
                    {notes.map((note) => (
                      <div
                        key={note._id}
                        className="bg-white rounded-lg p-3 cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(`/note/${note._id}`)}
                      >
                        <p className="text-gray-800 text-sm line-clamp-2">
                          {note.ocrContent || note.originalContent}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(note.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
