import {
  closestCorners,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensors,
  useSensor,
} from "@dnd-kit/core";
import { useState } from "react";
import DashboardColumns from "./DashboardUtilityComponents/DashboardColumns";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

function DashboardMainContent() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Add tests 1" },
    { id: 2, title: "Add tests 2" },
    { id: 3, title: "Add tests 3" },
  ]);

  const getTaskPos = (id) => tasks.findIndex((task) => task.id === id);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id === over.id) return;

    setTasks((tasks) => {
      const originalPos = getTaskPos(active.id);
      const newPos = getTaskPos(over.id);

      return arrayMove(tasks, originalPos, newPos);
    });
  };

  const sensors = useSensors(
    useSensor(TouchSensor),
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCorners}
      >
        <DashboardColumns tasks={tasks} />
      </DndContext>
    </>
  );
}

export default DashboardMainContent;
