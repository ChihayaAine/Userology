"use client";

import React from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { type ThemeProviderProps } from "next-themes/dist/types";
import compose from "@/lib/compose";
import { InterviewerProvider } from "@/contexts/interviewers.context";
import { InterviewProvider } from "@/contexts/interviews.context";
import { ResponseProvider } from "@/contexts/responses.context";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ClientProvider } from "@/contexts/clients.context";

const queryClient = new QueryClient();

const providers = ({ children }: ThemeProviderProps) => {
  const Provider = compose([
    InterviewProvider,
    InterviewerProvider,
    ResponseProvider,
    ClientProvider,
  ]);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Provider>{children}</Provider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default providers;
