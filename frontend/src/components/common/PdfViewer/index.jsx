// src/components/common/PdfViewer.jsx
import { useState } from "react";
import { Document, Page } from "react-pdf";

export default function PdfViewer({ url, scale = 1.0 }) {
  const [numPages, setNumPages] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <div className="pdf-viewer">
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<div>Loading CV…</div>}
        error={<div>Failed to load CV</div>}
      >
        {Array.from(new Array(numPages), (_, i) => (
          <Page
            key={`page_${i + 1}`}
            pageNumber={i + 1}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        ))}
      </Document>
    </div>
  );
}
