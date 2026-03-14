import type { GameState, GameAction } from "@/types/dojo";
import { checkAnswer } from "./scoring";

export const initialGameState: GameState = {
  status: "idle",
  tool: "tmux",
  level: 1,
  questions: [],
  currentIndex: 0,
  answers: [],
  showHint: false,
  showCheatSheet: false,
  startTime: 0,
  questionStartTime: 0,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START": {
      const now = Date.now();
      return {
        ...state,
        status: "playing",
        tool: action.tool,
        level: action.level,
        questions: action.questions,
        currentIndex: 0,
        answers: [],
        showHint: false,
        showCheatSheet: false,
        startTime: now,
        questionStartTime: now,
      };
    }

    case "SUBMIT_ANSWER": {
      const question = state.questions[state.currentIndex];
      if (!question) return state;

      const { isCorrect, isOptimal } = checkAnswer(question, action.answer);
      const timeTaken = Date.now() - state.questionStartTime;

      return {
        ...state,
        status: "feedback",
        showHint: false,
        answers: [
          ...state.answers,
          {
            questionId: question.id,
            userAnswer: action.answer,
            isCorrect,
            isOptimal,
            timeTaken,
          },
        ],
      };
    }

    case "NEXT_QUESTION": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) {
        return { ...state, status: "finished" };
      }
      return {
        ...state,
        status: "playing",
        currentIndex: nextIndex,
        showHint: false,
        questionStartTime: Date.now(),
      };
    }

    case "TOGGLE_HINT":
      return { ...state, showHint: !state.showHint };

    case "TOGGLE_CHEATSHEET":
      return { ...state, showCheatSheet: !state.showCheatSheet };

    case "FINISH":
      return { ...state, status: "finished" };

    default:
      return state;
  }
}
