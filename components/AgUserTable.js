import { useMemo, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
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

export default function AgUserTable({ users }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [users]);

  const columnDefs = useMemo(() => [
    { headerName: "Name", field: "name", filter: "agTextColumnFilter", sortable: true, flex: 1.3, minWidth: 180 },
    { headerName: "Email", field: "email", filter: "agTextColumnFilter", flex: 1.6, minWidth: 220 },
    { headerName: "Role", field: "role", filter: "agSetColumnFilter", width: 130 },
    { headerName: "Status", field: "status", filter: "agSetColumnFilter", width: 130 },
    { headerName: "Age", field: "age", filter: "agNumberColumnFilter", width: 100, sortable: true },
    { headerName: "Created", field: "created_at", filter: "agDateColumnFilter", width: 200 },
  ], []);

  const defaultColDef = useMemo(() => ({
    resizable: true,
    floatingFilter: true,
    suppressMenuHide: false,
  }), []);

  const gridOptions = useMemo(() => ({
    rowBuffer: 20,
    suppressScrollOnNewData: true,
    animateRows: true,
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 25, 50, 100],
    domLayout: 'autoHeight',
  }), []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="ag-theme-quartz" style={{ width: "100%" }}>
        {loading ? (
          <Skeleton />
        ) : (
          <AgGridReact
            rowData={users}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            gridOptions={gridOptions}
          />
        )}
      </div>
    </div>
  );
}
