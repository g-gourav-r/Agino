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
              title={widget.title}
              query={widget.query}
              graphType={widget.widgetData.graphType}
              graphOptions={widget.widgetData.graphOptions}
              graphData={widget.widgetData.graphData}
            />
          );
        })}
      </SortableContext>
    </div>
  );
}

export default DashboardColumns;
