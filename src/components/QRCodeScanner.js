import React, { useState, useEffect, useRef } from "react";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { app } from './firebase'; // Ensure you import your Firebase app
import { useNavigate } from "react-router-dom";  // Import useNavigate hook

const QRCodeScanner = () => {
  const [inputValue, setInputValue] = useState(""); // Track input field value
  const [userInfo, setUserInfo] = useState(null); // To store the matched user info
  const [queueNumber, setQueueNumber] = useState(""); // To store the generated queue number
  const [isModalVisible, setIsModalVisible] = useState(false); // For modal visibility
  const [isDuplicate, setIsDuplicate] = useState(false); // Flag to track duplicate queue number
  const db = getFirestore(app); // Initialize Firestore instance

  const inputRef = useRef(null); // Create a ref for the input field
  const navigate = useNavigate(); // Initialize the useNavigate hook for navigation

  // Fetch the last queue number from Firestore and generate the next one
  const generateQueueNumber = async () => {
    try {
      const q = query(collection(db, 'QueueDatabase'), orderBy("queueNumber", "desc"), limit(1)); // Get the most recent queue number
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const lastQueueNumber = querySnapshot.docs[0].data().queueNumber; // Get the last queue number
        const nextQueueNumber = incrementQueueNumber(lastQueueNumber); // Increment the last queue number
        setQueueNumber(nextQueueNumber); // Set the new queue number
      } else {
        setQueueNumber("UZ001"); // If no queue number exists, start from UZ001
      }
    } catch (error) {
      console.error("Error generating queue number:", error);
    }
  };

  // Increment queue number logic
  const incrementQueueNumber = (lastQueueNumber) => {
    const numericPart = parseInt(lastQueueNumber.substring(2)); // Extract numeric part (after "UZ")
    const nextNumber = numericPart + 1;
    const nextQueueNumber = `UZ${String(nextNumber).padStart(3, '0')}`; // Pad with zeros to maintain the format
    return nextQueueNumber;
  };

  // Check for duplicate queue number in Firestore
  const checkDuplicateQueue = async (queueNumber) => {
    try {
      const q = query(collection(db, 'QueueDatabase'), where("queueNumber", "==", queueNumber));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setIsDuplicate(true); // Duplicate found
        console.log("Duplicate queue number found:", queueNumber);
      } else {
        setIsDuplicate(false); // No duplicate
      }
    } catch (error) {
      console.error("Error checking duplicate queue number:", error);
    }
  };

  // Handle QR or barcode scan data
  const handleScan = async (scanData) => {
    if (scanData && scanData.text) {
      console.log("Scanned Data:", scanData.text); // Debugging log to check scan data
      setInputValue(scanData.text); // Update input field with scanned text

      // Fetch user data from Firestore to check if the scanned data matches a password
      await fetchUserData(scanData.text); // Pass scanned data (password) to fetch user data
      generateQueueNumber(); // Generate queue number after successful scan
    }
  };

  // Fetch user data from Firestore
  const fetchUserData = async (password) => {
    try {
      const q = query(collection(db, 'accountuz'), where("password", "==", password)); // Query Firestore for the password
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const user = querySnapshot.docs[0].data(); // Get the first matched user
        setUserInfo(user); // Set user info if password matches
      } else {
        console.log("No user found with the matching password");
        setUserInfo(null); // Reset if no match found
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const saveQueueData = async () => {
    try {
      if (userInfo && queueNumber) {
        // Check for duplicate queue number before saving
        await checkDuplicateQueue(queueNumber);
  
        if (isDuplicate) {
          alert("Duplicate queue number found! Please try again.");
        } else {
          // Add a new document with the 'status' field set to 'pending'
          await addDoc(collection(db, 'QueueDatabase'), {
            queueNumber: queueNumber,
            userName: userInfo.name,
            userEmail: userInfo.email,
            userStudentNumber: userInfo.studentNumber,
            userCellphoneNumber: userInfo.cellphoneNumber,
            timestamp: new Date().toISOString(), // Add a timestamp
            status: "pending", // Set status to "pending"
            referenceNumber: "0", // Store as a string
            amount: "0", // Store as a string
          });
          console.log("Queue data saved successfully with status: pending");
          setIsModalVisible(true); // Show success modal
        }
      } else {
        console.error("Cannot save queue data: Missing user information or queue number");
      }
    } catch (error) {
      console.error("Error saving queue data:", error);
    }
  };

  // Start scanning (Trigger actual scanning logic here)
  const startScanning = () => {
    if (inputRef.current) {
      inputRef.current.focus(); // Focus the input field when scanning starts
    }
    // Handle scanning logic here, e.g., trigger barcode scanner
  };

  // Listen for barcode scanner input (acting as keyboard input)
  const handleScannerInput = (event) => {
    if (event.key === "Enter") {
      console.log("Scanner input detected: ", inputValue);
      fetchUserData(inputValue); // Fetch user data with scanner input value
      generateQueueNumber(); // Generate queue number after successful scan
    } else {
      setInputValue(inputValue + event.key); // Update the input value with scanned input
    }
  };

  useEffect(() => {
    document.addEventListener("keypress", handleScannerInput);

    return () => {
      document.removeEventListener("keypress", handleScannerInput);
    };
  }, [inputValue]); // Add inputValue as a dependency

  // Clear all data
  const clearData = () => {
    setInputValue("");
    setUserInfo(null);
    setQueueNumber("");
  };

  // Auto hide the success modal and clear user info after 10 seconds
  useEffect(() => {
    if (isModalVisible) {
      const timer = setTimeout(() => {
        setIsModalVisible(false); // Hide the modal after 10 seconds
        clearData(); // Clear all data after 10 seconds
      }, 10000); // 10 seconds

      return () => clearTimeout(timer); // Clean up the timer
    }
  }, [isModalVisible]);

  return (
    <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#f4f4f9" }}>
      <h1 style={{ fontSize: "2.5rem", color: "#042F10", marginBottom: "30px" }}>QR Code and Barcode Scanner</h1>

      {/* Scanned Data Input Field */}
      <div style={{ marginTop: "20px" }}>
        <h3>Scanned Data:</h3>
        <input
          ref={inputRef} // Attach the ref to the input field
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)} // Update input field on change
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
          readOnly={true} // Make input field read-only as it's just for displaying scanned data
        />
      </div>

      {/* Display user information if found */}
      {userInfo && (
        <div style={{ marginTop: "20px", backgroundColor: "#e0f7e9", padding: "15px", borderRadius: "8px" }}>
          <h3 style={{ fontSize: "1.5rem", color: "#042F10" }}>User Information:</h3>
          <p><strong>Name:</strong> {userInfo.name}</p>
          <p><strong>Email:</strong> {userInfo.email}</p>
          <p><strong>Student Number:</strong> {userInfo.studentNumber}</p>
          <p><strong>Cellphone Number:</strong> {userInfo.cellphoneNumber}</p>
        </div>
      )}

      {/* Display Queue Number */}
      {queueNumber && (
        <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#e0f7f7", borderRadius: "8px" }}>
          <h3 style={{ fontSize: "1.8rem", color: "#042F10", fontWeight: "bold" }}>Queue Number:</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#004d00" }}>{queueNumber}</p>
        </div>
      )}

      {/* Modal for success */}
      {isModalVisible && (
        <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "#e0f7e9", borderRadius: "8px" }}>
          <h3 style={{ fontSize: "1.5rem", color: "#042F10" }}>Success!</h3>
          <p>Queue number successfully sent to your mobile phone.</p>
        </div>
      )}

      {/* Buttons Layout */}
      <div style={{ marginTop: "30px", display: "flex", justifyContent: "center", gap: "20px" }}>
        {/* Start Scanning or Get Queue Button */}
        <button
          onClick={async () => {
            if (userInfo) {
              await saveQueueData(); // Save queue data to Firestore
            } else {
              startScanning(); // Start scanning if no user info
            }
          }}
          style={{
            padding: "12px 24px",
            fontSize: "18px",
            backgroundColor: userInfo ? "#004d00" : "#042F10", // Different color for Get Queue
            color: "white",
            cursor: "pointer",
            borderRadius: "8px",
            border: "none",
          }}
        >
          {userInfo ? "Get Queue" : "Start Scanning"}
        </button>

        {/* Clear Data Button */}
        <button
          onClick={clearData}
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
          Clear Data
        </button>

        {/* Print Permit Button */}
        <button
          onClick={() => navigate("/print-permit")}  // Navigate to PrintPermit page
          style={{
            padding: "12px 24px",
            fontSize: "18px",
            backgroundColor: "#003366",
            color: "white",
            cursor: "pointer",
            borderRadius: "8px",
            border: "none",
          }}
        >
          Print Permit
        </button>
      </div>
    </div>
  );
};

export default QRCodeScanner;
