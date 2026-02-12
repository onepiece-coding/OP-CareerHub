import { pdfjs } from "react-pdf";

// Point PDF.js at its worker (web worker)
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;

// react-pdf depends on mozilla's pdf.js under the hood
