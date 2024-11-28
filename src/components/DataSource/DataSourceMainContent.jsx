import { useEffect, useState } from "react";
import createApiCall, { GET, POST } from "../api/api";
import MutatingDotsLoader from "../Loaders/MutatingDots";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHubspot,
  faShopify,
  faGoogle,
  faSalesforce,
  faFacebook,
} from "@fortawesome/free-brands-svg-icons";
import { faSheetPlastic, faDatabase } from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";

function DataSourceMainContent({ setRefresh }) {
  const [configurableDataSources, setConfigurableDataSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkingDB, setCheckDB] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [fieldsFilled, setFieldsFilled] = useState(true);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const [configValues, setConfigValues] = useState({});
  const [readOnlyFields, setReadOnlyFields] = useState(false);
  const [configData, setConfigData] = useState({});
  const [connectingToDB, setconntectingToDB] = useState(false);
  const [file, setFile] = useState(null);
  const [fileUpload, setFileUpload] = useState(false);

  const configurableDataSourcesApi = createApiCall("databaseForm", GET);
  const testDatabaseConnectionApi = createApiCall("testConnection", POST);
  const connectDatabaseApi = createApiCall("database", POST);
  const uploadSheetApi = createApiCall("uploadSheet", POST);
  const appData = JSON.parse(localStorage.getItem("appData"));
  const token = appData?.token;

  useEffect(() => {
    if (!token) return;

    setLoading(true);

    configurableDataSourcesApi({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        setLoading(false);
        setConfigurableDataSources(response.data);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching configurable data sources:", error);
      });
  }, []);

  const handleTestConfig = () => {
    let allFilled = true;

    // Ensure `selectedConfig.config` is an array before iterating
    if (Array.isArray(selectedConfig?.config)) {
      selectedConfig.config.forEach((field) => {
        if (!configValues[field]?.trim()) {
          allFilled = false;
        }
      });
    }

    setFieldsFilled(allFilled);
    if (allFilled) {
      let newConfigData = {
        dbtype: selectedConfig?.dbtype,
      };
      selectedConfig.config.forEach((field) => {
        newConfigData[field] = configValues[field];
      });
      if (newConfigData.host) {
        newConfigData.server = "host";
      } else {
        newConfigData.server = "none";
      }
      setConfigData(newConfigData);
      setCheckDB(true);
      const testDBToast = toast.loading("Verifying details...");

      testDatabaseConnectionApi({
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: newConfigData,
      })
        .then((response) => {
          if (response.status) {
            toast.update(testDBToast, {
              render: "Connection Valid! Tables fetched successfully.",
              type: "success",
              isLoading: false,
              autoClose: 2000,
            });
            setReadOnlyFields(true);
            setCheckDB(false);
            setConnectionFailed(false);
            newConfigData = { ...newConfigData, schema: response.table };
            setConfigData(newConfigData);
          } else {
            throw new Error(
              response.message || "No tables found or connection failed"
            );
          }
        })
        .catch((error) => {
          setCheckDB(false);
          toast.update(testDBToast, {
            render: `Error: ${
              error.message || "Connection failed. Please check the details."
            }`,
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
          setConnectionFailed(true);
          console.error("Error fetching configurable data sources:", error);
        });
    }
  };

  const handleInputChange = (field, event) => {
    setConnectionFailed(false);
    setFieldsFilled(true);
    setConfigValues({
      ...configValues,
      [field]: event.target.value,
    });
  };

  const handleConnectDB = () => {
    const connectDBToast = toast.loading("Connecting to your DataBase...");
    setconntectingToDB(true);
    connectDatabaseApi({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: configData,
    })
      .then((response) => {
        if (response.status) {
          toast.update(connectDBToast, {
            render: "Connection Successful!",
            type: "success",
            isLoading: false,
            autoClose: 2000,
          });
          setconntectingToDB(false);
          setRefresh((prev) => !prev);
          setTimeout(() => {
            setShowConfigModal(false);
            setReadOnlyFields(false);
            setConfigValues({});
          }, 3000);
        } else {
          setconntectingToDB(false);
          throw new Error(
            response.message || "Already exists or Connection failed"
          );
        }
      })
      .catch((error) => {
        toast.update(connectDBToast, {
          render: `Error: ${
            error.message || "Connection failed. Please check the details."
          }`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        setconntectingToDB(false);
        console.error("Error fetching configurable data sources:", error);
      });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadSheet = () => {
    if (!file) {
      toast.error("No file selected. Please choose a file before uploading.");
      return;
    }

    const fileUploadToast = toast.loading("Uploading the file...");
    setFileUpload(true);

    const formData = new FormData();
    formData.append("file", file);

    uploadSheetApi({
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((response) => {
        if (response?.status) {
          toast.update(fileUploadToast, {
            render: "File uploaded successfully!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          setRefresh((prev) => !prev);
          setFile(null);
          setFileUpload(false);

          setTimeout(() => {
            setShowFileModal(false);
          }, 3000);
        } else {
          toast.update(fileUploadToast, {
            render: response?.message || "Failed to upload the file.",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
          setFileUpload(false);
        }
      })
      .catch((error) => {
        toast.update(fileUploadToast, {
          render: `Error: ${
            error?.message || "Something went wrong. Please try again later."
          }`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        setFileUpload(false);
      });
  };

  return (
    <div className="d-flex flex-grow-1 flex-column h-100">
      <ToastContainer />
      {loading ? (
        <div className="d-flex justify-content-center align-items-center flex-grow-1">
          <MutatingDotsLoader />
        </div>
      ) : (
        <>
          <h2 className="text-center pt-2">
            Connect <span className="text-green">Data Source</span>
          </h2>
          <div className="m-2">
            <div className="mb-2 p-2 pb-3 ">
              <h5 className="mb-3">
                <span className="text-green font-weight-bold">Database</span>{" "}
                Connection Setup
              </h5>
              <div className="d-flex flex-wrap row">
                {configurableDataSources.map((db) => (
                  <button
                    key={db._id}
                    className="d-flex col-5 col-md-3 col-lg-2 align-items-center btn-black m-2 p-1 rounded"
                    onClick={() => {
                      setSelectedConfig({
                        config: db.config,
                        dbtype: db.dbtype,
                      });
                      setConfigValues((prev) => ({
                        ...prev,
                        [db.dbtype]: prev[db.dbtype] || "", // Ensure dbtype is initialized
                      }));
                      setShowConfigModal(true);
                    }}
                  >
                    <FontAwesomeIcon className="mx-2" icon={faDatabase} />{" "}
                    <span>{db.dbtype}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-2 p-2 pb-3">
              <h5 className="m-0">
                <span className="text-green font-weight-bold">
                  Third-Party Services
                </span>{" "}
                Integration
              </h5>
              <small>Available on request</small>
              <div className="mt-3 d-flex flex-wrap row">
                <button
                  onClick={() => setShowComingSoon(true)}
                  className="d-flex col-5 col-md-3 col-lg-2 align-items-center btn-black m-2 p-1 rounded"
                >
                  <FontAwesomeIcon icon={faShopify} className="mx-2 " />
                  Shopify
                </button>
                <button
                  onClick={() => setShowComingSoon(true)}
                  className="d-flex col-5 col-md-3 col-lg-2 align-items-center btn-black m-2 p-1 rounded"
                >
                  <FontAwesomeIcon icon={faHubspot} className="mx-2 " />
                  HubSpot
                </button>
                <button
                  onClick={() => setShowComingSoon(true)}
                  className="d-flex col-5 col-md-3 col-lg-2 align-items-center btn-black m-2 p-1 rounded"
                >
                  <FontAwesomeIcon icon={faGoogle} className="mx-2 " />
                  Google Analytics
                </button>
                <button
                  onClick={() => setShowComingSoon(true)}
                  className="d-flex col-5 col-md-3 col-lg-2 align-items-center btn-black m-2 p-1 rounded"
                >
                  <FontAwesomeIcon icon={faSalesforce} className="mx-2 " />
                  SalesForce
                </button>
                <button
                  onClick={() => setShowComingSoon(true)}
                  className="d-flex col-5 col-md-3 col-lg-2 align-items-center btn-black m-2 p-1 rounded"
                >
                  <FontAwesomeIcon icon={faFacebook} className="mx-2 " />
                  Facebook Pixel
                </button>
              </div>
            </div>
            <div className="mb-2 p-2">
              <h5>
                <span className="text-green font-weight-bold">Data</span> Import
              </h5>
              <div className="d-flex mt-3 flex-wrap row">
                <button
                  className="d-flex col-5 col-md-3 col-lg-2 align-items-center btn-black m-2 p-1 rounded"
                  onClick={() => setShowFileModal(true)}
                >
                  <FontAwesomeIcon icon={faSheetPlastic} className="mx-2" />{" "}
                  Flat Files
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {showFileModal && (
        <>
          <div className="modal show d-block">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content bg-white rounded p-2">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Upload <span className="text-green">Flat File</span>
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowFileModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div>
                    <p>
                      {" "}
                      Only <span className="text-green">.csv</span>,{" "}
                      <span className="text-green">.xls</span>, and{" "}
                      <span className="text-green">.xlsx</span> file types are
                      allowed.
                    </p>
                  </div>
                  <form>
                    <input
                      type="file"
                      accept=".csv, .xls, .xlsx"
                      className="form-control"
                      onChange={handleFileChange}
                    />
                  </form>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className={`${
                      fileUpload ? "btn-green-disabled" : "btn-green"
                    } p-1 px-2 rounded`}
                    onClick={handleUploadSheet}
                    disabled={fileUpload}
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {showComingSoon && (
        <>
          <div className="modal show d-block">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content bg-white rounded p-2">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <span className="text-green font-weight-bold">
                      Third-Party Services
                    </span>{" "}
                    Integration
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowComingSoon(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  To request this feature, please email us at{" "}
                  <a href="mailto:contact@agino.tech">contact@agino.tech</a>.{" "}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {showConfigModal && (
        <div className="modal show d-block">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-white rounded p-2">
              <div className="modal-header">
                <h5 className="modal-title">
                  <span className="text-green">{selectedConfig?.dbtype}</span>{" "}
                  Configuration
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => {
                    setShowConfigModal(false);
                    setReadOnlyFields(false);
                  }} // Close modal and reset fields
                ></button>
              </div>
              <div className="modal-body">
                <p>Configuration fields:</p>
                <form>
                  {selectedConfig?.config.map((configField, index) => (
                    <input
                      type="text"
                      key={index}
                      placeholder={configField}
                      className="form-control mb-2"
                      value={configValues[configField] || ""}
                      onChange={(e) => handleInputChange(configField, e)}
                      readOnly={readOnlyFields}
                    />
                  ))}
                </form>
                <div className="error-msgs d-flex flex-column">
                  <small
                    className={`${fieldsFilled ? "invisible" : "text-red"}`}
                  >
                    {" "}
                    All the fields are requried
                  </small>{" "}
                  <small
                    className={`${connectionFailed ? "text-red" : "invisible"}`}
                  >
                    {" "}
                    Connection failed: Please check the entered details.{" "}
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleTestConfig}
                  className={`btn-green rounded p-1 px-2 ${
                    checkingDB || readOnlyFields ? "btn-green-disabled" : ""
                  }`}
                  disabled={checkingDB}
                >
                  Test Config
                </button>
                <button
                  className={`${
                    readOnlyFields ? "btn-green" : "btn-green-disabled"
                  } ${
                    connectingToDB ? "btn-green-disabled" : "btn-green"
                  } p-1 px-2 rounded`}
                  onClick={handleConnectDB}
                >
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataSourceMainContent;
