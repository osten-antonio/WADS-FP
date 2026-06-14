"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface CalculatorState {
  question: string;
  answer: string;
  category: string;
  topicSlug: string;
}

interface CalculatorContextValue {
  state: CalculatorState;
  setSolved: (question: string, answer: string, category: string, topicSlug: string) => void;
  clear: () => void;
}

const CalculatorContext = createContext<CalculatorContextValue | null>(null);

const INITIAL_STATE: CalculatorState = {
  question: "",
  answer: "",
  category: "General",
  topicSlug: "general",
};

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CalculatorState>(INITIAL_STATE);

  const setSolved = useCallback(
    (question: string, answer: string, category: string, topicSlug: string) => {
      setState({ question, answer, category, topicSlug });
    },
    [],
  );

  const clear = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return (
    <CalculatorContext.Provider value={{ state, setSolved, clear }}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const ctx = useContext(CalculatorContext);
  if (!ctx) {
    throw new Error("useCalculator must be used within a CalculatorProvider");
  }
  return ctx;
}
