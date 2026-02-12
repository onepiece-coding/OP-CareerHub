"use client";
import { Loading } from "../../../components/feedback";
import useAdmin from "./useAdmin";
import { 
  FiActivity, FiUsers, FiBriefcase, FiDollarSign, 
  FiTrendingUp, FiRefreshCw 
} from "react-icons/fi";
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const chartColors = {
  primary: '#4f46e5',
  secondary: '#7c3aed',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  light: '#9ca3af',
  dark: '#1f2937'
};

const statusColors = {
  'en attente': chartColors.warning,
  'entretien': chartColors.primary,
  'refusé': chartColors.danger,
};

const Admin = () => {
  const { state } = useAdmin();

  const total = state.defaultStats.reduce((acc, curr) => acc + (curr.value || 0), 0);

  const globalStatsChartData = {
    labels: state.defaultStats.map(stat => stat.label),
    datasets: [{
      data: state.defaultStats.map(stat => stat.value || 0),
      backgroundColor: state.defaultStats.map(stat => statusColors[stat.label] || chartColors.light),
      borderWidth: 0,
      hoverOffset: 8
    }]
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 12,
          font: {
            size: 11
          },
          color: chartColors.dark
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: chartColors.dark,
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            const percent = total ? Math.round((val / total) * 100) : 0;
            return `${context.label}: ${val} (${percent}%)`;
          }
        }
      }
    }
  };

  return (
    <Loading loading={state.loading} error={state.error}>
      <div className="min-h-screen bg-gray-200 dark:bg-gray-900">
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              Informations Administratives
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {state.infoData?.map((info, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-xl hover:shadow-2xl p-6 border border-gray-300 dark:border-gray-700 transform hover:scale-105 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className={`p-4 rounded-full ${getInfoColorClass(index)}`}>
                      {getInfoIcon(index)}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-800 dark:text-gray-100">{info.value}</p>
                      <p className="text-sm capitalize text-gray-600 dark:text-gray-300">{info.key}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-md mx-auto w-full lg:w-96">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-300 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Répartition Globale</h2>
              <div className="h-64">
                {state.defaultStats.length > 0 ? (
                  <Pie data={globalStatsChartData} options={pieChartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Aucune donnée disponible
                  </div>
                )}
              </div>
              {state.defaultStats.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {state.defaultStats.map((stat, index) => {
                      const value = stat.value || 0;
                      const percent = total ? Math.round((value / total) * 100) : 0;
                      const color = statusColors[stat.label] || chartColors.light;

                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: color }} />
                            <span className="text-sm text-gray-600 truncate">{stat.label}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{percent}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </Loading>
  );
};

const getInfoIcon = (index) => {
  const icons = [
    <FiUsers className="text-white text-lg" />,
    <FiBriefcase className="text-white text-lg" />,
    <FiActivity className="text-white text-lg" />,
    <FiDollarSign className="text-white text-lg" />,
    <FiTrendingUp className="text-white text-lg" />,
    <FiRefreshCw className="text-white text-lg" />
  ];
  return icons[index % icons.length];
};

const getInfoColorClass = (index) => {
  const colors = [
    'bg-[#4f46e5]',
    'bg-[#7c3aed]',
    'bg-[#10b981]',
    'bg-[#f59e0b]',
    'bg-[#ef4444]',
    'bg-[#3b82f6]'
  ];
  return colors[index % colors.length];
};

export default Admin;
