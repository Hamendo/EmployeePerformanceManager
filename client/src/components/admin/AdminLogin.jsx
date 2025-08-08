import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
console.log(React);

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/master/login`, {
        password,
      });

      if (res.status === 200 && res.data.message === 'Login successful') {
        sessionStorage.setItem('isAdmin', 'true');
        navigate('/admin/dashboard');
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
    }
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: '4rem auto',
        padding: '2rem',
        border: `1px solid #B91C1C`, // Deep Red border
        borderRadius: 8,
        backgroundColor: '#F8FAFC', // Light Gray background
        color: '#374151', // Charcoal Gray text
        boxShadow: '0 0 10px rgba(185, 28, 28, 0.3)', // subtle red shadow
      }}
    >
      <h2 style={{ color: '#B91C1C', marginBottom: '1.5rem' }}>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Master Password
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 2.5rem 0.5rem 0.5rem',
              marginBottom: '1rem',
              borderRadius: 4,
              border: `1px solid #374151`, // Charcoal Gray border
              fontSize: '1rem',
              color: '#374151',
              backgroundColor: '#FFFFFF',
              boxSizing: 'border-box',
            }}
            required
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              color: '#B91C1C', // Deep Red icon color
              userSelect: 'none',
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setShowPassword(!showPassword);
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#B91C1C', // Deep Red background
            color: '#FFFFFF', // White text
            border: 'none',
            borderRadius: 6,
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#991b1b')} // Slightly darker on hover
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#B91C1C')}
        >
          Login
        </button>
      </form>
      {error && (
        <p style={{ color: '#B91C1C', marginTop: '1rem', fontWeight: 'bold' }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default AdminLogin;
