import { useContext } from "react";
import { ProfileContext } from "../contexts";

export function useProfileContext() {
  return useContext(ProfileContext);
}
