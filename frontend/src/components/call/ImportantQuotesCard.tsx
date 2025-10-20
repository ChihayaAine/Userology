"use client";

import React from "react";
import { ImportantQuote } from "@/types/response";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, User, Bot, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ImportantQuotesCardProps {
  quotes: ImportantQuote[];
}

const formatTimestamp = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const ImportantQuotesCard: React.FC<ImportantQuotesCardProps> = ({ quotes }) => {
  if (!quotes || quotes.length === 0) {
    return (
      <div className="bg-slate-200 rounded-2xl min-h-[120px] p-4 px-5 my-3">
        <p className="font-semibold my-2">Important Quotes</p>
        <div className="my-2 mt-4">
          <div className="flex flex-col gap-3 text-sm p-4 rounded-2xl bg-slate-50">
            <p className="text-gray-500 text-center py-4">
              No quotes available yet. Quotes will be extracted after the interview.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-200 rounded-2xl min-h-[120px] max-h-[600px] p-4 px-5 my-3">
      <div className="flex items-center gap-2 my-2">
        <Quote className="w-5 h-5 text-indigo-600" />
        <p className="font-semibold">Important Quotes</p>
      </div>
      <ScrollArea className="h-[500px] mt-4">
        <div className="space-y-3 pr-4">
          {quotes.map((quote, index) => (
            <Card 
              key={quote.id} 
              className={`bg-slate-50 border-l-4 ${
                quote.speaker === 'user' 
                  ? 'border-l-blue-500' 
                  : 'border-l-gray-400'
              }`}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    quote.speaker === 'user' 
                      ? 'bg-blue-100' 
                      : 'bg-gray-100'
                  }`}>
                    {quote.speaker === 'user' ? (
                      <User className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Bot className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-600 uppercase">
                        {quote.speaker === 'user' ? 'Participant' : 'AI Interviewer'}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(quote.timestamp)}</span>
                      </div>
                    </div>
                    <blockquote className="text-sm text-gray-800 italic leading-relaxed mb-2 pl-3 border-l-2 border-gray-300">
                      "{quote.quote}"
                    </blockquote>
                    {quote.context && (
                      <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                        <span className="font-semibold">Context:</span> {quote.context}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ImportantQuotesCard;

