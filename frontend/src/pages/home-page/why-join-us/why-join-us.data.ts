/**
 * @file src/pages/home-page/why-join-us-section/why-join-us.data.ts
 */

import { MdCastForEducation } from "react-icons/md";
import { FaBusinessTime } from "react-icons/fa";
import { TbTargetArrow } from "react-icons/tb";
import { GiTeamIdea } from "react-icons/gi";

export interface WhyJoinUsItem {
  readonly Icon: React.ComponentType;
  readonly title: string;
  readonly desc: string;
  readonly id: number;
}

export const WhyJoinUsItems = [
  {
    id: 1,
    Icon: FaBusinessTime,
    title: "Growth opportunities",
    desc: "Develop your skills and grow with us.",
  },
  {
    id: 2,
    Icon: MdCastForEducation,
    title: "Continuing education",
    desc: "Access training courses and certifications.",
  },
  {
    id: 3,
    Icon: TbTargetArrow,
    title: "Company values",
    desc: "We champion innovation, respect, and excellence.",
  },
  {
    id: 4,
    Icon: GiTeamIdea,
    title: "Dynamic team",
    desc: "Work with passionate experts, Lorem and lorem.",
  },
] as const satisfies readonly WhyJoinUsItem[];
