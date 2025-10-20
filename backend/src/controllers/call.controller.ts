import { Request, Response } from 'express';
import { InterviewerService } from '@/services/interviewers.service';
import { ResponseService } from '@/services/responses.service';
import { InterviewSummaryService } from '@/services/interview-summary.service';
import { generateInterviewAnalytics } from '@/services/analytics.service';
import { retellClient } from '@/config/retell';

export const registerCall = async (req: Request, res: Response) => {
  console.log("register-call request received");

  try {
    const body = req.body;
    console.warn('【register-call 请求体】：>>>>>>>>>>>> controller.ts:15', body);

    const interviewerId = BigInt(body.interviewer_id); // 转换为 BigInt
    console.warn('【interviewer_id 转换】：>>>>>>>>>>>> controller.ts:17', { original: body.interviewer_id, converted: interviewerId });
    
    const interviewer = await InterviewerService.getInterviewer(interviewerId);
    console.warn('【获取面试官结果】：>>>>>>>>>>>> controller.ts:20', interviewer);

    if (!interviewer) {
      console.error('【面试官不存在】：>>>>>>>>>>>> controller.ts:24', { interviewerId });
      
      return res.status(404).json({
        error: "Interviewer not found"
      });
    }

    if (!interviewer.agent_id) {
      console.error('【面试官缺少 agent_id】：>>>>>>>>>>>> controller.ts:31', interviewer);
      
      return res.status(400).json({
        error: "Interviewer agent_id not found"
      });
    }

    // 根据面试官类型动态调整数据格式
    let dynamicVariables = body.dynamic_data;
    
    // 判断是否为深度访谈模式（通过名称识别 David 面试官）
    const isDeepDiveMode = interviewer.name?.includes('David') || 
                          interviewer.name?.includes('Deep Dive');
    
    if (isDeepDiveMode) {
      console.log('🔬 [Deep Dive Mode] Preparing session variables for multi-prompt agent...');
      
      // David 已经是 multi-prompt agent，根据实际 questions 数量动态填充
      const questionsArray = body.dynamic_data.questions_array || [];
      const sessionCount = questionsArray.length;
      
      // 准备动态变量：实际的 sessions + 未使用的标记为 "No content"
      dynamicVariables = {
        mins: body.dynamic_data.mins,
        objective: body.dynamic_data.objective,
        name: body.dynamic_data.name,
        session_count: sessionCount.toString(),
        session1: questionsArray[0]?.question || "No content",
        session2: questionsArray[1]?.question || "No content",
        session3: questionsArray[2]?.question || "No content",
        session4: questionsArray[3]?.question || "No content",
        session5: questionsArray[4]?.question || "No content",
        session6: questionsArray[5]?.question || "No content",
        session7: questionsArray[6]?.question || "No content",
        session8: questionsArray[7]?.question || "No content",
        session9: questionsArray[8]?.question || "No content",
        session10: questionsArray[9]?.question || "No content",
      };
      
      console.log('🔬 [Deep Dive] Session variables prepared:', {
        totalSessions: sessionCount,
        actualSessions: questionsArray.map((_: any, i: number) => `session_${i + 1}`),
        emptySessions: Array.from({ length: 10 - sessionCount }, (_: any, i: number) => `session_${sessionCount + i + 1}`)
      });
    } else {
      console.log('📋 [Standard Mode] Using original question format');
    }

    console.warn('【调用 Retell API】：>>>>>>>>>>>> controller.ts', {
      agent_id: interviewer.agent_id,
      mode: isDeepDiveMode ? 'Deep Dive (Multi-Prompt)' : 'Standard',
      dynamic_variables: dynamicVariables
    });

    const registerCallResponse = await retellClient.call.createWebCall({
      agent_id: interviewer.agent_id,
      retell_llm_dynamic_variables: dynamicVariables,
    });

    console.warn('【Retell API 响应】：>>>>>>>>>>>> controller.ts:47', registerCallResponse);
    console.log("Call registered successfully");

    res.status(200).json({
      registerCallResponse,
    });
  } catch (error: any) {
    console.error('【register-call 错误】：>>>>>>>>>>>> controller.ts:57', {
      message: error.message,
      stack: error.stack,
      error: error
    });
    
    res.status(500).json({
      error: "Internal server error", 
      details: error.message
    });
  }
};

export const getCall = async (req: Request, res: Response) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`🔍 [${requestId}] Getting call data for callId:`, req.params.callId);

  try {
    const { callId } = req.params;

    if (!callId) {
      console.error(`❌ [${requestId}] Call ID is required`);
      return res.status(400).json({
        error: "Call ID is required"
      });
    }

    console.log(`🚀 [${requestId}] Fetching response from database...`);

    // 从数据库获取response记录
    const response = await ResponseService.getResponseByCallId(callId);

    if (!response) {
      console.error(`❌ [${requestId}] Response not found for callId:`, callId);
      return res.status(404).json({
        error: "Response not found"
      });
    }

    // 如果已经分析过，直接返回缓存的数据
    if (response.is_analysed && response.details && response.analytics) {
      console.log(`✅ [${requestId}] Returning cached analytics`);
      return res.status(200).json({
        callResponse: response.details,
        analytics: response.analytics
      });
    }

    console.log(`🚀 [${requestId}] Fetching call data from Retell API...`);

    // 从 Retell API 获取通话信息
    const callResponse = await retellClient.call.retrieve(callId);
    console.log(`✅ [${requestId}] Retell call response received`);

    const interviewId = response.interview_id;
    const transcript = callResponse.transcript;
    const duration = Math.round(
      callResponse.end_timestamp / 1000 - callResponse.start_timestamp / 1000,
    );

    console.log(`📊 [${requestId}] Generating analytics and summary...`);

    // 调用generateAnalytics生成分析和总结
    const analyticsResult = await generateInterviewAnalytics({
      callId,
      interviewId,
      transcript
    });

    if (analyticsResult.status !== 200) {
      console.error(`❌ [${requestId}] Analytics generation failed:`, analyticsResult.error);
      return res.status(analyticsResult.status).json(analyticsResult);
    }

    const analytics = analyticsResult.analytics;

    console.log(`✅ [${requestId}] Analytics generated successfully`);

    // 生成深度总结（key insights + important quotes）
    console.log(`🔍 [${requestId}] Generating interview summary...`);
    const summaryResult = await InterviewSummaryService.generateInterviewSummary({
      callId,
      interviewId,
      transcript
    });

    if (summaryResult.status !== 200) {
      console.warn(`⚠️ [${requestId}] Summary generation failed, but continuing:`, summaryResult.error);
      // 不因为总结生成失败而中断整个请求
    } else {
      console.log(`✅ [${requestId}] Interview summary generated successfully`);
    }

    // 保存分析结果到数据库
    await ResponseService.saveResponse(
      {
        details: callResponse,
        is_analysed: true,
        duration: duration,
        analytics: analytics,
      },
      callId,
    );

    console.log(`💾 [${requestId}] Analytics saved to database`);

    res.status(200).json({
      callResponse,
      analytics
    });
  } catch (error: any) {
    console.error(`❌ [${requestId}] Error fetching call:`, error);
    console.error(`❌ [${requestId}] Error details:`, error.message);

    res.status(500).json({
      error: "Failed to fetch call data",
      details: error.message
    });
  }
};
