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
    desc: "Start your career with opportunities designed to help you gain experience and build your future.",
  },
  {
    id: 2,
    image: "who-can-register-02.webp",
    title: "Unemployed",
    desc: "Explore new job openings and connect with employers looking for motivated candidates.",
  },
  {
    id: 3,
    image: "who-can-register-03.webp",
    title: "Interns",
    desc: "Find internship opportunities to learn, grow, and move closer to a full-time role.",
  },
] as const satisfies readonly WhoCanRegisterItem[];
