import Link from "next/link";

const todaysMeals = [
  { name: "Oatmeal Bowl", time: "08:15 AM", calories: 340, protein: "14g" },
  { name: "Grilled Chicken Salad", time: "01:05 PM", calories: 420, protein: "36g" },
  { name: "Greek Yogurt + Nuts", time: "04:30 PM", calories: 210, protein: "12g" },
  { name: "Salmon + Vegetables", time: "08:00 PM", calories: 510, protein: "39g" },
];

export default function MealTrackingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-slate-50 px-4 pb-12 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <section className="rounded-3xl border border-rose-100 bg-white/90 p-6 shadow-[0_20px_60px_rgba(190,24,93,0.12)] backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-rose-700">
                Meal Tracking
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Track Meals, Stay Consistent
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                Keep a quick log of your daily meals, monitor calories, and review your protein intake in one simple dashboard.
              </p>
            </div>

            <Link
              href="/dashboard/user"
              className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
            >
              Go to Dashboard
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Today Calories</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">1,480</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Protein</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">101g</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Meals Logged</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">4</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Water Intake</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">2.1L</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Today Log</h2>
            <p className="mt-1 text-sm text-slate-500">Simple snapshot of your recent meals.</p>

            <div className="mt-4 space-y-3">
              {todaysMeals.map((meal) => (
                <div
                  key={`${meal.name}-${meal.time}`}
                  className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{meal.name}</p>
                    <p className="text-xs text-slate-500">{meal.time}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-700">
                    <span>{meal.calories} kcal</span>
                    <span>{meal.protein} protein</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Quick Add Meal</h2>
            <p className="mt-1 text-sm text-slate-500">Fill this quickly after each meal.</p>

            <form className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Meal Name</label>
                <input
                  type="text"
                  placeholder="Example: Chicken Sandwich"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-rose-200 transition focus:ring-2"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Calories</label>
                  <input
                    type="number"
                    placeholder="320"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-rose-200 transition focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Protein (g)</label>
                  <input
                    type="number"
                    placeholder="20"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-rose-200 transition focus:ring-2"
                  />
                </div>
              </div>

              <button
                type="button"
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-800"
              >
                Save Meal
              </button>
            </form>

            <p className="mt-3 text-xs text-slate-500">This is a simple starter UI. We can connect it to backend storage next.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
