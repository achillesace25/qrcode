import React, { useState, useEffect } from "react";
import QrReader from "react-qr-barcode-scanner";

const QRCodeScanner = () => {
  const [data, setData] = useState("No result");
  const [scanning, setScanning] = useState(false);
  const [inputValue, setInputValue] = useState(""); // Track input field value

  // Handle QR or barcode scan data
  const handleScan = (scanData) => {
    if (scanData && scanData.text) {
      console.log("Scanned Data:", scanData.text); // Debugging log to check scan data
      setData(scanData.text); // Update state with scanned text
      setInputValue(scanData.text); // Update input field with scanned text
    }
  };

  // Handle scanning error
  const handleError = (error) => {
    console.error("Scan Error:", error); // Log error for debugging
  };

  const startScanning = () => {
    setScanning(true); // Activate scanning
    setData("Scanning..."); // Provide feedback to the user
  };

  // Listen for barcode scanner input (acting as keyboard input)
  const handleScannerInput = (event) => {
    // If the event is a keyboard input from the scanner (e.g., Tek-E2-3189)
    if (event.key === "Enter") {
      console.log("Scanner input detected: ", inputValue);
      // Process the scanned data
      setData(inputValue); // Update state with scanned text
    } else {
      // Accumulate characters typed by the scanner
      setInputValue(inputValue + event.key);
    }
  };

  // Set up event listener for key press on mount and clean up on unmount
  useEffect(() => {
    // Add event listener for key press
    document.addEventListener("keypress", handleScannerInput);

    return () => {
      // Clean up event listener when component is unmounted
      document.removeEventListener("keypress", handleScannerInput);
    };
  }, [inputValue]);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>QR Code and Barcode Scanner</h1>

      <button
        onClick={startScanning}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          marginBottom: "20px",
          cursor: "pointer",
        }}
      >
        Start Scanning
      </button>

      {scanning && (
        <QrReader
          onUpdate={(err, result) => {
            if (result) handleScan(result); // Process result if available
            if (err) handleError(err); // Handle any scanning error
          }}
          onError={handleError} // Handle errors directly here
          style={{ width: "300px", margin: "auto" }}
        />
      )}

      <div style={{ marginTop: "20px" }}>
        <h3>Scanned Data:</h3>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)} // Update input field on change
          style={{
            padding: "10px",
            fontSize: "16px",
            width: "300px",
            marginBottom: "20px",
            textAlign: "center",
          }}
          readOnly
        />
      </div>

      <p>{data}</p>
    </div>
  );
};

export default QRCodeScanner;
