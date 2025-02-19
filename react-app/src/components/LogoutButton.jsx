import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <button onClick={() => { logout(); navigate("/"); }}>Logout</button>
  );
};

export default Logout;
