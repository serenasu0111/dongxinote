export const chatWithAI = async (question: string, noteContents: string, maxLength: number = 2000): Promise<string> => {
  if (!noteContents) {
    return `您好！我是AI学习助手。\n\n💡 建议：\n1. 先添加一些笔记内容\n2. 然后我可以帮您查找相关信息\n\n📝 当前功能：基于您的笔记内容进行智能搜索和问答`;
  }

  const keywords = question.toLowerCase();
  const content = noteContents.toLowerCase();
  
  const relevantLines = noteContents.split('\n').filter(line => 
    line.toLowerCase().includes(keywords) || 
    keywords.split('').some(char => line.includes(char))
  );

  if (relevantLines.length > 0) {
    return `🔍 根据您的问题"${question}"，我在笔记中找到相关内容：\n\n${relevantLines.join('\n').substring(0, 500)}\n\n💡 提示：以上内容来自您的笔记。AI智能问答功能正在对接中...`;
  }

  return `🔍 根据您的问题"${question}"，我在笔记中搜索了相关内容。\n\n📝 笔记摘要：\n${noteContents.substring(0, 300)}...\n\n💡 提示：AI智能问答功能正在紧张对接火山引擎API...`;
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  return [];
};
