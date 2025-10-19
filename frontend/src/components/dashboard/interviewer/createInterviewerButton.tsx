"use client";

import { Card, CardContent } from "@/components/ui/card";
import { InterviewerService } from "@/services/interviewers.service";
import { useInterviewers } from "@/contexts/interviewers.context";
import { apiClient } from "@/services/api";
import { Plus, Loader2 } from "lucide-react";
import { useState } from "react";

function CreateInterviewerButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { createInterviewer } = useInterviewers();

  const createInterviewers = async () => {
    try {
      setIsLoading(true);
      console.warn('【创建面试官开始】：>>>>>>>>>>>> createInterviewerButton.tsx:16');
      
      const response = await apiClient.get("/interviewers/create");
      console.warn('【创建面试官响应】：>>>>>>>>>>>> createInterviewerButton.tsx:19', response.data);
      
      // 强制刷新面试官列表
      window.location.reload();
      
    } catch (error) {
      console.error('【创建面试官失败】：>>>>>>>>>>>> createInterviewerButton.tsx:25', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card
        className="p-0 inline-block cursor-pointer hover:scale-105 ease-in-out duration-300 h-40 w-36 ml-1 mr-3 rounded-xl shrink-0 overflow-hidden shadow-md"
        onClick={() => createInterviewers()}
      >
        <CardContent className="p-0">
          {isLoading ? (
            <div className="w-full h-20 overflow-hidden flex justify-center items-center">
              <Loader2 size={40} className="animate-spin" />
            </div>
          ) : (
            <div className="w-full h-20 overflow-hidden flex justify-center items-center">
              <Plus size={40} />
            </div>
          )}
          <p className="my-3 mx-auto text-xs text-wrap w-fit text-center">
            Create Default Interviewers
          </p>
        </CardContent>
      </Card>
    </>
  );
}

export default CreateInterviewerButton;
