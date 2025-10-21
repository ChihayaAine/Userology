"use client";

import React, { useState, useContext, ReactNode, useEffect } from "react";
import { Interview } from "@/types/interview";
import { InterviewService } from "@/services/interviews.service";
import { useClerk, useOrganization } from "@clerk/nextjs";

interface InterviewContextProps {
  interviews: Interview[];
  setInterviews: React.Dispatch<React.SetStateAction<Interview[]>>;
  getInterviewById: (interviewId: string) => Interview | null | any;
  interviewsLoading: boolean;
  setInterviewsLoading: (interviewsLoading: boolean) => void;
  fetchInterviews: () => void;
}

export const InterviewContext = React.createContext<InterviewContextProps>({
  interviews: [],
  setInterviews: () => {},
  getInterviewById: () => null,
  setInterviewsLoading: () => undefined,
  interviewsLoading: false,
  fetchInterviews: () => {},
});

interface InterviewProviderProps {
  children: ReactNode;
}

export function InterviewProvider({ children }: InterviewProviderProps) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const { user } = useClerk();
  const { organization } = useOrganization();
  const [interviewsLoading, setInterviewsLoading] = useState(true);

  const fetchInterviews = async () => {
    try {
      console.log('🔄 Fetching interviews...', { userId: user?.id, orgId: organization?.id });
      setInterviewsLoading(true);
      const response = await InterviewService.getAllInterviews(
        user?.id as string,
        organization?.id as string,
      );
      console.log('✅ Interviews fetched:', response.length, 'interviews');
      setInterviews(response);
      setInterviewsLoading(false);
    } catch (error) {
      console.error('❌ Error fetching interviews:', error);
      // 失败后延迟重试（最多3次）
      const retryCount = (error as any).__retryCount || 0;
      if (retryCount < 3) {
        console.log(`⏱️  将在 ${2 * (retryCount + 1)} 秒后重试 (${retryCount + 1}/3)`);
        setTimeout(() => {
          (error as any).__retryCount = retryCount + 1;
          fetchInterviews();
        }, 2000 * (retryCount + 1));
      } else {
        console.error('❌ 重试3次后仍然失败，停止重试');
        setInterviewsLoading(false);
      }
    }
  };

  const getInterviewById = async (interviewId: string) => {
    const response = await InterviewService.getInterviewById(interviewId);

    return response;
  };

  useEffect(() => {
    if (organization?.id || user?.id) {
      fetchInterviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id, user?.id]);

  return (
    <InterviewContext.Provider
      value={{
        interviews,
        setInterviews,
        getInterviewById,
        interviewsLoading,
        setInterviewsLoading,
        fetchInterviews,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
}

export const useInterviews = () => {
  const value = useContext(InterviewContext);

  return value;
};
