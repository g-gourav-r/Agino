import React from 'react';
import AppRouter from './routes/AppRouter';

function App() {
  // Define the global CSS to remove margin from the body
  const globalStyle = `
    body {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
  `;

  return (
    <>
      <style>
        {globalStyle}
      </style>
      <div>
        <AppRouter />
      </div>
    </>
  );
}

export default App;
