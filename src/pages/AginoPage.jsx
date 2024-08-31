import React from 'react';
import Header from '../components/Header';

const AginoPage = () => {
  return (
      <>
      <Header />
        <div style={styles.container}>
          <h1 style={styles.title}>Agnio</h1>
          <p style={styles.message}>This page is under construction</p>
        </div>
      </>
    );
  };
  
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: "'Poppins', sans-serif",
      textAlign: 'center',
    },
    title: {
      fontSize: '6rem',
      color: '#343a40',
    },
    message: {
      fontSize: '1.5rem',
      color: '#6c757d',
    },
  };
  

export default AginoPage;
