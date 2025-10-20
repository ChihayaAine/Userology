"use client";

import React, { useState, useContext, ReactNode, useEffect } from "react";
import { Interviewer } from "@/types/interviewer";
import { InterviewerService } from "@/services/interviewers.service";
import { useClerk } from "@clerk/nextjs";

interface InterviewerContextProps {
  interviewers: Interviewer[];
  setInterviewers: React.Dispatch<React.SetStateAction<Interviewer[]>>;
  createInterviewer: (payload: any) => void;
  interviewersLoading: boolean;
  setInterviewersLoading: (interviewersLoading: boolean) => void;
}

export const InterviewerContext = React.createContext<InterviewerContextProps>({
  interviewers: [],
  setInterviewers: () => {},
  createInterviewer: () => {},
  interviewersLoading: false,
  setInterviewersLoading: () => undefined,
});

interface InterviewerProviderProps {
  children: ReactNode;
}

export function InterviewerProvider({ children }: InterviewerProviderProps) {
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const { user } = useClerk();
  const [interviewersLoading, setInterviewersLoading] = useState(true);

  const fetchInterviewers = async () => {
    try {
      setInterviewersLoading(true);
      console.warn('【获取面试官开始】：>>>>>>>>>>>> interviewers.context.tsx:36', {
        userExists: !!user,
        userId: user?.id
      });
      
      // 面试官数据不依赖用户ID，直接获取所有面试官
      const response = await InterviewerService.getAllInterviewers();
      
      console.warn('【面试官数据响应】：>>>>>>>>>>>> interviewers.context.tsx:43', {
        count: response?.length || 0,
        data: response
      });
      
      setInterviewers(response);
    } catch (error) {
      console.error('【获取面试官失败】：>>>>>>>>>>>> interviewers.context.tsx:49', error);
    }
    setInterviewersLoading(false);
  };

  const createInterviewer = async (payload?: any) => {
    await InterviewerService.createInterviewer();
    fetchInterviewers();
  };

  useEffect(() => {
    // 立即获取面试官数据，不等待用户登录
    console.warn('【Context 初始化】：>>>>>>>>>>>> interviewers.context.tsx:63', {
      userExists: !!user,
      willFetchInterviewers: true
    });
    fetchInterviewers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 移除对 user?.id 的依赖

  return (
    <InterviewerContext.Provider
      value={{
        interviewers,
        setInterviewers,
        createInterviewer,
        interviewersLoading,
        setInterviewersLoading,
      }}
    >
      {children}
    </InterviewerContext.Provider>
  );
}

export const useInterviewers = () => {
  const value = useContext(InterviewerContext);

  return value;
};
