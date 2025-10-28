"use client";

import { Interview } from "@/types/interview";
import { Interviewer } from "@/types/interviewer";
import { Response } from "@/types/response";
import React, { useEffect, useState } from "react";
import { Info, Sparkles, RefreshCw, ArrowLeft, Download, FileText, Clock, CheckCircle } from "lucide-react";
import { useInterviewers } from "@/contexts/interviewers.context";
import { convertSecondstoMMSS } from "@/lib/utils";
import Image from "next/image";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import DataTable, {
  TableData,
} from "@/components/dashboard/interview/dataTable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudySummaryCard from "@/components/dashboard/interview/StudySummaryCard";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type SummaryProps = {
  responses: Response[];
  interview: Interview | undefined;
};

function InfoTooltip({ content }: { content: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Info
            className="h-2 w-2 text-[#4F46E5] inline-block ml-0 align-super font-bold"
            strokeWidth={2.5}
          />
        </TooltipTrigger>
        <TooltipContent className="bg-gray-500 text-white font-normal">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SummaryInfo({ responses, interview }: SummaryProps) {
  const router = useRouter();
  const { interviewers } = useInterviewers();
  const [interviewer, setInterviewer] = useState<Interviewer>();
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [completedInterviews, setCompletedInterviews] = useState<number>(0);
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [studySummary, setStudySummary] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");

  const prepareTableData = (responses: Response[]): TableData[] => {
    return responses.map((response) => ({
      call_id: response.call_id,
      name: response.name || "Anonymous",
      callSummary:
        response.analytics?.softSkillSummary ||
        response.details?.call_analysis?.call_summary ||
        "No summary available",
    }));
  };

  useEffect(() => {
    if (!interviewers || !interview) {
      return;
    }
    const interviewer = interviewers.find(
      (interviewer) => interviewer.id === interview.interviewer_id,
    );
    setInterviewer(interviewer);
  }, [interviewers, interview]);

  useEffect(() => {
    if (!responses) {
      return;
    }

    let totalDuration = 0;
    let completedCount = 0;

    responses.forEach((response) => {
      const agentTaskCompletion =
        response.details?.call_analysis?.agent_task_completion_rating;
      if (
        agentTaskCompletion === "Complete" ||
        agentTaskCompletion === "Partial"
      ) {
        completedCount += 1;
      }

      totalDuration += response.duration;
    });

    setTotalDuration(totalDuration);
    setCompletedInterviews(completedCount);

    const preparedData = prepareTableData(responses);
    setTableData(preparedData);
  }, [responses]);

  // Load existing study summary
  useEffect(() => {
    if (interview && (interview.executive_summary || interview.objective_deliverables || interview.cross_interview_insights)) {
      setStudySummary({
        executive_summary: interview.executive_summary,
        objective_deliverables: interview.objective_deliverables,
        cross_interview_insights: interview.cross_interview_insights,
        evidence_bank: interview.evidence_bank,
      });
    }
  }, [interview]);

  const handleGenerateInsights = async () => {
    if (!interview?.id) return;

    setIsGenerating(true);
    try {
      const response = await apiClient.post("/analytics/study-summary", {
        interviewId: interview.id,
      });

      if (response.data.summary) {
        setStudySummary(response.data.summary);
        setSelectedTab("insights");
        toast.success("Study insights generated successfully!");
      } else {
        toast.error(response.data.error || "Failed to generate insights");
      }
    } catch (error: any) {
      console.error("Error generating insights:", error);
      toast.error(error.response?.data?.error || "Failed to generate insights");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateSummary = async (field: string, value: any) => {
    if (!interview?.id) return;

    try {
      // Update local state immediately
      setStudySummary((prev: any) => ({
        ...prev,
        [field]: value,
      }));

      // TODO: Add API call to update the summary in database
      toast.success("Summary updated successfully!");
    } catch (error) {
      console.error("Error updating summary:", error);
      toast.error("Failed to update summary");
    }
  };

  return (
    <div className="h-screen z-[10] mx-2">
      {responses.length > 0 ? (
        <div className="bg-gray-50 rounded-2xl min-h-[120px] p-6">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex flex-row gap-4 justify-between items-start mb-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">整体调研总结</h1>
                <p className="text-sm text-gray-600">
                  AI对所有访谈结果进行的综合性总结，包含文字分析、带有图表的数据分析，并根据调研目标提供下一步行动建议
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  返回我的调研
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  导出完整报告
                </Button>
              </div>
            </div>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <div className="bg-white rounded-lg border border-gray-200 mb-4">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <TabsList className="bg-transparent border-none">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-6"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="insights"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-6"
                  >
                    Study Insights
                  </TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-600">
                    Interviewer: <span className="font-medium text-gray-900">{interviewer?.name}</span>
                  </p>
                  <Button
                    onClick={handleGenerateInsights}
                    disabled={isGenerating}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        生成洞察
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <TabsContent value="overview" className="p-6 space-y-6 mt-0">
                {/* Study Info Section */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-900 min-w-[120px]">Study Objective:</span>
                    <span className="text-sm text-gray-700">{interview?.objective || "Not specified"}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-900 min-w-[120px]">Description:</span>
                    <span className="text-sm text-gray-700">{interview?.description || "No description"}</span>
                  </div>
                </div>

                {/* Individual Interview Summaries Table */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">个人访谈总结</h3>
                  </div>
                  <ScrollArea className="h-[250px]">
                    <DataTable data={tableData} interviewId={interview?.id || ""} />
                  </ScrollArea>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-900">Average Duration</span>
                      </div>
                      <InfoTooltip content="Average time users took to complete an interview" />
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-blue-600">
                        {convertSecondstoMMSS(totalDuration / responses.length)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-900">Interview Completion Rate</span>
                      </div>
                      <InfoTooltip content="Percentage of interviews completed successfully" />
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-blue-600">
                        {Math.round((completedInterviews / responses.length) * 10000) / 100}%
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="p-6 space-y-6 mt-0">
                {studySummary ? (
                  <StudySummaryCard
                    interviewId={interview?.id || ""}
                    summary={studySummary}
                    onUpdate={handleUpdateSummary}
                  />
                ) : (
                  <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                    <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">暂未生成洞察</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      点击"生成洞察"按钮，AI将分析所有访谈并提取关键发现
                    </p>
                    <Button
                      onClick={handleGenerateInsights}
                      disabled={isGenerating}
                      className="bg-blue-600 hover:bg-blue-700 mx-auto"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          生成洞察
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      ) : (
        <div className="w-[85%] h-[60%] flex flex-col items-center justify-center">
          <div className="flex flex-col items-center">
            <Image
              src="/no-responses.png"
              alt="logo"
              width={270}
              height={270}
            />
            <p className="text-center text-sm mt-0">
              Please share with your intended respondents
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SummaryInfo;
