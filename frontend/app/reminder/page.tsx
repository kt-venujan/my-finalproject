"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiActivity, FiCoffee, FiDroplet } from "react-icons/fi";

type MealStatus = "done" | "upcoming" | "missed";

type MealItem = {
  name: string;
  time: string;
  status: MealStatus;
};

export default function ReminderPage() {
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterGoal] = useState(3);
  const [currentTime, setCurrentTime] = useState("");

  const [weightGoal] = useState(60);
  const [currentWeight, setCurrentWeight] = useState(64.2);

  const [waterInterval, setWaterInterval] = useState(20);

  const [meals, setMeals] = useState<MealItem[]>([
    { name: "Breakfast", time: "08:00", status: "done" },
    { name: "Lunch", time: "13:00", status: "upcoming" },
    { name: "Dinner", time: "19:30", status: "upcoming" },
  ]);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [lastWaterReminder, setLastWaterReminder] = useState<number | null>(null);
  const [notifiedMeals, setNotifiedMeals] = useState<string[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const waterPercent = useMemo(() => {
    return Math.min((waterIntake / waterGoal) * 100, 100);
  }, [waterIntake, waterGoal]);

  const weightDifference = useMemo(() => {
    return (currentWeight - weightGoal).toFixed(1);
  }, [currentWeight, weightGoal]);

  const nextMeal = useMemo(() => {
    return meals.find((meal) => meal.status === "upcoming");
  }, [meals]);

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.log("Notification permission error:", error);
      }
    }
  };

  const showBrowserNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  const playSound = async () => {
    try {
      if (!audioRef.current) return;
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
    } catch (error) {
      console.log("Audio play blocked until user interacts once.", error);
    }
  };

  const triggerAlert = async (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
    await playSound();

    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const handleDrinkWater = () => {
    setWaterIntake((prev) => Math.min(prev + 0.25, waterGoal));
  };

  const handleResetWater = () => {
    setWaterIntake(0);
  };

  const markMealDone = (mealName: string) => {
    setMeals((prev) =>
      prev.map((meal) =>
        meal.name === mealName ? { ...meal, status: "done" } : meal
      )
    );
  };

  const markMealMissed = (mealName: string) => {
    setMeals((prev) =>
      prev.map((meal) =>
        meal.name === mealName ? { ...meal, status: "missed" } : meal
      )
    );
  };

  const handleWeightUpdate = () => {
    setCurrentWeight((prev) => Number((prev - 0.2).toFixed(1)));
  };

  const handleMealTimeChange = (mealName: string, newTime: string) => {
    setMeals((prev) =>
      prev.map((meal) =>
        meal.name === mealName ? { ...meal, time: newTime } : meal
      )
    );
  };

  useEffect(() => {
    requestNotificationPermission();

    const savedWaterReminder = localStorage.getItem("lastWaterReminder");
    const savedMealNotifications = localStorage.getItem("notifiedMeals");
    const savedMeals = localStorage.getItem("reminderMeals");
    const savedWaterInterval = localStorage.getItem("waterInterval");

    if (savedWaterReminder) {
      setLastWaterReminder(Number(savedWaterReminder));
    }

    if (savedMealNotifications) {
      setNotifiedMeals(JSON.parse(savedMealNotifications));
    }

    if (savedMeals) {
      setMeals(JSON.parse(savedMeals));
    }

    if (savedWaterInterval) {
      setWaterInterval(Number(savedWaterInterval));
    }
  }, []);

  useEffect(() => {
    if (lastWaterReminder !== null) {
      localStorage.setItem("lastWaterReminder", String(lastWaterReminder));
    }
  }, [lastWaterReminder]);

  useEffect(() => {
    localStorage.setItem("notifiedMeals", JSON.stringify(notifiedMeals));
  }, [notifiedMeals]);

  useEffect(() => {
    localStorage.setItem("reminderMeals", JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem("waterInterval", String(waterInterval));
  }, [waterInterval]);

  useEffect(() => {
    const checkNow = async () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const formattedTime = `${hours}:${minutes}`;

      setCurrentTime(formattedTime);

      const nowTimestamp = Date.now();
      const intervalMs = waterInterval * 60 * 1000;

      if (
        lastWaterReminder === null ||
        nowTimestamp - lastWaterReminder >= intervalMs
      ) {
        showBrowserNotification("Water Reminder", "Time to drink some water.");
        await triggerAlert("Time to drink water.");
        setLastWaterReminder(nowTimestamp);
      }

      for (const meal of meals) {
        if (
          meal.time === formattedTime &&
          meal.status === "upcoming" &&
          !notifiedMeals.includes(meal.name)
        ) {
          showBrowserNotification(
            `${meal.name} Reminder`,
            `It's time for ${meal.name}.`
          );
          await triggerAlert(`It's time for ${meal.name}.`);
          setNotifiedMeals((prev) => [...prev, meal.name]);
        }
      }
    };

    checkNow();
    const interval = setInterval(checkNow, 60000);

    return () => clearInterval(interval);
  }, [lastWaterReminder, meals, notifiedMeals, waterInterval]);

  const mealStatusDotClass = (status: MealStatus) => {
    if (status === "done") return "bg-emerald-400";
    if (status === "missed") return "bg-rose-400";
    return "bg-amber-300";
  };

  const mealStatusPillClass = (status: MealStatus) => {
    if (status === "done") return "bg-emerald-500/20 text-emerald-200 border-emerald-300/30";
    if (status === "missed") return "bg-rose-500/20 text-rose-200 border-rose-300/30";
    return "bg-amber-400/20 text-amber-100 border-amber-200/30";
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#1a050d_0%,#14050a_42%,#090204_100%)] px-4 pb-12 pt-28 sm:px-6 lg:px-8">
      <audio ref={audioRef} src="/sounds/alert.mp3" preload="auto" />

      <div className="pointer-events-none absolute -left-16 top-28 h-72 w-72 rounded-full bg-[#ff6f97]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-16 h-80 w-80 rounded-full bg-[#ff8fa3]/20 blur-3xl" />

      <section className="relative mx-auto w-full max-w-7xl space-y-7">
        <header className="grid gap-6 rounded-3xl border border-[#ff7894]/25 bg-[rgba(52,7,24,0.72)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:p-8">
          <div className="space-y-4">
            <span className="inline-flex w-fit rounded-full border border-[#ff9eb5]/40 bg-[#ff9eb5]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#ffdce5]">
              Smart Reminder System
            </span>

            <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              Your Daily <span className="text-[#ffb7c8]">Health Reminders</span>
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-[#ffdce5]/85 sm:text-base">
              Water intake, meal timing and weight progress reminders in one aligned dashboard, fully optimized for everyday consistency.
            </p>

            <div className="inline-flex items-center rounded-xl border border-[#ff9eb5]/30 bg-[rgba(20,5,10,0.65)] px-4 py-2 text-sm font-semibold text-[#ffdce5]">
              Current Time: <span className="ml-2 text-white">{currentTime || "--:--"}</span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative h-52 w-52 sm:h-60 sm:w-60">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ff7894]/30 to-[#ff9eb5]/20 blur-md" />
              <div className="absolute inset-5 rounded-full border border-[#ffb7c8]/60" />
              <div className="absolute inset-0 animate-pulse rounded-full border border-[#ffdce5]/25" />
              <div className="absolute inset-9 animate-pulse rounded-full border border-[#ff9eb5]/30" />
              <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff9eb5] shadow-[0_0_30px_rgba(255,130,170,0.75)]" />
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#ff7894]/25 bg-[rgba(52,7,24,0.72)] p-4 text-[#ffe7ed] backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.12em] text-[#ffb7c8]/80">Today&apos;s Focus</p>
            <p className="mt-2 text-lg font-semibold">Consistency</p>
          </div>

          <div className="rounded-2xl border border-[#ff7894]/25 bg-[rgba(52,7,24,0.72)] p-4 text-[#ffe7ed] backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.12em] text-[#ffb7c8]/80">Next Reminder</p>
            <p className="mt-2 text-lg font-semibold">{nextMeal ? `${nextMeal.name} - ${nextMeal.time}` : "All Done"}</p>
          </div>

          <div className="rounded-2xl border border-[#ff7894]/25 bg-[rgba(52,7,24,0.72)] p-4 text-[#ffe7ed] backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.12em] text-[#ffb7c8]/80">Weight Goal</p>
            <p className="mt-2 text-lg font-semibold">{weightGoal} kg</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <article className="flex h-full flex-col rounded-3xl border border-[#ff7894]/25 bg-[rgba(52,7,24,0.72)] p-6 text-[#ffe7ed] shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#ffb7c8]/80">Hydration</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Water Intake</h2>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#ff9eb5]/20 text-[#ffdce5]">
                <FiDroplet className="h-5 w-5" />
              </div>
            </div>

            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-3xl font-extrabold text-white">{waterIntake.toFixed(2)}L</h3>
                <p className="text-sm text-[#ffdce5]/75">of {waterGoal}L goal</p>
              </div>
              <div className="grid h-16 w-16 place-items-center rounded-full border border-[#ffb7c8]/35 bg-[#ff9eb5]/10 text-sm font-semibold text-[#ffdce5]">
                {Math.round(waterPercent)}%
              </div>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-[rgba(20,5,10,0.8)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#ff9eb5] to-[#ff7894]"
                style={{ width: `${waterPercent}%` }}
              />
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <label htmlFor="waterInterval" className="text-sm font-medium text-[#ffdce5]">Reminder Interval</label>
              <select
                id="waterInterval"
                value={waterInterval}
                onChange={(e) => setWaterInterval(Number(e.target.value))}
                className="rounded-lg border border-[#ff9eb5]/30 bg-[rgba(20,5,10,0.75)] px-3 py-2 text-sm text-white outline-none transition focus:border-[#ffb7c8]"
              >
                <option value={20}>20 mins</option>
                <option value={30}>30 mins</option>
                <option value={60}>1 hour</option>
              </select>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#ffdce5]/75">
              <span>Auto reminder every {waterInterval} mins</span>
              <span>Small steps matter</span>
            </div>

            <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-2">
              <button
                className="rounded-xl bg-[#ff9eb5] px-4 py-2.5 text-sm font-semibold text-[#1a050d] transition hover:bg-[#ffb7c8]"
                onClick={handleDrinkWater}
              >
                Drink Now
              </button>
              <button
                className="rounded-xl border border-[#ff9eb5]/30 bg-[rgba(255,158,181,0.08)] px-4 py-2.5 text-sm font-semibold text-[#ffe7ed] transition hover:bg-[rgba(255,158,181,0.16)]"
                onClick={handleResetWater}
              >
                Reset
              </button>
            </div>
          </article>

          <article className="flex h-full flex-col rounded-3xl border border-[#ff7894]/25 bg-[rgba(52,7,24,0.72)] p-6 text-[#ffe7ed] shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#ffb7c8]/80">Nutrition</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Meal Time Reminder</h2>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#ff9eb5]/20 text-[#ffdce5]">
                <FiCoffee className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-3">
              {meals.map((meal) => (
                <div
                  className="grid gap-3 rounded-2xl border border-[#ff9eb5]/20 bg-[rgba(20,5,10,0.55)] p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  key={meal.name}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${mealStatusDotClass(meal.status)}`} />
                    <div>
                      <h4 className="text-base font-semibold text-white">{meal.name}</h4>

                      <input
                        type="time"
                        value={meal.time}
                        onChange={(e) => handleMealTimeChange(meal.name, e.target.value)}
                        className="mt-1 rounded-lg border border-[#ff9eb5]/25 bg-[rgba(20,5,10,0.75)] px-3 py-1.5 text-sm text-[#ffe7ed] outline-none transition focus:border-[#ffb7c8]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${mealStatusPillClass(meal.status)}`}>
                      {meal.status}
                    </span>

                    <div className="flex items-center gap-2">
                      {meal.status !== "done" && (
                        <button
                          className="min-w-16 rounded-lg bg-emerald-400/20 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/30"
                          onClick={() => markMealDone(meal.name)}
                        >
                          Done
                        </button>
                      )}

                      {meal.status === "upcoming" && (
                        <button
                          className="min-w-16 rounded-lg bg-rose-400/20 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/30"
                          onClick={() => markMealMissed(meal.name)}
                        >
                          Miss
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="flex h-full flex-col rounded-3xl border border-[#ff7894]/25 bg-[rgba(52,7,24,0.72)] p-6 text-[#ffe7ed] shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#ffb7c8]/80">Progress</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Weight Loss Goal</h2>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#ff9eb5]/20 text-[#ffdce5]">
                <FiActivity className="h-5 w-5" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#ff9eb5]/20 bg-[rgba(20,5,10,0.55)] p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-[#ffb7c8]/80">Current</p>
                <p className="mt-2 text-2xl font-bold text-white">{currentWeight.toFixed(1)} kg</p>
              </div>

              <div className="rounded-2xl border border-[#ff9eb5]/20 bg-[rgba(20,5,10,0.55)] p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-[#ffb7c8]/80">Target</p>
                <p className="mt-2 text-2xl font-bold text-white">{weightGoal} kg</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[#ff9eb5]/30 bg-[rgba(255,120,148,0.12)] p-4">
              <p className="text-sm text-[#ffdce5]">You are</p>
              <h3 className="mt-1 text-3xl font-extrabold text-white">{weightDifference} kg away</h3>
              <p className="mt-1 text-xs text-[#ffdce5]/75">Stay on track with your meals and water intake</p>
            </div>

            <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-2">
              <button
                className="rounded-xl bg-[#ff9eb5] px-4 py-2.5 text-sm font-semibold text-[#1a050d] transition hover:bg-[#ffb7c8]"
                onClick={handleWeightUpdate}
              >
                Update Progress
              </button>
              <button className="rounded-xl border border-[#ff9eb5]/30 bg-[rgba(255,158,181,0.08)] px-4 py-2.5 text-sm font-semibold text-[#ffe7ed] transition hover:bg-[rgba(255,158,181,0.16)]">
                View Plan
              </button>
            </div>
          </article>
        </section>
      </section>

      {showAlert && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#ff9eb5]/35 bg-[rgba(26,5,13,0.95)] p-5 text-center shadow-2xl">
            <h2 className="text-lg font-bold text-white">{alertMessage}</h2>
            <button
              onClick={() => setShowAlert(false)}
              className="mt-4 rounded-xl bg-[#ff9eb5] px-4 py-2 text-sm font-semibold text-[#1a050d] transition hover:bg-[#ffb7c8]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}