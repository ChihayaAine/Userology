import { Request, Response } from 'express';
import { FeedbackService } from '@/services/feedback.service';

export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const feedbackData = req.body;
    
    const result = await FeedbackService.submitFeedback(feedbackData);
    
    res.status(201).json(result);
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({
      error: "Failed to submit feedback"
    });
  }
};
