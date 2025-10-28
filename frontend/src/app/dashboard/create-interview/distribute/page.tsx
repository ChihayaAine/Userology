"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DistributePopup from "@/components/dashboard/interview/create-popup/distribute";
import { useInterviewStore } from "@/store/interview-store";
import Footer from "@/components/layout/Footer";
import LoaderWithLogo from "@/components/loaders/loader-with-logo/loaderWithLogo";
import { InterviewService } from "@/services/interviews.service";

export default function DistributePage() {
  const router = useRouter();
  const {
    interviewData,
    selectedLanguage,
    outlineDebugLanguage,
    draftQuestions,
    localizedQuestions,
    completedSteps,
    addCompletedStep,
    interviewId,
    setInterviewData,
    setDraftQuestions,
    setLocalizedQuestions,
    setSelectedLanguage,
    setOutlineDebugLanguage,
  } = useInterviewStore();

  const [isLoadingInterview, setIsLoadingInterview] = useState(false);

  useEffect(() => {
    const loadInterviewData = async () => {
      console.log('🔍 Distribute page - interviewId:', interviewId);
      console.log('🔍 Distribute page - interviewData:', interviewData);
      console.log('🔍 Distribute page - draftQuestions:', draftQuestions);
      
      // 如果没有访谈ID，重定向到首页
      if (!interviewId) {
        console.log('❌ No interviewId found, redirecting to dashboard');
        router.push('/dashboard');
        return;
      }

      // 如果没有访谈数据，从后端加载
      if (!interviewData.name || !draftQuestions || draftQuestions.length === 0) {
        console.log('📥 Loading interview data from backend for distribute page...');
        setIsLoadingInterview(true);
        try {
          const response = await InterviewService.getInterviewById(interviewId);
          console.log('📦 Raw response:', response);
          
          // InterviewService.getInterviewById 可能直接返回数据，而不是 { data: ... }
          const interview = response.data || response;
          
          console.log('✅ Interview data loaded:', interview);
          
          if (!interview || !interview.name) {
            throw new Error('Invalid interview data received');
          }
          
          // 更新 store
          setInterviewData({
            name: interview.name,
            objective: interview.objective,
            interviewer_id: interview.interviewer_id,
            is_anonymous: interview.is_anonymous,
            language: interview.language,
            research_type: interview.research_type,
          } as any);
          
          setDraftQuestions(interview.draft_outline || interview.questions || []);
          setLocalizedQuestions(interview.localized_outline || []);
          setSelectedLanguage(interview.outline_interview_language || interview.language);
          setOutlineDebugLanguage(interview.outline_debug_language || interview.language);
        } catch (error) {
          console.error('❌ Failed to load interview data:', error);
          router.push('/dashboard');
        } finally {
          setIsLoadingInterview(false);
        }
      }
      
      // 到达分发页面时标记此步骤为可访问
      addCompletedStep('distribute');
    };
    
    loadInterviewData();
  }, [interviewId, router, addCompletedStep]);

  const handleSetProceed = (back: boolean) => {
    if (back) {
      router.push('/dashboard/create-interview/outline');
    }
  };

  const handleClose = () => {
    router.push('/dashboard');
  };

  if (isLoadingInterview) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <LoaderWithLogo />
        <p className="mt-6 text-lg text-gray-600 animate-pulse">加载访谈数据中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 px-4 py-8 max-w-7xl mx-auto w-full">
        <DistributePopup
          interviewData={interviewData}
          setProceed={handleSetProceed}
          setOpen={handleClose}
          selectedLanguage={selectedLanguage}
          outlineDebugLanguage={outlineDebugLanguage}
          draftQuestions={draftQuestions}
          localizedQuestions={localizedQuestions}
        />
      </div>
      <Footer />
    </div>
  );
}

