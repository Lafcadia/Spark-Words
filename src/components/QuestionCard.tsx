"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface QuestionCardProps {
  sentence: string;
  answer: string;
  userAnswer: string;
  isCorrect: boolean | null;
  onAnswerChange: (value: string) => void;
  onSubmit: () => void;
  translation?: string;
}

export default function QuestionCard({
  sentence,
  answer,
  userAnswer,
  isCorrect,
  onAnswerChange,
  onSubmit,
  translation,
}: QuestionCardProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  
  // 解析句子，找到空格位置
  // 句子格式: "The scientist made a remarkable d_____ in..."
  // 需要将首字母和下划线分离处理
  const regex = /([a-z])(_+)/gi;
  let hintLetter = '';
  let inputWidth = 2.5;
  
  // 查找首字母提示
  const match = sentence.match(regex);
  if (match && match[0]) {
    hintLetter = match[0][0]; // 获取首字母
    inputWidth = Math.max(answer.length * 0.65, 2.5);
  }
  
  const parts = sentence.split(regex);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-3xl mx-auto"
    >
      {/* 纯粹的题目展示，无卡片包裹 */}
      <div className="relative">
        {/* 句子展示区域 */}
        <div className="font-serif text-xl md:text-2xl leading-relaxed text-foreground mb-6">
          {parts.map((part, index) => {
            // 检查是否是首字母
            if (part && part.length === 1 && /[a-z]/i.test(part) && index > 0 && parts[index + 1] && parts[index + 1].startsWith('_')) {
              return (
                <motion.span
                  key={index}
                  className="inline-flex items-baseline relative"
                  animate={
                    isCorrect === false
                      ? {
                          x: [-6, 6, -6, 6, 0],
                        }
                      : {}
                  }
                  transition={{ duration: 0.5 }}
                >
                  {/* 首字母提示 */}
                  <span className="font-sans font-medium text-xl md:text-2xl mr-0.5">{part}</span>
                  {/* 输入框 */}
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => onAnswerChange(e.target.value.toLowerCase())}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className={cn(
                      "inline-block border-b-2 bg-transparent outline-none transition-all duration-300",
                      "font-sans font-medium text-xl md:text-2xl px-1",
                      isCorrect === null && "border-muted-foreground/30 focus:border-accent",
                      isCorrect === true && "border-success text-success",
                      isCorrect === false && "border-error text-error"
                    )}
                    style={{
                      width: `${inputWidth}em`,
                    }}
                    disabled={isCorrect === true}
                  />
                </motion.span>
              );
            }
            // 跳过下划线部分（已经被input替代）
            if (part && part.startsWith('_')) {
              return null;
            }
            return <span key={index}>{part}</span>;
          })}
        </div>

        {/* 翻译 - 点击切换显示/模糊 */}
        {translation && (
          <div className="mb-8">
            <motion.button
              onClick={() => setShowTranslation(!showTranslation)}
              whileHover={{ opacity: 1 }}
              className="flex items-center gap-2 text-muted-foreground text-sm italic opacity-60 transition-opacity"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className={cn(!showTranslation && "blur-sm select-none")}>
                {translation}
              </span>
            </motion.button>
          </div>
        )}

        {/* 提交按钮 - 简化 */}
        <div className="flex items-center gap-3">
          {isCorrect !== true && (
            <>
              <motion.button
                onClick={onSubmit}
                disabled={!userAnswer}
                whileHover={{ scale: userAnswer ? 1.02 : 1 }}
                whileTap={{ scale: userAnswer ? 0.98 : 1 }}
                className={cn(
                  "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                  "disabled:opacity-30 disabled:cursor-not-allowed",
                  "bg-foreground text-background hover:opacity-90"
                )}
              >
                Check
              </motion.button>
              
              {/* 查看答案按钮 */}
              <motion.button
                onClick={() => setShowAnswer(!showAnswer)}
                whileHover={{ opacity: 1 }}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  showAnswer
                    ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border"
                )}
              >
                {showAnswer ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span className="font-mono">{answer}</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Show Answer
                  </>
                )}
              </motion.button>
            </>
          )}

          {/* 反馈信息 - 极简 */}
          {isCorrect === false && (
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-error text-sm"
            >
              Try again
            </motion.span>
          )}

          {isCorrect === true && (
            <motion.span
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="text-success text-sm flex items-center gap-1.5"
            >
              <span>✓</span> Correct
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
