import { useContext } from "react";
import { PdfViewerContext } from "../contexts";

export function usePdfViewerContext() {
  return useContext(PdfViewerContext);
}
