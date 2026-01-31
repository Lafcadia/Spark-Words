import { Question, QuestionSet } from '@/types/question';

// 示例题目数据
export const sampleQuestionSet: QuestionSet = {
  id: "sample-1",
  title: "English Practice",
  description: "",
  createdAt: new Date().toISOString(),
  questions: [
    {
      id: "q1",
      sentence: "The scientist made a remarkable d_____ in the field of quantum physics.",
      answer: "discovery",
      hint: "d",
      translation: "这位科学家在量子物理学领域取得了卓越的发现。"
    },
    {
      id: "q2",
      sentence: "Students should develop the a_____ to think critically and solve problems independently.",
      answer: "ability",
      hint: "a",
      translation: "学生应该培养批判性思考和独立解决问题的能力。"
    },
    {
      id: "q3",
      sentence: "The government has taken effective m_____ to protect the environment.",
      answer: "measures",
      hint: "m",
      translation: "政府已经采取了有效的措施来保护环境。"
    },
    {
      id: "q4",
      sentence: "It is important to maintain a balanced d_____ for good health.",
      answer: "diet",
      hint: "d",
      translation: "保持均衡的饮食对健康很重要。"
    },
    {
      id: "q5",
      sentence: "The teacher e_____ the students to participate in extracurricular activities.",
      answer: "encourages",
      hint: "e",
      translation: "老师鼓励学生参加课外活动。"
    }
  ]
};

// AI 生成题目的 Prompt 模板
export const promptTemplate = `请根据以下格式生成高考英语首字母填空题目（JSON格式）：

{
  "title": "题目集标题",
  "description": "题目集描述（可选）",
  "questions": [
    {
      "id": "q1",
      "sentence": "完整句子，用下划线表示需要填写的单词位置，如：The scientist made a remarkable d_____ in the field of quantum physics.",
      "answer": "正确答案的完整单词，如：discovery",
      "hint": "首字母，如：d",
      "translation": "中文翻译（可选）"
    }
  ]
}

要求：
1. 生成 5-10 道题目
2. 单词应为高考常见词汇
3. 句子要符合高考难度和语境
4. 每道题的 id 按 q1, q2, q3... 递增
5. hint 必须是 answer 的首字母（小写）
6. 确保 JSON 格式正确

请按照以上格式生成题目：`;
