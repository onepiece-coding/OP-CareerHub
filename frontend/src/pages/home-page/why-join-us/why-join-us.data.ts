/**
 * @file src/pages/home-page/why-join-us-section/why-join-us.data.ts
 */

import {
  BriefcaseIcon,
  CursorArrowRippleIcon,
  DocumentMagnifyingGlassIcon,
  UsersIcon,
} from "@/components/icons";

export interface WhyJoinUsItem {
  readonly Icon: React.ComponentType;
  readonly title: string;
  readonly desc: string;
  readonly id: number;
}

export const WhyJoinUsItems = [
  {
    id: 1,
    Icon: BriefcaseIcon,
    title: "Career Support",
    desc: "Find opportunities that match your goals and experience.",
  },
  {
    id: 2,
    Icon: DocumentMagnifyingGlassIcon,
    title: "Growth Opportunities",
    desc: "Build your future with roles that help you learn and progress.",
  },
  {
    id: 3,
    Icon: CursorArrowRippleIcon,
    title: "Trusted by Recruiters",
    desc: "Connect with reliable employers and real job offers.",
  },
  {
    id: 4,
    Icon: UsersIcon,
    title: "Fast Hiring Process",
    desc: "Apply quickly and move forward without delay.",
  },
] as const satisfies readonly WhyJoinUsItem[];
