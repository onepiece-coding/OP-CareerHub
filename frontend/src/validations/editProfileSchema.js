import z from "zod";

export const editProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .nonempty({ message: "Le nom d'utilisateur est requis!" }),
  location: z
    .string()
    .trim()
    .nonempty({ message: "L'emplacement est requis!" }),
  gender: z.string().trim().nonempty({ message: "Le genre est obligatoire!" }),
  pdf: z.any().optional(),
});
