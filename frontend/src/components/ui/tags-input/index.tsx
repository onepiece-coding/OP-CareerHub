/**
 * @file src/components/ui/tags-input/index.tsx
 */

import { useState, useRef, type KeyboardEvent } from "react";

import styles from "./styles.module.css";
import { cx } from "@/lib/utils";

interface TagsInputProps {
  onChange: (tags: string[]) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  touched?: boolean;
  error?: boolean;
  value: string[];
  id?: string;
}

export function TagsInput({
  placeholder = "Type and press Enter…",
  onChange,
  disabled,
  touched,
  onBlur,
  error,
  value,
  id,
}: TagsInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState("");

  const commit = (raw: string) => {
    const tag = raw.trim();
    if (!tag || value.includes(tag)) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  };

  const remove = (index: number) =>
    onChange(value.filter((_, i) => i !== index));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      remove(value.length - 1);
    }
  };

  return (
    <div
      className={cx(
        styles.container,
        touched && error ? styles.error : "",
        touched && !error ? styles.valid : "",
        disabled ? styles.disabled : "",
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag, i) => (
        <span key={tag + i} className={styles.tag}>
          <span className={styles.tagLabel}>{tag}</span>
          {!disabled && (
            <button
              className={styles.removeBtn}
              aria-label={`Remove ${tag}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(i);
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                aria-hidden="true"
              >
                <line
                  x1="1"
                  y1="1"
                  x2="9"
                  y2="9"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
                <line
                  x1="9"
                  y1="1"
                  x2="1"
                  y2="9"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </span>
      ))}

      <input
        placeholder={value.length === 0 ? placeholder : ""}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        className={styles.input}
        aria-label="Add tag"
        disabled={disabled}
        ref={inputRef}
        value={draft}
        onBlur={() => {
          if (draft.trim()) commit(draft);
          onBlur?.();
        }}
        id={id}
      />
    </div>
  );
}

export default TagsInput;
