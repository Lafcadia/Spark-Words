"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Trash2 } from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function ContextMenu({
  x,
  y,
  onEdit,
  onDelete,
  onClose,
}: ContextMenuProps) {
  useEffect(() => {
    const handleClick = () => onClose();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className="fixed bg-background rounded-lg shadow-lg border border-border py-1 min-w-[160px] z-50"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
          onClose();
        }}
        className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2 transition-colors"
      >
        <Edit2 className="w-4 h-4" />
        编辑
      </button>
      <div className="h-px bg-border my-1" />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
          onClose();
        }}
        className="w-full px-3 py-2 text-left text-sm text-error hover:bg-error-light/20 flex items-center gap-2 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        删除
      </button>
    </motion.div>
  );
}
