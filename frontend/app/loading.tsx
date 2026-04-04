const LOADER_TEXT = "DIETARA";
const LOADER_TAGLINE = "Crafting Your Meal Journey";

export default function Loading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#12020a] via-[#19040f] to-[#0e0207] px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-12 h-80 w-80 rounded-full bg-[#ff4f82]/20 blur-[110px]" />
        <div className="absolute bottom-0 right-[-140px] h-[24rem] w-[24rem] rounded-full bg-[#ff8caf]/15 blur-[120px]" />
      </div>

      <section className="relative text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ffc8d8]">
          {LOADER_TAGLINE}
        </p>

        <div className="mt-5 flex items-center justify-center gap-1.5 sm:gap-2">
          {LOADER_TEXT.split("").map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="dietara-loader-letter text-4xl font-extrabold tracking-[0.12em] text-[#ffe3eb] sm:text-5xl"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              {letter}
            </span>
          ))}
        </div>

        <div className="mx-auto mt-6 h-1.5 w-52 overflow-hidden rounded-full bg-[#ff9fba]/20">
          <div className="h-full w-1/2 animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-[#ff88aa] via-[#ffd4df] to-[#ff6e98]" />
        </div>
      </section>
    </main>
  );
}
