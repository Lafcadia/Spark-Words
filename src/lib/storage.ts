import { QuestionSet, CommunityPaper } from "@/types/question";

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

/**
 * 导入社区试卷到本地
 */
export function importCommunityPaper(communityPaper: CommunityPaper): void {
  if (typeof window === "undefined") return;
  
  try {
    // 转换为本地试卷格式
    const localPaper: QuestionSet = {
      id: generateId(), // 生成新的本地 ID
      title: communityPaper.title,
      description: communityPaper.description,
      tags: communityPaper.tags,
      questions: communityPaper.questions,
      createdAt: new Date().toISOString(),
      source: "community",
      communityId: communityPaper.id, // 保存原始社区 ID
    };
    
    savePaper(localPaper);
  } catch (error) {
    console.error("Failed to import community paper:", error);
    throw error;
  }
}

/**
 * 导出试卷为社区格式
 */
export function exportPaperToCommunity(
  paper: QuestionSet,
  author: string,
  difficulty?: "beginner" | "intermediate" | "advanced"
): CommunityPaper {
  // 生成社区试卷 ID（使用标题简化版）
  const communityId = `community-${paper.title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .substring(0, 50)}-${Date.now()}`;

  const communityPaper: CommunityPaper = {
    id: communityId,
    title: paper.title,
    description: paper.description || "",
    tags: paper.tags || [],
    questions: paper.questions,
    createdAt: paper.createdAt || new Date().toISOString(),
    author,
    version: "1.0.0",
    difficulty,
    source: "local",
  };

  return communityPaper;
}

/**
 * 下载 JSON 文件到用户设备
 */
export function downloadJsonFile(data: any, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

