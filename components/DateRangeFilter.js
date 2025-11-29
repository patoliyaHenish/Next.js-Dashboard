import { useCallback } from "react";

export default function DateRangeFilter({ startDate, endDate, onChange }) {
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    onChange({ ...{ startDate, endDate }, [name]: value });
  }, [startDate, endDate, onChange]);

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
        <input
          type="date"
          name="startDate"
          value={startDate}
          onChange={handleChange}
          className="h-9 w-48 px-3 rounded-md border border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
        <input
          type="date"
          name="endDate"
          value={endDate}
          onChange={handleChange}
          className="h-9 w-48 px-3 rounded-md border border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
        />
      </div>
    </div>
  );
}
