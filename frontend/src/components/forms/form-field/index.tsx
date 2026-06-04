/**
 * @file src/components/forms/form-field/index.tsx
 */

import { ErrorIcon, EyeIcon, EyeOffIcon } from "@/components/icons";
import { Select } from "@/components/ui";
import { useState } from "react";

import TagsInput from "@/components/ui/tags-input";
import styles from "./styles.module.css";
import DatePicker from "@/components/ui/date-picker";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BaseOption = { label: string; value: string };

/**
 * The broad union that register() / registerFile() return from useForm.
 * Every FormFieldProps variant must accept this type so spreading
 * {...register("name")} onto any <FormField> is always assignable.
 * At runtime the actual element is always the correct concrete type,
 * so widening here is safe.
 */
type AnyChangeHandler = React.ChangeEventHandler<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;
type AnyFocusHandler = React.FocusEventHandler<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

interface BaseFieldProps {
  /** Field name (must match the form values key) */
  name: string;
  /** Human-readable label */
  label: string;
  /** Optional helper text shown below the input */
  helperText?: string;
  /** Current validation error for this field */
  error?: string;
  /** Whether this field has been interacted with */
  touched?: boolean;
  /** Marks the label with a required asterisk */
  required?: boolean;
  /** Disables the input */
  disabled?: boolean;
}

interface TextFieldProps extends BaseFieldProps {
  onChange: AnyChangeHandler;
  onBlur: AnyFocusHandler;
  type: "text" | "email" | "tel" | "url" | "number";
  autoComplete?: string;
  placeholder?: string;
  value: string;
}

interface PasswordFieldProps extends BaseFieldProps {
  onChange: AnyChangeHandler;
  onBlur: AnyFocusHandler;
  autoComplete?: string;
  placeholder?: string;
  type: "password";
  value: string;
}

interface SelectFieldProps extends BaseFieldProps {
  onChange: (value: string) => void; // ← value-based, not event-based
  onBlur: () => void; // ← simple callback
  options: BaseOption[];
  placeholder?: string;
  type: "select";
  value: string;
}

interface FileFieldProps extends BaseFieldProps {
  type: "file";
  accept?: string;
  onChange: AnyChangeHandler;
  onBlur: AnyFocusHandler;
}

interface TagsFieldProps extends BaseFieldProps {
  type: "tags";
  value: string[];
  onChange: (tags: string[]) => void;
  onBlur: () => void;
  placeholder?: string;
}

interface DateFieldProps extends BaseFieldProps {
  type: "date";
  value: string;
  onChange: (date: string) => void;
  onBlur: () => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
}

export type FormFieldProps =
  | TextFieldProps
  | PasswordFieldProps
  | SelectFieldProps
  | FileFieldProps
  | TagsFieldProps
  | DateFieldProps;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInputClass(
  touched: boolean | undefined,
  error: string | undefined,
  extra?: string,
): string {
  const classes = [styles.input];
  if (extra) classes.push(extra);
  if (touched && error) classes.push(styles.error);
  else if (touched && !error) classes.push(styles.valid);
  return classes.join(" ");
}

// ---------------------------------------------------------------------------
// FormField Component
// ---------------------------------------------------------------------------

export const FormField: React.FC<FormFieldProps> = (props) => {
  const { name, label, helperText, error, touched, required, disabled } = props;

  // Password visibility toggle state
  const [showPassword, setShowPassword] = useState(false);

  const fieldId = `field-${name}`;
  const errorId = `error-${name}`;
  const helperId = `help-${name}`;

  const ariaDescribedBy =
    [helperText ? helperId : null, error && touched ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  // ── Label ────────────────────────────────────────────────────────────────
  const LabelEl = (
    <label htmlFor={fieldId} className={styles.label}>
      {label}
      {required && (
        <span className={styles.requiredMark} aria-hidden="true">
          *
        </span>
      )}
    </label>
  );

  // ── Error / Helper message ───────────────────────────────────────────────
  const MessageEl =
    error && touched ? (
      <span id={errorId} className={styles.errorMsg} role="alert">
        <ErrorIcon />
        {error}
      </span>
    ) : helperText && !(error && touched) ? (
      <span id={helperId} className={styles.helperText}>
        {helperText}
      </span>
    ) : null;

  // ── Render by type ───────────────────────────────────────────────────────

  if (props.type === "select") {
    return (
      <div className={styles.field}>
        {LabelEl}
        <Select
          placeholder={props.placeholder}
          onChange={props.onChange} // (value: string) => void ✅
          onBlur={props.onBlur} // () => void ✅
          options={props.options}
          value={props.value}
          disabled={disabled}
          touched={touched}
          error={!!error}
          id={fieldId}
        />
        {MessageEl}
      </div>
    );
  }

  if (props.type === "tags") {
    return (
      <div className={styles.field}>
        {LabelEl}
        <TagsInput
          placeholder={props.placeholder}
          onChange={props.onChange}
          onBlur={props.onBlur}
          value={props.value}
          disabled={disabled}
          touched={touched}
          error={!!error}
          id={fieldId}
        />
        {/* Keyboard hint — shown only when no error and not yet touched */}
        {!error && (
          <div className={styles.tagsHint}>
            <span>
              Press <kbd className={styles.kbd}>Enter</kbd>
              {" or "}
              <kbd className={styles.kbd}>,</kbd> to add ·{" "}
              <kbd className={styles.kbd}>⌫</kbd> to remove last
            </span>
          </div>
        )}
        {MessageEl}
      </div>
    );
  }

  if (props.type === "date") {
    return (
      <div className={styles.field}>
        {LabelEl}
        <DatePicker
          placeholder={props.placeholder}
          onChange={props.onChange}
          maxDate={props.maxDate}
          minDate={props.minDate}
          onBlur={props.onBlur}
          disabled={disabled}
          value={props.value}
          touched={touched}
          error={!!error}
          id={fieldId}
        />
        {MessageEl}
      </div>
    );
  }

  if (props.type === "file") {
    return (
      <div className={styles.field}>
        {LabelEl}
        <div className={styles.fileWrapper}>
          <input
            id={fieldId}
            type="file"
            name={name}
            accept={props.accept}
            onChange={props.onChange}
            onBlur={props.onBlur}
            disabled={disabled}
            aria-invalid={!!(touched && error)}
            aria-describedby={ariaDescribedBy}
            className={[
              styles.fileInput,
              touched && error ? styles.error : "",
              touched && !error ? styles.valid : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        </div>
        {MessageEl}
      </div>
    );
  }

  if (props.type === "password") {
    return (
      <div className={styles.field}>
        {LabelEl}
        <div className={styles.inputWrapper}>
          <input
            className={getInputClass(touched, error, styles.hasToggle)}
            aria-describedby={ariaDescribedBy}
            type={showPassword ? "text" : "password"}
            aria-invalid={!!(touched && error)}
            autoComplete={props.autoComplete}
            placeholder={props.placeholder}
            onChange={props.onChange}
            onBlur={props.onBlur}
            value={props.value}
            disabled={disabled}
            id={fieldId}
            name={name}
          />
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            className={styles.toggleBtn}
            type="button"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {MessageEl}
      </div>
    );
  }

  // Default: text, email, tel, url, number
  return (
    <div className={styles.field}>
      {LabelEl}
      <div className={styles.inputWrapper}>
        <input
          aria-describedby={ariaDescribedBy}
          className={getInputClass(touched, error)}
          aria-invalid={!!(touched && error)}
          autoComplete={props.autoComplete}
          placeholder={props.placeholder}
          onChange={props.onChange}
          onBlur={props.onBlur}
          value={props.value}
          disabled={disabled}
          type={props.type}
          id={fieldId}
          name={name}
        />
      </div>
      {MessageEl}
    </div>
  );
};

export default FormField;
