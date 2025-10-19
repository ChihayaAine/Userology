import { Request, Response } from 'express';
import { InterviewerService } from '@/services/interviewers.service';
import { retellClient } from '@/config/retell';
import { INTERVIEWERS, RETELL_AGENT_GENERAL_PROMPT, RETELL_AGENT_DEEP_DIVE_PROMPT } from '@/lib/constants';

export const createInterviewer = async (req: Request, res: Response) => {
  console.log("create-interviewer request received");

  try {
    const newModel = await retellClient.llm.create({
      model: "gpt-4o",
      general_prompt: RETELL_AGENT_GENERAL_PROMPT,
      general_tools: [
        {
          type: "end_call",
          name: "end_call_1",
          description:
            "End the call if the user uses goodbye phrases such as 'bye,' 'goodbye,' or 'have a nice day.' ",
        },
      ],
      // 控制AI响应时机的关键参数
      begin_message: null, // 不自动开始，等用户先说话
    });

    // Create Lisa
    const newFirstAgent = await retellClient.agent.create({
      response_engine: { llm_id: newModel.llm_id, type: "retell-llm" },
      voice_id: "11labs-Chloe",
      agent_name: "Lisa",
      // Retell AI官方参数：控制响应时机和打断行为
      responsiveness: 0.2, // 降低响应速度，给用户更多思考时间 (0-1, 默认1)
      interruption_sensitivity: 0.2, // 降低中断敏感度，减少抢话 (0-1, 默认1)
    });

    const newInterviewer = await InterviewerService.createInterviewer({
      agent_id: newFirstAgent.agent_id,
      ...INTERVIEWERS.LISA,
    });

    // Create Bob
    const newSecondAgent = await retellClient.agent.create({
      response_engine: { llm_id: newModel.llm_id, type: "retell-llm" },
      voice_id: "11labs-Brian",
      agent_name: "Bob",
      // Retell AI官方参数：控制响应时机和打断行为
      responsiveness: 0.2, // 降低响应速度，给用户更多思考时间 (0-1, 默认1)
      interruption_sensitivity: 0.2, // 降低中断敏感度，减少抢话 (0-1, 默认1)
    });

    const newSecondInterviewer = await InterviewerService.createInterviewer({
      agent_id: newSecondAgent.agent_id,
      ...INTERVIEWERS.BOB,
    });

    // Create David (Deep Dive) - 使用 MULTI-PROMPT AGENT（带 states）
    // 支持最多10个动态 sessions
    const davidModel = await retellClient.llm.create({
      model: "gpt-4o",
      general_prompt: `You are conducting a systematic, session-based user research interview.

Research Objective: {{objective}}
Participant Name: {{name}}
Time Limit: {{mins}} minutes
Total Sessions: {{session_count}}

Your interview is organized into {{session_count}} distinct sessions. Each session is a complete exploration unit that must be thoroughly covered before moving to the next.

CRITICAL INSTRUCTIONS:
- Complete the current session ENTIRELY before transitioning to the next
- Ask all questions within a session and explore with follow-ups
- After completing a session, explicitly announce: "We've completed this session. Let's move to the next section."
- Use the transition tool only when the current session is fully explored
- Do not mix or jump between sessions
- If a session content is empty or says "No content", end the interview as all sessions are completed`,
      // Multi-prompt agent: 定义最多10个 states，运行时根据实际需要填充
      states: [
        {
          name: "session_1",
          state_prompt: "{{session1}}",
          edges: [{
            description: "Transition to session 2 when session 1 is fully completed",
            destination_state_name: "session_2"
          }]
        },
        {
          name: "session_2",
          state_prompt: "{{session2}}",
          edges: [{
            description: "Transition to session 3 when session 2 is fully completed",
            destination_state_name: "session_3"
          }]
        },
        {
          name: "session_3",
          state_prompt: "{{session3}}",
          edges: [{
            description: "Transition to session 4 when session 4 is fully completed",
            destination_state_name: "session_4"
          }]
        },
        {
          name: "session_4",
          state_prompt: "{{session4}}",
          edges: [{
            description: "Transition to session 5 when session 5 is fully completed",
            destination_state_name: "session_5"
          }]
        },
        {
          name: "session_5",
          state_prompt: "{{session5}}",
          edges: [{
            description: "Transition to session 6 when session 6 is fully completed",
            destination_state_name: "session_6"
          }]
        },
        {
          name: "session_6",
          state_prompt: "{{session6}}",
          edges: [{
            description: "Transition to session 7 when session 7 is fully completed",
            destination_state_name: "session_7"
          }]
        },
        {
          name: "session_7",
          state_prompt: "{{session7}}",
          edges: [{
            description: "Transition to session 8 when session 8 is fully completed",
            destination_state_name: "session_8"
          }]
        },
        {
          name: "session_8",
          state_prompt: "{{session8}}",
          edges: [{
            description: "Transition to session 9 when session 9 is fully completed",
            destination_state_name: "session_9"
          }]
        },
        {
          name: "session_9",
          state_prompt: "{{session9}}",
          edges: [{
            description: "Transition to session 10 when session 10 is fully completed",
            destination_state_name: "session_10"
          }]
        },
        {
          name: "session_10",
          state_prompt: "{{session10}}"
          // 最后一个 session，没有 edges
        }
      ],
      starting_state: "session_1",
      general_tools: [
        {
          type: "end_call",
          name: "end_call_main",
          description: "End the call if user explicitly wants to end or all sessions are completed",
        },
      ],
      begin_message: null,
    });

    const davidAgent = await retellClient.agent.create({
      response_engine: { llm_id: davidModel.llm_id, type: "retell-llm" },
      voice_id: "11labs-Brian", // 使用和 Bob 一样的声音
      agent_name: "David",
      // 深度访谈需要更慢的节奏，给用户更多思考时间
      responsiveness: 0.1, // 更低的响应速度，更深思熟虑
      interruption_sensitivity: 0.15, // 更低的打断敏感度，让用户充分表达
    });

    const davidInterviewer = await InterviewerService.createInterviewer({
      agent_id: davidAgent.agent_id,
      ...INTERVIEWERS.DAVID,
    });

    console.log("Interviewers created successfully");

    res.status(200).json({
      newInterviewer,
      newSecondInterviewer,
      davidInterviewer,
    });
  } catch (error) {
    console.error("Error creating interviewers:", error);

    res.status(500).json({
      error: "Failed to create interviewers"
    });
  }
};

export const getAllInterviewers = async (req: Request, res: Response) => {
  try {
    const { clientId = "" } = req.query;
    const interviewers = await InterviewerService.getAllInterviewers(clientId as string);
    
    res.status(200).json(interviewers);
  } catch (error) {
    console.error("Error fetching interviewers:", error);
    res.status(500).json({
      error: "Failed to fetch interviewers"
    });
  }
};

export const getInterviewer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const interviewer = await InterviewerService.getInterviewer(BigInt(id));
    
    if (!interviewer) {
      return res.status(404).json({
        error: "Interviewer not found"
      });
    }
    
    return res.status(200).json(interviewer);
  } catch (error) {
    console.error("Error fetching interviewer:", error);
    return res.status(500).json({
      error: "Failed to fetch interviewer"
    });
  }
};
