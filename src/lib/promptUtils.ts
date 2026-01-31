/**
 * 根据单词列表生成 AI Prompt
 */
export function generatePromptFromWords(words: string[]): string {
  const wordList = words.join(", ");
  
  return `你是一名专业的英语首字母填空试题命题专家，请根据以下单词列表，生成英语首字母填空练习题目（JSON格式）：

**单词列表**：${wordList}

**输出格式**:
{
  "title": "题目集标题（根据单词内容命名）",
  "description": "题目集描述（可选）",
  "questions": [
    {
      "id": "q1",
      "sentence": "完整句子，用下划线表示需要填写的单词位置，例如：The scientist made a remarkable d_____ in the field of quantum physics.",
      "answer": "单词列表中的某个单词（完整形式）",
      "hint": "单词的首字母（小写）",
      "translation": "句子的中文翻译（可选）"
    }
  ]
}

**要求**:
1. 为你认为重要的单词生成30道题目，如spaghetti这样的词汇，很明显就是不常用不常考的专有词汇，这样的词汇不需要生成任何练习题
2. 句子要符合高考难度和语境，自然流畅
3. 每道题的 id 按 q1, q2, q3... 递增
4. hint 必须是 answer 的首字母（小写）
5. answer 必须从提供的单词列表中选择，单词可以有变形。比如说单词表中有happy，你生成的答案可以是happily, unhappy这样的变形
6. 确保 JSON 格式正确，可直接解析
7. 提供准确的中文翻译

请按照以上格式生成题目`;
}

/**
 * 验证题目 JSON 数据格式
 */
export function validateQuestionSet(data: any): {
  valid: boolean;
  error?: string;
} {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "数据必须是对象格式" };
  }

  if (!data.title || typeof data.title !== "string") {
    return { valid: false, error: "缺少标题（title）字段" };
  }

  if (!data.questions || !Array.isArray(data.questions)) {
    return { valid: false, error: "缺少或格式错误的 questions 数组" };
  }

  if (data.questions.length === 0) {
    return { valid: false, error: "题目列表不能为空" };
  }

  for (let i = 0; i < data.questions.length; i++) {
    const q = data.questions[i];
    
    if (!q.id || typeof q.id !== "string") {
      return { valid: false, error: `第 ${i + 1} 题缺少 id 字段` };
    }

    if (!q.sentence || typeof q.sentence !== "string") {
      return { valid: false, error: `第 ${i + 1} 题缺少 sentence 字段` };
    }

    if (!q.answer || typeof q.answer !== "string") {
      return { valid: false, error: `第 ${i + 1} 题缺少 answer 字段` };
    }

    if (!q.hint || typeof q.hint !== "string") {
      return { valid: false, error: `第 ${i + 1} 题缺少 hint 字段` };
    }

    // 验证 hint 是否是 answer 的首字母
    if (q.hint.toLowerCase() !== q.answer.toLowerCase()[0]) {
      return {
        valid: false,
        error: `第 ${i + 1} 题的 hint 必须是 answer 的首字母`,
      };
    }

    // 验证句子中是否包含下划线占位符
    if (!q.sentence.includes("_")) {
      return {
        valid: false,
        error: `第 ${i + 1} 题的 sentence 必须包含下划线占位符`,
      };
    }
  }

  return { valid: true };
}
