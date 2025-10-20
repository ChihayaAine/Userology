"use client";

import React from "react";
import { KeyInsight } from "@/types/response";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Lightbulb, 
  AlertCircle, 
  TrendingUp, 
  Heart, 
  Brain, 
  Sparkles 
} from "lucide-react";

interface KeyInsightsCardProps {
  insights: KeyInsight[];
}

const categoryConfig = {
  need: {
    label: "User Need",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: Lightbulb,
  },
  pain_point: {
    label: "Pain Point",
    color: "bg-red-100 text-red-800 border-red-300",
    icon: AlertCircle,
  },
  behavior: {
    label: "Behavior",
    color: "bg-green-100 text-green-800 border-green-300",
    icon: TrendingUp,
  },
  preference: {
    label: "Preference",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    icon: Heart,
  },
  mental_model: {
    label: "Mental Model",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: Brain,
  },
  unexpected: {
    label: "Unexpected Finding",
    color: "bg-orange-100 text-orange-800 border-orange-300",
    icon: Sparkles,
  },
};

const KeyInsightsCard: React.FC<KeyInsightsCardProps> = ({ insights }) => {
  if (!insights || insights.length === 0) {
    return (
      <div className="bg-slate-200 rounded-2xl min-h-[120px] p-4 px-5 my-3">
        <p className="font-semibold my-2">Key Insights</p>
        <div className="my-2 mt-4">
          <div className="flex flex-col gap-3 text-sm p-4 rounded-2xl bg-slate-50">
            <p className="text-gray-500 text-center py-4">
              No insights available yet. Insights will be generated after the interview.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-200 rounded-2xl min-h-[120px] p-4 px-5 my-3">
      <p className="font-semibold my-2">Key Insights</p>
      <div className="my-2 mt-4 space-y-3">
        {insights.map((insight, index) => {
          const category = insight.category || "need";
          const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.need;
          const Icon = config.icon;

          return (
            <Card key={insight.id} className="border-l-4 border-l-indigo-500 bg-slate-50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <Icon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <CardTitle className="text-sm font-semibold text-gray-700">
                      Insight {index + 1}
                    </CardTitle>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${config.color} text-xs`}
                  >
                    {config.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {insight.content}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default KeyInsightsCard;

