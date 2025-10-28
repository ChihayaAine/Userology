"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DistributePopup from "@/components/dashboard/interview/create-popup/distribute";
import { useInterviewStore } from "@/store/interview-store";
import Footer from "@/components/layout/Footer";

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
  } = useInterviewStore();

  useEffect(() => {
    // 如果没有问题数据，重定向到大纲页面
    if (!draftQuestions || draftQuestions.length === 0) {
      router.push('/dashboard/create-interview/outline');
      return;
    }
    // 到达分发页面时标记此步骤为可访问
    addCompletedStep('distribute');
  }, [draftQuestions, router, addCompletedStep]);

  const handleSetProceed = (back: boolean) => {
    if (back) {
      router.push('/dashboard/create-interview/outline');
    }
  };

  const handleClose = () => {
    router.push('/dashboard');
  };

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

