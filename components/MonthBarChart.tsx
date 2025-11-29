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

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;

interface MonthBarChartProps { users: User[] }

export default function MonthBarChart({ users }: MonthBarChartProps) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const labels = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const yy = String(d.getFullYear()).slice(-2);
    return `${MONTH_NAMES[d.getMonth()]} ${yy}`;
  });

  const counts = Array(12).fill(0) as number[];
  const startKey = start.getFullYear() * 12 + start.getMonth();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  users.forEach((u) => {
    const d = new Date(u.created_at + "T00:00:00");
    if (d < start || d > end) return;
    const key = d.getFullYear() * 12 + d.getMonth();
    const idx = key - startKey;
    if (idx >= 0 && idx < 12) counts[idx] += 1;
  });

  const totalLast12Months = counts.reduce((a, b) => a + b, 0);

  const data = {
    labels,
    datasets: [
      {
        label: "Users created per month (last 12 months)",
        data: counts,
        backgroundColor: "#2563eb",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" as const }, title: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-700">Users by Month (last 12 months)</h2>
        <span className="text-xs text-gray-600">Total: {totalLast12Months}</span>
      </div>
      <div className="h-72">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
