import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridOptions } from "ag-grid-community";
import type { User } from "../data/users";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

function Skeleton() {
  return (
    <div className="animate-pulse p-4">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );
}

interface AgUserTableProps { users: User[] }

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function AgUserTable({ users }: AgUserTableProps) {
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [newUser, setNewUser] = useState<{ name: string; email: string; role: string; status: string; age: string; created_at: string }>({ name: "", email: "", role: "User", status: "Active", age: "", created_at: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; age?: string; general?: string }>({});
  const gridRef = useRef<AgGridReact<User>>(null);

  const debouncedSearchText = useDebounce(searchText, 300);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = debouncedSearchText === "" || 
        user.name.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearchText.toLowerCase());

      const matchesRole = selectedRoles.length === 0 || selectedRoles.includes(user.role);
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(user.status);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, debouncedSearchText, selectedRoles, selectedStatuses]);

  const toggleRole = useCallback((role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  }, []);

  const toggleStatus = useCallback((status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  }, []);

  const ActionCellRenderer = (params: any) => {
    const name = params?.data?.name ?? "User";
    const onDelete = async () => {
      gridRef.current?.api?.applyTransaction({ remove: [params.data] });
      try {
        await fetch(`/api/users?id=${params.data?.id}`, { method: "DELETE" });
      } catch (e) {}
    
    };
    const onEdit = () => {
      const user = params.data;
      if (user) {
        setEditingUser(user);
        setNewUser({
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          age: String(user.age),
          created_at: user.created_at,
        });
        setShowAddModal(true);
      }
    };
    return (
      <div className="flex items-center gap-2">
        <button
          className="inline-flex items-center p-1 rounded border border-red-300 text-red-700 hover:bg-red-50"
          title="Delete"
          aria-label={`Delete ${name}`}
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M9 3a1 1 0 0 0-1 1v1H5a1 1 0 1 0 0 2h14a1 1 0 1 0 0-2h-3V4a1 1 0 0 0-1-1H9zm-3 6h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 9z" />
          </svg>
        </button>
        <button
          className="inline-flex items-center p-1 rounded border border-blue-300 text-blue-700 hover:bg-blue-50"
          title="Edit"
          aria-label={`Edit ${name}`}
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M14.06 9.02l.92.92-8.06 8.06H6v-.92l8.06-8.06zM16.88 3a2 2 0 0 1 2.83 2.83l-1.41 1.41-2.83-2.83L16.88 3z" />
          </svg>
        </button>
      </div>
    );
  };

  const columnDefs = useMemo<ColDef[]>(() => [
    { headerName: "Name", field: "name", filter: "agTextColumnFilter", sortable: true, flex: 1.3, minWidth: 180 },
    { headerName: "Email", field: "email", filter: "agTextColumnFilter", flex: 1.2, minWidth: 200 },
    { headerName: "Role", field: "role", filter: "agSetColumnFilter", width: 130, sortable: true },
    { headerName: "Status", field: "status", filter: "agSetColumnFilter", width: 130, sortable: true },
    { headerName: "Created", field: "created_at", filter: "agDateColumnFilter", width: 160, sortable: true },
    {
      headerName: "Action",
      field: "id",
      width: 140,
      sortable: false,
      filter: false,
      cellRenderer: ActionCellRenderer,
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'flex-start' },
    },
  ], []);

  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true,
    floatingFilter: true,
    suppressMenuHide: false,
  }), []);

  const gridOptions = useMemo<GridOptions>(() => ({
    rowBuffer: 20,
    suppressScrollOnNewData: true,
    animateRows: true,
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 25, 50, 100],
    domLayout: 'autoHeight',
    virtualizationPageSize: 50,
    overlayNoRowsTemplate: '<span class="text-gray-500 text-sm">No Users Found</span>',
  }), []);

  const clearFilters = useCallback(() => {
    setSearchText("");
    setSelectedRoles([]);
    setSelectedStatuses([]);
    gridRef.current?.api?.setFilterModel(null);
  }, []);

  const submitNewUser = useCallback(async () => {
    setFormErrors({});
    const payload = {
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      role: newUser.role,
      status: newUser.status,
      age: Number(newUser.age),
      created_at: newUser.created_at || new Date().toISOString().slice(0, 10),
    };
    
    const errors: { name?: string; email?: string; age?: string } = {};
    if (!payload.name) {
      errors.name = "Name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(payload.name)) {
      errors.name = "Name should only contain letters and spaces";
    }
    if (!payload.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      errors.email = "Invalid email format";
    }
    if (!payload.age || isNaN(payload.age)) errors.age = "Valid age is required";
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      if (editingUser) {
        const res = await fetch(`/api/users?id=${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to update user");
        gridRef.current?.api?.applyTransaction({ update: [json.user] });
      } else {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to add user");
        gridRef.current?.api?.applyTransaction({ add: [json.user] });
      }
      setNewUser({ name: "", email: "", role: "User", status: "Active", age: "", created_at: "" });
      setEditingUser(null);
      setFormErrors({});
      setShowAddModal(false);
    } catch (e: any) {
      setFormErrors({ general: e.message || "Error saving user" });
    }
  }, [newUser, editingUser]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6">
      <div className="mb-4">

        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={()=>setShowAddModal(false)}></div>
            <div className="relative bg-white rounded-lg shadow-lg w-[95%] max-w-xl p-4">
              <h3 className="text-base font-semibold text-gray-800 mb-3">{editingUser ? "Edit User" : "Add New User"}</h3>
              {formErrors.general && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {formErrors.general}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <input value={newUser.name} onChange={(e)=>setNewUser(v=>({...v,name:e.target.value}))} placeholder="Name" className={`px-3 py-2 border rounded-md text-sm w-full ${formErrors.name ? 'border-red-300' : 'border-gray-300'}`} />
                  {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <input value={newUser.email} onChange={(e)=>setNewUser(v=>({...v,email:e.target.value}))} placeholder="Email" className={`px-3 py-2 border rounded-md text-sm w-full ${formErrors.email ? 'border-red-300' : 'border-gray-300'}`} />
                  {formErrors.email && <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <select value={newUser.role} onChange={(e)=>setNewUser(v=>({...v,role:e.target.value}))} className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full">
                    <option>User</option>
                    <option>Admin</option>
                    <option>Manager</option>
                  </select>
                </div>
                <div>
                  <select value={newUser.status} onChange={(e)=>setNewUser(v=>({...v,status:e.target.value}))} className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full">
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Pending</option>
                  </select>
                </div>
                <div>
                  <input value={newUser.age} onChange={(e)=>setNewUser(v=>({...v,age:e.target.value}))} placeholder="Age" type="number" min="0" className={`px-3 py-2 border rounded-md text-sm w-full ${formErrors.age ? 'border-red-300' : 'border-gray-300'}`} />
                  {formErrors.age && <p className="text-xs text-red-600 mt-1">{formErrors.age}</p>}
                </div>
                <div>
                  <input value={newUser.created_at} onChange={(e)=>setNewUser(v=>({...v,created_at:e.target.value}))} placeholder="YYYY-MM-DD" type="date" className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full" />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={()=>{setShowAddModal(false);setEditingUser(null);setFormErrors({});}} className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 text-sm hover:bg-gray-50">Cancel</button>
                <button onClick={submitNewUser} className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">{editingUser ? "Update" : "Add"}</button>
              </div>
            </div>
          </div>
        )}

        <div className="hidden xl:flex gap-4 items-center">
          <div className="w-1/2">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="flex items-center gap-2 flex-nowrap">
            <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">Role:</span>
            <div className="flex gap-2">
              {["Admin", "Manager", "User"].map(role => (
                <label key={role} className="flex items-center cursor-pointer px-1.5 py-0.5 hover:bg-gray-50 rounded transition">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={() => toggleRole(role)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-1 text-xs text-gray-700">{role}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-nowrap">
            <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">Status:</span>
            <div className="flex gap-2">
              {["Active", "Inactive", "Pending"].map(status => (
                <label key={status} className="flex items-center cursor-pointer px-1.5 py-0.5 hover:bg-gray-50 rounded transition">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={() => toggleStatus(status)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-1 text-xs text-gray-700">{status}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 whitespace-nowrap"
          >
            Add
          </button>

          {(searchText || selectedRoles.length > 0 || selectedStatuses.length > 0) && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors text-xs font-medium whitespace-nowrap"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="xl:hidden space-y-3">
          <div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            {searchText && (
              <p className="mt-1 text-xs text-gray-500">
                Found {filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:items-center md:justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">Role:</span>
              <div className="flex gap-2 flex-wrap">
                {["Admin", "Manager", "User"].map(role => (
                  <label key={role} className="flex items-center cursor-pointer px-2 py-1 hover:bg-gray-50 rounded transition">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role)}
                      onChange={() => toggleRole(role)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-1.5 text-xs text-gray-700">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">Status:</span>
              <div className="flex gap-2 flex-wrap">
                {["Active", "Inactive", "Pending"].map(status => (
                  <label key={status} className="flex items-center cursor-pointer px-2 py-1 hover:bg-gray-50 rounded transition">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(status)}
                      onChange={() => toggleStatus(status)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-1.5 text-xs text-gray-700">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {(searchText || selectedRoles.length > 0 || selectedStatuses.length > 0) && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors text-xs font-medium whitespace-nowrap"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="ag-theme-quartz" style={{ width: "100%" }}>
          {loading ? (
            <Skeleton />
          ) : (
            <AgGridReact<User>
              ref={gridRef}
              rowData={filteredUsers}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              gridOptions={gridOptions}
            />
          )}
        </div>
      </div>
    </div>
  );
}
