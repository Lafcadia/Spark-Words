"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, ClipboardPaste, Lightbulb, Copy, Check, Tag as TagIcon } from "lucide-react";
import { generatePromptFromWords, validateQuestionSet } from "@/lib/promptUtils";
import { savePaper, generateId, getAllPapers } from "@/lib/storage";
import { QuestionSet } from "@/types/question";

interface NewPaperModalProps {
  onClose: () => void;
  onPaperCreated: (papers: QuestionSet[], newPaperId: string) => void;
}

type TabType = "words" | "prompt" | "json";

export default function NewPaperModal({
  onClose,
  onPaperCreated,
}: NewPaperModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("words");
  
  // Words tab state
  const [wordsInput, setWordsInput] = useState("");
  const [wordsError, setWordsError] = useState("");
  
  // Prompt tab state
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  
  // JSON tab state
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [paperTitle, setPaperTitle] = useState("");
  const [paperDescription, setPaperDescription] = useState("");
  const [paperTags, setPaperTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // 清理函数：确保关闭时移除所有可能的样式残留
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    };
  }, []);

  const handleClose = () => {
    document.body.style.overflow = '';
    document.body.style.pointerEvents = '';
    onClose();
  };

  const handleGeneratePrompt = () => {
    try {
      // 解析输入的单词列表
      const words = wordsInput
        .split(/[,\s\n]+/)
        .map((word) => word.trim().toLowerCase())
        .filter((word) => word.length > 0);

      if (words.length === 0) {
        throw new Error("请输入至少一个单词");
      }

      // 验证是否都是英文单词
      const invalidWords = words.filter((word) => !/^[a-z]+$/.test(word));
      if (invalidWords.length > 0) {
        throw new Error(
          `包含无效单词: ${invalidWords.slice(0, 3).join(", ")}${
            invalidWords.length > 3 ? "..." : ""
          }`
        );
      }

      const prompt = generatePromptFromWords(words);
      setGeneratedPrompt(prompt);
      setWordsError("");
      setActiveTab("prompt");
    } catch (err) {
      setWordsError(err instanceof Error ? err.message : "生成失败");
    }
  };

  // 监听单词输入，自动生成 Prompt
  const handleWordsInputChange = (value: string) => {
    setWordsInput(value);
    setWordsError("");
    
    // 防抖：延迟生成 Prompt
    const words = value
      .split(/[,\s\n]+/)
      .map((word) => word.trim().toLowerCase())
      .filter((word) => word.length > 0);

    if (words.length > 0) {
      // 验证是否都是英文单词
      const invalidWords = words.filter((word) => !/^[a-z]+$/.test(word));
      if (invalidWords.length === 0) {
        // 自动生成 Prompt
        const prompt = generatePromptFromWords(words);
        setGeneratedPrompt(prompt);
      }
    }
  };

  const handlePasteWords = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setWordsInput(text);
    } catch (err) {
      setWordsError("无法访问剪贴板");
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleImportJson = () => {
    try {
      setJsonError("");
      const data = JSON.parse(jsonInput);

      // 验证数据格式
      const validation = validateQuestionSet(data);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // 使用用户编辑的信息或 JSON 中的信息
      const finalTitle = paperTitle.trim() || data.title || "未命名试卷";
      const finalDescription = paperDescription.trim() || data.description || "";

      // 创建新试卷
      const newPaper: QuestionSet = {
        ...data,
        id: generateId(),
        title: finalTitle,
        description: finalDescription,
        tags: paperTags.length > 0 ? paperTags : (data.tags || []),
        createdAt: new Date().toISOString(),
      };

      // 保存并更新
      savePaper(newPaper);
      const updatedPapers = getAllPapers();
      
      onPaperCreated(updatedPapers, newPaper.id);
      onClose();
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : "JSON 格式错误");
    }
  };

  const handleJsonInputChange = (value: string) => {
    setJsonInput(value);
    setJsonError("");
    
    // 尝试自动解析并填充元信息
    try {
      const data = JSON.parse(value);
      if (data.title && !paperTitle) {
        setPaperTitle(data.title);
      }
      if (data.description && !paperDescription) {
        setPaperDescription(data.description);
      }
      if (data.tags && Array.isArray(data.tags) && paperTags.length === 0) {
        setPaperTags(data.tags);
      }
    } catch {
      // JSON 未完成解析，忽略错误
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !paperTags.includes(tag)) {
      setPaperTags([...paperTags, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPaperTags(paperTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "words", label: "导入单词" },
    { id: "prompt", label: "生成 Prompt" },
    { id: "json", label: "导入 JSON" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 20 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden relative border border-zinc-200/50 dark:border-zinc-800/50"
        onClick={(e) => e.stopPropagation()}
        style={{ height: "85vh", maxHeight: "900px" }}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
            新建试卷
          </h1>
          <button
            onClick={handleClose}
            className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-150"
            aria-label="关闭"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Content with Sidebar */}
        <div className="flex" style={{ height: "calc(85vh - 3.5rem)", maxHeight: "calc(900px - 3.5rem)" }}>
          {/* 左侧标签栏 */}
          <div className="w-56 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/30 py-4 px-3">
            <nav className="space-y-0.5">
              {tabs.map((tab, index) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-all duration-150
                      ${
                        isSelected
                          ? "bg-zinc-200/70 dark:bg-zinc-800/70 text-zinc-900 dark:text-zinc-100 font-medium shadow-sm"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-zinc-200"
                      }
                    `}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded flex items-center justify-center text-xs font-semibold shrink-0",
                        isSelected
                          ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                          : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                      )}
                    >
                      {index + 1}
                    </div>
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 右侧内容区 */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* 内容滚动区域 */}
            <div className="flex-1 overflow-y-auto py-8 px-10">
              {/* Words Tab */}
              {activeTab === "words" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl"
              >
                {/* 标题区 */}
                <div className="mb-8">
                  <h3 className="text-[28px] font-bold mb-2 text-zinc-900 dark:text-zinc-100">导入单词列表</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-[14px]">
                    输入单词列表，支持逗号、空格或换行分隔
                  </p>
                </div>

                {/* 输入区 */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
                      单词列表
                    </label>
                    <button
                      onClick={handlePasteWords}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md font-medium transition-colors"
                    >
                      <ClipboardPaste className="w-4 h-4" strokeWidth={2} />
                      从剪贴板粘贴
                    </button>
                  </div>
                  <textarea
                    value={wordsInput}
                    onChange={(e) => handleWordsInputChange(e.target.value)}
                    placeholder="例如：discovery, ability, measure, diet, encourage"
                    className="w-full h-72 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 resize-none focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono text-[13px] transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                {/* 错误提示 */}
                {wordsError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-6 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg"
                  >
                    <p className="text-red-700 dark:text-red-400 text-[13px] flex items-center gap-2">
                      <span>⚠️</span> {wordsError}
                    </p>
                  </motion.div>
                )}

                {/* 提示卡片 */}
                <div className="mb-8 p-5 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-lg">
                  <h4 className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-500 dark:text-blue-400" strokeWidth={2} />
                    使用提示
                  </h4>
                  <ul className="text-[13px] text-zinc-600 dark:text-zinc-400 space-y-2.5">
                    <li className="flex items-start gap-2.5">
                      <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                      <span>每个单词应为英文字母，支持多种分隔符</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                      <span>导入后会生成包含这些单词的 AI Prompt</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                      <span>复制 Prompt 给 AI，AI 会生成练习题</span>
                    </li>
                  </ul>
                </div>

                {/* 操作按钮 */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-[13px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-150"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      // 验证单词列表
                      const words = wordsInput
                        .split(/[,\s\n]+/)
                        .map((word) => word.trim().toLowerCase())
                        .filter((word) => word.length > 0);

                      if (words.length === 0) {
                        setWordsError("请输入至少一个单词");
                        return;
                      }

                      const invalidWords = words.filter((word) => !/^[a-z]+$/.test(word));
                      if (invalidWords.length > 0) {
                        setWordsError(
                          `包含无效单词: ${invalidWords.slice(0, 3).join(", ")}${
                            invalidWords.length > 3 ? "..." : ""
                          }`
                        );
                        return;
                      }

                      // 跳转到 Prompt 标签页
                      setActiveTab("prompt");
                    }}
                    disabled={!generatedPrompt}
                    className="px-5 py-2 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-150 text-[13px] font-medium shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    下一步：查看 Prompt
                  </button>
                </div>
              </motion.div>
            )}

            {/* Prompt Tab */}
            {activeTab === "prompt" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl"
              >
                <div className="mb-8">
                  <h3 className="text-3xl font-bold mb-2 text-foreground">AI Prompt</h3>
                  <p className="text-muted-foreground text-base">
                    复制此 Prompt 给 AI，然后导入 AI 返回的 JSON
                  </p>
                </div>

                {generatedPrompt ? (
                  <>
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-medium text-foreground">
                          Prompt 内容
                        </label>
                        <button
                          onClick={handleCopyPrompt}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-medium",
                            copied
                              ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400"
                              : "bg-accent text-white hover:bg-accent/90 shadow-sm"
                          )}
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4" />
                              已复制
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              复制 Prompt
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="w-full max-h-[500px] p-4 border border-border rounded-lg bg-muted/50 font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-auto">
                        {generatedPrompt}
                      </pre>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setActiveTab("words")}
                        className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                      >
                        返回
                      </button>
                      <button
                        onClick={() => setActiveTab("json")}
                        className="px-5 py-2 rounded-md bg-foreground text-background hover:opacity-90 transition-all text-sm font-medium shadow-sm"
                      >
                        下一步：导入 JSON
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                      <span className="text-xl">📝</span>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      请先在"导入单词"步骤中生成 Prompt
                    </p>
                    <button
                      onClick={() => setActiveTab("words")}
                      className="text-accent hover:underline text-sm font-medium"
                    >
                      返回导入单词
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* JSON Tab */}
            {activeTab === "json" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl"
              >
                <div className="mb-8">
                  <h3 className="text-[28px] font-bold mb-2 text-zinc-900 dark:text-zinc-100">导入 JSON</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-[14px]">
                    粘贴 AI 返回的 JSON 数据并编辑试卷信息
                  </p>
                </div>

                {/* 试卷元信息编辑 */}
                <div className="mb-6 space-y-4 p-5 bg-zinc-50 dark:bg-zinc-950/30 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 mb-3">试卷信息</h4>
                  
                  {/* 试卷名称 */}
                  <div>
                    <label className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 mb-2 block">
                      试卷名称 <span className="text-red-600 dark:text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={paperTitle}
                      onChange={(e) => setPaperTitle(e.target.value)}
                      placeholder="例如：高考英语词汇练习"
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-[13px] transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  {/* 试卷描述 */}
                  <div>
                    <label className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 mb-2 block">
                      试卷描述
                    </label>
                    <input
                      type="text"
                      value={paperDescription}
                      onChange={(e) => setPaperDescription(e.target.value)}
                      placeholder="例如：包含常用高频词汇的填空练习"
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-[13px] transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  {/* 标签 */}
                  <div>
                    <label className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 mb-2 block">
                      标签
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInputKeyDown}
                        placeholder="输入标签后按 Enter"
                        className="flex-1 px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-[13px] transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-zinc-100"
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-md text-[13px] font-medium transition-all duration-150"
                      >
                        添加
                      </button>
                    </div>
                    {paperTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {paperTags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded-md text-[13px]"
                          >
                            <TagIcon className="w-3 h-3" strokeWidth={2} />
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* JSON 输入 */}
                <div className="mb-6">
                  <label className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 mb-3 block">
                    JSON 数据
                  </label>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => handleJsonInputChange(e.target.value)}
                    placeholder='{"title": "...", "questions": [...]}'
                    className="w-full h-80 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 resize-none focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono text-[13px] transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                {jsonError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-6 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg"
                  >
                    <p className="text-red-700 dark:text-red-400 text-[13px] flex items-center gap-2">
                      <span>⚠️</span> {jsonError}
                    </p>
                  </motion.div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setActiveTab("prompt")}
                    className="px-4 py-2 text-[13px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-150"
                  >
                    返回
                  </button>
                  <button
                    onClick={handleImportJson}
                    className="px-5 py-2 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-150 text-[13px] font-medium shadow-sm"
                  >
                    创建试卷
                  </button>
                </div>
              </motion.div>
            )}
          </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
