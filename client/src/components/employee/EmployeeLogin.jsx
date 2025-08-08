// client/src/pages/EmployeeLogin.jsx
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

console.log(React);

const EmployeeLogin = () => {
  const [empId, setEmpId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!empId.trim()) {
      setError('Please enter your Employee ID');
      return;
    }

    try {
      const encodedEmpId = empId.trim();

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
    <div
      style={{
        maxWidth: 400,
        margin: '4rem auto',
        padding: '2rem',
        backgroundColor: '#F8FAFC', // Light Gray background
        border: '1px solid #ccc',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        color: '#374151', // Charcoal Gray text
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
          onChange={(e) => setEmpId(e.target.value)}
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
            backgroundColor: '#007bff', // Deep Red button
            color: '#FFFFFF', // White text
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
  );
};

export default EmployeeLogin;
