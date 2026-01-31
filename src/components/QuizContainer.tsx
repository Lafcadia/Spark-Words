"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Question, AnswerState } from "@/types/question";
import QuestionCard from "./QuestionCard";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";

interface QuizContainerProps {
  questions: Question[];
  title: string;
  description?: string;
}

export default function QuizContainer({
  questions,
  title,
  description,
}: QuizContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>(
    questions.map((q) => ({
      questionId: q.id,
      userAnswer: "",
      isCorrect: null,
    }))
  );

  // 当 questions 变化时，重置 answers 和 currentIndex
  useEffect(() => {
    setAnswers(
      questions.map((q) => ({
        questionId: q.id,
        userAnswer: "",
        isCorrect: null,
      }))
    );
    setCurrentIndex(0);
  }, [questions]);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];

  // 如果没有当前题目或答案，返回空
  if (!currentQuestion || !currentAnswer) {
    return null;
  }

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = {
      ...newAnswers[currentIndex],
      userAnswer: value,
      isCorrect: null,
    };
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    const userAns = currentAnswer.userAnswer.toLowerCase();
    const correctAns = currentQuestion.answer.toLowerCase();
    
    // 允许用户填写完整单词或去掉首字母的单词
    const isCorrect =
      userAns === correctAns || 
      userAns === correctAns.slice(1);
    
    const newAnswers = [...answers];
    newAnswers[currentIndex] = {
      ...newAnswers[currentIndex],
      isCorrect,
    };
    setAnswers(newAnswers);

    // 如果答对了，1.2秒后自动跳转到下一题
    if (isCorrect && currentIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 1200);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const correctCount = answers.filter((a) => a.isCorrect === true).length;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Section - 顶部极简进度 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-20"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">
              {currentIndex + 1} / {questions.length}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-success" />
              {correctCount} / {questions.length}
            </span>
          </div>
          {/* 可点击的进度条 */}
          <div 
            className="w-full h-2 bg-muted rounded-full overflow-hidden cursor-pointer relative group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = x / rect.width;
              const newIndex = Math.floor(percentage * questions.length);
              setCurrentIndex(Math.min(Math.max(0, newIndex), questions.length - 1));
            }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-accent to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
            {/* 悬停提示 */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="absolute inset-0 bg-white/10" />
            </div>
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <QuestionCard
            key={currentQuestion.id}
            sentence={currentQuestion.sentence}
            answer={currentQuestion.answer}
            userAnswer={currentAnswer.userAnswer}
            isCorrect={currentAnswer.isCorrect}
            onAnswerChange={handleAnswerChange}
            onSubmit={handleSubmit}
            translation={currentQuestion.translation}
          />
        </AnimatePresence>

        {/* Navigation - 更精致 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-between items-center mt-12"
        >
          <motion.button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            whileHover={{ scale: currentIndex !== 0 ? 1.05 : 1 }}
            whileTap={{ scale: currentIndex !== 0 ? 0.95 : 1 }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all text-sm",
              currentIndex === 0
                ? "opacity-20 cursor-not-allowed text-muted-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </motion.button>

          <div className="flex-1" />

          <motion.button
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            whileHover={{ scale: currentIndex !== questions.length - 1 ? 1.05 : 1 }}
            whileTap={{ scale: currentIndex !== questions.length - 1 ? 0.95 : 1 }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all text-sm",
              currentIndex === questions.length - 1
                ? "opacity-20 cursor-not-allowed text-muted-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* Completion Message - 精简 */}
        <AnimatePresence>
          {correctCount === questions.length && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="mt-20 text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6, repeat: 2 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-3xl font-bold text-success mb-2">
                Perfect!
              </h2>
              <p className="text-sm text-muted-foreground">
                All questions completed with 100% accuracy
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
