import React from 'react';
console.log(React);
const GoogleFormPage = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", margin: 0 }}>
      {/* Form container takes 90% of height and scrolls if content is taller */}
      <div style={{ flex: "0 0 90%", overflow: "auto" }}>
        <iframe
          src="https://forms.gle/aC6pbk2d9H5z1wS37"
          style={{ width: "100%", height: "100%", border: "none" }}
          allowFullScreen
          title="Google Form"
        />
      </div>

      {/* 1% bottom space */}
      <div style={{ flex: "0 0 10%", backgroundColor: "black" }}></div>
    </div>
  );
};

export default GoogleFormPage;
