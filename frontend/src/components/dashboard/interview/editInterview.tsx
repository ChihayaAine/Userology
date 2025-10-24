"use client";

import { Interview, Question } from "@/types/interview";
import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Plus, SaveIcon, TrashIcon, Globe } from "lucide-react";
import { useInterviewers } from "@/contexts/interviewers.context";
import QuestionCard from "@/components/dashboard/interview/create-popup/questionCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useInterviews } from "@/contexts/interviews.context";
import { InterviewService } from "@/services/interviews.service";
import { CardTitle } from "../../ui/card";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import apiClient from "@/services/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type EditInterviewProps = {
  interview: Interview | undefined;
};

function EditInterview({ interview }: EditInterviewProps) {
  const { interviewers } = useInterviewers();
  const { fetchInterviews } = useInterviews();

  const [description, setDescription] = useState<string>(
    interview?.description || "",
  );
  const [objective, setObjective] = useState<string>(
    interview?.objective || "",
  );
  const [numQuestions, setNumQuestions] = useState<number>(
    interview?.question_count || 1,
  );
  const [duration, setDuration] = useState<Number>(
    Number(interview?.time_duration),
  );
  const [questions, setQuestions] = useState<Question[]>(
    // 优先使用 draft_outline（初稿），如果没有则使用 questions
    interview?.draft_outline || interview?.questions || [],
  );
  const [selectedInterviewer, setSelectedInterviewer] = useState(
    interview?.interviewer_id,
  );
  const [isAnonymous, setIsAnonymous] = useState<boolean>(
    interview?.is_anonymous || false,
  );

  const [isClicked, setIsClicked] = useState(false);

  // Localization states
  const [isLocalizing, setIsLocalizing] = useState(false);
  const [localizedQuestions, setLocalizedQuestions] = useState<Question[]>(
    interview?.localized_outline || []
  );
  const [showLocalized, setShowLocalized] = useState(false);

  // 访谈使用的版本：'draft' 或 'localized'
  // 默认使用当前 questions 字段对应的版本
  const [interviewVersion, setInterviewVersion] = useState<'draft' | 'localized'>(() => {
    // 如果 questions 和 localized_outline 相同，说明使用的是本地化版本
    if (interview?.questions && interview?.localized_outline) {
      const questionsStr = JSON.stringify(interview.questions);
      const localizedStr = JSON.stringify(interview.localized_outline);
      return questionsStr === localizedStr ? 'localized' : 'draft';
    }
    return 'draft';
  });

  const endOfListRef = useRef<HTMLDivElement>(null);
  const prevQuestionLengthRef = useRef(questions.length);
  const router = useRouter();

  const handleInputChange = (id: string, newQuestion: Question) => {
    setQuestions(
      questions.map((question) =>
        question.id === id ? { ...question, ...newQuestion } : question,
      ),
    );
  };

  const handleDeleteQuestion = (id: string) => {
    if (questions.length === 1) {
      setQuestions(
        questions.map((question) => ({
          ...question,
          question: "",
          follow_up_count: 1,
        })),
      );

      return;
    }
    setQuestions(questions.filter((question) => question.id !== id));
    setNumQuestions(numQuestions - 1);
  };

  const handleAddQuestion = () => {
    if (questions.length < numQuestions) {
      setQuestions([
        ...questions,
        { id: uuidv4(), question: "", follow_up_count: 1 },
      ]);
    }
  };

  const onLocalize = async () => {
    if (!interview?.outline_interview_language) {
      toast.error("缺少访谈语言信息", {
        position: "bottom-right",
        duration: 3000,
      });
      return;
    }

    if (questions.length === 0) {
      toast.error("没有可本地化的大纲", {
        position: "bottom-right",
        duration: 3000,
      });
      return;
    }

    setIsLocalizing(true);
    try {
      const response = await apiClient.post(
        '/questions/localize-outline',
        {
          draftOutline: questions, // 使用当前的 questions 而不是 interview.draft_outline
          targetLanguage: interview.outline_interview_language,
          researchObjective: interview.objective,
          studyName: interview.name,
          description: description // 传递当前的 description
        },
        { timeout: 120000 }
      );

      console.log('✅ Localization response:', response.data);

      // 解析 OpenAI 返回的 JSON 字符串
      const localizedData = JSON.parse(response.data.response);
      console.log('📝 Localized data:', localizedData);
      console.log('📝 Localized description:', localizedData.description);

      if (localizedData && localizedData.questions) {
        // 保持ID一致，只更新question内容
        const localizedQuestionsWithIds = localizedData.questions.map((q: any, index: number) => ({
          id: questions[index]?.id || q.id,
          question: q.question,
          follow_up_count: q.follow_up_count || 1
        }));

        setLocalizedQuestions(localizedQuestionsWithIds);

        // 保存本地化版本到数据库（包括 description）
        const updateData: any = {
          localized_outline: localizedQuestionsWithIds
        };

        // 如果有本地化的 description，也保存
        if (localizedData.description) {
          updateData.description = localizedData.description;
          setDescription(localizedData.description); // 更新本地状态
        }

        await InterviewService.updateInterview(updateData, interview.id);

        toast.success("大纲本地化成功！", {
          position: "bottom-right",
          duration: 3000,
        });
        setShowLocalized(true);
      }
    } catch (error: any) {
      console.error('Localization error:', error);
      toast.error(error.response?.data?.error || "本地化失败，请重试", {
        position: "bottom-right",
        duration: 3000,
      });
    } finally {
      setIsLocalizing(false);
    }
  };

  const onSave = async () => {
    const questionCount =
      questions.length < numQuestions ? questions.length : numQuestions;

    const currentQuestions = showLocalized ? localizedQuestions : questions;

    // 根据 interviewVersion 决定访谈时使用哪个版本
    const interviewQuestions = interviewVersion === 'localized' ? localizedQuestions : questions;

    const interviewData = {
      objective: objective,
      questions: interviewQuestions, // 访谈时使用的版本
      interviewer_id: Number(selectedInterviewer),
      question_count: questionCount,
      time_duration: Number(duration),
      description: description,
      is_anonymous: isAnonymous,
      // 保存当前编辑的版本到对应字段
      ...(showLocalized
        ? { localized_outline: currentQuestions }
        : { draft_outline: currentQuestions }
      ),
    };

    try {
      if (!interview) {
        return;
      }
      const response = await InterviewService.updateInterview(
        interviewData,
        interview?.id,
      );
      setIsClicked(false);
      fetchInterviews();
      toast.success("Interview updated successfully.", {
        position: "bottom-right",
        duration: 3000,
      });
      router.push(`/interviews/${interview?.id}`);
    } catch (error) {
      console.error("Error creating interview:", error);
    }
  };

  const onDeleteInterviewClick = async () => {
    if (!interview) {
      return;
    }

    try {
      await InterviewService.deleteInterview(interview.id);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error("Failed to delete the interview.", {
        position: "bottom-right",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    if (questions.length > prevQuestionLengthRef.current) {
      endOfListRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevQuestionLengthRef.current = questions.length;
  }, [questions.length]);

  return (
    <div className=" h-screen z-[10] mx-2">
      <div className="flex flex-col bg-gray-200 rounded-md min-h-[120px] p-2 pl-4">
        <div>
          <div
            className="mt-2 ml-1 pr-2 inline-flex items-center text-indigo-600 hover:cursor-pointer"
            onClick={() => {
              router.push(`/interviews/${interview?.id}`);
            }}
          >
            <ArrowLeft className="mr-2" />
            <p className="text-sm font-semibold">Back to Summary</p>
          </div>
        </div>
        <div className="flex flex-row justify-between">
          <p className="mt-3 mb-1 ml-2 font-medium">
            Interview Description{" "}
            <span className="text-xs ml-2 font-normal">
              (Your respondents will see this.)
            </span>
          </p>
          <div className="flex flex-row gap-3">
            <Button
              disabled={isClicked}
              className="bg-indigo-600 hover:bg-indigo-800 mt-2"
              onClick={() => {
                setIsClicked(true);
                onSave();
              }}
            >
              Save <SaveIcon size={16} className="ml-2" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger>
                <Button
                  disabled={isClicked}
                  className="bg-red-500 hover:bg-red-600 mr-5 mt-2 p-2"
                >
                  <TrashIcon size={16} className="" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    this interview.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-indigo-600 hover:bg-indigo-800"
                    onClick={async () => {
                      await onDeleteInterviewClick();
                    }}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <textarea
          value={description}
          className="h-fit mt-3 ml-2 py-2 border-2 rounded-md w-[75%] px-2 border-gray-400"
          placeholder="Enter your interview description here."
          rows={3}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          onBlur={(e) => {
            setDescription(e.target.value.trim());
          }}
        />
        <p className="mt-3 mb-1 ml-2 font-medium">Objective</p>
        <textarea
          value={objective}
          className="h-fit mt-3 ml-2 py-2 border-2 rounded-md w-[75%] px-2 border-gray-400"
          placeholder="Enter your interview objective here."
          rows={3}
          onChange={(e) => setObjective(e.target.value)}
          onBlur={(e) => setObjective(e.target.value.trim())}
        />
        <div className="flex flex-row gap-3">
          <div>
            <p className="mt-3 mb-1 ml-2 font-medium">Interviewer</p>
            <div className=" flex items-center mt-1">
              <div
                id="slider-3"
                className=" h-32 pt-1 ml-2 overflow-x-scroll scroll whitespace-nowrap scroll-smooth scrollbar-hide w-[27.5rem]"
              >
                {interviewers.map((item) => (
                  <div
                    className=" p-0 inline-block cursor-pointer hover:scale-105 ease-in-out duration-300  ml-1 mr-3 rounded-xl shrink-0 overflow-hidden"
                    key={item.id}
                  >
                    <div
                      className={`w-[96px] overflow-hidden rounded-full ${
                        selectedInterviewer === item.id
                          ? "border-4 border-indigo-600"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedInterviewer(item.id);
                      }}
                    >
                      <Image
                        src={item.image}
                        alt="Picture of the interviewer"
                        width={70}
                        height={70}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardTitle className="mt-0 text-xs text-center">
                      {item.name}
                    </CardTitle>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <label className="flex-col mt-2 ml-2 w-full">
          <div className="flex items-center cursor-pointer">
            <span className="text-sm font-medium">
              Do you prefer the interviewees&apos; responses to be anonymous?
            </span>
            <Switch
              checked={isAnonymous}
              className={`ml-4 mt-1 border-2 border-gray-300 ${
                isAnonymous ? "bg-indigo-600" : "bg-white"
              }`}
              onCheckedChange={(checked) => setIsAnonymous(checked)}
            />
          </div>
          <span
            style={{ fontSize: "0.7rem", lineHeight: "0.66rem" }}
            className="font-light text-xs italic w-full text-left block"
          >
            Note: If not anonymous, the interviewee&apos;s email and name will
            be collected.
          </span>
        </label>
        <div className="flex flex-row justify-between w-[75%] gap-3 ml-2">
          <div className="flex flex-row justify-center items-center mt-5 ">
            <h3 className="font-medium ">Number of Sessions/Questions:</h3>
            <input
              type="number"
              step="1"
              max="5"
              min={questions.length.toString()}
              className="border-2 text-center focus:outline-none  bg-slate-100 rounded-md border-gray-500 w-14 px-2 py-0.5 ml-3"
              value={numQuestions}
              onChange={(e) => {
                let value = e.target.value;
                if (
                  value === "" ||
                  (Number.isInteger(Number(value)) && Number(value) > 0)
                ) {
                  if (Number(value) > 5) {
                    value = "5";
                  }
                  setNumQuestions(Number(value));
                }
              }}
            />
          </div>
          <div className="flex flex-row items-center mt-5">
            <h3 className="font-medium ">Duration (mins):</h3>
            <input
              type="number"
              step="1"
              max="10"
              min="1"
              className="border-2 text-center focus:outline-none bg-slate-100 rounded-md border-gray-500 w-14 px-2 py-0.5 ml-3"
              value={Number(duration)}
              onChange={(e) => {
                let value = e.target.value;
                if (
                  value === "" ||
                  (Number.isInteger(Number(value)) && Number(value) > 0)
                ) {
                  if (Number(value) > 10) {
                    value = "10";
                  }
                  setDuration(Number(value));
                }
              }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between w-[75%] mt-3 mb-1 ml-2">
          <p className="font-medium">Interview Guide</p>
          <div className="flex items-center gap-2">
            {/* 版本切换按钮 */}
            {localizedQuestions.length > 0 && (
              <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
                <Button
                  size="sm"
                  variant={!showLocalized ? "default" : "ghost"}
                  className={`h-7 text-xs ${!showLocalized ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
                  onClick={() => setShowLocalized(false)}
                >
                  初稿
                </Button>
                <Button
                  size="sm"
                  variant={showLocalized ? "default" : "ghost"}
                  className={`h-7 text-xs ${showLocalized ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
                  onClick={() => setShowLocalized(true)}
                >
                  本地化
                </Button>
              </div>
            )}

            {/* 本地化按钮 */}
            {interview?.outline_interview_language &&
             questions.length > 0 &&
             localizedQuestions.length === 0 && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                onClick={onLocalize}
                disabled={isLocalizing}
              >
                <Globe size={14} className="mr-1" />
                {isLocalizing ? "本地化中..." : "一键本地化"}
              </Button>
            )}
          </div>
        </div>

        {/* 访谈版本选择器 */}
        {localizedQuestions.length > 0 && (
          <div className="flex items-center gap-2 w-[75%] mt-2 mb-1 ml-2 p-2 bg-blue-50 rounded-md border border-blue-200">
            <span className="text-xs font-medium text-blue-900">访谈使用版本:</span>
            <div className="flex items-center gap-1 bg-white rounded-md p-0.5 border border-blue-300">
              <Button
                size="sm"
                variant={interviewVersion === 'draft' ? "default" : "ghost"}
                className={`h-6 text-xs ${interviewVersion === 'draft' ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-100"}`}
                onClick={() => setInterviewVersion('draft')}
              >
                初稿
              </Button>
              <Button
                size="sm"
                variant={interviewVersion === 'localized' ? "default" : "ghost"}
                className={`h-6 text-xs ${interviewVersion === 'localized' ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-100"}`}
                onClick={() => setInterviewVersion('localized')}
              >
                本地化
              </Button>
            </div>
            <span className="text-xs text-blue-700">
              {interviewVersion === 'draft'
                ? `(${interview?.outline_debug_language || '调试语言'})`
                : `(${interview?.outline_interview_language || '访谈语言'})`
              }
            </span>
          </div>
        )}

        <ScrollArea className="flex ml-2 p-2 pr-4 mb-4 flex-col justify-center items-center w-[75%] max-h-[500px] bg-slate-100 rounded-md text-sm mt-3">
          {(showLocalized ? localizedQuestions : questions).map((question, index) => (
            <QuestionCard
              key={question.id}
              questionNumber={index + 1}
              questionData={question}
              onDelete={showLocalized ? () => {} : handleDeleteQuestion}
              onQuestionChange={showLocalized ? () => {} : handleInputChange}
              readOnly={showLocalized}
            />
          ))}
          <div ref={endOfListRef} />
          {!showLocalized && questions.length < numQuestions ? (
            <div
              className="border-indigo-600 opacity-75 hover:opacity-100 w-fit text-center rounded-full mx-auto"
              onClick={handleAddQuestion}
            >
              <Plus
                size={45}
                strokeWidth={2.2}
                className="text-indigo-600 text-center cursor-pointer"
              />
            </div>
          ) : (
            <></>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

export default EditInterview;
