import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
    
        try {
            const response = await fetch("http://localhost:5000/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                setMessage("Signup successful! Redirecting to homepage...");
                setTimeout(() => navigate("/"), 2000); // Redirect to homepage
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError("Something went wrong. Try again.");
        }
    };
    
    

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow" style={{ width: "400px" }}>
                <h2 className="text-center mb-3">Signup</h2>

                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSignup}>
                    <div className="mb-3">
                        <input 
                            type="email" 
                            className="form-control" 
                            placeholder="Email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="mb-3">
                        <input 
                            type="password" 
                            className="form-control" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="btn btn-success w-100">Signup</button>
                </form>

                <p className="text-center mt-3">
                    Already have an account? <a href="/login" className="text-primary">Login here</a>
                </p>
            </div>
        </div>
    );
};

export default Signup;
