// client/src/pages/EmployeeLogin.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

console.log(React);

const EmployeeLogin = () => {
  const [empId, setEmpId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [validIds, setValidIds] = useState(new Set());
  const [isPreloading, setIsPreloading] = useState(true);

  const navigate = useNavigate();

  const normalizeId = (id) => id.trim().replace(/[-\\]/g, '/');
  const sanitizeInput = (value) => value.replace(/[^a-zA-Z0-9\/\\-]/g, '');

  useEffect(() => {
    let cancelled = false;

    const fetchEmployeeIds = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/employee/list`);
        if (!cancelled && res?.data?.success && Array.isArray(res.data.data)) {
          const set = new Set(
            res.data.data
              .filter((v) => typeof v === 'string')
              .map((v) => normalizeId(v))
          );
          setValidIds(set);
        }
      } catch (e) {
        console.error('Failed to preload employee IDs', e);
      } finally {
        if (!cancelled) setIsPreloading(false);
      }
    };

    fetchEmployeeIds();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    const value = sanitizeInput(e.target.value);
    setEmpId(value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const raw = empId.trim();
    if (!raw) {
      setError('Please enter your Employee ID');
      return;
    }

    if (!/^[a-zA-Z0-9\/\\-]+$/.test(raw)) {
      setError('Invalid Employee ID format');
      return;
    }

    const encodedEmpId = normalizeId(raw);

    if (validIds.size > 0 && !validIds.has(encodedEmpId)) {
      setError('Employee ID not found');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/employee`, {
        params: { employeeId: encodedEmpId },
      });

      if (res?.data?.success && res?.data?.data) {
        sessionStorage.setItem('employeeId', encodedEmpId);
        navigate('/employee/dashboard', { state: { employeeId: encodedEmpId } });
      } else {
        setError('Employee ID not found');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
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
            backgroundColor: '#B91C1C',
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
          textAlign: 'center',
        }}
      >
        <h2 style={{ marginBottom: '1.5rem' }}>Employee Login</h2>

        {/* Show loader while preloading */}
        {isPreloading ? (
          <p style={{ fontSize: '1rem', fontStyle: 'italic' }}>Loading…</p>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <label htmlFor="empId" style={{ display: 'block', marginBottom: 8, textAlign: 'left' }}>
                Employee ID
              </label>
              <input
                type="text"
                id="empId"
                value={empId}
                onChange={handleChange}
                autoComplete="off"
                spellCheck="false"
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
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: isSubmitting ? '#6c757d' : '#007bff',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 4,
                  fontWeight: 'bold',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s ease',
                }}
              >
                {isSubmitting ? 'Logging in…' : 'Login'}
              </button>
            </form>

            {error && (
              <p style={{ color: '#B91C1C', marginTop: '1rem' }}>
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeLogin;
