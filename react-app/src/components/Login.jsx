import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
  const { login, token } = useContext(AuthContext);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Invalid credentials. Please try again.");
    }
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post("http://localhost:5000/register", { email, password });
      alert(response.data.message);
      setIsRegistering(false); // Switch back to login after successful registration
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed. Please check your inputs.");
    }
  };

  // if (token) {
  //   return <p>Already logged in. Redirecting...</p>;
  // }

  return (
    <div>
      <h2>{isRegistering ? "Register" : "Login"}</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {isRegistering ? (
        <button onClick={handleRegister}>Register</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
      <p onClick={() => setIsRegistering(!isRegistering)} style={{ cursor: "pointer", color: "" }}>
        {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
      </p>
    </div>
  );
};

export default LoginPage;
