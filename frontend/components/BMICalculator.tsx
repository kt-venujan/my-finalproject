"use client";

import { useMemo, useState } from "react";

export default function BMICalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const bmiData = useMemo(() => {
    const h = Number(height);
    const w = Number(weight);

    if (!h || !w || h <= 0 || w <= 0) {
      return null;
    }

    const heightInMeters = h / 100;
    const bmi = w / (heightInMeters * heightInMeters);

    let status = "";
    let advice = "";

    if (bmi < 18.5) {
      status = "Underweight";
      advice = "Try a nutrient-rich meal plan to gain healthy weight.";
    } else if (bmi < 25) {
      status = "Normal";
      advice = "Great! Maintain your healthy lifestyle and balanced diet.";
    } else if (bmi < 30) {
      status = "Overweight";
      advice = "A calorie-controlled meal plan and regular activity can help.";
    } else {
      status = "Obese";
      advice = "Consider a structured diet plan and expert guidance.";
    }

    return {
      bmi: bmi.toFixed(1),
      status,
      advice,
    };
  }, [height, weight]);

  const handleReset = () => {
    setHeight("");
    setWeight("");
  };

  return (
    <section className="bmi-section">
      <div className="bmi-wrapper">
        <div className="bmi-left">
          <p className="bmi-tag">Health Tool</p>
          <h2>BMI Calculator</h2>
          <p className="bmi-desc">
            Check your Body Mass Index in seconds and get a quick health
            indication based on your height and weight.
          </p>

          <div className="bmi-form">
            <div className="bmi-field">
              <label htmlFor="height">Height (cm)</label>
              <input
                id="height"
                type="number"
                placeholder="Enter your height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>

            <div className="bmi-field">
              <label htmlFor="weight">Weight (kg)</label>
              <input
                id="weight"
                type="number"
                placeholder="Enter your weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            <div className="bmi-actions">
              <button type="button" className="bmi-btn" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="bmi-right">
          <div className="bmi-result-card">
            <h3>Your BMI Result</h3>

            {bmiData ? (
              <>
                <div className="bmi-score">{bmiData.bmi}</div>
                <p className="bmi-status">{bmiData.status}</p>
                <p className="bmi-advice">{bmiData.advice}</p>
              </>
            ) : (
              <>
                <div className="bmi-score bmi-empty">--</div>
                <p className="bmi-status">Enter your details</p>
                <p className="bmi-advice">
                  Fill your height and weight to calculate your BMI.
                </p>
              </>
            )}
          </div>

          <div className="bmi-scale-card">
            <h4>BMI Range</h4>
            <div className="bmi-scale-item">
              <span>Below 18.5</span>
              <strong>Underweight</strong>
            </div>
            <div className="bmi-scale-item">
              <span>18.5 - 24.9</span>
              <strong>Normal</strong>
            </div>
            <div className="bmi-scale-item">
              <span>25 - 29.9</span>
              <strong>Overweight</strong>
            </div>
            <div className="bmi-scale-item">
              <span>30 and above</span>
              <strong>Obese</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}