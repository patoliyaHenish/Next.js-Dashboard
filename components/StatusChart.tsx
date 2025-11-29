
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
import type { User } from "../data/users";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface StatusChartProps {
  users: User[];
}

export default function StatusChart({ users }: StatusChartProps) {
  const statusCounts = users.reduce<Record<string, number>>((acc, user) => {
    acc[user.status] = (acc[user.status] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(statusCounts);

  const data = {
    labels,
    datasets: [
      {
        label: "Users by Status",
        data: labels.map((label) => statusCounts[label]),
        backgroundColor: ["#2563eb", "#f59e0b", "#dc2626", "#16a34a", "#7c3aed"],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" as const },
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
