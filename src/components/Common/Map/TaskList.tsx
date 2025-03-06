import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const TaskList = ({ isTracking, selectedPoi, errorPoi, logEvent, t }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const tasksRef = useRef(null);

  if (!isTracking || !selectedPoi) return null;

  const tasks = selectedPoi.tasks || [];
  const totalTasks = tasks.length;

  const scrollTasks = (direction) => {
    if (!tasksRef.current) return;

    if (direction === "up" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === "down" && currentIndex < totalTasks - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="relative h-[40vh] bg-white dark:bg-gray-900 shadow-lg rounded-lg  overflow-hidden">
      <h4 className="text-lg text-center font-bold text-gray-900 dark:text-slate-100 mb-2">
        {selectedPoi.name}
      </h4>

      {totalTasks > 0 && (
        <div className="relative flex flex-col items-center">
          {/* Botón para subir */}
          {currentIndex > 0 && (
            <button
              className="absolute top-0 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow focus:outline-none z-10"
              onClick={() => scrollTasks("up")}
            >
              ↑
            </button>
          )}

          <div className="relative w-full flex flex-col items-center overflow-y-hidden px-1">
            <motion.div
              ref={tasksRef}
              className="w-full flex flex-col items-center transition-transform"
              animate={{ translateY: -currentIndex * 120 }}
            >
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  className={`w-full flex items-center p-4 border rounded-lg shadow mb-2 transition ${
                    errorPoi
                      ? "bg-gray-200 dark:bg-gray-700 opacity-50 cursor-not-allowed"
                      : "bg-white dark:bg-gray-800"
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Lado Izquierdo: Descripción */}
                  <div className="flex-1">
                    <h5 className="text-md font-semibold text-gray-900 dark:text-slate-100 truncate">
                      {task.title}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                      {task.description || t("No description available")}
                    </p>

                    <button
                      onClick={() => {
                        if (errorPoi) {
                          logEvent(
                            "USER_CLICKED_ENTER_TASK_ERROR",
                            "User clicked on the enter task button but there was an error",
                            { poi: selectedPoi, task }
                          );
                        } else {
                          logEvent(
                            "USER_CLICKED_ENTER_TASK",
                            "User clicked on the enter task button",
                            { poi: selectedPoi, task }
                          );
                          window.location.href = `/dashboard/task/${task.id}`;
                        }
                      }}
                      className={`mt-2 px-4 py-2 text-sm font-medium text-white rounded-md transition ${
                        errorPoi
                          ? "bg-gray-500 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 focus:ring focus:ring-blue-400"
                      }`}
                    >
                      {t("Enter Task")}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Botón para bajar */}
          {currentIndex < totalTasks - 1 && (
            <button
              className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow focus:outline-none z-10"
              onClick={() => scrollTasks("down")}
            >
              ↓
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskList;
