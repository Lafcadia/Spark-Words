import { AIConfig, AIGenerationParams, AIResponse, AIProvider } from "@/types/aiConfig";
import { QuestionSet, Question } from "@/types/question";
import { generateId } from "./storage";
import { createSmoothText } from "./smoothText";
import { ResponseAnimation, standardizeAnimationStyle } from "@/types/animation";

/**
 * 流式生成回调函数类型
 */
export type StreamCallback = (data: {
  type: 'progress' | 'text' | 'complete' | 'error';
  text?: string;          // 流式文本增量（用于平滑动画）
  fullText?: string;      // 完整文本（用于更新显示）
  progress?: string;
  error?: string;
  paper?: QuestionSet;
}) => void;

/**
 * 生成试卷的 System Prompt
 */
function generateSystemPrompt(): string {
  return `你是一个专业的英语试卷生成助手。请根据用户提供的信息生成完形填空试卷。

要求：
1. 每个题目包含一个完整的英文句子，其中一个单词用下划线表示需要填写的位置
2. 下划线格式：单词的首字母 + 下划线（下划线数量 = 剩余字母数）
   例如：discovery → d_____ (1个首字母 + 8个下划线)
3. 每个题目需要提供：
   - sentence: 完整句子（用"首字母+下划线"表示待填单词）
   - answer: 正确答案（完整单词）
   - hint: 提示（单词的首字母，小写）
   - translation: 中文翻译（可选）
4. 句子要符合语法，贴合主题，难度适中
5. 答案单词应该是句子中的关键词

请严格按照以下 JSON 格式返回，只输出 JSON，不要包含任何其他文字说明或代码块标记：

{
  "title": "题目集标题（根据单词内容命名）",
  "description": "题目集描述（可选）",
  "questions": [
    {
      "id": "q1",
      "sentence": "The scientist made a remarkable d_____ in the field of quantum physics.",
      "answer": "discovery",
      "hint": "d",
      "translation": "这位科学家在量子物理学领域取得了重大发现。"
    }
  ]
}`;
}

/**
 * 生成用户 Prompt
 */
function generateUserPrompt(params: AIGenerationParams): string {
  const { theme, words, difficulty, questionCount } = params;

  const difficultyMap = {
    beginner: "初级（简单常用词汇）",
    intermediate: "中级（日常词汇）",
    advanced: "高级（较复杂词汇）",
  };

  let prompt = `请生成一份英语完形填空试卷，要求如下：

主题：${theme}
难度：${difficultyMap[difficulty]}
题目数量：${questionCount}`;

  if (words && words.length > 0) {
    prompt += `\n指定单词：${words.join(", ")}（请在试卷中包含这些单词）`;
  }

  return prompt;
}

/**
 * 调用 OpenAI API
 */
async function callOpenAI(
  config: AIConfig,
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  try {
    const apiUrl = config.apiUrl || "https://api.openai.com/v1";
    const endpoint = `${apiUrl}/chat/completions`;

    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120秒超时

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("API 返回数据为空");
    }

    return { success: true, data: JSON.parse(content) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
}

/**
 * 调用 Claude API
 */
async function callClaude(
  config: AIConfig,
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  try {
    const apiUrl = config.apiUrl || "https://api.anthropic.com/v1";
    const endpoint = `${apiUrl}/messages`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120秒超时

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text;

    if (!content) {
      throw new Error("API 返回数据为空");
    }

    // Claude 返回的可能包含 markdown 代码块，需要提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // 如果没有 JSON 格式，尝试直接返回内容（用于测试等场景）
      return { success: true, data: { text: content } };
    }

    return { success: true, data: JSON.parse(jsonMatch[0]) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
}

/**
 * 调用 Gemini API
 */
async function callGemini(
  config: AIConfig,
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  try {
    const apiUrl = config.apiUrl || "https://generativelanguage.googleapis.com/v1beta";
    const endpoint = `${apiUrl}/models/${config.model}:generateContent?key=${config.apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120秒超时

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("API 返回数据为空");
    }

    // Gemini 返回的可能包含 markdown 代码块，需要提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // 如果没有 JSON 格式，尝试直接返回内容（用于测试等场景）
      return { success: true, data: { text: content } };
    }

    return { success: true, data: JSON.parse(jsonMatch[0]) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
}

/**
 * 调用自定义 API（兼容 OpenAI 格式）
 */
async function callCustomAPI(
  config: AIConfig,
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  // 自定义 API 使用与 OpenAI 相同的调用方式
  return callOpenAI(config, systemPrompt, userPrompt);
}

/**
 * 统一的 AI 调用接口
 */
async function callAI(
  config: AIConfig,
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  switch (config.provider) {
    case "openai":
      return callOpenAI(config, systemPrompt, userPrompt);
    case "claude":
      return callClaude(config, systemPrompt, userPrompt);
    case "gemini":
      return callGemini(config, systemPrompt, userPrompt);
    case "custom":
      return callCustomAPI(config, systemPrompt, userPrompt);
    default:
      return { success: false, error: "不支持的 AI 服务商" };
  }
}

/**
 * 验证生成的试卷数据
 */
function validateGeneratedPaper(data: any): { valid: boolean; error?: string } {
  if (!data.title || typeof data.title !== "string") {
    return { valid: false, error: "缺少试卷标题" };
  }

  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    return { valid: false, error: "题目列表为空或格式错误" };
  }

  for (let i = 0; i < data.questions.length; i++) {
    const q = data.questions[i];
    if (!q.sentence || !q.answer || !q.hint) {
      return { valid: false, error: `第 ${i + 1} 题格式错误` };
    }
    // 验证句子中包含下划线格式的占位符（如 d_____, r___, etc.）
    const underscorePattern = /[a-zA-Z]_+/;
    if (!underscorePattern.test(q.sentence)) {
      return { valid: false, error: `第 ${i + 1} 题缺少下划线占位符` };
    }
  }

  return { valid: true };
}

/**
 * 使用 AI 生成试卷
 */
export async function generatePaperWithAI(
  config: AIConfig,
  params: AIGenerationParams
): Promise<{ success: boolean; paper?: QuestionSet; error?: string }> {
  try {
    // 生成 Prompt
    const systemPrompt = generateSystemPrompt();
    const userPrompt = generateUserPrompt(params);

    // 调用 AI API
    const response = await callAI(config, systemPrompt, userPrompt);

    if (!response.success || !response.data) {
      return { success: false, error: response.error || "AI 调用失败" };
    }

    // 验证数据
    const validation = validateGeneratedPaper(response.data);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // 构造试卷对象
    const paper: QuestionSet = {
      id: generateId(),
      title: response.data.title,
      description: response.data.description || "",
      tags: response.data.tags || [],
      questions: response.data.questions.map((q: any, index: number) => ({
        id: q.id || `q${index + 1}`,
        sentence: q.sentence,
        answer: q.answer,
        hint: q.hint.toLowerCase(),
        translation: q.translation,
      })),
      createdAt: new Date().toISOString(),
      source: "local",
    };

    return { success: true, paper };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "生成失败",
    };
  }
}

/**
 * 测试 AI 配置是否有效
 */
export async function testAIConnection(config: AIConfig): Promise<{ success: boolean; error?: string }> {
  try {
    const testPrompt = "请简单回复：OK";
    const systemPrompt = "你是一个测试助手，请简短回复用户的消息。对于测试请求，直接回复即可,不需要 JSON 格式。";

    const response = await callAI(
      config,
      systemPrompt,
      testPrompt
    );

    if (!response.success) {
      return { success: false, error: response.error || "连接失败" };
    }

    // 测试时不需要验证 JSON 格式，只需要确认能成功调用
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "连接失败",
    };
  }
}

/**
 * 流式生成试卷 - OpenAI
 * 集成 LobeHub 风格的平滑文本动画
 */
async function streamOpenAI(
  config: AIConfig,
  systemPrompt: string,
  userPrompt: string,
  onProgress: StreamCallback,
  responseAnimation?: ResponseAnimation
): Promise<void> {
  const { text: textSmoothing, speed: smoothingSpeed } = standardizeAnimationStyle(
    responseAnimation || { text: 'smooth', speed: 15 }
  );

  const useSmoothing = textSmoothing === 'smooth';
  let output = '';

  // 创建平滑文本控制器
  const textController = createSmoothText({
    onTextUpdate: (delta, fullText) => {
      output = fullText;
      onProgress({ type: 'text', text: delta, fullText });
    },
    startSpeed: smoothingSpeed,
  });

  try {
    onProgress({ type: 'progress', progress: '正在连接 OpenAI...' });

    const apiUrl = config.apiUrl || "https://api.openai.com/v1";
    const endpoint = `${apiUrl}/chat/completions`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API 请求失败: ${response.status}`);
    }

    onProgress({ type: 'progress', progress: '开始生成题目...' });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';

    // 读取SSE流
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              fullContent += content;

              // 平滑模式：推送到队列
              if (useSmoothing) {
                textController.pushToQueue(content);
                if (!textController.isAnimationActive) {
                  textController.startAnimation();
                }
              } else {
                // 直接模式：立即输出
                output += content;
                onProgress({ type: 'text', text: content, fullText: output });
              }
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    // 等待队列清空
    if (textController.isTokenRemain()) {
      await textController.startAnimation();
    }

    // 解析完整JSON
    const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('无法解析生成的内容');
    }

    const data = JSON.parse(jsonMatch[0]);
    const validation = validateGeneratedPaper(data);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 构建试卷
    const questions = data.questions.map((q: any, index: number) => ({
      id: q.id || `q${index + 1}`,
      sentence: q.sentence,
      answer: q.answer,
      hint: q.hint.toLowerCase(),
      translation: q.translation,
    }));

    const paper: QuestionSet = {
      id: generateId(),
      title: data.title,
      description: data.description || "",
      tags: data.tags || [],
      questions,
      createdAt: new Date().toISOString(),
      source: "local",
    };

    onProgress({ type: 'complete', paper });
  } catch (error) {
    textController.stopAnimation();
    onProgress({
      type: 'error',
      error: error instanceof Error ? error.message : '生成失败'
    });
  }
}

/**
 * 流式生成试卷 - Claude
 * 集成 LobeHub 风格的平滑文本动画
 */
async function streamClaude(
  config: AIConfig,
  systemPrompt: string,
  userPrompt: string,
  onProgress: StreamCallback,
  responseAnimation?: ResponseAnimation
): Promise<void> {
  const { text: textSmoothing, speed: smoothingSpeed } = standardizeAnimationStyle(
    responseAnimation || { text: 'smooth', speed: 15 }
  );

  const useSmoothing = textSmoothing === 'smooth';
  let output = '';

  const textController = createSmoothText({
    onTextUpdate: (delta, fullText) => {
      output = fullText;
      onProgress({ type: 'text', text: delta, fullText });
    },
    startSpeed: smoothingSpeed,
  });

  try {
    onProgress({ type: 'progress', progress: '正在连接 Claude...' });

    const apiUrl = config.apiUrl || "https://api.anthropic.com/v1";
    const endpoint = `${apiUrl}/messages`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API 请求失败: ${response.status}`);
    }

    onProgress({ type: 'progress', progress: '开始生成题目...' });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta') {
              const content = parsed.delta?.text;
              if (content) {
                fullContent += content;

                if (useSmoothing) {
                  textController.pushToQueue(content);
                  if (!textController.isAnimationActive) {
                    textController.startAnimation();
                  }
                } else {
                  output += content;
                  onProgress({ type: 'text', text: content, fullText: output });
                }
              }
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    // 等待队列清空
    if (textController.isTokenRemain()) {
      await textController.startAnimation();
    }

    // 解析完整JSON
    const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('无法解析生成的内容');
    }

    const data = JSON.parse(jsonMatch[0]);
    const validation = validateGeneratedPaper(data);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const questions = data.questions.map((q: any, index: number) => ({
      id: q.id || `q${index + 1}`,
      sentence: q.sentence,
      answer: q.answer,
      hint: q.hint.toLowerCase(),
      translation: q.translation,
    }));

    const paper: QuestionSet = {
      id: generateId(),
      title: data.title,
      description: data.description || "",
      tags: data.tags || [],
      questions,
      createdAt: new Date().toISOString(),
      source: "local",
    };

    onProgress({ type: 'complete', paper });
  } catch (error) {
    textController.stopAnimation();
    onProgress({
      type: 'error',
      error: error instanceof Error ? error.message : '生成失败'
    });
  }
}

/**
 * 流式生成试卷 - Gemini
 * 集成 LobeHub 风格的平滑文本动画
 */
async function streamGemini(
  config: AIConfig,
  systemPrompt: string,
  userPrompt: string,
  onProgress: StreamCallback,
  responseAnimation?: ResponseAnimation
): Promise<void> {
  const { text: textSmoothing, speed: smoothingSpeed } = standardizeAnimationStyle(
    responseAnimation || { text: 'smooth', speed: 15 }
  );

  const useSmoothing = textSmoothing === 'smooth';
  let output = '';

  const textController = createSmoothText({
    onTextUpdate: (delta, fullText) => {
      output = fullText;
      onProgress({ type: 'text', text: delta, fullText });
    },
    startSpeed: smoothingSpeed,
  });

  try {
    onProgress({ type: 'progress', progress: '正在连接 Gemini...' });

    const apiUrl = config.apiUrl || "https://generativelanguage.googleapis.com/v1beta";
    const endpoint = `${apiUrl}/models/${config.model}:streamGenerateContent?key=${config.apiKey}&alt=sse`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API 请求失败: ${response.status}`);
    }

    onProgress({ type: 'progress', progress: '开始生成题目...' });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          try {
            const parsed = JSON.parse(data);
            const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (content) {
              fullContent += content;

              if (useSmoothing) {
                textController.pushToQueue(content);
                if (!textController.isAnimationActive) {
                  textController.startAnimation();
                }
              } else {
                output += content;
                onProgress({ type: 'text', text: content, fullText: output });
              }
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    // 等待队列清空
    if (textController.isTokenRemain()) {
      await textController.startAnimation();
    }

    // 解析完整JSON
    const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('无法解析生成的内容');
    }

    const data = JSON.parse(jsonMatch[0]);
    const validation = validateGeneratedPaper(data);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const questions = data.questions.map((q: any, index: number) => ({
      id: q.id || `q${index + 1}`,
      sentence: q.sentence,
      answer: q.answer,
      hint: q.hint.toLowerCase(),
      translation: q.translation,
    }));

    const paper: QuestionSet = {
      id: generateId(),
      title: data.title,
      description: data.description || "",
      tags: data.tags || [],
      questions,
      createdAt: new Date().toISOString(),
      source: "local",
    };

    onProgress({ type: 'complete', paper });
  } catch (error) {
    textController.stopAnimation();
    onProgress({
      type: 'error',
      error: error instanceof Error ? error.message : '生成失败'
    });
  }
}

/**
 * 统一的流式生成接口
 */
export async function generatePaperWithAIStream(
  config: AIConfig,
  params: AIGenerationParams,
  onProgress: StreamCallback,
  responseAnimation?: ResponseAnimation
): Promise<void> {
  const systemPrompt = generateSystemPrompt();
  const userPrompt = generateUserPrompt(params);

  switch (config.provider) {
    case "openai":
      return streamOpenAI(config, systemPrompt, userPrompt, onProgress, responseAnimation);
    case "claude":
      return streamClaude(config, systemPrompt, userPrompt, onProgress, responseAnimation);
    case "gemini":
      return streamGemini(config, systemPrompt, userPrompt, onProgress, responseAnimation);
    case "custom":
      return streamOpenAI(config, systemPrompt, userPrompt, onProgress, responseAnimation);
    default:
      onProgress({ type: 'error', error: '不支持的 AI 服务商' });
  }
}
