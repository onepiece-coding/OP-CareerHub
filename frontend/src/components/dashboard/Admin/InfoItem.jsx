import { memo } from "react";
import { 
  FaUsers, 
  FaBoxOpen, 
  FaShoppingCart, 
  FaExclamationTriangle, 
  FaTimesCircle, 
  FaInfoCircle,
  FaBullhorn,
  FaCalendarAlt,
  FaLightbulb,
  FaMoon
} from "react-icons/fa";

const getIconAndColor = (key) => {
  const normalizedKey = key.toString().toLowerCase().trim();

  // Updated color palette to match Admin's chartColors
  const colorPalette = {
    primary: '#4f46e5', // Indigo
    secondary: '#7c3aed', // Violet
    success: '#10b981', // Emerald
    warning: '#f59e0b', // Amber
    danger: '#ef4444', // Red
    info: '#3b82f6', // Blue
    light: '#9ca3af', // Gray
    dark: '#1f2937' // Dark Gray
  };

  switch (normalizedKey) {
    case "users":
      return { icon: <FaUsers className="text-2xl" />, color: `bg-[${colorPalette.primary}]/10` };
    case "products":
      return { icon: <FaBoxOpen className="text-2xl" />, color: `bg-[${colorPalette.secondary}]/10` };
    case "orders":
      return { icon: <FaShoppingCart className="text-2xl" />, color: `bg-[${colorPalette.success}]/10` };
    case "warnings":
      return { icon: <FaExclamationTriangle className="text-2xl" />, color: `bg-[${colorPalette.warning}]/10` };
    case "errors":
      return { icon: <FaTimesCircle className="text-2xl" />, color: `bg-[${colorPalette.danger}]/10` };
    case "info":
      return { icon: <FaInfoCircle className="text-2xl" />, color: `bg-[${colorPalette.info}]/10` };
    case "promotions":
    case "promo":
      return { icon: <FaBullhorn className="text-2xl" />, color: `bg-[${colorPalette.secondary}]/10` };
    case "events":
    case "event":
      return { icon: <FaCalendarAlt className="text-2xl" />, color: `bg-[${colorPalette.info}]/10` };
    case "light":
      return { icon: <FaLightbulb className="text-2xl" />, color: `bg-[${colorPalette.warning}]/10` };
    case "dark":
      return { icon: <FaMoon className="text-2xl" />, color: `bg-[${colorPalette.dark}]/10` };
    default:
      const icons = [
        <FaInfoCircle className="text-2xl" />,
        <FaBoxOpen className="text-2xl" />,
        <FaCalendarAlt className="text-2xl" />,
        <FaLightbulb className="text-2xl" />
      ];
      const hash = Array.from(normalizedKey).reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return {
        icon: icons[hash % icons.length],
        color: `bg-[${colorPalette.light}]/10`
      };
  }
};

const InfoItem = memo(
  ({ info }) => {
    const { icon, color } = getIconAndColor(info.key);

    return (
      <div
        className={`
          flex flex-col items-center justify-center 
          p-6 rounded-xl 
          shadow-xl hover:shadow-2xl 
          transform hover:scale-105 
          transition-all duration-300 
          bg-white dark:bg-gray-800 
          min-h-[160px] 
          border border-gray-200 dark:border-gray-700 
          hover:bg-gray-50 dark:hover:bg-gray-700
        `}
      >
        {/* Icon with vibrant background */}
        <div className={`flex items-center justify-center p-4 rounded-full ${color}`}>
          {icon}
        </div>
        <dt className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-4">{info.value}</dt>
        <dd className="capitalize text-base text-gray-600 dark:text-gray-300 mt-1">{info.key}</dd>
      </div>
    );
  },
  (prev, next) => prev.info.key === next.info.key && prev.info.value === next.info.value
);

export default InfoItem;