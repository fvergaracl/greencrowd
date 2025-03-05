import { useState } from "react";
import { motion } from "framer-motion";
import { logEvent } from "@/utils/logger";
import {
  FaMapMarkerAlt,
  FaClock,
  FaAward,
  FaChartLine,
  FaFire,
  FaGlobe,
} from "react-icons/fa";

interface SphereMenuProps {
  gamificationFilter: string;
  setGamificationFilter: (filter: string) => void;
}

export default function SphereMenu({
  gamificationFilter,
  setGamificationFilter,
}: SphereMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      key: "all",
      icon: <FaGlobe size={24} />,
      color: "text-white bg-gray-700",
      label: "All",
    },
    {
      key: "DIM_BP",
      icon: <FaAward size={24} />,
      color: "text-yellow-400 bg-gray-700",
      label: "Base Points",
    },
    {
      key: "DIM_LBE",
      icon: <FaMapMarkerAlt size={24} />,
      color: "text-green-400 bg-gray-700",
      label: "Location Equity",
    },
    {
      key: "DIM_TD",
      icon: <FaClock size={24} />,
      color: "text-blue-400 bg-gray-700",
      label: "Time Diversity",
    },
    {
      key: "DIM_PP",
      icon: <FaChartLine size={24} />,
      color: "text-purple-400 bg-gray-700",
      label: "Personal Performance",
    },
    {
      key: "DIM_S",
      icon: <FaFire size={24} />,
      color: "text-red-400 bg-gray-700",
      label: "Streak Bonus",
    },
  ];

  return (
    <div className="fixed top-10 right-10 z-50">
      {/* Botón central */}
      <motion.button
        className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-white shadow-lg"
        onClick={() => {
          let eventName = isOpen ? "USER_CLOSE_SPHERE_MENU" : "USER_OPEN_SPHERE_MENU";
          logEvent(
            eventName,
            isOpen ? "Sphere menu closed" : "Sphere menu opened",
            { isOpen, gamificationFilter }
          );

          setIsOpen(!isOpen);
        }}
        whileTap={{ scale: 0.9 }}
      >
        🏆
      </motion.button>

      {/* Elementos del menú */}
      {menuItems.map((item, index) => {
        const startOffset = 65; // Ajusta para mover el arco más a la izquierda
        const totalAngle = 140; // Ángulo de distribución
        const angle =
          (index / (menuItems.length - 1)) * (totalAngle * (Math.PI / 180)) +
          startOffset * (Math.PI / 180);
        const distance = 85; // Distancia de separación

        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: isOpen ? 1 : 0,
              scale: isOpen ? 1 : 0,
              x: isOpen ? Math.cos(angle) * distance : 0,
              y: isOpen ? Math.sin(angle) * distance : 0,
            }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="absolute flex flex-col items-center top-0 right-0"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all 
                ${item.color} 
                ${gamificationFilter === item.key ? "ring-4 ring-white" : ""}`}
              onClick={() => setGamificationFilter(item.key)}
            >
              {item.icon}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
