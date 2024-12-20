import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import DashboardItem from "./DashboardItem";

function DashboardColumns({ widgets }) {
  return (
    <div>
      <SortableContext items={widgets} strategy={verticalListSortingStrategy}>
        {widgets.map((widget) => {
          return (
            <DashboardItem
              id={widget.id}
              key={widget.id}
              dataSource={widget.database}
              title={widget.title}
              query={widget.query}
              graphOptions={widget.graphoption}
              graphData={widget.graphData}
            />
          );
        })}
      </SortableContext>
    </div>
  );
}

export default DashboardColumns;
