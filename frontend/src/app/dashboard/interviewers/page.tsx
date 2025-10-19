"use client";

import { useInterviewers } from "@/contexts/interviewers.context";
import React, { useEffect } from "react";
import InterviewerCard from "@/components/dashboard/interviewer/interviewerCard";
import CreateInterviewerButton from "@/components/dashboard/interviewer/createInterviewerButton";
import SyncInterviewersButton from "@/components/dashboard/interviewer/syncInterviewersButton";

function Interviewers() {
  const { interviewers, interviewersLoading } = useInterviewers();

  // 添加调试日志
  useEffect(() => {
    console.log("【Interviewers Page】Current interviewers:", {
      count: interviewers.length,
      interviewers: interviewers,
      loading: interviewersLoading
    });
  }, [interviewers, interviewersLoading]);

  function InterviewersLoader() {
    return (
      <>
        <div className="flex flex-wrap gap-3">
          <div className="h-40 w-36 animate-pulse rounded-xl bg-gray-300" />
          <div className="h-40 w-36 animate-pulse rounded-xl bg-gray-300" />
          <div className="h-40 w-36 animate-pulse rounded-xl bg-gray-300" />
          <div className="h-40 w-36 animate-pulse rounded-xl bg-gray-300" />
        </div>
      </>
    );
  }

  return (
    <main className="p-8 pt-0 ml-12 mr-auto rounded-md">
      <div className="flex flex-col items-left">
        <div className="flex flex-row mt-5">
          <div>
            <h2 className="mr-2 text-2xl font-semibold tracking-tight mt-3">
              Interviewers
            </h2>
            <h3 className=" text-sm tracking-tight text-gray-600 font-medium ">
              Get to know them by clicking the profile.
            </h3>
          </div>
        </div>
        
        {/* 改为flex-wrap布局，自动换行显示所有面试官 */}
        <div className="mt-4">
          <div className="flex flex-wrap gap-3">
            {/* 始终显示同步按钮 */}
            <SyncInterviewersButton />
            
            {/* 始终显示创建按钮（后端会检查重复） */}
            {!interviewersLoading && (
              <CreateInterviewerButton />
            )}
            
            {!interviewersLoading ? (
              <>
                {interviewers.map((interviewer) => (
                  <InterviewerCard
                    key={interviewer.id}
                    interviewer={interviewer}
                  />
                ))}
              </>
            ) : (
              <InterviewersLoader />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Interviewers;
