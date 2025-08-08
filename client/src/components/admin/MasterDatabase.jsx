// client/src/components/admin/MasterDatabase.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';

console.log(React);

const MasterDatabase = () => {
  const [employees, setEmployees] = useState([]);
  const [searchEmpId, setSearchEmpId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchDept, setSearchDept] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch filtered employees
  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchEmpId) params.empId = searchEmpId;
      if (searchName) params.name = searchName;
      if (searchDept) params.department = searchDept;

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/master`, { params });
      setEmployees(res.data);
    } catch (err) {
      setError('Failed to fetch employee data.');
    }
    setLoading(false);
  };

  // Fetch on first render and when filters change
  useEffect(() => {
    fetchEmployees();
  }, [searchEmpId, searchName, searchDept]);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Master Database</h2>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search Employee ID"
          value={searchEmpId}
          onChange={(e) => setSearchEmpId(e.target.value)}
          style={{ marginRight: '0.5rem' }}
        />
        <input
          type="text"
          placeholder="Search Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={{ marginRight: '0.5rem' }}
        />
        <input
          type="text"
          placeholder="Search Department"
          value={searchDept}
          onChange={(e) => setSearchDept(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Email Address</th>
              <th>Date of Joining</th>
              <th>Phone Number</th>
              <th>Department/Team</th>
              <th>Gender</th>
              <th>Bank Name</th>
              <th>Branch</th>
              <th>IFSC Code</th>
              <th>Saving Account Number</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, idx) => (
              <tr key={idx}>
                <td>{emp['Employee ID']}</td>
                <td>{emp['Name']}</td>
                <td>{emp['Email address']}</td>
                <td>{emp['Date of Joining']}</td>
                <td>{emp['Phone Number']}</td>
                <td>{emp['Department/Team']}</td>
                <td>{emp['Gender']}</td>
                <td>{emp['BANK NAME'] || ''}</td>
                <td>{emp['BRANCH'] || ''}</td>
                <td>{emp['IFSC CODE'] || ''}</td>
                <td>{emp['SAVING ACCOUNT NUMBER'] || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MasterDatabase;
