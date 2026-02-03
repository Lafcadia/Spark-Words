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

// ==================== 进度管理 ====================
const CURRENT_PAPER_KEY = "spark-words-current-paper";
const PROGRESS_KEY = "spark-words-progress";

import { PaperProgress } from "@/types/question";

/**
 * 保存当前选中的试卷ID
 */
export function saveCurrentPaperId(paperId: string): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(CURRENT_PAPER_KEY, paperId);
  } catch (error) {
    console.error("Failed to save current paper ID:", error);
  }
}

/**
 * 获取当前选中的试卷ID
 */
export function getCurrentPaperId(): string | null {
  if (typeof window === "undefined") return null;
  
  try {
    return localStorage.getItem(CURRENT_PAPER_KEY);
  } catch (error) {
    console.error("Failed to get current paper ID:", error);
    return null;
  }
}

/**
 * 保存试卷做题进度
 */
export function savePaperProgress(progress: PaperProgress): void {
  if (typeof window === "undefined") return;
  
  try {
    const allProgress = getAllProgress();
    const existingIndex = allProgress.findIndex((p) => p.paperId === progress.paperId);
    
    if (existingIndex >= 0) {
      allProgress[existingIndex] = progress;
    } else {
      allProgress.push(progress);
    }
    
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
  } catch (error) {
    console.error("Failed to save paper progress:", error);
  }
}

/**
 * 获取试卷做题进度
 */
export function getPaperProgress(paperId: string): PaperProgress | null {
  if (typeof window === "undefined") return null;
  
  try {
    const allProgress = getAllProgress();
    return allProgress.find((p) => p.paperId === paperId) || null;
  } catch (error) {
    console.error("Failed to get paper progress:", error);
    return null;
  }
}

/**
 * 获取所有试卷进度
 */
function getAllProgress(): PaperProgress[] {
  if (typeof window === "undefined") return [];
  
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load all progress:", error);
    return [];
  }
}

/**
 * 清除试卷做题进度
 */
export function clearPaperProgress(paperId: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const allProgress = getAllProgress().filter((p) => p.paperId !== paperId);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
  } catch (error) {
    console.error("Failed to clear paper progress:", error);
  }
}

// ==================== 数据备份与恢复 ====================

interface BackupData {
  version: string;
  exportedAt: string;
  papers: QuestionSet[];
  progress: PaperProgress[];
  currentPaperId: string | null;
}

/**
 * 导出所有数据
 */
export function exportAllData(): void {
  if (typeof window === "undefined") return;
  
  try {
    const backupData: BackupData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      papers: getAllPapers(),
      progress: getAllProgress(),
      currentPaperId: getCurrentPaperId(),
    };
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `spark-words-backup-${timestamp}.json`;
    
    downloadJsonFile(backupData, filename);
  } catch (error) {
    console.error("Failed to export data:", error);
    throw error;
  }
}

/**
 * 导入所有数据（用户选择覆盖或合并）
 */
export function importAllData(
  file: File, 
  strategy: 'overwrite' | 'merge',
  onSuccess: () => void,
  onError: (error: string) => void
): void {
  if (typeof window === "undefined") return;
  
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const backupData: BackupData = JSON.parse(content);
      
      // 验证数据格式
      if (!backupData.version || !Array.isArray(backupData.papers)) {
        onError("无效的备份文件格式");
        return;
      }
      
      if (strategy === 'overwrite') {
        // 覆盖策略：清空现有数据，导入新数据
        localStorage.setItem(STORAGE_KEY, JSON.stringify(backupData.papers));
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(backupData.progress || []));
        if (backupData.currentPaperId) {
          localStorage.setItem(CURRENT_PAPER_KEY, backupData.currentPaperId);
        }
      } else {
        // 合并策略：保留现有数据，添加新数据（相同ID跳过）
        const existingPapers = getAllPapers();
        const existingProgress = getAllProgress();
        
        // 合并试卷（跳过相同ID）
        const existingPaperIds = new Set(existingPapers.map(p => p.id));
        const newPapers = backupData.papers.filter(p => !existingPaperIds.has(p.id));
        const mergedPapers = [...existingPapers, ...newPapers];
        
        // 合并进度（跳过相同paperId）
        const existingProgressIds = new Set(existingProgress.map(p => p.paperId));
        const newProgress = (backupData.progress || []).filter(p => !existingProgressIds.has(p.paperId));
        const mergedProgress = [...existingProgress, ...newProgress];
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedPapers));
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(mergedProgress));
      }
      
      onSuccess();
    } catch (error) {
      console.error("Failed to import data:", error);
      onError("导入失败：文件解析错误");
    }
  };
  
  reader.onerror = () => {
    onError("导入失败：文件读取错误");
  };
  
  reader.readAsText(file);
}

/**
 * 清空所有数据
 */
export function clearAllData(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(CURRENT_PAPER_KEY);
  } catch (error) {
    console.error("Failed to clear all data:", error);
    throw error;
  }
}

// ==================== AI 配置管理 ====================
import { AIConfig, MultiAIConfig } from "@/types/aiConfig";

const AI_CONFIG_KEY = "spark-words-ai-config";
const ENCRYPTION_KEY = "spark-words-encryption-v1"; // 简单加密密钥

/**
 * 简单加密函数（使用 Base64 + XOR）
 */
function encryptString(text: string): string {
  const key = ENCRYPTION_KEY;
  let encrypted = '';
  for (let i = 0; i < text.length; i++) {
    encrypted += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(encrypted);
}

/**
 * 简单解密函数
 */
function decryptString(encrypted: string): string {
  try {
    const key = ENCRYPTION_KEY;
    const decrypted = atob(encrypted);
    let text = '';
    for (let i = 0; i < decrypted.length; i++) {
      text += String.fromCharCode(decrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return text;
  } catch {
    return '';
  }
}

/**
 * 保存 AI 配置
 */
export function saveAIConfig(config: AIConfig): void {
  if (typeof window === "undefined") return;
  
  try {
    // 获取所有配置
    const allConfigs = getAllAIConfigs();
    
    // 如果保存的配置是启用的，禁用其他所有配置
    if (config.enabled) {
      Object.keys(allConfigs).forEach(key => {
        if (key !== config.provider) {
          allConfigs[key].enabled = false;
        }
      });
    }
    
    // 加密 API Key
    const encryptedConfig = {
      ...config,
      apiKey: encryptString(config.apiKey),
    };
    
    // 更新对应服务商的配置
    allConfigs[config.provider] = encryptedConfig;
    
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(allConfigs));
  } catch (error) {
    console.error("Failed to save AI config:", error);
    throw error;
  }
}

/**
 * 获取所有 AI 配置
 */
function getAllAIConfigs(): MultiAIConfig {
  if (typeof window === "undefined") return {};
  
  try {
    const data = localStorage.getItem(AI_CONFIG_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Failed to load AI configs:", error);
    return {};
  }
}

/**
 * 获取 AI 配置（返回当前启用的配置）
 */
export function getAIConfig(): AIConfig | null {
  if (typeof window === "undefined") return null;
  
  try {
    const allConfigs = getAllAIConfigs();
    
    // 找到启用的配置
    const enabledConfig = Object.values(allConfigs).find(c => c.enabled);
    if (!enabledConfig) return null;
    
    // 解密 API Key
    return {
      ...enabledConfig,
      apiKey: decryptString(enabledConfig.apiKey),
    };
  } catch (error) {
    console.error("Failed to load AI config:", error);
    return null;
  }
}

/**
 * 获取特定服务商的配置
 */
export function getAIConfigByProvider(provider: string): AIConfig | null {
  if (typeof window === "undefined") return null;
  
  try {
    const allConfigs = getAllAIConfigs();
    const config = allConfigs[provider];
    
    if (!config) return null;
    
    // 解密 API Key
    return {
      ...config,
      apiKey: decryptString(config.apiKey),
    };
  } catch (error) {
    console.error("Failed to load AI config:", error);
    return null;
  }
}

/**
 * 删除指定服务商的 AI 配置
 */
export function deleteAIConfig(provider: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const allConfigs = getAllAIConfigs();
    delete allConfigs[provider];
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(allConfigs));
  } catch (error) {
    console.error("Failed to delete AI config:", error);
    throw error;
  }
}

/**
 * 切换指定服务商的启用状态
 */
export function toggleAIConfigEnabled(provider: string): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const allConfigs = getAllAIConfigs();
    const config = allConfigs[provider];
    
    if (!config) return false;
    
    // 禁用所有其他配置
    Object.keys(allConfigs).forEach(key => {
      allConfigs[key].enabled = false;
    });
    
    // 启用当前配置
    allConfigs[provider].enabled = true;
    
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(allConfigs));
    return true;
  } catch (error) {
    console.error("Failed to toggle AI config:", error);
    return false;
  }
}

/**
 * 获取所有服务商的配置列表
 */
export function getAllAIConfigList(): AIConfig[] {
  if (typeof window === "undefined") return [];
  
  try {
    const allConfigs = getAllAIConfigs();
    return Object.values(allConfigs).map(config => ({
      ...config,
      apiKey: decryptString(config.apiKey),
    }));
  } catch (error) {
    console.error("Failed to load AI config list:", error);
    return [];
  }
}

