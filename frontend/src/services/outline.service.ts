/**
 * Outline Service
 * 
 * 处理两步大纲生成的 API 调用
 */

import { apiClient } from './api';
import { OutlineSkeleton } from '@/types/interview';

export class OutlineService {
  /**
   * Step 1: 生成大纲骨架
   * 注意：不需要 interview_id，只需要基本信息
   */
  static async generateSkeleton(params: {
    name: string;
    objective: string;
    context?: string;
    session_count: number;
    duration_minutes: number;
    draft_language: string;
    researchType: 'market' | 'product';
    manualSessions?: Array<{ session_number: number; theme: string }>; // 用户预设的 Session 主题
  }): Promise<{ skeleton: OutlineSkeleton; status: string }> {
    const response = await apiClient.post('/outlines/skeleton', params, {
      timeout: 120000 // 2分钟超时
    });
    return response.data;
  }

  /**
   * Step 2: 更新骨架（用户编辑）
   */
  static async updateSkeleton(
    interviewId: string,
    skeleton: OutlineSkeleton
  ): Promise<{ skeleton: OutlineSkeleton; status: string }> {
    const response = await apiClient.patch(`/outlines/${interviewId}/skeleton`, {
      skeleton
    });
    return response.data;
  }

  /**
   * Step 3: 基于骨架生成完整大纲
   */
  static async generateFullOutline(
    interviewId: string
  ): Promise<{ draft_outline: string[]; description: string; status: string }> {
    const response = await apiClient.post(`/outlines/${interviewId}/full-outline`, {}, {
      timeout: 180000 // 3分钟超时
    });
    return response.data;
  }
}

