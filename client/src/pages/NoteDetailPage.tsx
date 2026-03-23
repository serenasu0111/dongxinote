import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { noteAPI } from '../services/api';
import { Note } from '../types';

export const NoteDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [relatedNotes, setRelatedNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNote();
    loadRelatedNotes();
  }, [id]);

  const loadNote = async () => {
    try {
      const res = await noteAPI.getOne(id!);
      setNote(res.data);
    } catch (error) {
      console.error('加载笔记失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedNotes = async () => {
    try {
      const res = await noteAPI.getRelated(id!);
      setRelatedNotes(res.data);
    } catch (error) {
      console.error('加载相关笔记失败:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这条笔记吗？')) return;
    try {
      await noteAPI.delete(id!);
      navigate(-1);
    } catch (error) {
      alert('删除失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">笔记不存在</div>
      </div>
    );
  }

  const inventoryName = typeof note.inventoryId === 'object' ? (note.inventoryId as any).name : '';

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:pt-14">
      <div className="max-w-md mx-auto md:max-w-full p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">←</button>
          <h1 className="text-xl font-bold">笔记详情</h1>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
              {note.type === 'image' ? '🖼️ 图片' : note.type === 'document' ? '📄 文档' : '📝 文字'}
            </span>
            {inventoryName && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                {inventoryName}
              </span>
            )}
          </div>

          {note.type === 'image' && note.originalContent && (
            <div className="mb-4">
              <img 
                src={note.originalContent} 
                alt="笔记图片" 
                className="w-full rounded-lg"
              />
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">原文内容</h3>
            <p className="text-gray-800 whitespace-pre-wrap">{note.originalContent}</p>
          </div>

          {note.ocrContent && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">OCR识别</h3>
              <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                {note.ocrContent}
              </p>
            </div>
          )}

          {note.remark && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">备注</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{note.remark}</p>
            </div>
          )}

          {note.tags && note.tags.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">标签</h3>
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-400">
            创建于 {new Date(note.createdAt).toLocaleString('zh-CN')}
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => navigate(`/edit-note/${id}`)}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg"
          >
            编辑标签
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg"
          >
            删除这条笔记
          </button>
        </div>

        {relatedNotes.length > 0 && (
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-semibold mb-3">相关笔记</h3>
            <div className="space-y-2">
              {relatedNotes.map((related) => (
                <div
                  key={related._id}
                  className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => navigate(`/note/${related._id}`)}
                >
                  <p className="text-gray-800 text-sm line-clamp-2">
                    {related.ocrContent || related.originalContent}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
