import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BMICalculator from "./BMICalculator";
import LogMeal from "./LogMeal"; 
import { Bar } from "react-chartjs-2";
import axios from "axios";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("loggedInUser")) || {};
    const [showBMIForm, setShowBMIForm] = useState(false);
    const [showMealForm, setShowMealForm] = useState(false);
    const [calorieData, setCalorieData] = useState([]);
    const [dates, setDates] = useState([]);
    const [refreshData, setRefreshData] = useState(false); // 🔄 New State to Trigger Refresh

    // Function to fetch meal data
    const fetchMealData = () => {
        if (user.email) {
            axios.get(`http://localhost:5000/user-meals?email=${user.email}`, {
                headers: {
                    "Cache-Control": "no-cache",
                    "Pragma": "no-cache",
                    "Expires": "0"
                }
            })
            .then(response => {
                const meals = response.data;
                const last10Days = meals.slice(-10); // Get last 10 entries
    
                setCalorieData(last10Days.map(meal => meal.totalCalories));
                setDates(last10Days.map(meal => meal.date));
            })
            .catch(error => console.error("Error fetching meal data:", error));
        }
    };
    

    useEffect(() => {
        fetchMealData();
    }, [user.email, refreshData]); // 🔄 Re-fetch when `refreshData` changes

    // Function to update graph after logging a meal
    const handleMealLogged = () => {
        axios.get(`http://localhost:5000/user-meals?email=${user.email}`)
            .then(response => {
                const meals = response.data;
                const last10Days = meals.slice(-10); // Get last 10 entries
    
                setCalorieData(last10Days.map(meal => meal.totalCalories));
                setDates(last10Days.map(meal => meal.date));
            })
            .catch(error => console.error("Error fetching meal data:", error));
    
        setShowMealForm(false); // Close modal
    };
    
    {showMealForm && <LogMeal userEmail={user?.email} closeModal={() => setShowMealForm(false)} onMealLogged={handleMealLogged} />}
    

    // Graph Data
    const data = {
        labels: dates, // X-axis (Last 10 days)
        datasets: [
            {
                label: "Calories",
                data: calorieData, // Y-axis (Calorie values)
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: "Calorie Intake Over Last 10 Days" },
        },
        scales: {
            y: { beginAtZero: true },
        },
    };

    return (
        <div className="container-fluid">
            <nav className="navbar navbar-dark bg-dark text-white p-3">
                <span className="navbar-brand">Calorie Tracker</span>
                <button className="btn btn-danger" onClick={() => { localStorage.removeItem("loggedInUser"); navigate("/"); }}>Logout</button>
            </nav>

            <div className="row">
                <div className="col-md-3 bg-light sidebar p-3">
                    <h5>Dashboard</h5>
                    <ul className="list-group">
                        <li className="list-group-item" onClick={() => setShowBMIForm(true)}>BMI Calculator</li>
                        <li className="list-group-item"><a href="#">Calorie Tracker</a></li>
                    </ul>
                </div>

                <div className="col-md-9 p-4">
                    <h2>Welcome, {user?.email || "User"}!</h2>
                    <p>Track your calorie intake & maintain a healthy lifestyle.</p>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="card p-3 shadow">
                                <h4>BMI Calculator</h4>
                                <button className="btn btn-primary w-100 mt-2" onClick={() => setShowBMIForm(true)}>Check BMI</button>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="card p-3 shadow">
                                <h4>Last 10 Days Calorie Intake</h4>
                                {calorieData.length > 0 ? (
                                    <Bar data={data} options={options} />
                                ) : (
                                    <p>No calorie data available.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card p-3 mt-4 shadow">
                        <h4>Track Calories</h4>
                        <button className="btn btn-success w-100 mt-2" onClick={() => setShowMealForm(true)}>Log Meal</button>
                    </div>
                </div>
            </div>

            {showBMIForm && (
                <BMICalculator userEmail={user?.email} closeModal={() => setShowBMIForm(false)} />
            )}

            {showMealForm && <LogMeal userEmail={user?.email} closeModal={handleMealLogged} />}
        </div>
    );
};

export default Dashboard;
