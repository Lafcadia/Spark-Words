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
      className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="bg-background rounded-lg shadow-2xl max-w-2xl w-full p-8 border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">编辑试卷</h2>
            <p className="text-muted-foreground text-sm">修改试卷的名称、描述和标签</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              试卷名称 <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：高考英语词汇练习"
              className="w-full px-3 py-2.5 border border-border rounded-md bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 text-sm transition-all placeholder:text-muted-foreground"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              试卷描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例如：包含常用高频词汇的填空练习"
              rows={3}
              className="w-full px-3 py-2.5 border border-border rounded-md bg-background resize-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 text-sm transition-all placeholder:text-muted-foreground"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              标签
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="输入标签后按 Enter"
                className="flex-1 px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 text-sm transition-all placeholder:text-muted-foreground"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md text-sm font-medium transition-colors"
              >
                添加
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded-md text-sm"
                  >
                    <TagIcon className="w-3 h-3" />
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

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-md bg-foreground text-background hover:opacity-90 transition-all text-sm font-medium shadow-sm"
          >
            保存
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
