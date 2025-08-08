import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

console.log(React);

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
};

// Use your exact mapping strings here as keys in DEPT_FIELDS
const DEPT_FIELDS = {
  Reservation: [
    'Reservation - No of Booking Requests Processed ',
    'Reservation - No of Confirmations Updated',
    'Reservation - No of Cancellations ',
    'Reservation - No. of Amendments Made ',
    'Reservation - No of Reconfirmations Made ',
    'Reservation - Remarks ',
  ],
  'Bhutan Air Tickets and Taj Hotels': [
    'Taj/Bhutan - No. of Bhutan Air Booking Processed ',
    'Taj/Bhutan - No of Confirmed Bhutan Air Tickets ',
    'Taj/Bhutan - No of Taj Hotels Booking Processed ',
    'Taj/Bhutan - No of Confirmed bookings ',
    'Taj/Bhutan - No of Cancellations ',
    'Taj/Bhutan - No of Amendments made',
    'Taj/Bhutan - No of Reconfirmations made',
    'Taj/Bhutan - Remarks ',
  ],
  'Sales(Online)': [
    'Sales Online - No of Enquiries Received ',
    'Sales Online - No of Conversions ',
    'Sales Online - No of Follow‑Ups Taken ',
    'Sales Online - No of Cancellations ',
    'Sales Online - Remarks ',
  ],
  'Sales(Group)': [
    'Sales Group - No of Enquiries Received ',
    'Sales Group - No of Conversions Made ',
    'Sales Group - No of Follow‑Ups Taken ',
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
  ACCOUNTS: [
    'Accounts - Number of Customer Payments Processed ',
    'Accounts - Number of Tax Filings Prepared/Reviewed ',
    'Accounts - Number of transactions recorded in the accounting system',
    'Accounts - Number of vendor invoices processed',
    'Accounts - Remarks ',
  ],
  'Graphic Designer': ['Graphic Designer - Give a summary for the day'],
  Others: ['Others - Give a summary for the day'],
};

// Helper: parse date string DD/MM/YYYY or D/M/YYYY to Date object
function parseDateString(dateStr) {
  if (!dateStr) return new Date(0);
  const parts = dateStr.trim().split(/[\/\-]/);
  if (parts.length !== 3) return new Date(dateStr);
  const [day, month, year] = parts;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

const PerformanceView = () => {
  const navigate = useNavigate();
  const GF1_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSckA29iTf4kbtRt6ymr4wN2k9IBo4LS1GOim2tv-mcnVe-8UQ/viewform';

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Search states
  const [searchDate, setSearchDate] = useState('');
  const [searchEmpId, setSearchEmpId] = useState('');
  const [searchDept, setSearchDept] = useState('');

  // Flatten performance record
  const flattenRecord = perf => {
    const row = {
      employeeId: perf.empId || perf.employeeId,
      department: perf.department,
      date: perf.date,
    };
    Object.keys(perf).forEach(k => {
      if (['empId', 'employeeId', 'department', 'date'].includes(k)) return;
      row[k] = perf[k];
    });
    return row;
  };

  // Fetch data on mount
  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`${import.meta.env.VITE_API_URL}/api/performance`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        setData(Array.isArray(json) ? json : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch performance data');
        setLoading(false);
      });
  }, []);

  // Compute filtered data on search or data change
  useEffect(() => {
    if (!data.length) {
      setFilteredData([]);
      return;
    }

    let flatData = data.map(flattenRecord);

    const sd = searchDate.trim();
    const se = searchEmpId.trim().toLowerCase();
    const sdept = searchDept.trim().toLowerCase();

    // 1) No search: show latest date per employee only, sorted desc by date
    if (!sd && !se && !sdept) {
      const latestMap = new Map();
      flatData.forEach(record => {
        const key = record.employeeId;
        if (!key) return;
        const currDate = parseDateString(record.date);
        if (!latestMap.has(key) || currDate > parseDateString(latestMap.get(key).date)) {
          latestMap.set(key, record);
        }
      });
      const latestRecords = Array.from(latestMap.values()).sort(
        (a, b) => parseDateString(b.date) - parseDateString(a.date)
      );
      setFilteredData(latestRecords);
      return;
    }

    // 2) Search by Date only (empId and dept empty): show all employees who submitted that date, only basic fields
    if (sd && !se && !sdept) {
      const filtered = flatData.filter(r => r.date.trim() === sd);
      filtered.sort((a, b) => a.employeeId.localeCompare(b.employeeId));
      setFilteredData(filtered);
      return;
    }

    // 3) Search by Employee ID or Department only (no date): show matching plus dept fields
    if (!sd && (se || sdept)) {
      const filtered = flatData.filter(r => {
        const empMatch = se ? r.employeeId.toLowerCase().includes(se) : true;
        const deptMatch = sdept ? r.department.toLowerCase().includes(sdept) : true;
        return empMatch && deptMatch;
      });
      filtered.sort((a, b) => parseDateString(b.date) - parseDateString(a.date));
      setFilteredData(filtered);
      return;
    }

    // 4) Search by Employee ID or Department + Date: filter all three
    if (sd && (se || sdept)) {
      const filtered = flatData.filter(r => {
        const empMatch = se ? r.employeeId.toLowerCase().includes(se) : true;
        const deptMatch = sdept ? r.department.toLowerCase().includes(sdept) : true;
        const dateMatch = r.date.trim() === sd;
        return empMatch && deptMatch && dateMatch;
      });
      filtered.sort((a, b) => parseDateString(b.date) - parseDateString(a.date));
      setFilteredData(filtered);
      return;
    }
  }, [data, searchDate, searchEmpId, searchDept]);

  const showDeptFields =
    (searchEmpId.trim() !== '' || searchDept.trim() !== '') &&
    true;

  const showOnlyBasicFields = searchDate.trim() !== '' && searchEmpId.trim() === '' && searchDept.trim() === '';

  // Determine columns to display
  let columns = ['Employee ID', 'Department', 'Date'];
  if (!showOnlyBasicFields && showDeptFields && filteredData.length) {
    const depts = Array.from(new Set(filteredData.map(r => r.department)));
    const extraFields = [];
    depts.forEach(d => {
      const fields = DEPT_FIELDS[d];
      if (fields) fields.forEach(f => { if (!extraFields.includes(f)) extraFields.push(f); });
    });
    columns = columns.concat(extraFields);
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Admin Dashboard</h2>

      <nav style={styles.nav}>
        <button
          onClick={() => navigate('/admin/dashboard')}
          style={styles.navButton}
        >
          Master Database
        </button>
        <button
          onClick={() => window.open(GF1_URL, '_blank')}
          style={styles.navButton}
        >
          Create / Delete / Update
        </button>
        <button style={styles.navButton} disabled>View Performance</button>
      </nav>

      <div style={styles.searchBar}>
        <h2 style={styles.heading}>Performance Records</h2>
        <label style={styles.label} htmlFor="searchDate">Search by Date (DD/MM/YYYY):</label>
        <input
          style={styles.input}
          id="searchDate"
          type="text"
          placeholder="e.g. 05/07/2025"
          value={searchDate}
          onChange={e => setSearchDate(e.target.value)}
        />

        <label style={styles.label} htmlFor="searchEmpId">Search by Employee ID:</label>
        <input
          style={styles.input}
          id="searchEmpId"
          type="text"
          placeholder="Employee ID"
          value={searchEmpId}
          onChange={e => setSearchEmpId(e.target.value)}
        />

        <label style={styles.label} htmlFor="searchDept">Search by Department:</label>
        <input
          style={styles.input}
          id="searchDept"
          type="text"
          placeholder="Department"
          value={searchDept}
          onChange={e => setSearchDept(e.target.value)}
        />
      </div>

      {loading && <p>Loading performance data...</p>}
      {error && <p style={styles.error}>{error}</p>}
      {!loading && !error && filteredData.length === 0 && <p>No performance records found.</p>}

      {!loading && !error && filteredData.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col} style={styles.th}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, idx) => (
              <tr key={idx}>
                <td style={styles.td}>{row.employeeId}</td>
                <td style={styles.td}>{row.department}</td>
                <td style={styles.td}>{row.date}</td>
                {!showOnlyBasicFields &&
                  columns.slice(3).map(field => (
                    <td key={field} style={styles.td}>{row[field] ?? ''}</td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PerformanceView;
