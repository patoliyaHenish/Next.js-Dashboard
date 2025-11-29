import { useState, useMemo } from "react";
import { users as baseUsers } from "../data/users";
import DateRangeFilter from "../components/DateRangeFilter";
import StatusChart from "../components/StatusChart";
import MonthBarChart from "../components/MonthBarChart";
import AgUserTable from "../components/AgUserTable";

function parseDate(str) { return new Date(str + "T00:00:00"); }

export default function Dashboard() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeRange, setActiveRange] = useState(null); // 7 | 30 | 90 | null

  const fmtLocal = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const applyQuickRange = (days) => {
    const today = new Date();
    const endLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startLocal = new Date(endLocal);
    startLocal.setDate(endLocal.getDate() - days + 1);
    setStartDate(fmtLocal(startLocal));
    setEndDate(fmtLocal(endLocal));
    setActiveRange(days);
  };

  const filtered = useMemo(() => {
    return baseUsers.filter(u => {
      const d = parseDate(u.created_at);
      if (startDate && d < parseDate(startDate)) return false;
      if (endDate && d > parseDate(endDate)) return false;
      return true;
    });
  }, [startDate, endDate]);

  const handleDateChange = ({ startDate: s, endDate: e }) => {
    setStartDate(s);
    setEndDate(e);
    if (s && e) {
      const sD = parseDate(s);
      const eD = parseDate(e);
      const today = new Date();
      const endLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const daysInc = Math.floor((eD - sD) / 86400000) + 1;
      if (fmtLocal(endLocal) === e) {
        if (daysInc === 7) return setActiveRange(7);
        if (daysInc === 30) return setActiveRange(30);
        if (daysInc === 90) return setActiveRange(90);
      }
    }
    setActiveRange(null);
  };


  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm">Filter users by date range.</p>
          </div>

          <div className="flex flex-wrap items-end gap-4 w-full lg:w-auto">
            <DateRangeFilter startDate={startDate} endDate={endDate} onChange={handleDateChange} />
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quick ranges</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => applyQuickRange(7)}
                  aria-pressed={activeRange === 7}
                  className={`h-9 px-3 rounded-md border text-sm ${activeRange === 7 ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" : "border-gray-300 bg-white hover:bg-gray-50"}`}
                >Last 7 days</button>
                <button
                  onClick={() => applyQuickRange(30)}
                  aria-pressed={activeRange === 30}
                  className={`h-9 px-3 rounded-md border text-sm ${activeRange === 30 ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" : "border-gray-300 bg-white hover:bg-gray-50"}`}
                >Last 30 days</button>
                <button
                  onClick={() => applyQuickRange(90)}
                  aria-pressed={activeRange === 90}
                  className={`h-9 px-3 rounded-md border text-sm ${activeRange === 90 ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" : "border-gray-300 bg-white hover:bg-gray-50"}`}
                >Last 90 days</button>
              </div>
            </div>
            <button
              onClick={() => { setStartDate(""); setEndDate(""); setActiveRange(null); }}
              className="h-9 px-3 rounded-md bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
            >Reset</button>
          </div>
        </header>

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-2">
            <StatusChart users={filtered} />
          </div>
          <div className="md:col-span-3">
            <MonthBarChart users={filtered} />
          </div>
        </div>

        {/* Summary counts under both graphs */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="p-3 rounded-md bg-blue-50">
              <dt className="font-medium text-blue-700">Total</dt>
              <dd className="text-blue-800 font-semibold text-lg">{filtered.length}</dd>
            </div>
            <div className="p-3 rounded-md bg-green-50">
              <dt className="font-medium text-green-700">Active</dt>
              <dd className="text-green-800 font-semibold text-lg">{filtered.filter(u=>u.status==="Active").length}</dd>
            </div>
            <div className="p-3 rounded-md bg-yellow-50">
              <dt className="font-medium text-yellow-700">Pending</dt>
              <dd className="text-yellow-800 font-semibold text-lg">{filtered.filter(u=>u.status==="Pending").length}</dd>
            </div>
            <div className="p-3 rounded-md bg-gray-50">
              <dt className="font-medium text-gray-700">Inactive</dt>
              <dd className="text-gray-800 font-semibold text-lg">{filtered.filter(u=>u.status==="Inactive").length}</dd>
            </div>
          </dl>
        </div>

        <AgUserTable users={filtered} />
      </div>
    </main>
  );
}
