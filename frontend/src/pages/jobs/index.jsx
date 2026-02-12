import { Pagination } from "../../components/common";
import { useJobsContext } from "../../hooks/useJobsContext";
import { FilterAndSearch, JobsList } from "../../components/jobs";

const Jobs = () => {
  const { pagination, currentPage, fetchJobs } = useJobsContext();

  return (
    <section className="py-4 px-2 sm:px-4">
      <FilterAndSearch />
      <JobsList />
      <Pagination
        totalPages={pagination.totalPages}
        currentPage={currentPage}
        fetchMethod={fetchJobs}
      />
    </section>
  );
};

export default Jobs;
