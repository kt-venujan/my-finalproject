"use client";

import { useEffect, useState } from "react";
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
};

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="diet-stars">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < full ? "star full" : i === full && half ? "star half" : "star"}>★</span>
      ))}
      <span className="diet-rating-num">{rating > 0 ? rating.toFixed(1) : "New"}</span>
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
    <div className="diet-page">

      {/* HERO */}
      <section className="diet-hero">
        <div className="diet-hero-text">
          <h1>Find Your <span>Dietician</span></h1>
          <p>Book a personalized consultation with a certified nutrition expert.</p>
        </div>
        <div className="diet-hero-stats">
          <div className="diet-hero-stat">
            <h3>{dieticians.length}+</h3>
            <p>Experts</p>
          </div>
          <div className="diet-hero-stat">
            <h3>{dieticians.filter(d => d.isVerified).length}</h3>
            <p>Verified</p>
          </div>
          <div className="diet-hero-stat">
            <h3>4.8★</h3>
            <p>Avg Rating</p>
          </div>
        </div>
      </section>

      {/* FILTERS + SEARCH */}
      <div className="diet-controls">
        <input
          className="diet-search"
          placeholder="🔍 Search by name or specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="diet-filters">
          {(["available", "verified", "all"] as const).map((f) => (
            <button
              key={f}
              className={`diet-filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "available" ? "● Available" : f === "verified" ? "✅ Verified" : "All"}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="diet-loading">
          <div className="diet-spinner" />
          <p>Loading dieticians...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="diet-empty">
          <p>No dieticians found</p>
        </div>
      ) : (
        <div className="diet-grid">
          {filtered.map((d) => (
            <div key={d._id} className={`diet-card ${!d.isAvailable ? "unavailable" : ""}`}>

              {/* AVATAR */}
              <div className="diet-card-top">
                <div className="diet-avatar">
                  {d.avatar ? (
                    <img src={d.avatar} alt={d.user?.username} />
                  ) : (
                    <span>{d.user?.username?.[0]?.toUpperCase() || "D"}</span>
                  )}
                </div>
                <div className="diet-card-badges">
                  {d.isVerified && <span className="badge verified">✅ Verified</span>}
                  <span className={`badge ${d.isAvailable ? "available" : "unavailable"}`}>
                    {d.isAvailable ? "● Available" : "○ Busy"}
                  </span>
                </div>
              </div>

              {/* INFO */}
              <div className="diet-card-info">
                <h3>{d.user?.username}</h3>
                <p className="diet-spec">{d.specialization}</p>
                {d.bio && <p className="diet-bio">{d.bio}</p>}

                <StarRating rating={d.rating || 0} />
                {d.reviewCount > 0 && (
                  <span className="diet-review-count">({d.reviewCount} reviews)</span>
                )}
              </div>

              {/* META */}
              <div className="diet-card-meta">
                {d.experience > 0 && (
                  <div className="diet-meta-item">
                    <span>🎓</span>
                    <span>{d.experience} yrs exp</span>
                  </div>
                )}
                <div className="diet-meta-item price">
                  <span>💰</span>
                  <span>Rs. {(d.price || 1500).toLocaleString()}</span>
                </div>
              </div>

              {/* CTA */}
              <button
                className="diet-book-btn"
                disabled={!d.isAvailable}
                onClick={() => handleBook(d)}
              >
                {d.isAvailable ? "Book Now" : "Not Available"}
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