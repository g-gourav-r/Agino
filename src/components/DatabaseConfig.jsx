import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Spinner } from 'react-bootstrap';

const DatabaseConfig = () => {
  const [dbConfigs, setDbConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the database configurations
    const fetchDatabaseConfigs = async () => {
      try {
        const response = await fetch('http://localhost:3000/database');
        const data = await response.json();
        setDbConfigs(data.data);
      } catch (error) {
        console.error('Error fetching database configurations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDatabaseConfigs();
  }, []);

  return (
    <Container fluid>
      {loading ? (
        <Row className="justify-content-center align-items-center" style={{ height: '100vh' }}>
          <Col xs="auto">
            <Spinner animation="border" />
          </Col>
        </Row>
      ) : (
        dbConfigs.map((dbConfig) => (
          <Row key={dbConfig._id} className="mb-4">
            <Col>
              <h4>{dbConfig.dbtype}</h4>
              <Form>
                {dbConfig.config.map((field, index) => (
                  <Form.Group key={index} className="mb-3" controlId={`${dbConfig._id}-${field}`}>
                    <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                    <Form.Control type="text" placeholder={`Enter ${field}`} />
                  </Form.Group>
                ))}
              </Form>
            </Col>
          </Row>
        ))
      )}
    </Container>
  );
};

export default DatabaseConfig;
