import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

console.log(React);

const EmployeeDashboard = () => {
  const [employee, setEmployee] = useState(null);
  const [step, setStep] = useState('menu');
  const navigate = useNavigate();

  useEffect(() => {
    const employeeId = sessionStorage.getItem('employeeId');

    if (!employeeId) {
      alert('Session expired. Please log in again.');
      navigate('/employee/login');
      return;
    }

    const fetchEmployee = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/employee`, {
          params: { employeeId: employeeId },
        });
        if (res.data && res.data.success && res.data.data) {
          setEmployee(res.data.data);
        } else {
          alert('Invalid Employee ID or account deactivated.');
          navigate('/employee/login');
        }
      } catch (error) {
        console.error('Error fetching employee:', error);
        alert('Error fetching employee. Please try again.');
        navigate('/employee/login');
      }
    };

    fetchEmployee();
  }, [navigate]);

  if (!employee) return <div style={{ color: '#212529' }}>Loading...</div>;

  return (
    <div
      style={{
        padding: '2rem',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        color: '#212529',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        <h2 style={{ color: '#007bff' }}>Welcome, {employee.Name}</h2>
        {step === 'menu' && (
          <>
            <p style={{ color: '#6c757d' }}>Select an option below:</p>
            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={() => navigate('/employee/daily-performance')}
                style={{
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  marginRight: '1rem',
                  cursor: 'pointer',
                }}
              >
                Enter Daily Performance
              </button>
              <button
                onClick={() =>
                  window.open(
                    'https://docs.google.com/forms/d/e/1FAIpQLSe3Lhg2YkEmWCfjOLYPipTHD6kda3LapEqebDUysHFiexU-ig/viewform',
                    '_blank'
                  )
                }
                style={{
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                Fill Personal Details
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
