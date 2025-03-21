import React, { useState, useEffect } from "react";
import axios from "axios";

const LogMeal = ({ userEmail, closeModal }) => {
    const [foods, setFoods] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [selectedFood, setSelectedFood] = useState("");
    const [quantity, setQuantity] = useState("");
    const [addedFoods, setAddedFoods] = useState([]);
    const [totalCalories, setTotalCalories] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        axios.get("http://localhost:5000/foods")
            .then(res => {
                console.log("Fetched foods:", res.data); // Debugging
                setFoods(res.data);
            })
            .catch(err => console.error("Error fetching foods:", err));
    }, []);
    

    const handleAddFood = () => {
        if (!selectedFood || !quantity) return;

        const foodItem = foods.find(food => food.name === selectedFood);
        const foodCalories = (foodItem.calories * quantity) / 100;

        setAddedFoods([...addedFoods, { name: selectedFood, calories: foodCalories, quantity }]);
        setTotalCalories(totalCalories + foodCalories);
    };

    const handleRemoveFood = (index) => {
        const updatedFoods = [...addedFoods];
        const removedFood = updatedFoods.splice(index, 1)[0];
        setAddedFoods(updatedFoods);
        setTotalCalories(totalCalories - removedFood.calories);
    };

    const handleSubmit = () => {
        axios.post("http://localhost:5000/add-meal", {
            email: userEmail, 
            date: selectedDate, 
            totalCalories 
        })
        .then(() => {
            alert("Meal logged successfully!");
            setSubmitted(true);
            closeModal(); // 🔄 Call this to update graph
        })
        .catch(err => {
            if (err.response && err.response.status === 400) {
                alert(err.response.data.message);
            } else {
                console.error("Error logging meal:", err);
            }
        });
    };
    
    
    

    return (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Log Meal</h5>
                        <button className="close" onClick={closeModal}>&times;</button>
                    </div>
                    <div className="modal-body">
                        <label>Select Date:</label>
                        <input type="date" className="form-control" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} disabled={submitted} />

                        <label>Select Food:</label>
                        <select className="form-control" onChange={(e) => setSelectedFood(e.target.value)} disabled={submitted}>
                            <option value="">Choose...</option>
                            {foods.map(food => <option key={food.name} value={food.name}>{food.name}</option>)}
                        </select>

                        <label>Quantity (grams):</label>
                        <input type="number" className="form-control" value={quantity} onChange={(e) => setQuantity(e.target.value)} disabled={submitted} />

                        <button className="btn btn-primary mt-2" onClick={handleAddFood} disabled={submitted}>+ Add Food</button>

                        <ul className="list-group mt-2">
                            {addedFoods.map((food, index) => (
                                <li className="list-group-item d-flex justify-content-between">
                                    {food.name} - {food.quantity}g ({food.calories.toFixed(2)} cal)
                                    <button className="btn btn-danger btn-sm" onClick={() => handleRemoveFood(index)}>X</button>
                                </li>
                            ))}
                        </ul>

                        <h5 className="mt-2">Total Calories: {totalCalories.toFixed(2)}</h5>

                        <button className="btn btn-success mt-2 w-100" onClick={handleSubmit} disabled={submitted}>Submit</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogMeal;
