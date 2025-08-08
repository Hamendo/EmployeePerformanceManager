// client/src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; // ✅ Update the path if needed
import '../assets/themes.css';
console.log(React)

const HomePage = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="home-container">
      <div className="theme-switch">
        <label>
          <input
            type="checkbox"
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
          {' '}Dark Mode
        </label>
      </div>

      <img src={logo} alt="Logo" className="logo" />
      <h1>Employee Performance Manager</h1>

      <div className="button-group">
        <button className="home-button" onClick={() => navigate('/admin/login')}>
          Admin Section
        </button>
        <button className="home-button" onClick={() => navigate('/employee/login')}>
          Employee Section
        </button>
      </div>
    </div>
  );
};

export default HomePage;
