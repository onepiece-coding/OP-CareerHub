import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    BarChart,
    Bar,
    Legend,
  } from "recharts";
  import { MdOutlineStackedBarChart } from "react-icons/md";
  import { SlGraph } from "react-icons/sl";
  
  const JobApplicationStats = ({
    isShowBarChart,
    monthly_stats,
    setIsShowBarChart,
  }) => {
    return (
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg md:text-2xl text-gray-900 dark:text-white opacity-80 font-semibold">
            Statistiques des candidatures
          </h3>
          <div
            className="border border-gray-900 dark:border-white p-1"
            onClick={setIsShowBarChart}
          >
            {isShowBarChart ? (
              <SlGraph
                title="Graph View"
                className="text-gray-900 dark:text-white w-7 h-7"
              />
            ) : (
              <MdOutlineStackedBarChart
                title="Bar View"
                className="text-gray-900 dark:text-white w-6 h-6"
              />
            )}
          </div>
        </div>
        {isShowBarChart ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthly_stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#ac04ac" stroke="#ac04ac" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthly_stats}>
              <CartesianGrid strokeDasharray="3/3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                fill="#ac04ac"
                stroke="#ac04ac"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  };
  
  export default JobApplicationStats;
  