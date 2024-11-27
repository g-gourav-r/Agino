import {
  Line,
  Bar,
  Bubble,
  Doughnut,
  Pie,
  PolarArea,
  Radar,
  Scatter,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  ArcElement,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
);

function GraphGenerator() {}

export default GraphGenerator;
