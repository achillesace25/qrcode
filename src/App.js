import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QRCodeScanner from "./components/QRCodeScanner";
import PrintPermit from "./components/PrintPermit";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<QRCodeScanner />} />
        <Route path="/print-permit" element={<PrintPermit />} />
      </Routes>
    </Router>
  );
}

export default App;
