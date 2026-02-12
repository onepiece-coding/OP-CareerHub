import {
  JobApplicationStats,
  OverallStatistics,
} from "../../../components/dashboard";
import { Loading } from "../../../components/feedback";
import useStats from "./useStats";

const Stats = () => {
  const { state, setIsShowBarChart } = useStats();

  return (
    <Loading loading={state.loading} error={state.error}>
      <section className="py-4 px-2 sm:px-4">
        <OverallStatistics defaultStats={state.defaultStats} />
        <JobApplicationStats
          isShowBarChart={state.isShowBarChart}
          monthly_stats={state.monthly_stats}
          setIsShowBarChart={setIsShowBarChart}
        />
      </section>
    </Loading>
  );
};

export default Stats;
