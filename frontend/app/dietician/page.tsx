"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import BookingModal from "@/components/BookingModal";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

type Dietician = {
  _id: string;
  user: { _id: string; username: string; email: string };
  specialization: string;
  bio: string;
  experience: number;
  price: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isAvailable: boolean;
  availableSlots: string[];
  certificateStatus: string;
  avatar?: string;
};

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="flex items-center gap-[2px] mb-3 text-base">
      {Array.from({ length: 5 }, (_, i) => (
        <span 
          key={i} 
          className={i < full ? "text-amber-500" : i === full && half ? "text-amber-500" : "text-neutral-700"}
        >
          ★
        </span>
      ))}
      <span className="text-[13px] text-white/60 ml-1.5">{rating > 0 ? rating.toFixed(1) : "New"}</span>
    </span>
  );
}

export default function DieticianPage() {
  const { user, openLogin } = useAuth();
  const [dieticians, setDieticians] = useState<Dietician[]>([]);
  const [filter, setFilter] = useState<"all" | "available" | "verified">("available");
  const [selected, setSelected] = useState<Dietician | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "/diet-hero.jpg",
      title: "Find Your",
      highlight: "Dietician",
      subtitle: "Book a personalized consultation with a certified nutrition expert."
    },
    {
      image: "/meal.jpg",
      title: "Customized",
      highlight: "Meal Plans",
      subtitle: "Get a diet plan tailored exactly to your body type and fitness goals."
    },
    {
      image: "/track.jpg",
      title: "Track Your",
      highlight: "Progress",
      subtitle: "Stay motivated with regular check-ins and progress tracking."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const fetchDieticians = async () => {
      try {
        const res = await api.get("/dieticians");
        setDieticians(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dieticians");
      } finally {
        setLoading(false);
      }
    };
    fetchDieticians();
  }, []);

  const handleBook = (d: Dietician) => {
    if (!user) {
      toast.info("Please login to book a consultation");
      openLogin();
      return;
    }
    if (user.role !== "user") {
      toast.warning("Only users can book consultations");
      return;
    }
    setSelected(d);
  };

  const filtered = dieticians.filter((d) => {
    const matchSearch =
      d.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(search.toLowerCase());

    if (filter === "available") return d.isAvailable && matchSearch;
    if (filter === "verified") return d.isVerified && matchSearch;
    return matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white pt-[90px]">

      {/* HERO SLIDER */}
      <section className="relative w-full overflow-hidden flex flex-col justify-center items-center py-16 px-10 min-h-[400px]">
        
        {/* Background Images */}
        {slides.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a0a12]/95 via-[#2d0f1e]/85 to-[#0d0d0d]/95 z-10"></div>
            <img 
              src={slide.image} 
              alt="Slider background" 
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Content (Z-index above background) */}
        <div className="relative z-20 text-center flex flex-col items-center justify-center w-full h-full my-auto mt-6">
          <div className="mb-6 flex flex-col justify-center items-center transition-all duration-500 max-w-4xl px-4">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg text-white">
              {slides[currentSlide].title} <span className="text-[#ff4d6d]">{slides[currentSlide].highlight}</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-[700px] mx-auto drop-shadow-md font-medium">
              {slides[currentSlide].subtitle}
            </p>
          </div>
          
          <div className="flex justify-center gap-8 md:gap-16 mt-4 bg-[#0d0d0d]/60 px-8 py-5 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl">
            <div className="text-center">
              <h3 className="text-[32px] md:text-4xl font-extrabold text-[#ff4d6d]">{dieticians.length}+</h3>
              <p className="text-white/70 text-xs md:text-sm mt-1 uppercase tracking-widest font-semibold">Experts</p>
            </div>
            <div className="text-center">
              <h3 className="text-[32px] md:text-4xl font-extrabold text-[#ff4d6d]">{dieticians.filter(d => d.isVerified).length}</h3>
              <p className="text-white/70 text-xs md:text-sm mt-1 uppercase tracking-widest font-semibold">Verified</p>
            </div>
            <div className="text-center">
              <h3 className="text-[32px] md:text-4xl font-extrabold text-[#ff4d6d]">4.8★</h3>
              <p className="text-white/70 text-xs md:text-sm mt-1 uppercase tracking-widest font-semibold">Avg Rating</p>
            </div>
          </div>
          
          {/* Slide Indicators */}
          <div className="flex gap-2 mt-10">
            {slides.map((_, index) => (
              <button 
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "w-8 bg-[#ff4d6d]" : "w-2 bg-white/30 hover:bg-white/50"}`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-10 pb-2 pt-8 max-w-7xl mx-auto" data-scroll-reveal>
        <div className="rounded-2xl border border-[#3a2430] bg-gradient-to-r from-[#1e1016] to-[#151515] p-5 md:p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#ff9fb5] font-semibold">Plan Your Flow</p>
            <h2 className="mt-2 text-xl md:text-2xl font-bold text-white">Need help before booking?</h2>
            <p className="mt-1 text-sm text-white/70">Start with AI guidance or compare memberships, then book the best-fit dietician.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/ai-assistant"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#8b0c2e] to-[#c4234a] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Generate AI Diet Plan
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl border border-[#ffb9cb]/35 bg-[#1d1216] px-4 py-2.5 text-sm font-semibold text-[#ffe4ec] transition hover:border-[#ffb9cb]/60"
            >
              See Pricing Plans
            </Link>
          </div>
        </div>
      </section>

      {/* FILTERS + SEARCH */}
      <div className="pt-12 pb-8 px-10 flex flex-col md:flex-row gap-6 items-center justify-between max-w-7xl mx-auto">
        <div className="relative w-full md:max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input
            className="w-full pl-12 pr-4 py-3.5 border-2 border-[#2a2a2a] rounded-2xl bg-[#1a1a1a] text-white text-[15px] outline-none focus:border-[#8b0c2e] focus:bg-[#222] transition-colors shadow-inner"
            placeholder="Search by name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {(["available", "verified", "all"] as const).map((f) => (
            <button
              key={f}
              className={`py-3 px-6 rounded-xl font-bold text-[13px] uppercase tracking-wide transition-all duration-300 cursor-pointer whitespace-nowrap
                ${filter === f 
                  ? "bg-gradient-to-r from-[#8b0c2e] to-[#c4234a] text-white shadow-lg shadow-[#8b0c2e]/20" 
                  : "bg-[#1a1a1a] border border-[#2a2a2a] text-[#888] hover:border-[#8b0c2e] hover:text-white"
                }`}
              onClick={() => setFilter(f)}
            >
              {f === "available" ? "● Available" : f === "verified" ? "✅ Verified" : "All Dieticians"}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="text-center py-32 px-5 text-white/50">
          <div className="w-12 h-12 border-4 border-[#333] border-t-[#8b0c2e] rounded-full animate-spin mx-auto mb-6" />
          <p className="text-lg tracking-wide">Loading dieticians...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-32 px-5 text-white/50">
          <p className="text-xl tracking-wide">No dieticians found</p>
          <button 
            onClick={() => {setSearch(""); setFilter("all");}}
            className="mt-4 text-[#ff4d6d] hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-10 pb-24 max-w-7xl mx-auto">
          {filtered.map((d) => (
            <div 
              key={d._id} 
              className={`bg-[#151515] rounded-[24px] p-6 border border-[#2a2a2a] transition-all duration-300 flex flex-col hover:border-[#8b0c2e]/60 hover:-translate-y-1.5 hover:shadow-[0_15px_35px_rgba(139,12,46,0.15)] overflow-hidden relative group ${!d.isAvailable ? "opacity-60 saturate-50" : ""}`}
            >
              {/* Subtle top glow effect */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8b0c2e] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* AVATAR & BADGES */}
              <div className="flex justify-between items-start mb-5 relative z-10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8b0c2e] to-[#ff4d6d] flex items-center justify-center text-2xl font-black text-white shadow-lg overflow-hidden border-2 border-[#1a1a1a]">
                  {d.avatar ? (
                    <img src={d.avatar} alt={d.user?.username} className="w-full h-full object-cover" />
                  ) : (
                    <span>{d.user?.username?.[0]?.toUpperCase() || "D"}</span>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {d.isVerified && <span className="py-1 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#16a34a]/10 text-green-400 border border-[#16a34a]/20">✅ Verified</span>}
                  <span className={`py-1 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider border ${d.isAvailable ? "bg-[#16a34a]/10 text-green-400 border-[#16a34a]/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                    {d.isAvailable ? "● Available" : "○ Busy"}
                  </span>
                </div>
              </div>

              {/* INFO */}
              <div className="relative z-10 flex-grow">
                <h3 className="text-[22px] text-white mb-0.5 font-bold tracking-tight">{d.user?.username}</h3>
                <p className="text-[#ff4d6d] text-[15px] font-semibold mb-3">{d.specialization}</p>
                {d.bio && <p className="text-white/50 text-[14px] mb-4 leading-relaxed line-clamp-3">{d.bio}</p>}

                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={d.rating || 0} />
                  {d.reviewCount > 0 && (
                    <span className="text-[13px] text-white/40 mb-3 block">({d.reviewCount} reviews)</span>
                  )}
                </div>
              </div>

              {/* META */}
              <div className="flex gap-4 items-center justify-between min-h-[44px] mt-4 pt-4 border-t border-[#ffffff0a] relative z-10">
                <div className="flex items-center gap-1.5 text-[14px] text-white/60 font-medium">
                  {d.experience > 0 && (
                    <>
                      <span className="text-lg">🎓</span>
                      <span>{d.experience} yrs</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[16px] text-[#ff4d6d] font-bold">
                  <span className="text-lg">💰</span>
                  <span>Rs. {(d.price || 1500).toLocaleString()}</span>
                </div>
              </div>

              {/* CTA */}
              <button
                className="mt-5 w-full py-3.5 border-none rounded-xl bg-[#222] text-white text-[15px] font-bold cursor-pointer transition-all duration-300 hover:bg-gradient-to-br hover:from-[#8b0c2e] hover:to-[#ff4d6d] hover:shadow-[0_8px_20px_rgba(139,12,46,0.35)] disabled:opacity-50 disabled:cursor-not-allowed group-hover:bg-[#333] relative z-10"
                disabled={!d.isAvailable}
                onClick={() => handleBook(d)}
              >
                {d.isAvailable ? "Book Consultation" : "Currently Unavailable"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* BOOKING MODAL */}
      {selected && (
        <BookingModal
          dietician={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}