import { useState } from "react"
import { motion } from "framer-motion"
import {
  FaMapMarkerAlt,
  FaClock,
  FaAward,
  FaChartLine,
  FaFire
} from "react-icons/fa"

export default function SphereMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    {
      key: "DIM_BP",
      icon: <FaAward size={24} />,
      color: "text-yellow-400",
      label: "Base Points"
    },
    {
      key: "DIM_LBE",
      icon: <FaMapMarkerAlt size={24} />,
      color: "text-green-400",
      label: "Location Equity"
    },
    {
      key: "DIM_TD",
      icon: <FaClock size={24} />,
      color: "text-blue-400",
      label: "Time Diversity"
    },
    {
      key: "DIM_PP",
      icon: <FaChartLine size={24} />,
      color: "text-purple-400",
      label: "Personal Performance"
    },
    {
      key: "DIM_S",
      icon: <FaFire size={24} />,
      color: "text-red-400",
      label: "Streak Bonus"
    }
  ]

  return (
    <div className='fixed top-10 right-10 z-50'>
      {/* Botón central */}
      <motion.button
        className='w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-white shadow-lg'
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.9 }}
      >
        🏆
      </motion.button>

      {/* Elementos del menú (distribuidos en 140° y más a la izquierda) */}
      {menuItems.map((item, index) => {
        const startOffset = 65 // Ajusta para mover el arco más a la izquierda
        const totalAngle = 140 // Ajusta el ángulo total de distribución (antes 120°)
        const angle =
          (index / (menuItems.length - 1)) * (totalAngle * (Math.PI / 180)) +
          startOffset * (Math.PI / 180)
        const distance = 85 // Distancia de separación del menú

        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: isOpen ? 1 : 0,
              scale: isOpen ? 1 : 0,
              x: isOpen ? Math.cos(angle) * distance : 0,
              y: isOpen ? Math.sin(angle) * distance : 0
            }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className='absolute flex flex-col items-center top-0 right-0'
          >
            <div
              className={`w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center ${item.color} shadow-lg`}
            >
              {item.icon}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
