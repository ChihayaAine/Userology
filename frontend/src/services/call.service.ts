import { apiClient } from './api';

const registerCall = async (interviewer_id: string, dynamic_data: any) => {
  try {
    const response = await apiClient.post('/call/register', {
      interviewer_id,
      dynamic_data
    });
    return response.data;
  } catch (error) {
    console.error('Error registering call:', error);
    throw error;
  }
};

const getCall = async (callId: string) => {
  try {
    // 对于长访谈，处理可能需要很长时间（获取转录 + 生成分析）
    // 设置5分钟超时，并添加重试逻辑
    const response = await apiClient.get(`/call/${callId}`, {
      timeout: 300000, // 5分钟超时（300秒）
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching call:', error);
    
    // 如果是超时错误，返回null而不是抛出异常
    if (error.code === 'ECONNABORTED') {
      console.warn('⚠️ Call fetch timed out - interview may still be processing');
      return null;
    }
    
    // 其他错误也返回null，让调用方处理
    return null;
  }
};

export const CallService = {
  registerCall,
  getCall,
};
