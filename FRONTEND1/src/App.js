import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/login";
import Signup from "./pages/signup";
import BMICalculator from "./pages/BMICalculator";

function App() {
  const [user, setUser] = useState(null);

  return (
      <Router>
          <Routes>
              <Route path="/" element={<Login setUser={setUser} />} />
              <Route path="/signup" element={<Signup />} />
             {user && <Route path="/dashboard" element={<Dashboard user={user} />} />}

          </Routes>
      </Router>
  );
}

export default App;
