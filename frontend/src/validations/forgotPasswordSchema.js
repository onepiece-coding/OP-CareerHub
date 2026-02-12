import z from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .nonempty({ message: "L'email est obligatoire!" })
    .email({ message: "E-mail invalide" }),
});
