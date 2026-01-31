// 题目接口定义
export interface Question {
  id: string;
  sentence: string; // 完整句子，其中待填单词用 {answer} 占位符表示
  answer: string; // 正确答案（完整单词）
  hint: string; // 提示（首字母）
  translation?: string; // 可选的中文翻译
}

export interface QuestionSet {
  id: string; // 试卷唯一ID
  title: string;
  description?: string;
  tags?: string[]; // 标签/分类
  questions: Question[];
  createdAt?: string; // 创建时间
}

// 用户答题状态
export interface AnswerState {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean | null; // null 表示未答题
}
