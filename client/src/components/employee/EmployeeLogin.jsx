// client/src/pages/EmployeeLogin.jsx
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

console.log(React);

const EmployeeLogin = () => {
  const [empId, setEmpId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    // Allow only A-Z, a-z, 0-9, '/', '-', '\'
    const value = e.target.value.replace(/[^a-zA-Z0-9\/\\-]/g, '');
    setEmpId(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!empId.trim()) {
      setError('Please enter your Employee ID');
      return;
    }

    // Double-check validation before sending
    if (!/^[a-zA-Z0-9\/\\-]+$/.test(empId.trim())) {
      setError('Invalid Employee ID format');
      return;
    }

    try {
      let encodedEmpId = empId.trim();
      // Convert '-' and '\' into '/'
      encodedEmpId = encodedEmpId.replace(/[-\\]/g, '/');

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/employee`, {
        params: { employeeId: encodedEmpId },
      });

      if (res.data && res.data.success && res.data.data) {
        sessionStorage.setItem('employeeId', encodedEmpId);
        navigate('/employee/dashboard', { state: { employeeId: encodedEmpId } });
      } else {
        setError('Employee ID not found');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div>
      {/* Top Bar with Admin Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '1rem',
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid #ccc',
        }}
      >
        <button
          onClick={() => navigate('/admin/login')}
          style={{
            backgroundColor: '#B91C1C', // Red
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '4px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Admin Login
        </button>
      </div>

      {/* Login Card */}
      <div
        style={{
          maxWidth: 400,
          margin: '3rem auto',
          padding: '2rem',
          backgroundColor: '#F8FAFC',
          border: '1px solid #ccc',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          color: '#374151',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Employee Login</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="empId" style={{ display: 'block', marginBottom: 8 }}>
            Employee ID
          </label>
          <input
            type="text"
            id="empId"
            value={empId}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: 4,
              border: '1px solid #ccc',
              marginBottom: '1rem',
              fontSize: '1rem',
            }}
            required
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#007bff',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 4,
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Login
          </button>
        </form>
        {error && (
          <p style={{ color: '#B91C1C', marginTop: '1rem', textAlign: 'center' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default EmployeeLogin;
