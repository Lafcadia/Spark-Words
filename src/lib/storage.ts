import { QuestionSet } from "@/types/question";

const STORAGE_KEY = "spark-words-papers";

/**
 * 获取所有试卷
 */
export function getAllPapers(): QuestionSet[] {
  if (typeof window === "undefined") return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load papers:", error);
    return [];
  }
}

/**
 * 保存试卷
 */
export function savePaper(paper: QuestionSet): void {
  if (typeof window === "undefined") return;
  
  try {
    const papers = getAllPapers();
    const existingIndex = papers.findIndex((p) => p.id === paper.id);
    
    if (existingIndex >= 0) {
      papers[existingIndex] = paper;
    } else {
      papers.push(paper);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(papers));
  } catch (error) {
    console.error("Failed to save paper:", error);
  }
}

/**
 * 删除试卷
 */
export function deletePaper(id: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const papers = getAllPapers().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(papers));
  } catch (error) {
    console.error("Failed to delete paper:", error);
  }
}

/**
 * 根据 ID 获取试卷
 */
export function getPaperById(id: string): QuestionSet | null {
  const papers = getAllPapers();
  return papers.find((p) => p.id === id) || null;
}

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return `paper-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
