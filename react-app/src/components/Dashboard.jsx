import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!token) {
    return <p>You are not logged in. Redirecting...</p>;
  }

  return (
    <div>
      <h1>Welcome to the Dashboard!</h1>
      <button onClick={() => { logout(); navigate("/"); }}>Logout</button>
    </div>
  );
};

export default Dashboard;
