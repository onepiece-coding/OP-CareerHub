import { createContext } from "react";

export const ProfileContext = createContext({
  user: null,
  userStatus: {},
  loading: false,
  fetchProfile: () => {},
});

export const JobsContext = createContext(null);

export const PdfViewerContext = createContext(null);
