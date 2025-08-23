import React, { useEffect, useState } from "react";
console.log(React);

const GoogleFormPage = () => {
  const [alerts, setAlerts] = useState([]);

  // Fetch alerts from backend
  useEffect(() => {
    const fetchAlerts = () => {
      fetch(`${import.meta.env.VITE_API_URL}/api/alerts`)
        .then((res) => res.json())
        .then((data) => setAlerts(data))
        .catch((err) => console.error("❌ Failed to load alerts:", err));
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", margin: 0 }}>
      {/* Form container takes 90% of height */}
      <div style={{ flex: "0 0 90%", overflow: "auto" }}>
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSckA29iTf4kbtRt6ymr4wN2k9IBo4LS1GOim2tv-mcnVe-8UQ/viewform?embedded=true"
          style={{ width: "100%", height: "100%", border: "none" }}
          allowFullScreen
          title="Google Form"
        />
      </div>

      {/* Alerts in bottom 10% with black background */}
      <div
        style={{
          flex: "0 0 10%",
          backgroundColor: "black",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.5rem",
          overflowY: "auto",
          textAlign: "center",
        }}
      >
        <h3 style={{ margin: "0 0 0.5rem" }}>🚨 Alerts</h3>
        {alerts.length === 0 ? (
          <p style={{ margin: 0 }}>No alerts ✅</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {alerts.map((alert, idx) => (
              <li key={idx} style={{ marginBottom: "0.25rem" }}>
                <b>{alert.event}</b> — {alert.empId}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GoogleFormPage;
