/**
 * @file src/pages/home-page/who-can-register/who-can-register.data.ts
 */

export interface WhoCanRegisterItem {
  readonly image: string;
  readonly title: string;
  readonly desc: string;
  readonly id: number;
}

export const WhoCanRegisterItems = [
  {
    id: 1,
    image: "who-can-register-01.webp",
    title: "Young graduates",
    desc: "Computer science graduates? Discover opportunities to launch your career.",
  },
  {
    id: 2,
    image: "who-can-register-02.jpg",
    title: "Unemployed",
    desc: "Access IT opportunities with our network of partner companies.",
  },
  {
    id: 3,
    image: "who-can-register-03.webp",
    title: "Interns",
    desc: "Computer science students, find the ideal internship to validate your skills.",
  },
] as const satisfies readonly WhoCanRegisterItem[];
