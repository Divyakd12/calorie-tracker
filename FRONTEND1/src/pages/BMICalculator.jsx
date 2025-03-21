import React, { useState, useEffect } from "react";

const BMICalculator = ({ userEmail, closeModal }) => {
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("male");
    const [bmi, setBmi] = useState(null);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    // ✅ Fix: Ensure userEmail is retrieved properly
    useEffect(() => {
        let storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
        let storedEmail = userEmail || (storedUser ? storedUser.email : null);
    
        console.log("🔍 Checking stored email:", storedEmail); // Debugging log
    
        if (!storedEmail) {
            console.warn("⚠️ No user email provided. Skipping BMI fetch.");
            return;
        }
    
        fetch(`http://localhost:5000/user-bmi?email=${storedEmail}`)
            .then(res => res.json())
            .then(data => {
                if (data.bmi) {
                    setBmi(data.bmi);
                    setStatus(data.status);
                }
            })
            .catch(err => console.error("❌ Error fetching BMI:", err));
    }, [userEmail]);
    

    const calculateBMI = () => {
        setError(""); // Clear previous errors

        let storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
        let storedEmail = userEmail || (storedUser ? storedUser.email : null);

        if (!storedEmail) {
            setError("User email is missing! Please log in.");
            console.error("❌ No user email found, cannot save BMI.");
            return;
        }

        if (!height || !weight || !age) {
            setError("Please fill in all fields.");
            return;
        }

        const heightMeters = parseFloat(height) / 100;
        const weightKg = parseFloat(weight);
        const ageNum = parseInt(age);

        if (isNaN(heightMeters) || isNaN(weightKg) || isNaN(ageNum) || heightMeters <= 0 || weightKg <= 0 || ageNum <= 0) {
            setError("Invalid height, weight, or age values.");
            return;
        }

        const calculatedBMI = (weightKg / (heightMeters * heightMeters)).toFixed(2);
        let bmiStatus = calculatedBMI < 18.5 ? "Gain weight" :
                        calculatedBMI >= 18.5 && calculatedBMI <= 24.9 ? "Maintain weight" :
                        "Reduce weight";

        setBmi(calculatedBMI);
        setStatus(bmiStatus);

        // ✅ Send BMI data to the server
        fetch("http://localhost:5000/save-bmi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: storedEmail, bmi: calculatedBMI, status: bmiStatus }),
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("✅ Server Response:", data);
            alert("BMI saved successfully!");
        })
        .catch(error => {
            console.error("❌ Error saving BMI:", error);
            setError("Failed to save BMI. Please try again.");
        });
    };

    return (
        <div>
            <h4>BMI Calculator</h4>

            {error && <p className="text-danger">{error}</p>}

            <div className="mb-2">
                <input type="number" className="form-control" placeholder="Height (cm)" value={height} onChange={(e) => setHeight(e.target.value)} required />
            </div>
            <div className="mb-2">
                <input type="number" className="form-control" placeholder="Weight (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} required />
            </div>
            <div className="mb-2">
                <input type="number" className="form-control" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} required />
            </div>
            <div className="mb-2">
                <select className="form-control" value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
            </div>
            <button className="btn btn-primary w-100" onClick={calculateBMI}>Calculate BMI</button>

            {bmi && (
                <div className="mt-3">
                    <h5>Your BMI: {bmi}</h5>
                    <p><strong>Recommendation:</strong> {status}</p>
                </div>
            )}

            <button className="btn btn-secondary w-100 mt-2" onClick={closeModal}>Close</button>
        </div>
    );
};

export default BMICalculator;
