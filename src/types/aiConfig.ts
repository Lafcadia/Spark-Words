// AI服务提供商类型
export type AIProvider = 'openai' | 'claude' | 'gemini' | 'custom';

// AI配置接口
export interface AIConfig {
  provider: AIProvider;
  apiKey: string; // 加密存储
  apiUrl?: string; // 自定义API地址（可选）
  model: string; // 模型名称
  enabled: boolean; // 是否启用
}

// 多服务商配置存储
export interface MultiAIConfig {
  [key: string]: AIConfig; // key 为 provider
}

// AI服务商预设配置
export interface AIProviderPreset {
  id: AIProvider;
  name: string;
  defaultModel: string;
  defaultApiUrl: string;
  models: { value: string; label: string }[];
  requiresApiKey: boolean;
}

// AI生成试卷参数
export interface AIGenerationParams {
  theme: string; // 主题描述
  words?: string[]; // 可选的单词列表
  difficulty: 'beginner' | 'intermediate' | 'advanced'; // 难度
  questionCount: number; // 题目数量
}

// AI API响应
export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// 预设的AI服务商配置
export const AI_PROVIDER_PRESETS: AIProviderPreset[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    defaultModel: 'gpt-5.2-instant',
    defaultApiUrl: 'https://api.openai.com/v1',
    models: [
      { value: 'gpt-5.2-instant', label: 'GPT-5.2 Instant' },
      { value: 'gpt-5.2-thinking', label: 'GPT-5.2 Thinking' },
      { value: 'gpt-5.2-pro', label: 'GPT-5.2 Pro' },
    ],
    requiresApiKey: true,
  },
  {
    id: 'claude',
    name: 'Claude',
    defaultModel: 'claude-sonnet-4.5',
    defaultApiUrl: 'https://api.anthropic.com/v1',
    models: [
      { value: 'claude-opus-4.5', label: 'Claude Opus 4.5' },
      { value: 'claude-sonnet-4.5', label: 'Claude Sonnet 4.5' },
      { value: 'claude-haiku-4.5', label: 'Claude Haiku 4.5' },
    ],
    requiresApiKey: true,
  },
  {
    id: 'gemini',
    name: 'Gemini',
    defaultModel: 'gemini-3-pro',
    defaultApiUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: [
      { value: 'gemini-3-pro', label: 'Gemini 3 Pro' },
      { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview' },
      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    ],
    requiresApiKey: true,
  },
  {
    id: 'custom',
    name: '自定义服务',
    defaultModel: '',
    defaultApiUrl: '',
    models: [],
    requiresApiKey: true,
  },
];
