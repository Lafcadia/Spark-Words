"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Tag as TagIcon } from "lucide-react";
import { QuestionSet } from "@/types/question";

interface EditPaperModalProps {
  paper: QuestionSet;
  onSave: (updatedPaper: QuestionSet) => void;
  onClose: () => void;
}

export default function EditPaperModal({
  paper,
  onSave,
  onClose,
}: EditPaperModalProps) {
  const [title, setTitle] = useState(paper.title);
  const [description, setDescription] = useState(paper.description || "");
  
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
  const [tags, setTags] = useState<string[]>(paper.tags || []);
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert("试卷名称不能为空");
      return;
    }

    const updatedPaper: QuestionSet = {
      ...paper,
      title: title.trim(),
      description: description.trim(),
      tags,
    };

    onSave(updatedPaper);
    handleClose();
  };

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
        className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
            编辑试卷
          </h1>
          <button
            onClick={handleClose}
            className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-150"
            aria-label="关闭"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-[14px] font-medium mb-2 text-zinc-800 dark:text-zinc-100">
                试卷名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：高考英语词汇练习"
                className="w-full px-3 py-2.5 text-[14px] border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[14px] font-medium mb-2 text-zinc-800 dark:text-zinc-100">
                试卷描述
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="例如：包含常用高频词汇的填空练习"
                rows={3}
                className="w-full px-3 py-2.5 text-[14px] border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-[14px] font-medium mb-2 text-zinc-800 dark:text-zinc-100">
                标签
              </label>
              <div className="flex gap-2.5 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="输入标签后按 Enter"
                  className="flex-1 px-3 py-2.5 text-[14px] border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all"
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-[14px] font-medium transition-all duration-150"
                >
                  添加
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-[13px] font-medium"
                    >
                      <TagIcon className="w-3.5 h-3.5" strokeWidth={2} />
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-[16px] leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 text-[14px] font-medium border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-150 text-zinc-700 dark:text-zinc-300"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 text-[14px] font-medium bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg transition-all duration-150"
          >
            保存
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
