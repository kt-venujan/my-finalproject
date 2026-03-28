export const generateDietPlan = async (req, res) => {
  try {
    const {
      age,
      gender,
      weight,
      height,
      goal,
      foodPreference,
    } = req.body;

    let breakfast = [];
    let lunch = [];
    let dinner = [];

    // 🔥 BASE PLAN
    if (foodPreference === "Veg") {
      breakfast = ["Oats", "Banana", "Green Tea"];
      lunch = ["Brown Rice", "Vegetables", "Dal"];
      dinner = ["Salad", "Soup"];
    } else {
      breakfast = ["Boiled Eggs", "Oats", "Black Coffee"];
      lunch = ["Chicken", "Rice", "Vegetables"];
      dinner = ["Fish", "Salad"];
    }

    // 🎯 GOAL BASED MODIFICATION
    if (goal === "Weight Loss") {
      breakfast.push("Low Sugar");
      lunch.push("Less Oil");
      dinner.push("Light Meal");
    }

    if (goal === "Weight Gain") {
      breakfast.push("Peanut Butter");
      lunch.push("Extra Rice");
      dinner.push("Milk");
    }

    // 🧠 SIMPLE CALORIE LOGIC
    let calories = 1800;

    if (goal === "Weight Loss") calories = 1500;
    if (goal === "Weight Gain") calories = 2500;

    res.json({
      success: true,
      calories,
      plan: {
        breakfast,
        lunch,
        dinner,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};