import { useState, useRef, useEffect } from "react";
import type { CardData } from "../types/deck";
import { PencilIcon, TrashIcon, CheckIcon, XIcon, GripIcon } from "./Icons";

interface CardProps extends CardData {
  onSave: (newLabel: string, newContent: string) => void;
  onDelete: () => void;
  dragHandleProps?: any;
}

const Card = ({
  label,
  content,
  onSave,
  onDelete,
  dragHandleProps,
}: CardProps) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempLabel, setTempLabel] = useState(label);
  const [tempContent, setTempContent] = useState(content);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTempLabel(label);
    setTempContent(content);
  }, [label, content]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(
        tempContent.length,
        tempContent.length,
      );
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [isEditing, tempContent]);

  const handleCopy = async () => {
    if (isEditing || !content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const handleSave = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onSave(tempLabel, tempContent);
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setTempLabel(label);
    setTempContent(content);
    setIsEditing(false);
  };

  return (
    <div className="group flex flex-col gap-1 w-full relative">
      <div className="flex justify-between items-end text-sm font-semibold text-slate-400 px-1 min-h-[1.5rem]">
        <div className="flex items-center gap-2 max-w-[75%]">
          <div
            {...dragHandleProps}
            className={`cursor-grab active:cursor-grabbing transition-opacity duration-200 p-1 -ml-1
              ${
                isEditing
                  ? "opacity-0 pointer-events-none"
                  : "opacity-0 group-hover:opacity-100 text-slate-500 hover:text-blue-400"
              }`}
            title="Drag to reorder"
          >
            <GripIcon />
          </div>

          {isEditing ? (
            <input
              type="text"
              value={tempLabel}
              onChange={(e) => setTempLabel(e.target.value)}
              className="bg-transparent border-b border-blue-400 text-blue-400 focus:outline-none w-full font-normal"
              placeholder="Label..."
              autoFocus
            />
          ) : (
            <span className="break-words truncate">{label}</span>
          )}
        </div>

        <div className="flex items-center gap-2 pb-0.5">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="text-green-400 hover:text-green-300 transition-colors"
                title="Save"
              >
                <CheckIcon />
              </button>
              <button
                onClick={handleCancel}
                className="text-red-400 hover:text-red-300 transition-colors"
                title="Cancel"
              >
                <XIcon />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {copied && (
                <span className="text-green-500 text-xs animate-pulse font-normal">
                  Copied!
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="transition-all duration-200 text-slate-400 opacity-0 group-hover:opacity-40
                              hover:text-blue-400 hover:opacity-100 scale-90"
                title="Edit entry"
              >
                <PencilIcon />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="transition-all duration-200 text-slate-400 opacity-0 group-hover:opacity-40
                              hover:text-red-400 hover:opacity-100 scale-90"
                title="Delete entry"
              >
                <TrashIcon />
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <textarea
          ref={inputRef}
          value={tempContent}
          onChange={(e) => setTempContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave(e);
            if (e.key === "Escape") handleCancel(e);
          }}
          className="border p-2 w-full min-h-[2.5rem] bg-slate-600 text-slate-100 text-sm rounded
                        shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none
                        overflow-hidden transition-all"
          rows={1}
        />
      ) : (
        <div
          onClick={handleCopy}
          className={`border p-2 w-full min-h-[2.5rem] flex items-center cursor-pointer transition-all duration-200
            ${
              copied
                ? "border-green-500 bg-green-300 text-slate-900"
                : "border-slate-400 bg-slate-500 text-slate-100 hover:border-slate-100 hover:bg-slate-400"
            }
            text-sm break-all rounded shadow-sm whitespace-pre-wrap`}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Card;
