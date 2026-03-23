import axios from 'axios';

const ALIYUN_OCR_ACCESS_KEY_ID = process.env.ALIYUN_OCR_ACCESS_KEY_ID;
const ALIYUN_OCR_ACCESS_KEY_SECRET = process.env.ALIYUN_OCR_ACCESS_KEY_SECRET;

export const processImageOCR = async (imageBase64: string): Promise<string> => {
  try {
    if (!ALIYUN_OCR_ACCESS_KEY_ID || !ALIYUN_OCR_ACCESS_KEY_SECRET) {
      console.warn('阿里云OCR未配置，使用占位符');
      return '[图片OCR内容 - 请配置阿里云OCR]';
    }

    const response = await axios.post(
      'https://ocrapi-advanced.taobao.com/ocrservice/advanced.do',
      {
        img: imageBase64,
        prob: false,
        charInfo: false,
        rotate: false,
        table: false,
        mask: false
      },
      {
        headers: {
          'Authorization': `APPCODE ${ALIYUN_OCR_ACCESS_KEY_ID}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    if (response.data?.data?.prism_ocrs) {
      return response.data.data.prism_ocrs
        .map((item: any) => item.prism_wordsInfo?.map((w: any) => w.content).join(''))
        .join('\n');
    }

    return '';
  } catch (error) {
    console.error('OCR处理失败:', error);
    return '[OCR识别失败]';
  }
};

export const processDocument = async (content: string): Promise<string> => {
  try {
    return content;
  } catch (error) {
    console.error('文档处理失败:', error);
    return content;
  }
};
