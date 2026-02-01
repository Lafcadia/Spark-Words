"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Palette, Info, Sun, Moon, Monitor, ExternalLink, Sparkles, User, Github, Code } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface SettingsModalProps {
  onClose: () => void;
}

type SettingCategory = "appearance" | "about";

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<SettingCategory>("appearance");
  const { theme, setTheme } = useTheme();

  // 清理函数：确保关闭时移除所有可能的样式残留
  useEffect(() => {
    // 防止背景滚动
    document.body.style.overflow = 'hidden';
    
    return () => {
      // 恢复滚动
      document.body.style.overflow = '';
      // 确保没有残留的 pointer-events 样式
      document.body.style.pointerEvents = '';
    };
  }, []);

  const handleClose = () => {
    // 确保清理所有样式
    document.body.style.overflow = '';
    document.body.style.pointerEvents = '';
    onClose();
  };

  const categories = [
    { id: "appearance" as SettingCategory, label: "外观", icon: Palette },
    { id: "about" as SettingCategory, label: "关于", icon: Info },
  ];

  const themeOptions = [
    { 
      value: "light" as const, 
      label: "浅色", 
      icon: Sun,
    },
    { 
      value: "dark" as const, 
      label: "深色", 
      icon: Moon,
    },
    { 
      value: "system" as const, 
      label: "系统", 
      icon: Monitor,
    },
  ];

  const renderContent = () => {
    switch (selectedCategory) {
      case "appearance":
        return (
          <div className="space-y-8">
            {/* 主题设置 */}
            <div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="text-[14px] font-medium text-zinc-800 dark:text-zinc-100">
                    明暗主题
                  </h3>
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    选择界面外观
                  </p>
                </div>
                <div className="grid grid-cols-3 items-center p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg relative w-[270px]">
                  <div 
                    className="absolute bg-white dark:bg-zinc-700 rounded-md transition-all duration-200 ease-out"
                    style={{
                      width: 'calc((100% - 0.5rem) / 3)',
                      left: '0.25rem',
                      top: '0.25rem',
                      bottom: '0.25rem',
                      transform: `translateX(${theme === 'light' ? '0%' : theme === 'dark' ? '100%' : '200%'})`
                    }}
                  />
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = theme === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          setTheme(option.value);
                        }}
                        className={`
                          relative flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors duration-200 w-full
                          ${
                            isSelected
                              ? "text-zinc-900 dark:text-zinc-100"
                              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                          }
                        `}
                      >
                        <Icon className="w-4 h-4 relative z-10" strokeWidth={2} />
                        <span className="relative z-10 whitespace-nowrap">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      case "about":
        return (
          <div className="space-y-8">
            {/* 标题和简介 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-zinc-600 dark:text-zinc-400" strokeWidth={2} />
                </div>
                <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
                  Spark Words
                </h3>
              </div>
              <p className="text-[14px] text-zinc-500 dark:text-zinc-400 leading-relaxed ml-10">
                优雅的完形填空，纯净背单词
              </p>
            </div>

            {/* 开发者 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
                <div className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  开发者
                </div>
              </div>
              <a
                href="https://github.com/Mystic-Stars"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-[14px] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group ml-5"
              >
                <Github className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors" strokeWidth={1.5} />
                <span>Mystic Stars</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors" strokeWidth={2} />
              </a>
            </div>

            {/* 项目地址 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Code className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
                <div className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  项目地址
                </div>
              </div>
              <a
                href="https://github.com/Mystic-Stars/Spark-Words"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-[14px] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group ml-5"
              >
                <Github className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors" strokeWidth={1.5} />
                <span className="truncate">github.com/Mystic-Stars/Spark-Words</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors flex-shrink-0" strokeWidth={2} />
              </a>
            </div>

            {/* 技术栈 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
                <div className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  技术栈
                </div>
              </div>
              <div className="ml-5 text-[14px] text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600"></div>
                  <span>Next.js 15</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600"></div>
                  <span>React 18</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600"></div>
                  <span>TypeScript</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600"></div>
                  <span>Tailwind CSS</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600"></div>
                  <span>Framer Motion</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600"></div>
                  <span>Lucide Icons</span>
                </div>
              </div>
            </div>

            {/* 版本信息 */}
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-[13px] text-zinc-400 dark:text-zinc-500">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                <span>Version 1.0.0 · 2026年1月</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
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
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden relative border border-zinc-200/50 dark:border-zinc-800/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
            设置
          </h1>
          <button
            onClick={handleClose}
            className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-150"
            aria-label="关闭设置"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Content with Sidebar */}
        <div className="flex" style={{ height: "540px" }}>
          {/* Left Sidebar */}
          <div className="w-56 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/30 py-4 px-3">
            <nav className="space-y-0.5">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-all duration-150
                      ${
                        isSelected
                          ? "bg-zinc-200/70 dark:bg-zinc-800/70 text-zinc-900 dark:text-zinc-100 font-medium shadow-sm"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-zinc-200"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                    <span>{category.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Content */}
          <div className="flex-1 py-8 px-10 overflow-y-auto custom-scrollbar">
            {renderContent()}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
