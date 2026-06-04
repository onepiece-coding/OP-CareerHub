/**
 * @file src/main.tsx
 */

import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";

import AppRouter from "./routes/app-router";

import "./styles/variables.css";
import "./styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <AppRouter />
  </Provider>,
);
