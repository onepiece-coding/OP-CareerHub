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
    desc: "Browse available jobs and find the role that fits your skills and goals.",
  },
  {
    id: 2,
    Icon: ArrowRightEndOnRectangleIcon,
    title: "Apply online",
    desc: "Submit your application in just a few clicks, quickly and easily.",
  },
  {
    id: 3,
    Icon: UserPlusIcon,
    title: "Take an interview",
    desc: "Meet with recruiters and showcase your experience and potential.",
  },
  {
    id: 4,
    Icon: CheckCircleIcon,
    title: "Join us!",
    desc: "Get selected, start your journey, and grow with the right opportunity.",
  },
] as const satisfies readonly HowDoesItWorkItem[];
