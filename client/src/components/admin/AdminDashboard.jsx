// File: client/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
console.log(React);

const styles = {
  container: {
    padding: '2rem',
    backgroundColor: '#F8FAFC',
    color: '#374151',
    minHeight: '100vh',
  },
  heading: {
    color: '#B91C1C',
    marginBottom: '1rem',
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
  input: {
    padding: '0.4rem',
    marginRight: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#FFFFFF',
  },
  th: {
    backgroundColor: '#374151',
    color: '#FFFFFF',
    padding: '0.5rem',
    border: '1px solid #ccc',
  },
  td: {
    padding: '0.5rem',
    border: '1px solid #ccc',
  },
  link: {
    color: '#3B82F6',
    textDecoration: 'underline',
  },
  error: {
    color: '#B91C1C',
  },
  countdownBox: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#FEF2F2',
    color: '#B91C1C',
    borderRadius: '6px',
    display: 'inline-block',
  },
};

const AdminDashboard = () => {
  const [section, setSection] = useState('masterDatabase');
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [errorEmployees, setErrorEmployees] = useState('');

  const [searchEmpId, setSearchEmpId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchDept, setSearchDept] = useState('');

  const [countdown, setCountdown] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);

  const navigate = useNavigate();
  const GF1_URL =
    'https://docs.google.com/forms/d/e/1FAIpQLSckA29iTf4kbtRt6ymr4wN2k9IBo4LS1GOim2tv-mcnVe-8UQ/viewform';

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    setErrorEmployees('');
    try {
      const queryParams = new URLSearchParams();
      if (searchEmpId) queryParams.append('empId', searchEmpId);
      if (searchName) queryParams.append('name', searchName);
      if (searchDept) queryParams.append('department', searchDept);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/master?${queryParams.toString()}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setErrorEmployees('Failed to fetch employees');
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [searchEmpId, searchName, searchDept]);

  const handleCountdownClick = (url) => {
    // Open a blank tab immediately so browser doesn't block
    const newWindow = window.open('', '_blank');

    setCountdown(10);
    setShowCountdown(true);
    alert('The form will open in 10 seconds...');

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (newWindow) {
            newWindow.location.href = url; // redirect to form
          }
          setShowCountdown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Admin Dashboard</h2>

      <nav style={styles.nav}>
        <button style={styles.navButton} disabled>
          Master Database
        </button>
        <button
          onClick={() => handleCountdownClick('https://forms.gle/EL3UmGLwNKQbuyxt9')}
          style={styles.navButton}
        >
          Create / Delete / Update
        </button>
        <button
          onClick={() => navigate('/admin/performance')}
          style={styles.navButton}
        >
          View Performance
        </button>
      </nav>

      {showCountdown && (
        <div style={styles.countdownBox}>
          Opening form in {countdown} seconds...
        </div>
      )}

      <div>
        <h3>Employee Master Database</h3>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search by Employee ID"
            value={searchEmpId}
            onChange={(e) => setSearchEmpId(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Search by Name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Search by Department"
            value={searchDept}
            onChange={(e) => setSearchDept(e.target.value)}
            style={styles.input}
          />
        </div>

        {loadingEmployees && <p>Loading employees...</p>}
        {errorEmployees && <p style={styles.error}>{errorEmployees}</p>}
        {!loadingEmployees && !errorEmployees && employees.length === 0 && (
          <p>No employees found.</p>
        )}
        {!loadingEmployees && employees.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                {[
                  'Employee ID',
                  'Name',
                  'Email',
                  'Date of Joining',
                  'Phone Number',
                  'Department/Team',
                  'Gender',
                  'Bank Name',
                  'Branch',
                  'IFSC Code',
                  'Saving Account Number',
                ].map((head) => (
                  <th key={head} style={styles.th}>
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp['Employee ID']}>
                  <td style={styles.td}>{emp['Employee ID']}</td>
                  <td style={styles.td}>{emp['Name']}</td>
                  <td style={styles.td}>{emp['Email address']}</td>
                  <td style={styles.td}>{emp['Date of Joining ']}</td>
                  <td style={styles.td}>{emp['Phone Number']}</td>
                  <td style={styles.td}>{emp['Department/Team']}</td>
                  <td style={styles.td}>{emp['Gender']}</td>
                  <td style={styles.td}>{emp['BANK NAME']}</td>
                  <td style={styles.td}>{emp['BRANCH ']}</td>
                  <td style={styles.td}>{emp['IFSC CODE']}</td>
                  <td style={styles.td}>{emp['SAVING ACCOUNT NUMBER ']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
