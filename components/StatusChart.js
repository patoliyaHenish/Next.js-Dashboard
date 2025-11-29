import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function StatusChart({ users }) {
  const statusCounts = users.reduce((acc, u) => {
    acc[u.status] = (acc[u.status] || 0) + 1;
    return acc;
  }, {});
  const labels = Object.keys(statusCounts);
  const data = {
    labels,
    datasets: [
      {
        label: "Users by Status",
        data: labels.map((l) => statusCounts[l]),
        backgroundColor: ["#2563eb", "#f59e0b", "#dc2626", "#16a34a", "#7c3aed"],
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 mb-2">Status Distribution</h2>
      <div className="h-72">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
