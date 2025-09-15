import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

console.log(React);

// === Constants and helper functions ===

const DEPT_FIELDS = {
  Reservation: [
    'Reservation - No of Booking Requests Processed ',
    'Reservation - No of Confirmations Updated',
    'Reservation - No of Cancellations ',
    'Reservation - No. of Amendments Made ',
    'Reservation - No of Reconfirmations Made ',
    'Reservation - Remarks ',
  ],
  'Taj/Bhutan': [
    'Taj/Bhutan - No. of Bhutan Air Booking Processed ',
    'Taj/Bhutan - No of Confirmed Bhutan Air Tickets ',
    'Taj/Bhutan - No of Taj Hotels Booking Processed ',
    'Taj/Bhutan - No of Confirmed bookings ',
    'Taj/Bhutan - No of Cancellations ',
    'Taj/Bhutan - No of Amendments made',
    'Taj/Bhutan - No of Reconfirmations made',
    'Taj/Bhutan - Remarks ',
  ],
  'Sales Online': [
    'Sales Online - No of Enquiries Received ',
    'Sales Online - No of Conversions ',
    'Sales Online - No of Follow-Ups Taken ',
    'Sales Online - No of Cancellations ',
    'Sales Online - Remarks ',
  ],
  'Sales Group': [
    'Sales Group - No of Enquiries Received ',
    'Sales Group - No of Conversions Made ',
    'Sales Group - No of Follow-Ups Taken ',
    'Sales Group - No of Cancellations ',
    'Sales Group - No of Amendments Made ',
    'Sales Group - Remarks ',
  ],
  IT: [
    'IT - No of Entries Made ',
    'IT - No. of Amendments Made ',
    'IT - No of Calls/Emails Made ',
    'IT - No of Creatives Made ',
    'IT - Remarks ',
  ],
  HR: [
    'HR - Number of Interviews Taken ',
    'HR - Number of Job Offers Extended ',
    'HR - How many Leave Requests Received Today ',
    'HR - Number of Employee Grievances Addressed ',
    'HR - Number of Salary Processing ',
    'HR - Payroll Processing ',
    'HR - Were any Exit Interviews Conducted Today ',
    'HR - Were any Retention Efforts Made (at risk of leaving) ',
    'HR - Remarks ',
  ],
  Accounts: [
    'Accounts - Number of Customer Payments Processed ',
    'Accounts - Number of Tax Filings Prepared/Reviewed ',
    'Accounts - Number of transactions recorded in the accounting system',
    'Accounts - Number of vendor invoices processed',
    'Accounts - Remarks ',
  ],
};

const FIELD_MAP = {
  reservations: {
    bookingRequestsProcessed: 'Reservation - No of Booking Requests Processed ',
    confirmationsUpdated: 'Reservation - No of Confirmations Updated',
    cancellations: 'Reservation - No of Cancellations ',
    amendmentsMade: 'Reservation - No. of Amendments Made ',
    reconfirmationsMade: 'Reservation - No of Reconfirmations Made ',
    remarks: 'Reservation - Remarks ',
  },
  tajBhutan: {
    bhutanAirBookingProcessed: 'Taj/Bhutan - No. of Bhutan Air Booking Processed ',
    confirmedBhutanAirTickets: 'Taj/Bhutan - No of Confirmed Bhutan Air Tickets ',
    tajHotelsBookingProcessed: 'Taj/Bhutan - No of Taj Hotels Booking Processed ',
    confirmedBookings: 'Taj/Bhutan - No of Confirmed bookings ',
    cancellations: 'Taj/Bhutan - No of Cancellations ',
    amendmentsMade: 'Taj/Bhutan - No of Amendments made',
    reconfirmationsMade: 'Taj/Bhutan - No of Reconfirmations made',
    remarks: 'Taj/Bhutan - Remarks ',
  },
  salesOnline: {
    enquiriesReceived: 'Sales Online - No of Enquiries Received ',
    conversions: 'Sales Online - No of Conversions ',
    followUpsTaken: 'Sales Online - No of Follow-Ups Taken ',
    cancellations: 'Sales Online - No of Cancellations ',
    remarks: 'Sales Online - Remarks ',
  },
  salesGroup: {
    enquiriesReceived: 'Sales Group - No of Enquiries Received ',
    conversionsMade: 'Sales Group - No of Conversions Made ',
    followUpsTaken: 'Sales Group - No of Follow-Ups Taken ',
    cancellations: 'Sales Group - No of Cancellations ',
    amendmentsMade: 'Sales Group - No of Amendments Made ',
    remarks: 'Sales Group - Remarks ',
  },
  it: {
    entriesMade: 'IT - No of Entries Made ',
    amendmentsMade: 'IT - No. of Amendments Made ',
    callsOrEmailsMade: 'IT - No of Calls/Emails Made ',
    creativesMade: 'IT - No of Creatives Made ',
    remarks: 'IT - Remarks ',
  },
  hr: {
    interviewsTaken: 'HR - Number of Interviews Taken ',
    jobOffersExtended: 'HR - Number of Job Offers Extended ',
    leaveRequestsReceived: 'HR - How many Leave Requests Received Today ',
    grievancesAddressed: 'HR - Number of Employee Grievances Addressed ',
    salaryProcessing: 'HR - Number of Salary Processing ',
    payrollProcessing: 'HR - Payroll Processing ',
    exitInterviewsConducted: 'HR - Were any Exit Interviews Conducted Today ',
    retentionEffortsMade: 'HR - Were any Retention Efforts Made (at risk of leaving) ',
    remarks: 'HR - Remarks ',
  },
  accounts: {
    customerPaymentsProcessed: 'Accounts - Number of Customer Payments Processed ',
    taxFilingsPreparedReviewed: 'Accounts - Number of Tax Filings Prepared/Reviewed ',
    transactionsRecorded: 'Accounts - Number of transactions recorded in the accounting system',
    vendorInvoicesProcessed: 'Accounts - Number of vendor invoices processed',
    remarks: 'Accounts - Remarks ',
  },
};

const BASE_TOP_LEVEL_KEYS = new Set([
  'timestamp', 'date', 'employeeId', 'empId', 'location', 'department',
  'reservations', 'tajBhutan', 'salesOnline', 'salesGroup', 'it', 'hr', 'accounts',
  'graphicDesignerSummary', 'othersSummary', '_id', '__v', 'createdAt', 'updatedAt'
]);

const ALL_CANON_LABELS = Object.values(DEPT_FIELDS).flat();

const normalize = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^\w]/g, '');

const CANON_LOOKUP = ALL_CANON_LABELS.reduce((acc, label) => {
  acc[normalize(label)] = label;
  acc[normalize(label.trim())] = label;
  return acc;
}, {});

const flattenRecord = (perf) => {
  const row = {
    employeeId: perf.empId || perf.employeeId || '',
    department: perf.department || '',
    date: (perf.date || '').trim(),
  };

  Object.keys(perf).forEach((k) => {
    if (BASE_TOP_LEVEL_KEYS.has(k)) return;
    const canon = CANON_LOOKUP[normalize(k)];
    if (canon) {
      row[canon] = perf[k] ?? row[canon];
    }
  });

  Object.keys(FIELD_MAP).forEach((section) => {
    const sectionObj = perf[section];
    if (!sectionObj) return;
    Object.entries(FIELD_MAP[section]).forEach(([backendKey, frontendLabel]) => {
      const val = sectionObj[backendKey];
      if (val !== undefined && val !== null && val !== '') {
        row[frontendLabel] = val;
      }
    });
  });

  if (perf.graphicDesignerSummary !== undefined) {
    row['Graphic Designer - Give a summary for the day'] = perf.graphicDesignerSummary ?? '';
  }
  if (perf.othersSummary !== undefined) {
    row['Others - Give a summary for the day'] = perf.othersSummary ?? '';
  }

  return row;
};

const styles = {
  container: { padding: '2rem', backgroundColor: '#F8FAFC', color: '#374151', minHeight: '100vh' },
  heading: { color: '#B91C1C', marginBottom: '1rem' },
  error: { color: '#B91C1C' },
  input: {
    padding: '0.4rem',
    marginRight: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  nav: {
    marginBottom: '1rem',
    display: 'flex',
    gap: '1rem',
  },
  navButton: {
    backgroundColor: '#B91C1C',
    color: '#FFFFFF',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  label: {
    marginRight: '0.5rem',
    fontWeight: 'bold',
  },
  searchBar: {
    marginBottom: '1rem',
  },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#FFFFFF' },
  th: { backgroundColor: '#374151', color: '#FFFFFF', padding: '0.5rem', border: '1px solid #ccc' },
  td: { padding: '0.5rem', border: '1px solid #ccc' },
  pagination: {
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  pageButton: {
    padding: '0.4rem 0.8rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    background: '#fff',
  },
  pageButtonDisabled: {
    padding: '0.4rem 0.8rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    background: '#eee',
    color: '#888',
    cursor: 'not-allowed',
  }
};

const PerformanceView = () => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [searchEmpId, setSearchEmpId] = useState('');
  const [searchDept, setSearchDept] = useState(''); // will be dropdown now
  const [filterDate, setFilterDate] = useState(''); // single date filter for viewAll

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentMonthLabel, setCurrentMonthLabel] = useState('');

  const [viewAll, setViewAll] = useState(false);

  const reportOptions = [
    { label: 'Last 3 Months', value: 'last3months' },
    { label: 'Last Month', value: 'lastmonth' },
    { label: '2nd Last Month', value: 'secondlastmonth' },
    { label: '3rd Last Month', value: 'thirdlastmonth' }
  ];

  const departmentOptions = ['', ...Object.keys(DEPT_FIELDS)];

  const downloadZip = (period) => {
    if (!period) return;
    const url = `${import.meta.env.VITE_API_URL}/api/performance-export/export-zip`;
    axios.get(url, {
      params: { period },
      responseType: 'blob'
    })
      .then(res => {
        const blob = new Blob([res.data]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance_${period}.zip`;
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(err => console.error('Download failed', err));
  };

  // === Fetch Data ===
  useEffect(() => {
    setLoading(true);
    setError('');

    const params = { page };
    if (viewAll) params.viewAll = true;
    if (searchEmpId.trim()) params.empId = searchEmpId.trim();
    if (searchDept.trim()) params.department = searchDept.trim();

    axios.get(`${import.meta.env.VITE_API_URL}/api/performance`, { params })
      .then(res => {
        const json = res.data;
        setData(json.data || []);
        setTotalPages(viewAll ? 1 : (json.totalPages || 1));
        setCurrentMonthLabel(json.currentMonth || '');
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch performance data');
        setLoading(false);
      });
  }, [page, searchEmpId, searchDept, viewAll]);

  // === Filter & Flatten ===
  useEffect(() => {
    if (!data.length) {
      setFilteredData([]);
      return;
    }

    // Flatten everything first (keeps backward compatibility)
    let flatData = data.map(flattenRecord);

    if (viewAll) {
      // Apply frontend filters for viewAll
      flatData = flatData.filter(r => {
        const empMatch = searchEmpId.trim() ? (r.employeeId || '').toLowerCase().includes(searchEmpId.trim().toLowerCase()) : true;
        const deptMatch = searchDept.trim() ? (r.department || '').toLowerCase() === searchDept.trim().toLowerCase() : true;
        const dateMatch = filterDate.trim() ? r.date === filterDate.trim() : true;
        return empMatch && deptMatch && dateMatch;
      });
    }

    setFilteredData(flatData);
  }, [data, searchEmpId, searchDept, filterDate, viewAll]);

  // showDeptFields logic:
  // If user selected a department from dropdown, show only that dept's fields.
  // If user didn't select a department but filtered by employeeId, show fields for departments present in results.
  const showDeptFields = (searchEmpId.trim() !== '' || searchDept.trim() !== '') && true;
  const showOnlyBasicFields = false;

  // Build columns:
  let columns = ['Employee ID', 'Department', 'Date'];
  if (!showOnlyBasicFields && showDeptFields && filteredData.length) {
    const extraFields = [];

    if (searchDept.trim()) {
      // If a department is explicitly selected, use its fields (if known)
      const fields = DEPT_FIELDS[searchDept] || [];
      fields.forEach(f => { if (!extraFields.includes(f)) extraFields.push(f); });
    } else {
      // No explicit department selected: derive departments from results (existing behavior)
      const depts = Array.from(new Set(filteredData.map(r => r.department).filter(Boolean)));
      depts.forEach(d => {
        const fields = DEPT_FIELDS[d];
        if (fields) fields.forEach(f => { if (!extraFields.includes(f)) extraFields.push(f); });
      });
    }

    columns = columns.concat(extraFields);
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Admin Dashboard</h2>

      <nav style={styles.nav}>
        <button onClick={() => navigate('/admin/dashboard')} style={styles.navButton}>Master Database</button>
        <button onClick={() => window.open('https://forms.gle/EL3UmGLwNKQbuyxt9', '_blank')} style={styles.navButton}>Create / Delete / Update</button>
        <button style={styles.navButton} disabled>View Performance</button>
      </nav>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <select onChange={(e) => downloadZip(e.target.value)}>
          <option value="">Download Report</option>
          {reportOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
        </select>
      </div>

      <div style={styles.searchBar}>
        <h2 style={styles.heading}>Performance Records</h2>

        <button
          style={{ ...styles.navButton, backgroundColor: viewAll ? '#16A34A' : '#B91C1C' }}
          onClick={() => { setViewAll(!viewAll); setPage(1); }}
        >
          {viewAll ? 'Switch to Month View' : 'View All Records'}
        </button>
        <br /><br />

        <label style={styles.label} htmlFor="searchEmpId">Search by Employee ID:</label>
        <input
          style={styles.input}
          id="searchEmpId"
          type="text"
          placeholder="Employee ID"
          value={searchEmpId}
          onChange={e => { setSearchEmpId(e.target.value); setPage(1); }}
        />

        <label style={styles.label} htmlFor="searchDept">Search by Department:</label>
        <select
          style={styles.input}
          id="searchDept"
          value={searchDept}
          onChange={e => { setSearchDept(e.target.value); setPage(1); }}
        >
          <option value="">All</option>
          {departmentOptions.slice(1).map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        {viewAll && (
          <>
            <label style={styles.label} htmlFor="filterDate">Filter by Date (DD/MM/YYYY):</label>
            <input
              style={styles.input}
              id="filterDate"
              type="text"
              placeholder="DD/MM/YYYY"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
          </>
        )}
      </div>

      {currentMonthLabel && !viewAll && (<h3>Showing data for month: {currentMonthLabel}</h3>)}

      {loading && <p>Loading performance data...</p>}
      {error && <p style={styles.error}>{error}</p>}
      {!loading && !error && filteredData.length === 0 && <p>No performance records found.</p>}

      {!loading && !error && filteredData.length > 0 && (
        <>
          <table style={styles.table}>
            <thead>
              <tr>{columns.map(col => (<th key={col} style={styles.th}>{col}</th>))}</tr>
            </thead>
            <tbody>
              {filteredData.map((row, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>{row.employeeId}</td>
                  <td style={styles.td}>{row.department}</td>
                  <td style={styles.td}>{row.date}</td>
                  {!showOnlyBasicFields &&
                    columns.slice(3).map(field => (<td key={field} style={styles.td}>{row[field] ?? ''}</td>))
                  }
                </tr>
              ))}
            </tbody>
          </table>

          {viewAll ? (
            <div style={styles.pagination}>
              <span>Total Records: {filteredData.length}</span>
            </div>
          ) : (
            <div style={styles.pagination}>
              <button
                style={page > 1 ? styles.pageButton : styles.pageButtonDisabled}
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                Prev
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                style={page < totalPages ? styles.pageButton : styles.pageButtonDisabled}
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PerformanceView;
