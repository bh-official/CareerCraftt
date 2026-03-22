"use client";

import { createContext, useContext, useReducer, useCallback } from "react";

/**
 * AnalysisContext - Global state management for the analysis feature
 *
 * Provides centralized state and actions for:
 * - Job description and resume input (text and file)
 * - Analysis results (scores, gaps, recommendations)
 * - Generated content (cover letter, optimization tips, interview prep, career advice)
 * - UI state (loading states, errors, active tab)
 *
 * Architecture:
 * - Uses useReducer for predictable state transitions
 * - Single source of truth avoids prop drilling across components
 * - Separate generating flags allow parallel content generation
 * - Session ID tracks analysis history for persistence
 *
 * @see {@link https://react.dev/learn/passing-data-deeply-with-context|React Context}
 * @see {@link https://react.dev/reference/react/useReducer|useReducer hook}
 */

const AnalysisContext = createContext(null);

const initialState = {
  // Input state
  jobDescription: "",
  resumeText: "",
  companyName: "",
  jobTitle: "",

  // Analysis results
  analysis: null,
  coverLetter: "",
  optimization: null,
  interviewPrep: null,
  careerDevelopment: null,

  // UI state
  isAnalyzing: false,
  isGenerating: {
    coverLetter: false,
    optimization: false,
    interview: false,
    career: false,
  },
  error: null,
  sessionId: null,
  activeTab: "overview",

  // File state
  jobFile: null,
  resumeFile: null,
};

function analysisReducer(state, action) {
  switch (action.type) {
    case "SET_INPUT":
      return {
        ...state,
        ...action.payload,
      };

    case "SET_FILES":
      return {
        ...state,
        jobFile: action.payload.jobFile,
        resumeFile: action.payload.resumeFile,
      };

    case "SET_ANALYZING":
      return {
        ...state,
        isAnalyzing: action.payload,
      };

    case "SET_GENERATING":
      return {
        ...state,
        isGenerating: {
          ...state.isGenerating,
          [action.payload.type]: action.payload.value,
        },
      };

    case "SET_ANALYSIS":
      return {
        ...state,
        analysis: action.payload.analysis,
        sessionId: action.payload.sessionId,
        isAnalyzing: false,
      };

    case "SET_COVER_LETTER":
      return {
        ...state,
        coverLetter: action.payload,
        isGenerating: { ...state.isGenerating, coverLetter: false },
      };

    case "SET_OPTIMIZATION":
      return {
        ...state,
        optimization: action.payload,
        isGenerating: { ...state.isGenerating, optimization: false },
      };

    case "SET_INTERVIEW_PREP":
      return {
        ...state,
        interviewPrep: action.payload,
        isGenerating: { ...state.isGenerating, interview: false },
      };

    case "SET_CAREER_DEVELOPMENT":
      return {
        ...state,
        careerDevelopment: action.payload,
        isGenerating: { ...state.isGenerating, career: false },
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isAnalyzing: false,
        isGenerating: {
          coverLetter: false,
          optimization: false,
          interview: false,
          career: false,
        },
      };

    case "SET_ACTIVE_TAB":
      return {
        ...state,
        activeTab: action.payload,
      };

    case "RESET":
      return initialState;

    case "LOAD_SESSION":
      return {
        ...state,
        ...action.payload,
        isAnalyzing: false,
        isGenerating: {
          coverLetter: false,
          optimization: false,
          interview: false,
          career: false,
        },
      };

    default:
      return state;
  }
}

export function AnalysisProvider({ children }) {
  const [state, dispatch] = useReducer(analysisReducer, initialState);

  const setInput = useCallback((data) => {
    dispatch({ type: "SET_INPUT", payload: data });
  }, []);

  const setFiles = useCallback((jobFile, resumeFile) => {
    dispatch({ type: "SET_FILES", payload: { jobFile, resumeFile } });
  }, []);

  const runAnalysis = useCallback(async () => {
    dispatch({ type: "SET_ANALYZING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: state.jobDescription,
          resumeText: state.resumeText,
          companyName: state.companyName,
          jobTitle: state.jobTitle,
          sessionId: state.sessionId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Analysis failed");
      }

      dispatch({
        type: "SET_ANALYSIS",
        payload: { analysis: data.analysis, sessionId: data.sessionId },
      });
      return data;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  }, [
    state.jobDescription,
    state.resumeText,
    state.companyName,
    state.jobTitle,
    state.sessionId,
  ]);

  const generateCoverLetter = useCallback(async () => {
    dispatch({
      type: "SET_GENERATING",
      payload: { type: "coverLetter", value: true },
    });

    try {
      const response = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: state.jobDescription,
          resumeText: state.resumeText,
          companyName: state.companyName,
          positionTitle: state.jobTitle,
          sessionId: state.sessionId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Cover letter generation failed");
      }

      dispatch({ type: "SET_COVER_LETTER", payload: data.coverLetter });
      return data;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  }, [
    state.jobDescription,
    state.resumeText,
    state.companyName,
    state.jobTitle,
    state.sessionId,
  ]);

  const generateOptimization = useCallback(async () => {
    dispatch({
      type: "SET_GENERATING",
      payload: { type: "optimization", value: true },
    });

    try {
      const response = await fetch("/api/optimization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: state.jobDescription,
          resumeText: state.resumeText,
          sessionId: state.sessionId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Optimization generation failed");
      }

      dispatch({ type: "SET_OPTIMIZATION", payload: data });
      return data;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  }, [state.jobDescription, state.resumeText, state.sessionId]);

  const generateInterviewPrep = useCallback(async () => {
    dispatch({
      type: "SET_GENERATING",
      payload: { type: "interview", value: true },
    });

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: state.jobDescription,
          resumeText: state.resumeText,
          sessionId: state.sessionId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Interview prep generation failed");
      }

      dispatch({ type: "SET_INTERVIEW_PREP", payload: data });
      return data;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  }, [state.jobDescription, state.resumeText, state.sessionId]);

  const generateCareerDevelopment = useCallback(async () => {
    dispatch({
      type: "SET_GENERATING",
      payload: { type: "career", value: true },
    });

    try {
      const response = await fetch("/api/career", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: state.jobDescription,
          resumeText: state.resumeText,
          sessionId: state.sessionId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Career development generation failed");
      }

      dispatch({ type: "SET_CAREER_DEVELOPMENT", payload: data });
      return data;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  }, [state.jobDescription, state.resumeText, state.sessionId]);

  const setActiveTab = useCallback((tab) => {
    dispatch({ type: "SET_ACTIVE_TAB", payload: tab });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const loadSession = useCallback((sessionData) => {
    dispatch({ type: "LOAD_SESSION", payload: sessionData });
  }, []);

  const value = {
    ...state,
    setInput,
    setFiles,
    runAnalysis,
    generateCoverLetter,
    generateOptimization,
    generateInterviewPrep,
    generateCareerDevelopment,
    setActiveTab,
    reset,
    loadSession,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
}
