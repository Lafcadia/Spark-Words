import { CommunityMetadata, CommunityPaper, CommunityPaperMeta } from "@/types/question";

// GitHub 仓库配置
const GITHUB_CONFIG = {
  owner: "Mystic-Stars", // 你的 GitHub 用户名
  repo: "spark-words-community", // 社区仓库名
  branch: "main",
};

/**
 * 构建 GitHub Raw Content URL
 */
function buildRawUrl(filepath: string): string {
  return `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${filepath}`;
}

/**
 * 获取社区试卷元数据列表
 */
export async function fetchCommunityMetadata(): Promise<CommunityMetadata> {
  try {
    const url = buildRawUrl("papers/metadata.json");
    const response = await fetch(url, {
      cache: "no-cache", // 避免缓存旧数据
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }

    const metadata: CommunityMetadata = await response.json();
    return metadata;
  } catch (error) {
    console.error("Error fetching community metadata:", error);
    // 返回空数据而不是抛出错误，提升用户体验
    return {
      papers: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * 下载指定的社区试卷
 */
export async function downloadCommunityPaper(
  filepath: string
): Promise<CommunityPaper | null> {
  try {
    const url = buildRawUrl(filepath);
    const response = await fetch(url, {
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error(`Failed to download paper: ${response.statusText}`);
    }

    const paper: CommunityPaper = await response.json();
    return paper;
  } catch (error) {
    console.error(`Error downloading paper from ${filepath}:`, error);
    return null;
  }
}

/**
 * 搜索社区试卷
 */
export function searchCommunityPapers(
  papers: CommunityPaperMeta[],
  query: string
): CommunityPaperMeta[] {
  if (!papers || !query.trim()) return papers || [];

  const lowerQuery = query.toLowerCase();
  return papers.filter(
    (paper) =>
      paper.title.toLowerCase().includes(lowerQuery) ||
      paper.description?.toLowerCase().includes(lowerQuery) ||
      paper.author.toLowerCase().includes(lowerQuery) ||
      paper.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * 按标签筛选试卷
 */
export function filterPapersByTags(
  papers: CommunityPaperMeta[],
  tags: string[]
): CommunityPaperMeta[] {
  if (!papers || tags.length === 0) return papers || [];

  return papers.filter((paper) =>
    tags.some((tag) => paper.tags?.includes(tag))
  );
}

/**
 * 按难度筛选试卷
 */
export function filterPapersByDifficulty(
  papers: CommunityPaperMeta[],
  difficulty: string | null
): CommunityPaperMeta[] {
  if (!papers || !difficulty) return papers || [];

  return papers.filter((paper) => paper.difficulty === difficulty);
}

/**
 * 获取所有可用标签
 */
export function getAllTags(papers: CommunityPaperMeta[]): string[] {
  if (!papers) return [];
  
  const tagSet = new Set<string>();
  papers.forEach((paper) => {
    paper.tags?.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

/**
 * 生成贡献 PR 的模板文本
 */
export function generatePRTemplate(paper: CommunityPaper): string {
  return `## 📝 新增试卷

**试卷标题**: ${paper.title}
**作者**: ${paper.author}
**难度**: ${paper.difficulty || "未指定"}
**题目数量**: ${paper.questions.length}
**标签**: ${paper.tags?.join(", ") || "无"}

### 描述
${paper.description || "无描述"}

### 检查清单
- [ ] JSON 格式正确
- [ ] 所有必填字段已填写
- [ ] 题目答案准确无误
- [ ] 翻译正确（如有）
- [ ] 文件命名规范（小写字母-连字符）

### 文件路径
\`papers/${paper.difficulty || "other"}/${paper.id}.json\`
`;
}

/**
 * 获取贡献指南链接
 */
export function getContributionGuideUrl(): string {
  return `https://github.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}#contributing`;
}

/**
 * 获取仓库 URL
 */
export function getRepoUrl(): string {
  return `https://github.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`;
}
