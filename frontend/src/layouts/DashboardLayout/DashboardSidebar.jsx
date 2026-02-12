"use client";

import { useState } from "react";
import {
  Sidebar,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
} from "flowbite-react";
import { Link, useLocation } from "react-router-dom";
import { useProfileContext } from "../../hooks/useProfileContext";
import { adminLinks, recruiterLinks, userLinks } from "../../constants";
import { HiMenu } from "react-icons/hi";

const DashboardSidebar = () => {
  const { user } = useProfileContext();
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  const links =
    user?.role === "admin"
      ? adminLinks
      : user?.role === "recruiter"
      ? recruiterLinks
      : user?.role === "user"
      ? userLinks
      : [];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        className={`transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        } bg-gray-900 shadow-xl`}
        theme={{
          root: {
            base: "border-none",
            inner: "bg-gray-800",
          },
          item: {
            base: "text-white hover:text-blue-400", // Changer ici la couleur du texte au survol vers le bleu
            active: "bg-blue-600 text-white", // Bleu quand actif
            content: {
              base: "flex items-center rounded-lg p-2 text-base font-medium",
            },
            icon: {
              base: "text-blue hover:text-blue-500", // Icônes blanches qui deviennent bleues au survol
              active: "text-white",
            },
          },
        }}
      >
        {/* Toggle hamburger */}
        <div className="flex justify-end p-2">
          <button
            onClick={toggleSidebar}
            className="p-2 text-white hover:text-blue-300 focus:outline-none"
          >
            <HiMenu className="w-6 h-6" />
          </button>
        </div>

        <SidebarItems>
          <SidebarItemGroup>
            {links.map((link) => (
              <SidebarItem
                key={link.label}
                as={Link}
                to={link.path}
                icon={link.icon}
                active={location.pathname === link.path}
              >
                {!collapsed && link.label}
              </SidebarItem>
            ))}
          </SidebarItemGroup>
        </SidebarItems>
      </Sidebar>

      {/* Contenu principal */}
      <div className="flex-1 p-6 bg-gray-100 overflow-auto">
        {/* Ton contenu ici */}
      </div>
    </div>
  );
};

export default DashboardSidebar;
