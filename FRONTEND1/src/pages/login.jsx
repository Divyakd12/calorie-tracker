import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login({ setUser }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await axios.post("http://localhost:5000/login", { email, password });
            
            localStorage.setItem("loggedInUser", JSON.stringify({ email })); // Store email in localStorage
            setUser(email);
            
            alert("Login successful");
            navigate("/dashboard");
        } catch (error) {
            alert("Invalid credentials");
        }
    };
    

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card p-4 shadow-lg" style={{ width: "350px" }}>
                <h2 className="text-center">Calorie Tracker</h2>
                <p className="text-muted text-center">Login to continue</p>

                <input 
                    type="email" 
                    className="form-control my-2" 
                    placeholder="Enter Email" 
                    onChange={(e) => setEmail(e.target.value)} 
                />
                
                <input 
                    type="password" 
                    className="form-control my-2" 
                    placeholder="Enter Password" 
                    onChange={(e) => setPassword(e.target.value)} 
                />
                
                <button className="btn btn-primary w-100 my-2" onClick={handleLogin}>
                    Login
                </button>

                <p className="text-center mt-3">
                    Don't have an account? 
                    <button className="btn btn-link" onClick={() => navigate("/signup")}>
                        Sign Up
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Login;
