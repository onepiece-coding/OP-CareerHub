/**
 * @file src/lib/validation.ts
 */

import { formatDateDisplay } from "./utils";

// ---------------------------------------------------------------------------
// Rule Definitions
// ---------------------------------------------------------------------------

export interface RequiredRule {
  type: "required";
  message?: string;
}

export interface MinLengthRule {
  type: "minLength";
  value: number;
  message?: string;
}

export interface MaxLengthRule {
  type: "maxLength";
  value: number;
  message?: string;
}

export interface PatternRule {
  type: "pattern";
  value: RegExp;
  message?: string;
}

export interface FileSizeRule {
  type: "fileSize";
  /** Maximum size in bytes */
  maxBytes: number;
  message?: string;
}

export interface FileTypeRule {
  type: "fileType";
  /** Allowed MIME types, e.g. ["image/jpeg", "image/png"] */
  allowedTypes: string[];
  message?: string;
}

export interface MatchRule {
  type: "match";
  /** The name of the sibling field this field must match */
  fieldName: string;
  message?: string;
}

export interface EnumRule {
  type: "enum";
  allowedValues: readonly string[];
  message?: string;
}

export interface OptionalRule {
  type: "optional";
}

export interface CustomRule<TValues = Record<string, unknown>> {
  type: "custom";
  /** Return an error string on failure, or null/undefined on success */
  validate: (value: unknown, allValues: TValues) => string | null | undefined;
}

export interface MinTagsRule {
  message?: string;
  type: "minTags";
  value: number;
}

export interface MaxTagsRule {
  message?: string;
  type: "maxTags";
  value: number;
}

// New rule interfaces
export interface MinDateRule {
  value: string; // ISO "YYYY-MM-DD"
  message?: string;
  type: "minDate";
}

export interface MaxDateRule {
  value: string; // ISO "YYYY-MM-DD"
  message?: string;
  type: "maxDate";
}

export type ValidationRule<TValues = Record<string, unknown>> =
  | RequiredRule
  | MinLengthRule
  | MaxLengthRule
  | PatternRule
  | FileSizeRule
  | FileTypeRule
  | MatchRule
  | EnumRule
  | OptionalRule
  | MinTagsRule
  | MaxTagsRule
  | MinDateRule
  | MaxDateRule
  | CustomRule<TValues>;

// ---------------------------------------------------------------------------
// Schema Type
// ---------------------------------------------------------------------------

/**
 * A map from field name to an ordered array of validation rules.
 * Rules are evaluated in order; the first failure short-circuits the rest.
 */
export type ValidationSchema<TValues extends Record<string, unknown>> = {
  [K in keyof TValues]?: ValidationRule<TValues>[];
};

// ---------------------------------------------------------------------------
// Errors Type
// ---------------------------------------------------------------------------

export type FormErrors<TValues extends Record<string, unknown>> = Partial<
  Record<keyof TValues, string>
>;

// ---------------------------------------------------------------------------
// Built-in Rule Validators
// ---------------------------------------------------------------------------

function validateRequired(value: unknown, rule: RequiredRule): string | null {
  const isEmpty =
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (value instanceof FileList && value.length === 0) ||
    (Array.isArray(value) && value.length === 0);

  if (isEmpty) {
    return rule.message ?? "This field is required.";
  }
  return null;
}

function validateMinLength(value: unknown, rule: MinLengthRule): string | null {
  if (typeof value !== "string") return null;
  if (value.length < rule.value) {
    return rule.message ?? `Must be at least ${rule.value} characters.`;
  }
  return null;
}

function validateMaxLength(value: unknown, rule: MaxLengthRule): string | null {
  if (typeof value !== "string") return null;
  if (value.length > rule.value) {
    return rule.message ?? `Must be no more than ${rule.value} characters.`;
  }
  return null;
}

function validatePattern(value: unknown, rule: PatternRule): string | null {
  if (typeof value !== "string" || value === "") return null;
  if (!rule.value.test(value)) {
    return rule.message ?? "Invalid format.";
  }
  return null;
}

function validateFileSize(value: unknown, rule: FileSizeRule): string | null {
  if (!(value instanceof FileList) || value.length === 0) return null;
  const file = value[0];
  if (file.size > rule.maxBytes) {
    const maxMB = (rule.maxBytes / (1024 * 1024)).toFixed(1);
    return rule.message ?? `File must be smaller than ${maxMB} MB.`;
  }
  return null;
}

function validateFileType(value: unknown, rule: FileTypeRule): string | null {
  if (!(value instanceof FileList) || value.length === 0) return null;
  const file = value[0];
  if (!rule.allowedTypes.includes(file.type)) {
    return (
      rule.message ?? `Allowed file types: ${rule.allowedTypes.join(", ")}.`
    );
  }
  return null;
}

function validateMatch<TValues extends Record<string, unknown>>(
  value: unknown,
  rule: MatchRule,
  allValues: TValues,
): string | null {
  const sibling = allValues[rule.fieldName];
  if (value !== sibling) {
    return rule.message ?? `Must match the ${rule.fieldName} field.`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Core `validateField` — runs a single field's rules
// ---------------------------------------------------------------------------

export function validateField<TValues extends Record<string, unknown>>(
  value: unknown,
  rules: ValidationRule<TValues>[],
  allValues: TValues,
): string | null {
  const isEmpty =
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (value instanceof FileList && value.length === 0);

  // If the field is marked optional and currently empty, skip all rules
  const isOptional = rules.some((r) => r.type === "optional");
  if (isOptional && isEmpty) return null;

  for (const rule of rules) {
    let error: string | null = null;

    switch (rule.type) {
      case "required":
        error = validateRequired(value, rule);
        break;
      case "minLength":
        error = validateMinLength(value, rule);
        break;
      case "maxLength":
        error = validateMaxLength(value, rule);
        break;
      case "pattern":
        error = validatePattern(value, rule);
        break;
      case "fileSize":
        error = validateFileSize(value, rule);
        break;
      case "fileType":
        error = validateFileType(value, rule);
        break;
      case "match":
        error = validateMatch(value, rule, allValues);
        break;
      case "custom":
        error = rule.validate(value, allValues) ?? null;
        break;
      case "enum":
        if (typeof value === "string" && value !== "") {
          if (!rule.allowedValues.includes(value)) {
            error =
              rule.message ??
              `Must be one of: ${rule.allowedValues.join(", ")}.`;
          }
        }
        break;
      case "minTags":
        if (Array.isArray(value) && value.length < rule.value) {
          error =
            rule.message ??
            `Add at least ${rule.value} tag${rule.value !== 1 ? "s" : ""}.`;
        }
        break;
      case "maxTags":
        if (Array.isArray(value) && value.length > rule.value) {
          error =
            rule.message ??
            `No more than ${rule.value} tag${rule.value !== 1 ? "s" : ""}.`;
        }
        break;
      case "minDate":
        if (typeof value === "string" && value !== "" && value < rule.value) {
          error =
            rule.message ??
            `Date must be on or after ${formatDateDisplay(rule.value)}.`;
        }
        break;
      case "maxDate":
        if (typeof value === "string" && value !== "" && value > rule.value) {
          error =
            rule.message ??
            `Date must be on or before ${formatDateDisplay(rule.value)}.`;
        }
        break;
    }

    if (error) return error; // short-circuit on first failure
  }
  return null;
}

// ---------------------------------------------------------------------------
// Core `validateForm` — validates every field in the schema
// ---------------------------------------------------------------------------

export function validateForm<TValues extends Record<string, unknown>>(
  values: TValues,
  schema: ValidationSchema<TValues>,
): FormErrors<TValues> {
  const errors: FormErrors<TValues> = {};

  for (const key in schema) {
    const fieldKey = key as keyof TValues;
    const rules = schema[fieldKey];
    if (!rules) continue;

    const error = validateField(values[fieldKey], rules, values);
    if (error) {
      errors[fieldKey] = error;
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Convenience rule factory helpers (optional, improves DX)
// ---------------------------------------------------------------------------

export const rules = {
  required: (message?: string): RequiredRule => ({
    type: "required",
    message,
  }),
  minLength: (value: number, message?: string): MinLengthRule => ({
    type: "minLength",
    value,
    message,
  }),
  maxLength: (value: number, message?: string): MaxLengthRule => ({
    type: "maxLength",
    value,
    message,
  }),
  pattern: (value: RegExp, message?: string): PatternRule => ({
    type: "pattern",
    value,
    message,
  }),
  fileSize: (maxBytes: number, message?: string): FileSizeRule => ({
    type: "fileSize",
    maxBytes,
    message,
  }),
  fileType: (allowedTypes: string[], message?: string): FileTypeRule => ({
    type: "fileType",
    allowedTypes,
    message,
  }),
  match: (fieldName: string, message?: string): MatchRule => ({
    type: "match",
    fieldName,
    message,
  }),
  enum: (allowedValues: readonly string[], message?: string): EnumRule => ({
    type: "enum",
    allowedValues,
    message,
  }),
  optional: (): OptionalRule => ({ type: "optional" }),
  custom: <TValues extends Record<string, unknown>>(
    validate: (value: unknown, allValues: TValues) => string | null | undefined,
  ): CustomRule<TValues> => ({
    type: "custom",
    validate,
  }),
  minTags: (value: number, message?: string): MinTagsRule => ({
    type: "minTags",
    value,
    message,
  }),
  maxTags: (value: number, message?: string): MaxTagsRule => ({
    type: "maxTags",
    value,
    message,
  }),
  minDate: (value: string, message?: string): MinDateRule => ({
    type: "minDate",
    value,
    message,
  }),
  maxDate: (value: string, message?: string): MaxDateRule => ({
    type: "maxDate",
    value,
    message,
  }),
};
