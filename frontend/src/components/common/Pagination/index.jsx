import { Pagination as FlowbitePagination } from "flowbite-react";
import { memo, useCallback } from "react";

const customTheme = {
  pages: {
    previous: {
      base: "cursor-pointer",
    },
    next: {
      base: "cursor-pointer",
    },
    selector: {
      base: "cursor-pointer",
    },
  },
};

const Pagination = memo(({ totalPages, currentPage, fetchMethod }) => {
  const handlePageChange = useCallback(
    (page) => {
      fetchMethod(page);
    },
    [fetchMethod]
  );

  if (totalPages > 1) {
    return (
      <div className="mt-2 flex overflow-x-auto justify-center">
        <FlowbitePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          theme={customTheme}
          previousLabel="précédente"
          nextLabel="suivante"
        />
      </div>
    );
  } else {
    return null;
  }
});

export default Pagination;
