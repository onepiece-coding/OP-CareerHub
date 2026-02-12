import z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .nonempty({ message: "L'email est obligatoire!" })
    .email({ message: "E-mail invalide!" }),
  password: z
    .string()
    .trim()
    .nonempty({ message: "Le mot de passe est requis!" }),
});
