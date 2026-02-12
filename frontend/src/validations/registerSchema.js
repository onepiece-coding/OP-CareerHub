import z from "zod";

export const registerSchema = z.object({
  username: z.string().trim().nonempty({ message: "Username is required!" }),
  email: z
    .string()
    .trim()
    .nonempty({ message: "L'email est obligatoire!" })
    .email({ message: "E-mail invalide!" }),
  password: z
    .string()
    .trim()
    .nonempty({ message: "Le mot de passe est requis!" })
    .min(8, { message: "Le mot de passe est trop court (min 8)" }),
});
