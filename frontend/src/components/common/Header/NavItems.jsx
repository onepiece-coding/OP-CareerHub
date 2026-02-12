import { NavbarCollapse, NavbarLink } from "flowbite-react";
import { Link, useLocation } from "react-router-dom";

const NavItems = ({ status }) => {
  const location = useLocation();

  // Configuration des icônes et liens
  const navItems = [
    {
      path: "/",
      name: "Accueil",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      hoverBg: false // Pas de fond au survol pour Accueil
    },
    {
      path: "/jobs",
      name: "Trouver un emploi",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      hoverBg: true // Fond au survol pour les autres
    },
    ...(status ? [{
      path: "/dashboard",
      name: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      hoverBg: true
    }] : [])
  ];

  return (
    <NavbarCollapse className="bg-gray-50 md:bg-transparent rounded-lg md:rounded-none shadow-sm md:shadow-none p-4 md:p-0 space-y-2 md:space-y-0 md:space-x-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path; // Vérifie l'égalité exacte

        return (
          <NavbarLink
            key={item.path}
            as={Link}
            to={item.path}
            active={isActive}
            className={`
              flex items-center
              ${isActive ? 'bg-orange-500 text-white' : 'text-blue-600'}
              hover:text-orange-600
              font-semibold
              text-base
              px-3 py-2
              rounded-md
              transition-all duration-200
              ${item.hoverBg ? 'hover:bg-orange-100' : ''}
            `}
          >
            <span className="mr-2 flex-shrink-0">
              {item.icon}
            </span>
            {item.name}
          </NavbarLink>
        );
      })}
    </NavbarCollapse>
  );
};

export default NavItems;
