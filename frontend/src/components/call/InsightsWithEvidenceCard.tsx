"use client";

import React from "react";
import { InsightWithEvidence } from "@/types/response";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Lightbulb, 
  AlertCircle, 
  TrendingUp, 
  Heart, 
  Brain, 
  Sparkles,
  Quote,
  User,
  Bot
} from "lucide-react";

interface InsightsWithEvidenceCardProps {
  insights: InsightWithEvidence[];
}

const categoryConfig = {
  need: {
    label: "User Need",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    borderColor: "border-l-blue-500",
    icon: Lightbulb,
  },
  pain_point: {
    label: "Pain Point",
    color: "bg-red-100 text-red-800 border-red-300",
    borderColor: "border-l-red-500",
    icon: AlertCircle,
  },
  behavior: {
    label: "Behavior",
    color: "bg-green-100 text-green-800 border-green-300",
    borderColor: "border-l-green-500",
    icon: TrendingUp,
  },
  preference: {
    label: "Preference",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    borderColor: "border-l-purple-500",
    icon: Heart,
  },
  mental_model: {
    label: "Mental Model",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    borderColor: "border-l-yellow-500",
    icon: Brain,
  },
  unexpected: {
    label: "Unexpected Finding",
    color: "bg-orange-100 text-orange-800 border-orange-300",
    borderColor: "border-l-orange-500",
    icon: Sparkles,
  },
};

const formatTimestamp = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const InsightsWithEvidenceCard: React.FC<InsightsWithEvidenceCardProps> = ({ insights }) => {
  if (!insights || insights.length === 0) {
    return (
      <Card className="bg-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Key Insights with Evidence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 text-sm">
            No insights available yet. Insights will be generated after the interview.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Key Insights with Evidence
          <Badge variant="outline" className="ml-auto">
            {insights.length} {insights.length === 1 ? 'Insight' : 'Insights'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[600px] pr-4">
          <div className="space-y-6">
            {insights.map((insight, index) => {
              const config = categoryConfig[insight.category] || categoryConfig.unexpected;
              const Icon = config.icon;

              return (
                <div
                  key={insight.id}
                  className={`bg-white rounded-lg border-l-4 ${config.borderColor} p-4 shadow-sm`}
                >
                  {/* Insight Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 mt-1">
                      <Icon className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={config.color}>
                          {config.label}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          Insight #{index + 1}
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium leading-relaxed">
                        {insight.content}
                      </p>
                    </div>
                  </div>

                  {/* Supporting Quotes */}
                  <div className="mt-4 pl-8">
                    <div className="flex items-center gap-2 mb-3">
                      <Quote className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-600">
                        Supporting Evidence
                      </span>
                    </div>
                    <div className="space-y-3">
                      {insight.supporting_quotes.map((quote) => (
                        <div
                          key={quote.id}
                          className="bg-slate-50 rounded-md p-3 border border-slate-200"
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 mt-1">
                              {quote.speaker === 'user' ? (
                                <User className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Bot className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-slate-700 italic text-sm leading-relaxed">
                                "{quote.quote}"
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    quote.speaker === 'user' 
                                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                      : 'bg-green-50 text-green-700 border-green-200'
                                  }`}
                                >
                                  {quote.speaker === 'user' ? 'User' : 'AI Interviewer'}
                                </Badge>
                                <span className="text-xs text-slate-500">
                                  @ {formatTimestamp(quote.timestamp)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

