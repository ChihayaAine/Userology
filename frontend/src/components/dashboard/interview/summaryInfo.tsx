"use client";

import { Interview } from "@/types/interview";
import { Interviewer } from "@/types/interviewer";
import { Response } from "@/types/response";
import React, { useEffect, useState } from "react";
import { Info, Sparkles, RefreshCw } from "lucide-react";
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
        <div className="bg-slate-200 rounded-2xl min-h-[120px] p-4">
          <div className="flex flex-row gap-2 justify-between items-center mb-4">
            <div className="flex flex-row gap-2 items-center">
              <p className="font-semibold text-lg">Study Analysis</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm">
                Interviewer: <span className="font-medium">{interviewer?.name}</span>
              </p>
              <Button
                onClick={handleGenerateInsights}
                disabled={isGenerating}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Insights
                  </>
                )}
              </Button>
            </div>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="insights">Study Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Study Objective:</span>{" "}
                {interview?.objective || "Not specified"}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Description:</span>{" "}
                {interview?.description || "No description"}
              </p>

              <div className="flex flex-col gap-1 p-4 rounded-2xl bg-slate-50 shadow-md">
                <ScrollArea className="h-[250px]">
                  <DataTable data={tableData} interviewId={interview?.id || ""} />
                </ScrollArea>
              </div>

              <div className="flex flex-row gap-4 justify-center">
                <div className="flex flex-col gap-1 p-3 rounded-2xl bg-slate-50 shadow-md max-w-[400px]">
                  <div className="flex flex-row items-center justify-center gap-1 font-semibold mb-1 text-[15px]">
                    Average Duration
                    <InfoTooltip content="Average time users took to complete an interview" />
                  </div>
                  <div className="flex items-center justify-center">
                    <p className="text-2xl font-semibold text-indigo-600 w-fit p-1 px-2 bg-indigo-100 rounded-md">
                      {convertSecondstoMMSS(totalDuration / responses.length)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-slate-50 shadow-md max-w-[360px]">
                  <div className="flex flex-row gap-1 font-semibold mb-1 text-[15px] mx-auto text-center">
                    Interview Completion Rate
                    <InfoTooltip content="Percentage of interviews completed successfully" />
                  </div>
                  <p className="w-fit text-2xl font-semibold text-indigo-600 p-1 px-2 bg-indigo-100 rounded-md">
                    {Math.round((completedInterviews / responses.length) * 10000) / 100}%
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              {studySummary ? (
                <StudySummaryCard
                  interviewId={interview?.id || ""}
                  summary={studySummary}
                  onUpdate={handleUpdateSummary}
                />
              ) : (
                <div className="bg-slate-50 rounded-2xl p-8 text-center">
                  <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No insights generated yet</p>
                  <p className="text-sm text-gray-500">
                    Click "Generate Insights" to analyze all interviews and extract key findings
                  </p>
                </div>
              )}
            </TabsContent>
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
