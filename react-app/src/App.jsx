import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";

import Home from "./pages/Home";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

// ✅ Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token, encryptionKey, decryptToken } = useContext(AuthContext);
  console.log("ProtectedRoute State:", { token, encryptionKey });

  if (!token || !encryptionKey) {
    return <Navigate to="/login" />;
  }

  const decryptedToken = decryptToken(token);
  return decryptedToken ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
