/**
 * @file src/components/ui/select/index.tsx
 */

import { useState, useRef, useEffect } from "react";

import styles from "./styles.module.css";
import { cx } from "@/lib/utils";

interface Option<T> {
  label: string;
  value: T;
}

interface SelectProps<T> {
  onChange: (value: T) => void;
  options: Option<T>[];
  placeholder?: string;
  onBlur?: () => void;
  disabled?: boolean;
  touched?: boolean;
  error?: boolean;
  value?: T;
}

function Select<T>({
  placeholder = "Select...",
  onChange,
  disabled,
  touched,
  options,
  onBlur,
  value,
  error,
  id,
}: SelectProps<T> & { id?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLButtonElement>(null);

  const listId = `${id ?? "select"}-list`;

  const selectedOption = options.find((opt) => opt.value === value);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = options.findIndex((o) => o.value === value);
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (!disabled) setIsOpen((v) => !v);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen && !disabled) {
          setIsOpen(true);
          break;
        }
        if (!disabled)
          onChange(
            options[Math.min(currentIndex + 1, options.length - 1)].value,
          );
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!disabled) onChange(options[Math.max(currentIndex - 1, 0)].value);
        break;
      case "Escape":
        setIsOpen(false);
        containerRef.current?.focus();
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [isOpen]);

  return (
    <button
      className={cx(
        styles.container,
        touched && error ? styles.error : "",
        touched && !error ? styles.valid : "",
        disabled ? styles.disabled : "",
      )}
      onClick={() => !disabled && setIsOpen((prev) => !prev)}
      onKeyDown={handleKeyDown}
      aria-haspopup="listbox"
      aria-controls={listId}
      aria-expanded={isOpen}
      onBlur={() => {
        setIsOpen(false);
        onBlur?.(); // ← call out to the form system
      }}
      ref={containerRef}
      role="combobox"
      type="button"
      tabIndex={0}
      id={id}
    >
      <span>{selectedOption ? selectedOption.label : placeholder}</span>

      <div className={styles.caret} aria-hidden="true"></div>

      <ul
        className={`${styles.options} ${isOpen ? styles.show : ""}`}
        role="listbox"
        id={listId}
      >
        {options.map((option) => (
          <li
            className={`${styles.option} ${option.value === value ? styles.selected : ""}`}
            aria-selected={option.value === value}
            key={String(option.value)}
            role="option"
            onClick={(e) => {
              e.stopPropagation();
              onChange(option.value);
              setIsOpen(false);
            }}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </button>
  );
}

export default Select;
