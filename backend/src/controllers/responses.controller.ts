import { Request, Response } from 'express';
import { ResponseService } from '@/services/responses.service';

export const createResponse = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const responseId = await ResponseService.createResponse(payload);
    
    res.status(201).json({ id: responseId });
  } catch (error) {
    console.error("Error creating response:", error);
    res.status(500).json({
      error: "Failed to create response"
    });
  }
};

export const getAllResponses = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;
    const responses = await ResponseService.getAllResponses(interviewId);
    
    res.status(200).json(responses);
  } catch (error) {
    console.error("Error fetching responses:", error);
    res.status(500).json({
      error: "Failed to fetch responses"
    });
  }
};

export const getResponseByCallId = async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const response = await ResponseService.getResponseByCallId(callId);
    
    if (!response) {
      return res.status(404).json({
        error: "Response not found"
      });
    }
    
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching response:", error);
    res.status(500).json({
      error: "Failed to fetch response"
    });
  }
};

export const updateResponse = async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const payload = req.body;
    
    const result = await ResponseService.updateResponse(payload, callId);
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating response:", error);
    res.status(500).json({
      error: "Failed to update response"
    });
  }
};

export const deleteResponse = async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    
    const result = await ResponseService.deleteResponse(callId);
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting response:", error);
    res.status(500).json({
      error: "Failed to delete response"
    });
  }
};

export const responseWebhook = async (req: Request, res: Response) => {
  try {
    // 处理 webhook 逻辑
    const payload = req.body;
    console.log("Response webhook received:", payload);
    
    // 根据 webhook 类型处理不同的逻辑
    // 这里需要根据实际的 webhook 需求实现
    
    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({
      error: "Failed to process webhook"
    });
  }
};

export const getEmailsForInterview = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;
    const emails = await ResponseService.getAllEmails(interviewId);
    
    res.status(200).json(emails);
  } catch (error) {
    console.error("Error fetching emails for interview:", error);
    res.status(500).json({
      error: "Failed to fetch emails"
    });
  }
};
