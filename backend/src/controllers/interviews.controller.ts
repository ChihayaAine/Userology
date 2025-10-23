import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { InterviewService } from '@/services/interviews.service';

const base_url = process.env.FRONTEND_URL || 'https://userology.xin';

export const createInterview = async (req: Request, res: Response) => {
  try {
    const url_id = nanoid();
    const url = `${base_url}/call/${url_id}`;
    const body = req.body;

    console.log("create-interview request received");
    console.warn('【创建面试请求】：>>>>>>>>>>>> controller.ts:15', {
      body,
      url_id,
      url,
      base_url
    });

    const payload = body.interviewData;
    console.warn('【面试数据负载】：>>>>>>>>>>>> controller.ts:22', payload);

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
