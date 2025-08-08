// client/src/App.js
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import AdminDashboard from './components/admin/AdminDashboard';
import AdminLogin from './components/admin/AdminLogin';
import PerformanceView from './components/admin/PerformanceView';
import DailyPerformanceForm from './components/employee/DailyPerformanceForm';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import EmployeeLogin from './components/employee/EmployeeLogin';
import HomePage from './pages/HomePage';

console.log(React);
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/performance" element={<PerformanceView />} />

        <Route path="/employee/login" element={<EmployeeLogin />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/daily-performance" element={<DailyPerformanceForm />} />
      </Routes>
    </Router>
  );
}

export default App;
