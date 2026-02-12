import z from "zod";

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .trim()
    .nonempty({ message: "Le mot de passe est requis!" }),
});
