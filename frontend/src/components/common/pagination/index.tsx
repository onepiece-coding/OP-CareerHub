/**
 * @file src/components/common/pagination/index.tsx
 */

import type { CSSProperties } from "react";
import { Button } from "@/components/ui";

import styles from "./styles.module.css";

interface PaginationProps {
  handlePageChange: (newPage: number) => void;
  style?: CSSProperties;
  totalPages: number;
  pageNumber: number;
}

const Pagination = ({
  handlePageChange,
  totalPages,
  pageNumber,
  style,
}: PaginationProps) => {
  const nextPage = () => {
    if (pageNumber < totalPages) handlePageChange(pageNumber + 1);
  };

  const prevPage = () => {
    if (pageNumber > 1) handlePageChange(pageNumber - 1);
  };

  return (
    <div className={styles.row} style={style}>
      <Button onClick={prevPage} disabled={pageNumber === 1}>
        Prev
      </Button>
      <span>
        page {pageNumber} of {totalPages}
      </span>
      <Button onClick={nextPage} disabled={pageNumber === totalPages}>
        Next
      </Button>
    </div>
  );
};

export default Pagination;
