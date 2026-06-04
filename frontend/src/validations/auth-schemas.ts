/**
 * @file src/validations/auth-schemas.ts
 */

import { rules, type ValidationSchema } from "@/lib/validation";
import { EMAIL_REGEX } from "@/lib/constants";

export type RegisterValues = {
  confirmPassword: string;
  username: string;
  password: string;
  email: string;
};

export type LoginValues = {
  password: string;
  email: string;
};

export const registerSchema: ValidationSchema<RegisterValues> = {
  username: [
    rules.required("Username is required."),
    rules.minLength(2, "Must be at least 2 characters."),
    rules.maxLength(100),
  ],
  email: [
    rules.required("Email address is required."),
    rules.pattern(EMAIL_REGEX, "Please enter a valid email address."),
  ],
  password: [
    rules.required("Password is required."),
    rules.minLength(8, "Password must be at least 8 characters."),
    rules.pattern(/(?=.*[A-Z])/, "Must contain at least one uppercase letter."),
    rules.pattern(/(?=.*[0-9])/, "Must contain at least one number."),
  ],
  confirmPassword: [
    rules.required("Please confirm your password."),
    rules.match("password", "Passwords do not match."),
  ],
};

export const loginSchema: ValidationSchema<LoginValues> = {
  email: [
    rules.required("Email address is required."),
    rules.pattern(EMAIL_REGEX, "Please enter a valid email address."),
  ],
  password: [rules.required("Password is required.")],
};
