import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Spinner, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase } from '@fortawesome/free-solid-svg-icons';

// Utility function to get the JWT token from localStorage
const getJwtToken = () => {
  return localStorage.getItem('token'); // Adjust if using sessionStorage
};

const DatabaseConfig = () => {
  const [dbConfigs, setDbConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDbType, setSelectedDbType] = useState(null);

  useEffect(() => {
    // Fetch the database configurations
    const fetchDatabaseConfigs = async () => {
      try {
        const token = getJwtToken(); // Get the JWT token
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/databaseForm`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
          },
        });

        const data = await response.json();
        if (response.ok) {
          setDbConfigs(data.data || []); // Ensure data is an array
        } else {
          console.error('Failed to fetch database configurations:', data.message);
        }
      } catch (error) {
        console.error('Error fetching database configurations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDatabaseConfigs();
  }, []);

  const handleDbTypeClick = (dbConfig) => {
    setSelectedDbType(dbConfig);
  };

  return (
    <Container fluid className="my-4">
      {loading ? (
        <Row className="justify-content-center align-items-center" style={{ height: '100vh' }}>
          <Col xs="auto">
            <Spinner animation="border" variant="primary" />
          </Col>
        </Row>
      ) : (
        <>
          <Row className="mb-4">
            {dbConfigs.length > 0 ? (
              dbConfigs.map((dbConfig) => (
                <Col key={dbConfig._id} md={4} className="mb-3">
                  <Card className="shadow-sm">
                    <Card.Body>
                      <Button
                        variant="light"
                        className="w-100 d-flex align-items-center justify-content-between"
                        onClick={() => handleDbTypeClick(dbConfig)}
                      >
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon icon={faDatabase} className="me-2" size="lg" />
                          <span>{dbConfig.dbtype.charAt(0).toUpperCase() + dbConfig.dbtype.slice(1)}</span>
                        </div>
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col xs="auto">
                <Card className="text-center">
                  <Card.Body>No database configurations available.</Card.Body>
                </Card>
              </Col>
            )}
          </Row>

          {selectedDbType && (
            <Row className="mb-4">
              <Col md={8} className="mx-auto">
                <Card>
                  <Card.Header as="h4">{selectedDbType.dbtype.charAt(0).toUpperCase() + selectedDbType.dbtype.slice(1)} Configuration</Card.Header>
                  <Card.Body>
                    <Form>
                      {selectedDbType.config.map((field, index) => (
                        <Form.Group key={index} className="mb-3" controlId={`${selectedDbType._id}-${field}`}>
                          <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                          <Form.Control type="text" placeholder={`Enter ${field}`} />
                        </Form.Group>
                      ))}
                      <Button variant="primary" className="mt-3">
                        Add
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </>
      )}
    </Container>
  );
};

export default DatabaseConfig;
