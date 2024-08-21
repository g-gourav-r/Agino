import React from 'react';

const AginoPage = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Agino</h1>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#282c34',
    fontFamily: "'Poppins', sans-serif",
  },
  title: {
    fontSize: '4rem',
    color: '#61dafb',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.4)',
  },
};

export default AginoPage;
