/**
 * @file src/pages/home-page/how-does-it-work/how-does-it-work.data.ts
 */

import { CiSearch, CiMedal, CiLogin } from "react-icons/ci";
import { FiUserCheck } from "react-icons/fi";

export interface HowDoesItWorkItem {
  readonly Icon: React.ComponentType;
  readonly title: string;
  readonly desc: string;
  readonly id: number;
}

export const HowDoesItWorkItems = [
  {
    id: 1,
    Icon: CiSearch,
    title: "Search for a position",
    desc: "Explore our offers available now. Lorem ipsum",
  },
  {
    id: 2,
    Icon: CiLogin,
    title: "Apply online",
    desc: "Complete your application in just a few clicks.",
  },
  {
    id: 3,
    Icon: FiUserCheck,
    title: "Take an interview",
    desc: "If your profile matches, we will contact you.",
  },
  {
    id: 4,
    Icon: CiMedal,
    title: "Join us!",
    desc: "Congratulations, you're part of the team!",
  },
] as const satisfies readonly HowDoesItWorkItem[];
