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
    title: "Growth opportunities",
    desc: "Develop your skills and grow with us.",
  },
  {
    id: 2,
    Icon: DocumentMagnifyingGlassIcon,
    title: "Continuing education",
    desc: "Access training courses and certifications.",
  },
  {
    id: 3,
    Icon: CursorArrowRippleIcon,
    title: "Company values",
    desc: "We champion innovation, respect, and excellence.",
  },
  {
    id: 4,
    Icon: UsersIcon,
    title: "Dynamic team",
    desc: "Work with passionate experts, Lorem and lorem.",
  },
] as const satisfies readonly WhyJoinUsItem[];
