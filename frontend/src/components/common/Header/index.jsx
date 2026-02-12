import { Button, Navbar, NavbarToggle } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import { useProfileContext } from "../../../hooks/useProfileContext";
import NavItems from "./NavItems";
import Logo from "../../../assets/logo.gif";

const Header = () => {
  const navigate = useNavigate();
  const { userStatus, handleLogOut, user } = useProfileContext();

  return (
    <Navbar
      fluid
      className="bg-gray-200 shadow-lg shadow-gray-300/50"
    >
      <Link to={"/"}>
        <img
          src={Logo}
          alt="Logo"
          width={150}
          className="py-2 transition-transform duration-200 hover:scale-105"
        />
      </Link>
      
      <div className="flex md:order-2 gap-3 items-center">
        {!userStatus.status ? (
          <>
            <Button
              as={Link}
              to={"/register"}  // Lien vers la page d'inscription
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 shadow-md shadow-blue-200/50 hover:shadow-lg hover:shadow-blue-300/50 transition-all duration-200 mr-2"
            >
              <svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                ></path>
              </svg>
              S'inscrire
            </Button>
            
            <Button
              as={Link}
              to={"/login"}
              className="flex items-center bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg px-4 py-2 shadow-md shadow-orange-200/50 hover:shadow-lg hover:shadow-orange-300/50 transition-all duration-200"
            >
              <svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                ></path>
              </svg>
              Se connecter
            </Button>
          </>
        ) : (
          <>
            <div className="hidden md:flex items-center gap-3 mr-2">
              <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full shadow-sm">
                Bienvenue, {user?.name || user?.username || "Utilisateur"}
              </span>
            </div>
            <Button
              className="flex items-center bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg px-4 py-2 shadow-md shadow-orange-200/50 hover:shadow-lg hover:shadow-orange-300/50 transition-all duration-200"
              onClick={() => {
                handleLogOut();
                navigate("/");
              }}
            >
              <svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                ></path>
              </svg>
              Déconnexion
            </Button>
          </>
        )}
        <NavbarToggle className="text-gray-600 hover:text-orange-500 focus:ring-orange-200 hover:bg-gray-300 rounded-md p-2 transition-colors duration-200" />
      </div>
      
      <NavItems status={userStatus.status} />
    </Navbar>
  );
};

export default Header;