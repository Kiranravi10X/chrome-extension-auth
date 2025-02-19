import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <h1>Welcome to React Auth App</h1>
      <Link to="/login">
        <button>Login</button>
      </Link>
    </div>
  );
};

export default Home;
