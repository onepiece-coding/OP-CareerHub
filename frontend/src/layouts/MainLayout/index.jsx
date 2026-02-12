import { Footer, Header } from "../../components/common";
import { Outlet, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Chatbot } from "../../components/chatbot";
import { ThemeConfig } from "flowbite-react";

const MainLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/"; // ou "/accueil" selon ta route

  return (
    <div className="flex flex-col min-h-screen">
      <ThemeConfig dark={true} />
      <ToastContainer position="top-center" theme="colored" autoClose={3000} />
      <Chatbot />
      <Header />
      <main className="flex-grow bg-white dark:bg-gray-900">
        <Outlet />
      </main>
      {isHomePage && <Footer />}
    </div>
  );
};

export default MainLayout;