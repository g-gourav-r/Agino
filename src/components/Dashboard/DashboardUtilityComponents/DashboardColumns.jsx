import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import DashboardItem from "./DashboardItem";

function DashboardColumns({ tasks }) {
  return (
    <div>
      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        {tasks.map((task) => {
          return (
            <DashboardItem id={task.id} title={task.title} key={task.id} />
          );
        })}
      </SortableContext>
    </div>
  );
}

export default DashboardColumns;
