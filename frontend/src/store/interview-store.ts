import { create } from 'zustand';
import { InterviewBase, OutlineSkeleton } from '@/types/interview';
import { LanguageCode } from '@/lib/languages';

interface InterviewStore {
  // Interview data
  interviewData: InterviewBase;
  setInterviewData: (data: InterviewBase) => void;

  // Interview ID (after creation)
  interviewId: string | null;
  setInterviewId: (id: string | null) => void;

  // Language settings
  selectedLanguage: LanguageCode | '';
  setSelectedLanguage: (lang: LanguageCode | '') => void;
  outlineDebugLanguage: LanguageCode | '';
  setOutlineDebugLanguage: (lang: LanguageCode | '') => void;

  // File upload
  isUploaded: boolean;
  setIsUploaded: (uploaded: boolean) => void;
  fileName: string;
  setFileName: (name: string) => void;

  // Questions
  draftQuestions: any[];
  setDraftQuestions: (questions: any[]) => void;
  localizedQuestions: any[] | null;
  setLocalizedQuestions: (questions: any[] | null) => void;

  // Outline Skeleton (两步生成流程)
  outlineSkeleton: OutlineSkeleton | null;
  setOutlineSkeleton: (skeleton: OutlineSkeleton | null) => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;

  // Completed steps
  completedSteps: string[];
  setCompletedSteps: (steps: string[]) => void;
  addCompletedStep: (step: string) => void;

  // Reset
  resetStore: () => void;
}

const createEmptyInterviewData = (): InterviewBase => ({
  user_id: "",
  organization_id: "",
  name: "",
  interviewer_id: BigInt(0),
  objective: "",
  question_count: 0,
  time_duration: "",
  is_anonymous: false,
  questions: [],
  description: "",
  response_count: BigInt(0),
});

export const useInterviewStore = create<InterviewStore>((set) => ({
  interviewData: createEmptyInterviewData(),
  setInterviewData: (data) => set({ interviewData: data }),
  
  interviewId: null,
  setInterviewId: (id) => set({ interviewId: id }),
  
  selectedLanguage: '',
  setSelectedLanguage: (lang) => set({ selectedLanguage: lang }),
  outlineDebugLanguage: '',
  setOutlineDebugLanguage: (lang) => set({ outlineDebugLanguage: lang }),
  
  isUploaded: false,
  setIsUploaded: (uploaded) => set({ isUploaded: uploaded }),
  fileName: '',
  setFileName: (name) => set({ fileName: name }),
  
  draftQuestions: [],
  setDraftQuestions: (questions) => set({ draftQuestions: questions }),
  localizedQuestions: null,
  setLocalizedQuestions: (questions) => set({ localizedQuestions: questions }),

  outlineSkeleton: null,
  setOutlineSkeleton: (skeleton) => set({ outlineSkeleton: skeleton }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  loadingMessage: 'Loading...',
  setLoadingMessage: (message) => set({ loadingMessage: message }),

  completedSteps: [],
  setCompletedSteps: (steps) => set({ completedSteps: steps }),
  addCompletedStep: (step) => set((state) => ({
    completedSteps: state.completedSteps.includes(step)
      ? state.completedSteps
      : [...state.completedSteps, step]
  })),

  resetStore: () => set({
    interviewData: createEmptyInterviewData(),
    interviewId: null,
    selectedLanguage: '',
    outlineDebugLanguage: '',
    isUploaded: false,
    fileName: '',
    draftQuestions: [],
    localizedQuestions: null,
    outlineSkeleton: null,
    isLoading: false,
    loadingMessage: 'Loading...',
    completedSteps: [],
  }),
}));

