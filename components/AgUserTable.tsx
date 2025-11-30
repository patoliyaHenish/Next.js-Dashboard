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

// Custom debounce hook
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
  const gridRef = useRef<AgGridReact<User>>(null);

  const debouncedSearchText = useDebounce(searchText, 300);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [users]);

  // Filter data based on search and filters
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

  const columnDefs = useMemo<ColDef[]>(() => [
    { headerName: "Name", field: "name", filter: "agTextColumnFilter", sortable: true, flex: 1.3, minWidth: 180 },
    { headerName: "Email", field: "email", filter: "agTextColumnFilter", flex: 1.6, minWidth: 220 },
    { headerName: "Role", field: "role", filter: "agSetColumnFilter", width: 130, sortable: true },
    { headerName: "Status", field: "status", filter: "agSetColumnFilter", width: 130, sortable: true },
    { headerName: "Created", field: "created_at", filter: "agDateColumnFilter", width: 160, sortable: true },
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
  }), []);

  const clearFilters = useCallback(() => {
    setSearchText("");
    setSelectedRoles([]);
    setSelectedStatuses([]);
    gridRef.current?.api?.setFilterModel(null);
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6">
      {/* Search and Filter Controls */}
      <div className="mb-4">
        {/* Desktop View (980px+): All in one line */}
        <div className="hidden xl:flex gap-4 items-center">
          {/* Search Input */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Role Filter */}
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

          {/* Status Filter */}
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

          {/* Clear Filters Button */}
          {(searchText || selectedRoles.length > 0 || selectedStatuses.length > 0) && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors text-xs font-medium whitespace-nowrap"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Tablet/Mobile View: Stacked */}
        <div className="xl:hidden space-y-3">
          {/* Search Bar */}
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

          {/* Filters Row - Role and Status side by side on tablet */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:items-center md:justify-between">
            {/* Role Filter */}
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

            {/* Status Filter */}
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

            {/* Clear Filters Button */}
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

      {/* Table */}
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
