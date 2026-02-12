import { FaBusinessTime } from "react-icons/fa";
import { RiPlayListAddLine, RiAdminFill } from "react-icons/ri";
import { IoNotificationsSharp, IoStatsChart } from "react-icons/io5";
import { HiUser } from "react-icons/hi";
import { MdManageAccounts } from "react-icons/md";
import { HiUserGroup } from "react-icons/hi2";

export const userLinks = [
  {
    path: "/dashboard",
    icon: HiUser,
    label: "Profil",
  },
  {
    path: "/dashboard/my-jobs",
    icon: FaBusinessTime,
    label: "candidats",
  },
  {
    path: "/dashboard/notifications",
    icon: IoNotificationsSharp,
    label: "Notifications",
  },
];

export const recruiterLinks = [
  {
    path: "/dashboard",
    icon: HiUser,
    label: "Profil",
  },
  {
    path: "/dashboard/add-job",
    icon: RiPlayListAddLine,
    label: "Ajouter un emploi",
  },
  {
    path: "/dashboard/manage-jobs",
    icon: MdManageAccounts,
    label: "Gérer les emplois",
  },
  {
    path: "/dashboard/my-jobs",
    icon: FaBusinessTime,
    label: "candidats",
  },
  {
    path: "/dashboard/notifications",
    icon: IoNotificationsSharp,
    label: "Notifications",
  },
];

export const adminLinks = [
  {
    path: "/dashboard",
    icon: HiUser,
    label: "Profil",
  },
  // {
  //   path: "/dashboard/stats",
  //   icon: IoStatsChart,
  //   label: "Statistiques",
  // },
  {
    path: "/dashboard/admin",
    icon: RiAdminFill,
    label: "Administrateur",
  },
  {
    path: "/dashboard/manage-users",
    icon: HiUserGroup,
    label: "Gérer les utilisateurs",
  },
];
