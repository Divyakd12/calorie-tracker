const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const USERS_FILE = "users.json";
const FOODS_FILE = "foods.json";

const loadFoods = () => {
    try {
        if (!fs.existsSync(FOODS_FILE)) {
            const initialFoods = [
                { id: 1, name: "Apple", calories: 95, protein: 0.5, carbs: 25, fats: 0.3 },
                { id: 2, name: "Egg", calories: 70, protein: 6, carbs: 1, fats: 5 },
                { id: 3, name: "Chicken Breast (100g)", calories: 165, protein: 31, carbs: 0, fats: 3.6 },
                { id: 4, name: "Rice (1 cup)", calories: 200, protein: 4, carbs: 45, fats: 0.5 }
            ];
            fs.writeFileSync(FOODS_FILE, JSON.stringify(initialFoods, null, 2), "utf8");
        }
        return JSON.parse(fs.readFileSync(FOODS_FILE, "utf8"));
    } catch (error) {
        console.error("Error loading food database:", error);
        return [];
    }
};

app.get("/user-meals", (req, res) => {
    const { email } = req.query;
    let users = loadUsers();
    
    let user = users.find(user => user.email === email);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.meals || []);
});


// **Fetch available food items**
app.get("/foods", (req, res) => {
    fs.readFile(FOODS_FILE, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading foods.json:", err);
            return res.status(500).json({ message: "Error reading foods data" });
        }

        try {
            const foods = JSON.parse(data);
            res.json(foods);
        } catch (parseError) {
            console.error("Error parsing foods.json:", parseError);
            res.status(500).json({ message: "Error parsing foods data" });
        }
    });
});





// **Log a user's meal**
app.post("/add-meal", (req, res) => {
    const { email, date, totalCalories } = req.body;

    if (!email || !date || totalCalories === undefined) {
        return res.status(400).json({ message: "All fields are required." });
    }

    let users = loadUsers();
    let userIndex = users.findIndex(user => user.email === email);

    if (userIndex === -1) {
        return res.status(404).json({ message: "User not found." });
    }

    // Ensure the user has a meals array
    if (!users[userIndex].meals) {
        users[userIndex].meals = [];
    }

    // **Check if the user has already logged a meal for this date**
    let existingMeal = users[userIndex].meals.find(meal => meal.date === date);
    if (existingMeal) {
        return res.status(400).json({ message: "You have already logged a meal for this date." });
    }

    // Store only date and total calories
    users[userIndex].meals.push({ date, totalCalories });

    saveUsers(users);

    console.log(`✅ Meal logged for ${email} on ${date}: ${totalCalories} cal`);
    return res.json({ message: "Meal logged successfully", meals: users[userIndex].meals });
});



// Load users from JSON file (Auto-Create if Missing)
const loadUsers = () => {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            fs.writeFileSync(USERS_FILE, "[]", "utf8"); // Create empty file
        }
        const data = fs.readFileSync(USERS_FILE, "utf8");
        return JSON.parse(data.length ? data : "[]"); // Handle empty file case
    } catch (error) {
        console.error("Error loading users:", error);
        return [];
    }
};

// Save users to JSON file
const saveUsers = (users) => {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
    } catch (error) {
        console.error("Error saving users:", error);
    }
};

// **Signup Route**
app.post("/signup", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    let users = loadUsers();

    // Check if user already exists
    if (users.some(user => user.email === email)) {
        return res.status(400).json({ message: "User already exists." });
    }

    // Register new user with default BMI fields
    users.push({ email, password, bmi: null, bmiStatus: "" });
    saveUsers(users);

    console.log("✅ New user registered:", email);
    return res.status(201).json({ message: "Signup successful. Redirecting to login..." });
});

// **Login Route**
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    let users = loadUsers();

    // Check if user exists and password matches
    const user = users.find(user => user.email === email && user.password === password);

    if (!user) {
        return res.status(401).json({ message: "Invalid email or password." });
    }

    console.log("🔓 User logged in:", email);
    return res.status(200).json({ message: "Login successful." });
});

// **Fetch BMI for a User**
app.get("/user-bmi", (req, res) => {
    const { email } = req.query;
    let users = loadUsers();
    const user = users.find(user => user.email === email);

    if (user) {
        res.json({ bmi: user.bmi, status: user.bmiStatus });
    } else {
        res.status(404).json({ message: "User not found" });
    }
});

// **Save BMI Data (Now Updates Correctly)**
app.post("/save-bmi", (req, res) => {
    console.log("Incoming BMI Data:", req.body); // Log request body

    const { email, bmi, status } = req.body;
    if (!email || !bmi || !status) {
        console.error("❌ Missing fields in request:", req.body);
        return res.status(400).json({ message: "Missing email, bmi, or status" });
    }

    let users = loadUsers();
    let userIndex = users.findIndex(user => user.email === email);

    if (userIndex !== -1) {
        users[userIndex].bmi = bmi;
        users[userIndex].bmiStatus = status;

        saveUsers(users);
        console.log(`✅ BMI updated for ${email}: ${bmi} (${status})`);
        return res.json({ message: "BMI saved successfully", updatedUser: users[userIndex] });
    } else {
        console.error(`❌ User not found: ${email}`);
        return res.status(400).json({ message: "User not found" });
    }
});



// **Fetch All Users (For Debugging)**
app.get("/users", (req, res) => {
    const users = loadUsers();
    res.json(users);
});

// **Start Server**
app.listen(5000, () => console.log("✅ Server running on port 5000"));
