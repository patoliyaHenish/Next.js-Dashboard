import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AgePieChart({ users }) {
  const ranges = [
    { label: "<25", match: (a) => a < 25 },
    { label: "25-34", match: (a) => a >= 25 && a <= 34 },
    { label: "35-44", match: (a) => a >= 35 && a <= 44 },
    { label: "45+", match: (a) => a >= 45 },
  ];
  const labels = ranges.map((r) => r.label);
  const dataCounts = ranges.map((r) => users.filter((u) => r.match(u.age)).length);
  const data = {
    labels,
    datasets: [
      {
        data: dataCounts,
        backgroundColor: ["#60a5fa", "#34d399", "#fbbf24", "#f87171"],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };
  const options = { responsive: true, plugins: { legend: { position: "bottom" } } };
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 mb-2">Age Distribution</h2>
      <Pie data={data} options={options} />
    </div>
  );
}
