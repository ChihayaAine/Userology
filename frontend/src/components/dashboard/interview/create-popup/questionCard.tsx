import { Question } from "@/types/interview";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuestionCardProps {
  questionNumber: number;
  questionData: Question;
  onQuestionChange: (id: string, question: Question) => void;
  onDelete: (id: string) => void;
  isDeepDiveMode?: boolean;
  readOnly?: boolean;
}

const questionCard = ({
  questionNumber,
  questionData,
  onQuestionChange,
  onDelete,
  isDeepDiveMode = false,
  readOnly = false,
}: QuestionCardProps) => {
  return (
    <>
      <Card className={`shadow-md mb-5 pb-3 ${isDeepDiveMode ? 'min-h-[200px]' : ''}`}>
        <CardContent className="p-2 mx-5">
          <div className="flex flex-row justify-between mt-3 items-baseline ">
            <CardTitle className="text-lg">
              {isDeepDiveMode ? `Session ${questionNumber}` : `Question ${questionNumber}`}
            </CardTitle>
            <div className="flex flex-row items-start space-x-1">
              <h3 className="text-base font-semibold mr-2">Depth Level: </h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className={`text-xs h-7  hover:bg-indigo-800  ${
                        questionData?.follow_up_count == 1
                          ? "bg-indigo-600"
                          : "opacity-50"
                      } `}
                      onClick={() =>
                        !readOnly && onQuestionChange(questionData.id, {
                          ...questionData,
                          follow_up_count: 1,
                        })
                      }
                      disabled={readOnly}
                    >
                      Low
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-200">
                    <p className="text-zinc-800">Brief follow-up</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className={`text-xs h-7  hover:bg-indigo-800 ${
                        questionData?.follow_up_count == 2
                          ? "bg-indigo-600"
                          : "opacity-50"
                      } `}
                      onClick={() =>
                        !readOnly && onQuestionChange(questionData.id, {
                          ...questionData,
                          follow_up_count: 2,
                        })
                      }
                      disabled={readOnly}
                    >
                      Medium
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-200">
                    <p className="text-zinc-800">Moderate follow-up</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className={`text-xs h-7 hover:bg-indigo-800  ${
                        questionData?.follow_up_count == 3
                          ? "bg-indigo-600"
                          : "opacity-50"
                      } `}
                      onClick={() =>
                        !readOnly && onQuestionChange(questionData.id, {
                          ...questionData,
                          follow_up_count: 3,
                        })
                      }
                      disabled={readOnly}
                    >
                      High
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-200">
                    <p className="text-zinc-800">In-depth follow-up</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="flex flex-row items-center">
            <textarea
              value={questionData?.question}
              className={`h-fit mt-3 pt-1 border-2 rounded-md w-full px-2 border-gray-400 ${
                isDeepDiveMode ? 'min-h-[120px]' : ''
              } ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder={
                isDeepDiveMode
                  ? "e.g. Session 1: User Background & Context\n- Tell me about your role and daily responsibilities\n- What does a typical workday look like for you?\n- What tools and systems do you use regularly?\n- How long have you been in this position?"
                  : "e.g. Can you tell me about a challenging project you've worked on?"
              }
              rows={isDeepDiveMode ? 10 : 3}
              onChange={(e) =>
                !readOnly && onQuestionChange(questionData.id, {
                  ...questionData,
                  question: e.target.value,
                })
              }
              onBlur={(e) =>
                !readOnly && onQuestionChange(questionData.id, {
                  ...questionData,
                  question: e.target.value.trim(),
                })
              }
              readOnly={readOnly}
            />
            {!readOnly && (
              <Trash2
                className="cursor-pointer ml-3"
                color="red"
                size={24}
                onClick={() => onDelete(questionData.id)}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};
export default questionCard;
