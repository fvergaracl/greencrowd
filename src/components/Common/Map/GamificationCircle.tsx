import { useState } from "react"
import { motion } from "framer-motion"
import {
  FiTrash2,
  FiLink,
  FiZoomIn,
  FiShare2,
  FiLayers,
  FiGrid
} from "react-icons/fi"

export default function SphereMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { key: "layers", icon: <FiLayers size={24} />, color: "text-green-400" },
    { key: "grid", icon: <FiGrid size={24} />, color: "text-green-400" },
    { key: "share", icon: <FiShare2 size={24} />, color: "text-green-400" },
    { key: "zoom", icon: <FiZoomIn size={24} />, color: "text-blue-400" },
    { key: "link", icon: <FiLink size={24} />, color: "text-blue-400" },
    { key: "trash", icon: <FiTrash2 size={24} />, color: "text-red-400" }
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
