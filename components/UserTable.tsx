import type { User } from "../data/users";
import { useCallback } from "react";

interface BadgeProps { status: User["status"] }

function Badge({ status }: BadgeProps) {
  const colors: Record<string, string> = {
    Active: "bg-green-100 text-green-700 border-green-200",
    Inactive: "bg-gray-100 text-gray-600 border-gray-200",
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${colors[status] || "bg-blue-100 text-blue-700 border-blue-200"}`}>{status}</span>
  );
}

interface UserTableProps { users: User[] }

export default function UserTable({ users }: UserTableProps) {
  const onDelete = useCallback((u: User) => {
    const ok = typeof window !== "undefined" ? window.confirm(`Delete ${u.name}?`) : true;
    if (!ok) return;
  }, []);

  const onEdit = useCallback((u: User) => {}, []);

  const onView = useCallback((u: User) => {}, []);
  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">Name</th>
            <th className="px-3 py-2 text-left font-semibold">Email</th>
            <th className="px-3 py-2 text-left font-semibold">Role</th>
            <th className="px-3 py-2 text-left font-semibold">Status</th>
            <th className="px-3 py-2 text-left font-semibold">Age</th>
            <th className="px-3 py-2 text-left font-semibold">Created</th>
            <th className="px-3 py-2 text-left font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map(u => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="px-3 py-2 font-medium text-gray-900">{u.name}</td>
              <td className="px-3 py-2 text-gray-600">{u.email}</td>
              <td className="px-3 py-2 text-gray-700">{u.role}</td>
              <td className="px-3 py-2"><Badge status={u.status} /></td>
              <td className="px-3 py-2 text-gray-700">{u.age}</td>
              <td className="px-3 py-2 text-gray-500">{u.created_at}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <button
                    className="inline-flex items-center p-1 rounded border border-red-300 text-red-700 hover:bg-red-50"
                    title="Delete"
                    aria-label={`Delete ${u.name}`}
                    onClick={() => onDelete(u)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M9 3a1 1 0 0 0-1 1v1H5a1 1 0 1 0 0 2h14a1 1 0 1 0 0-2h-3V4a1 1 0 0 0-1-1H9zm-3 6h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 9z"/>
                    </svg>
                  </button>
                  <button
                    className="inline-flex items-center p-1 rounded border border-blue-300 text-blue-700 hover:bg-blue-50"
                    title="Edit"
                    aria-label={`Edit ${u.name}`}
                    onClick={() => onEdit(u)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M14.06 9.02l.92.92-8.06 8.06H6v-.92l8.06-8.06zM16.88 3a2 2 0 0 1 2.83 2.83l-1.41 1.41-2.83-2.83L16.88 3z"/>
                    </svg>
                  </button>
                  <button
                    className="inline-flex items-center p-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                    title="View"
                    aria-label={`View ${u.name}`}
                    onClick={() => onView(u)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td className="px-3 py-4 text-center text-gray-500" colSpan={7}>No users in selected date range.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
