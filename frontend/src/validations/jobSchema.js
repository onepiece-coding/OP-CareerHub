import z from "zod";

export const jobSchema = z.object({
  company: z
    .string()
    .trim()
    .nonempty({ message: "Le poste doit avoir une entreprise!" }),
  position: z
    .string()
    .trim()
    .nonempty({ message: "Le poste doit avoir un poste!" }),
  jobLocation: z
    .string()
    .trim()
    .nonempty({ message: "Le lieu de travail est requis!" }),
  jobStatus: z.enum(["en attente", "entretien", "refusé"], {
    message: "Statut d'emploi invalide",
  }),
  jobType: z.enum(["à temps plein", "à temps partiel", "stage"], { 
    message: "Type de travail invalide",
  }),
  jobVacancy: z
    .string()
    .trim()
    .nonempty({ message: "Offre d'emploi requise!" }),
  jobSalary: z
    .string()
    .trim()
    .nonempty({ message: "Le salaire du poste est requis!" }),
  jobContact: z
    .string()
    .trim()
    .nonempty({ message: "Un contact d'emploi est requis!" })
    .email(),
  jobDescription: z
    .string()
    .trim()
    .nonempty({ message: "Une description de poste est requise!" }),
});
