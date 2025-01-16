import React, { useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook

const PrintPermit = () => {
  const [queueNumber, setQueueNumber] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate hook

  const fetchPermitData = async () => {
    try {
      if (!queueNumber) {
        setError("Queue number is required.");
        return;
      }

      const db = getFirestore();
      const claimRef = doc(db, `ClaimingPermit/${queueNumber}`);

      const snapshot = await getDoc(claimRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setUserInfo({
          userName: data.userName,
          userStudentNumber: data.userStudentNumber,
          permitStatus: data.permitStatus,
          timestamp: data.timestamp,
        });
        setError(null);
        setShowModal(true);
      } else {
        setError("No permit found for this queue number.");
        setUserInfo(null);
      }
    } catch (err) {
      setError("Error fetching data.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setQueueNumber("");
    setUserInfo(null);
    setError(null);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");

    printWindow.document.write(`
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
            .modal-content {
              padding: 20px;
              background-color: #fff;
              border-radius: 8px;
              box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
              max-width: 600px;
              margin: 0 auto;
            }
            .modal-content h3 {
              color: #042F10;
              font-size: 24px;
              margin-bottom: 20px;
              text-align: center;
            }
            .modal-content p {
              font-size: 18px;
              line-height: 1.5;
              margin: 10px 0;
            }
            .modal-content p strong {
              color: #004d00;
            }
            @media print {
              body * {
                visibility: hidden;
              }
              .modal-content, .modal-content * {
                visibility: visible;
              }
              .modal-content {
                position: absolute;
                left: 0;
                top: 0;
              }
              button {
                display: none; /* Hide buttons during printing */
              }
            }
          </style>
        </head>
        <body>
          <div class="modal-content">
            <h3>Universidad de Zamboanga</h3>
            <p style="text-align: center;"><strong>Permit Details</strong></p>
            <p><strong>Queue Number:</strong> ${userInfo.userName}</p>
            <p><strong>Permit Status:</strong> ${userInfo ? userInfo.permitStatus : "No data available"}</p>
            <p><strong>Timestamp:</strong> ${userInfo ? new Date(userInfo.timestamp).toLocaleString() : "No timestamp available"}</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const handleGetQueue = () => {
    navigate("/"); // Redirect to the QRCodeScanner.js page
  };

  return (
    <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#f4f4f9" }}>
      {/* Scanned Data Input Field */}
      <div style={{ marginTop: "20px" }}>
        <h3>Scanned Data:</h3>
        <input
          type="text"
          value={queueNumber}
          onChange={(e) => setQueueNumber(e.target.value)}
          placeholder="Enter Queue Number"
          style={{
            padding: "12px",
            fontSize: "18px",
            width: "350px",
            marginBottom: "20px",
            textAlign: "center",
            border: "2px solid #042F10",
            borderRadius: "8px",
            boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
          }}
        />
      </div>

      {/* Error Handling */}
      {error && (
        <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "#ffebee", borderRadius: "8px" }}>
          <h3 style={{ fontSize: "1.5rem", color: "#f44336" }}>Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Fetch Data Button */}
      <div style={{ marginTop: "30px" }}>
        <button
          onClick={fetchPermitData}
          style={{
            padding: "12px 24px",
            fontSize: "18px",
            backgroundColor: "#004d00",
            color: "white",
            cursor: "pointer",
            borderRadius: "8px",
            border: "none",
            marginRight: "10px",
          }}
        >
          Fetch Permit
        </button>
        <button
          onClick={handleGetQueue}
          style={{
            padding: "12px 24px",
            fontSize: "18px",
            backgroundColor: "#007bff",
            color: "white",
            cursor: "pointer",
            borderRadius: "8px",
            border: "none",
          }}
        >
          Get Queue
        </button>
      </div>

      {/* Modal - Display Data or Error */}
      {showModal && (
        <div style={modalStyles}>
          <div style={modalContentStyles}>
            <h3 style={{ color: "#042F10" }}>User Information:</h3>
            {userInfo ? (
              <>
                <p><strong>Name:</strong> {userInfo.userName}</p>
                <p><strong>Student Number:</strong> {userInfo.userStudentNumber}</p>
                <p><strong>Permit Status:</strong> {userInfo.permitStatus}</p>
                <p><strong>Timestamp:</strong> {new Date(userInfo.timestamp).toLocaleString()}</p>
              </>
            ) : (
              <p>No data available.</p>
            )}
            <div>
              <button
                onClick={handlePrint}
                style={{
                  padding: "12px 24px",
                  fontSize: "18px",
                  backgroundColor: "#007bff",
                  color: "white",
                  cursor: "pointer",
                  borderRadius: "8px",
                  border: "none",
                  marginTop: "20px",
                  marginRight: "10px",
                }}
              >
                Print
              </button>
              <button
                onClick={closeModal}
                style={{
                  padding: "12px 24px",
                  fontSize: "18px",
                  backgroundColor: "#ff6f61",
                  color: "white",
                  cursor: "pointer",
                  borderRadius: "8px",
                  border: "none",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const modalStyles = {
  position: "fixed",
  top: "0",
  left: "0",
  right: "0",
  bottom: "0",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  zIndex: "1000",
};

const modalContentStyles = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  maxWidth: "500px",
  textAlign: "center",
  boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
};

export default PrintPermit;
