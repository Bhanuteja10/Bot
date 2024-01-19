import React, { createContext, useContext, useState } from 'react';

const QuestionContext = createContext();

export function useQuestion() {
  return useContext(QuestionContext);
}

export function QuestionProvider({ children }) {
  const [question, setQuestion] = useState('');

  return (
    <QuestionContext.Provider value={{question, setQuestion}}>
      {children}
    </QuestionContext.Provider>
  );
}