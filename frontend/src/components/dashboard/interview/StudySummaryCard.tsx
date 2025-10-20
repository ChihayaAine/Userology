"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Target, 
  Lightbulb, 
  Edit2, 
  Save, 
  X,
  Sparkles,
  Quote
} from "lucide-react";
import { InterviewDetails } from "@/types/interview";

interface StudySummaryCardProps {
  interviewId: string;
  summary: {
    executive_summary?: string;
    objective_deliverables?: any;
    cross_interview_insights?: any[];
    evidence_bank?: any[];
  } | null;
  onUpdate: (field: string, value: any) => Promise<void>;
}

const StudySummaryCard: React.FC<StudySummaryCardProps> = ({
  interviewId,
  summary,
  onUpdate,
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSave = async (field: string) => {
    await onUpdate(field, editValue);
    setEditingField(null);
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue("");
  };

  if (!summary) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Executive Summary */}
      {summary.executive_summary && (
        <Card className="bg-slate-50 border-l-4 border-l-indigo-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <CardTitle className="text-lg">Executive Summary</CardTitle>
              </div>
              {editingField !== "executive_summary" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit("executive_summary", summary.executive_summary || "")}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editingField === "executive_summary" ? (
              <div className="space-y-2">
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="min-h-[120px]"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSave("executive_summary")}>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed">
                {summary.executive_summary}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Objective Deliverables */}
      {summary.objective_deliverables && (
        <Card className="bg-slate-50 border-l-4 border-l-purple-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg">
                {summary.objective_deliverables.type || "Key Deliverables"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.isArray(summary.objective_deliverables.content) ? (
                summary.objective_deliverables.content.map((item: any, index: number) => (
                  <Card key={index} className="bg-white">
                    <CardContent className="pt-4">
                      {typeof item === "string" ? (
                        <p className="text-sm text-gray-700">{item}</p>
                      ) : (
                        <div>
                          {item.title && (
                            <h4 className="font-semibold text-sm mb-2">{item.title}</h4>
                          )}
                          {item.description && (
                            <p className="text-sm text-gray-700">{item.description}</p>
                          )}
                          {item.details && (
                            <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                              {Array.isArray(item.details) ? (
                                item.details.map((detail: string, i: number) => (
                                  <li key={i}>{detail}</li>
                                ))
                              ) : (
                                <li>{item.details}</li>
                              )}
                            </ul>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-sm text-gray-700">
                  {JSON.stringify(summary.objective_deliverables.content, null, 2)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cross-Interview Insights */}
      {summary.cross_interview_insights && summary.cross_interview_insights.length > 0 && (
        <Card className="bg-slate-50 border-l-4 border-l-green-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <Lightbulb className="w-5 h-5 text-green-600" />
              </div>
              <CardTitle className="text-lg">Cross-Interview Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-3 pr-4">
                {summary.cross_interview_insights.map((insight: any, index: number) => (
                  <Card key={insight.id || index} className="bg-white">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-green-600" />
                          <h4 className="font-semibold text-sm">
                            {insight.title || `Insight ${index + 1}`}
                          </h4>
                        </div>
                        {insight.importance && (
                          <Badge
                            variant="outline"
                            className={
                              insight.importance === "high"
                                ? "bg-red-100 text-red-800 border-red-300"
                                : insight.importance === "medium"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                : "bg-gray-100 text-gray-800 border-gray-300"
                            }
                          >
                            {insight.importance}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {insight.description}
                      </p>
                      {insight.category && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {insight.category}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Evidence Bank */}
      {summary.evidence_bank && summary.evidence_bank.length > 0 && (
        <Card className="bg-slate-50 border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Quote className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Supporting Evidence</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-3 pr-4">
                {summary.evidence_bank.map((evidence: any, index: number) => (
                  <Card key={index} className="bg-white">
                    <CardContent className="pt-4">
                      {evidence.insight_id && (
                        <p className="text-xs text-gray-500 mb-2">
                          Related to: {evidence.insight_id}
                        </p>
                      )}
                      <blockquote className="text-sm text-gray-700 italic border-l-2 border-gray-300 pl-3">
                        "{evidence.quote}"
                      </blockquote>
                      {evidence.participant && (
                        <p className="text-xs text-gray-600 mt-2">
                          — {evidence.participant}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudySummaryCard;

