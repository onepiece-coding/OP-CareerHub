/**
 * @file src/validations/password-schemas.ts
 */

import { rules, type ValidationSchema } from "@/lib/validation";
import { EMAIL_REGEX } from "@/lib/constants";

export type SendResetPasswordLinkValues = {
  email: string;
};

export type ResetPasswordValues = {
  confirmPassword: string;
  password: string;
};

export const SendResetPasswordLinkSchema: ValidationSchema<SendResetPasswordLinkValues> =
  {
    email: [
      rules.required("Email address is required."),
      rules.pattern(EMAIL_REGEX, "Please enter a valid email address."),
    ],
  };

export const resetPasswordSchema: ValidationSchema<ResetPasswordValues> = {
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
