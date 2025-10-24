import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import axios from 'axios';
import { InterviewService } from '@/services/interviews.service';
import { InterviewerService } from '@/services/interviewers.service';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';

// 🔧 访谈链接始终使用生产环境域名
// 原因：访谈链接是给受访者使用的，应该指向生产环境
// 即使在本地开发，创建的访谈也应该能在生产环境访问
const INTERVIEW_BASE_URL = 'https://userology.xin';

export const createInterview = async (req: Request, res: Response) => {
  try {
    const url_id = nanoid();
    const url = `${INTERVIEW_BASE_URL}/call/${url_id}`;
    const body = req.body;

    console.log("create-interview request received");
    console.warn('【创建面试请求】：>>>>>>>>>>>> controller.ts:15', {
      body,
      url_id,
      url,
      base_url: INTERVIEW_BASE_URL
    });

    const payload = body.interviewData;
    console.warn('【面试数据负载】：>>>>>>>>>>>> controller.ts:22', payload);

    // 🆕 获取 interviewer 模板信息
    const interviewer = await InterviewerService.getInterviewer(BigInt(payload.interviewer_id));
    
    // 🆕 为每个 interview 创建独立的 Retell Agent
    let agentId = null;
    if (interviewer && interviewer.agent_id) {
      try {
        console.log('🔄 Creating dedicated agent for interview...');
        
        // 获取模板 agent 配置
        const templateResponse = await axios.get(
          `https://api.retellai.com/get-agent/${interviewer.agent_id}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
            },
          }
        );
        const templateAgent = templateResponse.data;
        
        // 获取语言配置
        const language = payload.language || 'en-US';
        const languageConfig = SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES] || SUPPORTED_LANGUAGES['en-US'];
        
        // 选择对应的语音
        let voiceId = languageConfig.voices.bob;
        if (interviewer.name?.toLowerCase().includes('lisa')) {
          voiceId = languageConfig.voices.lisa;
        } else if (interviewer.name?.toLowerCase().includes('david')) {
          voiceId = languageConfig.voices.david;
        }
        
        // 使用 Retell API 创建新 agent
        const createResponse = await axios.post(
          'https://api.retellai.com/create-agent',
          {
            llm_websocket_url: templateAgent.llm_websocket_url,
            agent_name: `${interviewer.name}_${url_id}`,
            voice_id: voiceId,
            language: languageConfig.code,
            response_engine: templateAgent.response_engine,
            responsiveness: templateAgent.responsiveness,
            interruption_sensitivity: templateAgent.interruption_sensitivity,
            enable_backchannel: templateAgent.enable_backchannel,
            backchannel_frequency: templateAgent.backchannel_frequency,
            backchannel_words: templateAgent.backchannel_words,
            reminder_trigger_ms: templateAgent.reminder_trigger_ms,
            reminder_max_count: templateAgent.reminder_max_count,
            ambient_sound: templateAgent.ambient_sound,
            ambient_sound_volume: templateAgent.ambient_sound_volume,
            opt_out_sensitive_data_storage: templateAgent.opt_out_sensitive_data_storage,
            end_call_after_silence_ms: templateAgent.end_call_after_silence_ms,
            enable_transcription_formatting: templateAgent.enable_transcription_formatting,
            normalize_for_speech: templateAgent.normalize_for_speech,
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        agentId = createResponse.data.agent_id;
        console.log('✅ Created new agent:', agentId, 'with language:', language);
      } catch (error) {
        console.error('❌ Failed to create agent, using template:', error);
        // 如果创建失败，降级使用模板 agent
        agentId = interviewer.agent_id;
      }
    }

    let readableSlug = null;
    if (body.organizationName) {
      const interviewNameSlug = payload.name?.toLowerCase().replace(/\s/g, "-");
      const orgNameSlug = body.organizationName
        ?.toLowerCase()
        .replace(/\s/g, "-");
      readableSlug = `${orgNameSlug}-${interviewNameSlug}`;
    }

    // 处理空的 user_id 和 organization_id
    const finalPayload = {
      ...payload,
      url: url,
      id: url_id,
      readable_slug: readableSlug,
      // 将空字符串转换为 null 以避免外键约束错误
      user_id: payload.user_id || null,
      organization_id: payload.organization_id || null,
      // 🆕 添加新字段
      agent_id: agentId,
      language: payload.language || 'en-US',
      interviewer_template: interviewer?.name?.toLowerCase() || null,
    };
    
    console.warn('【最终创建负载】：>>>>>>>>>>>> controller.ts:35', finalPayload);
    
    const newInterview = await InterviewService.createInterview(finalPayload);
    
    console.warn('【创建结果】：>>>>>>>>>>>> controller.ts:39', newInterview);
    console.log("Interview created successfully");

    res.status(200).json({
      response: "Interview created successfully"
    });
  } catch (err) {
    console.error("Error creating interview:", err);

    res.status(500).json({
      error: "Internal server error"
    });
  }
};

export const getAllInterviews = async (req: Request, res: Response) => {
  try {
    const { userId, organizationId } = req.query;
    const interviews = await InterviewService.getAllInterviews(
      userId as string || '', 
      organizationId as string || ''
    );
    
    res.status(200).json(interviews);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    res.status(500).json({
      error: "Failed to fetch interviews"
    });
  }
};

export const getInterviewById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const interview = await InterviewService.getInterviewById(id);
    
    if (!interview) {
      return res.status(404).json({
        error: "Interview not found"
      });
    }
    
    return res.status(200).json(interview);
  } catch (error) {
    console.error("Error fetching interview:", error);
    return res.status(500).json({
      error: "Failed to fetch interview"
    });
  }
};

export const updateInterview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    
    const result = await InterviewService.updateInterview(payload, id);
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating interview:", error);
    res.status(500).json({
      error: "Failed to update interview"
    });
  }
};

export const deleteInterview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await InterviewService.deleteInterview(id);
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting interview:", error);
    res.status(500).json({
      error: "Failed to delete interview"
    });
  }
};
