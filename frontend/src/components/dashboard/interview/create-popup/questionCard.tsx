import { Question } from "@/types/interview";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Sparkles } from "lucide-react";
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
    <div className="card bg-white border-2 border-gray-200 hover:shadow-md transition-all">
      <div className="card-body p-5">
        <div className="flex items-start gap-4">
          {/* Question Number Badge */}
          <div className="badge badge-primary badge-lg font-bold text-base min-w-[2.5rem] h-8 flex items-center justify-center">
            {questionNumber}
          </div>

          {/* Question Content */}
          <div className="flex-1">
            <textarea
              value={questionData?.question}
              className={`textarea textarea-bordered w-full border-2 border-gray-300 bg-white focus:border-blue-500 focus:outline-none resize-none ${
                isDeepDiveMode ? 'min-h-[120px]' : 'min-h-[80px]'
              } ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder={
                isDeepDiveMode
                  ? "请输入Session内容..."
                  : "请输入问题内容..."
              }
              rows={isDeepDiveMode ? 5 : 2}
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
          </div>

          {/* Action Buttons */}
          {!readOnly && (
            <div className="flex flex-col gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="btn btn-ghost btn-sm btn-square">
                      <Pencil size={16} className="text-gray-600" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>编辑</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="btn btn-ghost btn-sm btn-square">
                      <Sparkles size={16} className="text-blue-600" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI优化</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className="btn btn-ghost btn-sm btn-square"
                      onClick={() => onDelete(questionData.id)}
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>删除</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default questionCard;
