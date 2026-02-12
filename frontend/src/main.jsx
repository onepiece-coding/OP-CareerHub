import { createRoot } from "react-dom/client";
import AppRouter from "./routes/AppRouter";
import ProfileProvider from "./contexts/ProfileProvider";
import "./utils/pdfWorkerSetup";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <ProfileProvider>
    <AppRouter />
  </ProfileProvider>
);
