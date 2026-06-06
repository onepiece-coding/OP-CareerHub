/**
 * @file src/pages/home-page/how-does-it-work/how-does-it-work.data.ts
 */

import {
  ArrowRightEndOnRectangleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
} from "@/components/icons";

export interface HowDoesItWorkItem {
  readonly Icon: React.ComponentType;
  readonly title: string;
  readonly desc: string;
  readonly id: number;
}

export const HowDoesItWorkItems = [
  {
    id: 1,
    Icon: MagnifyingGlassIcon,
    title: "Search for a position",
    desc: "Explore our offers available now. Lorem ipsum",
  },
  {
    id: 2,
    Icon: ArrowRightEndOnRectangleIcon,
    title: "Apply online",
    desc: "Complete your application in just a few clicks.",
  },
  {
    id: 3,
    Icon: UserPlusIcon,
    title: "Take an interview",
    desc: "If your profile matches, we will contact you.",
  },
  {
    id: 4,
    Icon: CheckCircleIcon,
    title: "Join us!",
    desc: "Congratulations, you're part of the team!",
  },
] as const satisfies readonly HowDoesItWorkItem[];
