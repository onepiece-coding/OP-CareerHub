/**
 * @file src/validations/users-schemas.ts
 */

import { rules, type ValidationSchema } from "@/lib/validation";

export type UpdateUserProfileValues = {
  username: string;
  location: string;
  gender: string;
};

export const updateUserProfileSchema: ValidationSchema<UpdateUserProfileValues> =
  {
    username: [
      rules.optional(),
      rules.minLength(2, "Must be at least 2 characters."),
      rules.maxLength(100),
    ],
    location: [
      rules.optional(),
      rules.minLength(6, "Location Should be (country, city, street)."),
      rules.maxLength(250, "Location too long."),
    ],
    gender: [
      rules.optional(),
      rules.enum(["male", "female"] as const, "Invalid selection."),
    ],
  };
