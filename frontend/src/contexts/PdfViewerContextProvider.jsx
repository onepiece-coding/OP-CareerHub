import { useCallback, useState } from "react";
import { PdfViewerContext } from ".";
import PdfViewer from "../components/common/PdfViewer";

const PdfViewerContextProvider = ({ children }) => {
  const [state, setState] = useState({
    showPreview: false,
    resumeURL: null,
  });

  const setShowPreview = useCallback((showPreview, resumeURL) => {
    setState({ showPreview, resumeURL });
  }, []);

  return (
    <PdfViewerContext.Provider value={{ setShowPreview }}>
      {children}
      {state.showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-h-full overflow-auto p-4 rounded-lg">
            <button
              onClick={() => setShowPreview(false, null)}
              className="mb-4 text-red-600"
            >
              Close
            </button>
            <PdfViewer url={state.resumeURL} scale={1.2} />
          </div>
        </div>
      )}
    </PdfViewerContext.Provider>
  );
};

export default PdfViewerContextProvider;
