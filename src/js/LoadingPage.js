import React from 'react';
import { MoonLoader } from 'react-spinners';

function LoadingPage() {
  return (
    <div className="loading-page" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}>
      <MoonLoader color="#354F52" size={50} />
    </div>
  );
}

export default LoadingPage;