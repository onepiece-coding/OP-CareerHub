/**
 * @file src/pages/home-page/hero-section/hero.data.ts
 */

export interface HeroItem {
  readonly subHeading: string;
  readonly heading: string;
  readonly desc: string;
  readonly id: number;
}

export const HeroItems = [
  {
    id: 1,
    heading: "Welcome to CareerHub",
    subHeading: "Join our team and advance your career.",
    desc: "Discover our job opportunities and apply in just a few clicks.",
  },
  {
    id: 2,
    heading: "Find Your Ideal Job",
    subHeading: "Thousands of Opportunities Await You",
    desc: "Browse our database of job offers and find the one that matches your skills.",
  },
  {
    id: 3,
    heading: "Your Future Starts Here",
    subHeading: "Opportunities for All Profiles",
    desc: "Whether you are a beginner or an expert, find the job that suits you.",
  },
] as const satisfies readonly HeroItem[];
