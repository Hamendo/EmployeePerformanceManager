// client/src/components/employee/DailyPerformanceForm.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
console.log(React);

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

const DEPARTMENTS = Object.keys(DEPT_FIELDS);
const LOCATIONS = ['Kolkata', 'Jaipur'];

const getDateNDaysAgo = (n) => {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().split('T')[0];
};

const DailyPerformanceForm = () => {
  const [date, setDate] = useState('');
  const [empId, setEmpId] = useState(() => sessionStorage.getItem('employeeId') || '');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [department, setDepartment] = useState('');
  const [fields, setFields] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [error, setError] = useState('');
  const [loadingName, setLoadingName] = useState(false);
  const [isEmpIdLocked, setIsEmpIdLocked] = useState(false);

  const minDate = getDateNDaysAgo(5);
  const maxDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const storedId = sessionStorage.getItem('employeeId');
    if (storedId) {
      setEmpId(storedId);
      fetchEmployeeName(storedId);
    }
  }, []);

  const fetchEmployeeName = async (id) => {
    if (!id) {
      setName('');
      return;
    }
    setLoadingName(true);
    setError('');
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/master`, {
        params: { empId: id },
      });
      if (res.data.length > 0) {
        setName(res.data[0]['Name']);
        setIsEmpIdLocked(true); // ✅ Lock Employee ID input
      } else {
        setName('');
        setError('Employee ID not found');
        setIsEmpIdLocked(false);
      }
    } catch {
      setName('');
      setError('Error fetching employee details');
      setIsEmpIdLocked(false);
    }
    setLoadingName(false);
  };

  const onEmpIdChange = (e) => {
    const val = e.target.value;
    setEmpId(val);
    fetchEmployeeName(val);
  };

  const onFieldChange = (field, value) => {
    setFields((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);
    setError('');

    if (!date) return setError('Please select a date.');
    if (!empId) return setError('Please enter your Employee ID.');
    if (!name) return setError('Valid Employee ID required.');
    if (!location) return setError('Please select a location.');
    if (!department) return setError('Please select a department.');
    if (date < minDate || date > maxDate) {
      return setError(`Date must be between ${minDate} and ${maxDate}.`);
    }

    const payload = { empId, name, location, department, date, ...fields };

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/employee`, payload);
      setSubmitStatus('Performance data submitted successfully!');
      setDate('');
      setLocation('');
      setDepartment('');
      setFields({});
    } catch {
      setError('Failed to submit performance data.');
    }
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', padding: '2rem', minHeight: '100vh', color: '#212529' }}>
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '700px',
          margin: '0 auto',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ color: '#007bff', marginBottom: '1rem' }}>Enter Daily Performance</h2>
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Date:</label><br />
            <input type="date" value={date} min={minDate} max={maxDate} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Employee ID:</label><br />
            <input
              type="text"
              value={empId}
              onChange={onEmpIdChange}
              required
              readOnly={isEmpIdLocked} // ✅ Apply readOnly when locked
            />
            {loadingName && <p>Loading employee name...</p>}
            {name && <p><strong>Name:</strong> {name}</p>}
            {error && !name && <p style={{ color: '#dc3545' }}>{error}</p>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Location:</label><br />
            <select value={location} onChange={(e) => setLocation(e.target.value)} required>
              <option value="">-- Select Location --</option>
              {LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Department:</label><br />
            <select value={department} onChange={(e) => { setDepartment(e.target.value); setFields({}); }} required>
              <option value="">-- Select Department --</option>
              {DEPARTMENTS.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>

          {department && DEPT_FIELDS[department] && (
            <>
              <h3 style={{ color: '#007bff' }}>Performance Details</h3>
              {DEPT_FIELDS[department].map((field) => (
                <div key={field} style={{ marginBottom: '1rem' }}>
                  <label>{field}:</label><br />
                  {(field.toLowerCase().includes('remarks') || field.toLowerCase().includes('summary')) ? (
                    <textarea rows="3" value={fields[field] || ''} onChange={(e) => onFieldChange(field, e.target.value)} />
                  ) : (
                    <input type="number" min="0" value={fields[field] || ''} onChange={(e) => onFieldChange(field, e.target.value)} required />
                  )}
                </div>
              ))}
            </>
          )}

          {error && <p style={{ color: '#dc3545' }}>{error}</p>}
          {submitStatus && <p style={{ color: '#198754' }}>{submitStatus}</p>}

          <button
            type="submit"
            style={{
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Submit Performance
          </button>
        </form>
      </div>
    </div>
  );
};

export default DailyPerformanceForm;
