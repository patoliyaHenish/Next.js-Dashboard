import type { User } from "../data/users";

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
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td className="px-3 py-4 text-center text-gray-500" colSpan={6}>No users in selected date range.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
