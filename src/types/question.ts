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
  source?: 'local' | 'community'; // 试卷来源
  communityId?: string; // 社区试卷的原始ID
}

// 社区试卷扩展字段
export interface CommunityPaper extends QuestionSet {
  author: string; // 贡献者名称
  version: string; // 版本号
  difficulty?: 'beginner' | 'intermediate' | 'advanced'; // 难度等级
  downloads?: number; // 下载次数
  stars?: number; // GitHub stars
  updatedAt?: string; // 最后更新时间
  filepath?: string; // GitHub 仓库中的文件路径
}

// 社区库元数据
export interface CommunityMetadata {
  papers: CommunityPaperMeta[];
  lastUpdated: string;
}

// 社区试卷元信息（用于列表展示）
export interface CommunityPaperMeta {
  id: string;
  title: string;
  description?: string;
  author: string;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  questionCount: number;
  filepath: string; // 相对路径
  createdAt: string;
  updatedAt?: string;
  version: string;
}

// 用户答题状态
export interface AnswerState {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean | null; // null 表示未答题
}
