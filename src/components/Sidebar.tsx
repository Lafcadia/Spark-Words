"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Plus, FileText, PanelLeftClose, Globe } from "lucide-react";
import { QuestionSet } from "@/types/question";
import ContextMenu from "./ContextMenu";
import CommunityLibraryModal from "./CommunityLibraryModal";
import SharePaperModal from "./SharePaperModal";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  papers: QuestionSet[];
  currentPaperId: string;
  onSelectPaper: (id: string) => void;
  onNewPaper: () => void;
  onEditPaper: (paperId: string) => void;
  onDeletePaper: (paperId: string) => void;
  onRefreshPapers?: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  papers,
  currentPaperId,
  onSelectPaper,
  onNewPaper,
  onEditPaper,
  onDeletePaper,
  onRefreshPapers,
}: SidebarProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    paperId: string;
  } | null>(null);
  const [showCommunityLibrary, setShowCommunityLibrary] = useState(false);
  const [shareModalPaper, setShareModalPaper] = useState<QuestionSet | null>(null);

  const handleContextMenu = (
    e: React.MouseEvent,
    paperId: string
  ) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      paperId,
    });
  };
  return (
    <>
      {/* 移动端遮罩层 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* 侧边栏 - 移动端覆盖式，PC端固定式 */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="fixed left-0 top-0 bottom-0 w-64 bg-background border-r border-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-medium text-foreground">Papers</h2>
              <motion.button
                whileHover={{ opacity: 0.6 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded"
                title="Close sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Papers List */}
            <div className="flex-1 overflow-y-auto px-2 py-3 custom-scrollbar">
              {papers.map((paper) => (
                <motion.button
                  key={paper.id}
                  onClick={() => onSelectPaper(paper.id)}
                  onContextMenu={(e) => handleContextMenu(e, paper.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md mb-1 transition-all group",
                    currentPaperId === paper.id
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <FileText
                      className={cn(
                        "w-4 h-4 mt-0.5 flex-shrink-0 transition-colors",
                        currentPaperId === paper.id
                          ? "text-accent"
                          : "text-muted-foreground/50 group-hover:text-muted-foreground"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-normal truncate leading-tight">
                        {paper.title}
                      </h3>
                      {paper.description && (
                        <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">
                          {paper.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground/60">
                          {paper.questions.length} {paper.questions.length === 1 ? 'question' : 'questions'}
                        </p>
                        {paper.tags && paper.tags.length > 0 && (
                          <div className="flex gap-1">
                            {paper.tags.slice(0, 2).map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {paper.tags.length > 2 && (
                              <span className="text-xs text-muted-foreground/60">
                                +{paper.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="px-2 py-3 border-t border-border space-y-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowCommunityLibrary(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-3 md:py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all text-[14px] font-medium touch-manipulation"
              >
                <Globe className="w-4 h-4" strokeWidth={2} />
                社区试卷
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={onNewPaper}
                className="w-full flex items-center justify-center gap-2 px-3 py-3 md:py-2 rounded-md bg-foreground text-background hover:opacity-90 transition-all text-sm font-normal touch-manipulation"
              >
                <Plus className="w-4 h-4" />
                New Paper
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onEdit={() => onEditPaper(contextMenu.paperId)}
            onDelete={() => onDeletePaper(contextMenu.paperId)}
            onShare={() => {
              const paper = papers.find(p => p.id === contextMenu.paperId);
              if (paper) {
                setShareModalPaper(paper);
              }
              setContextMenu(null);
            }}
            onClose={() => setContextMenu(null)}
          />
        )}
      </AnimatePresence>

      {/* Community Library Modal */}
      <AnimatePresence mode="wait">
        {showCommunityLibrary && (
          <CommunityLibraryModal
            isOpen={showCommunityLibrary}
            onClose={() => setShowCommunityLibrary(false)}
            onImportSuccess={onRefreshPapers}
          />
        )}
      </AnimatePresence>

      {/* Share Paper Modal */}
      <AnimatePresence mode="wait">
        {shareModalPaper && (
          <SharePaperModal
            isOpen={!!shareModalPaper}
            onClose={() => setShareModalPaper(null)}
            paper={shareModalPaper}
          />
        )}
      </AnimatePresence>
    </>
  );
}
