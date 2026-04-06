"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "@/lib/axios";
import { toast } from "react-toastify";
import { FiAward, FiCheckCircle, FiClock, FiFileText, FiXCircle } from "react-icons/fi";

const LOAD_PROFILES_ERROR_TOAST_ID = "admin-dieticians-load-error";

type Profile = {
  _id: string;
  user: { username: string; email: string };
  specialization: string;
  certificateUrl: string;
  certificateStatus: string;
  isVerified: boolean;
  rejectionReason: string;
  createdAt: string;
};

export default function AdminDieticiansPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    try {
      setLoadError("");
      const res = await api.get("/dieticians/admin/all");
      setProfiles(res.data);
      if (toast.isActive(LOAD_PROFILES_ERROR_TOAST_ID)) {
        toast.dismiss(LOAD_PROFILES_ERROR_TOAST_ID);
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to load dietician profiles";
      setLoadError(message);

      if (!toast.isActive(LOAD_PROFILES_ERROR_TOAST_ID)) {
        toast.error(message, { toastId: LOAD_PROFILES_ERROR_TOAST_ID });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleApprove = async (profileId: string) => {
    setProcessing(profileId);
    try {
      await api.put(`/dieticians/admin/${profileId}/approve`, {});
      toast.success("Certificate approved!");
      fetchProfiles();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Approval failed");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    setProcessing(rejectId);
    try {
      await api.put(`/dieticians/admin/${rejectId}/reject`, { reason: rejectReason });
      toast.success("Certificate rejected");
      setRejectId(null);
      setRejectReason("");
      fetchProfiles();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Rejection failed");
    } finally {
      setProcessing(null);
    }
  };

  const filtered = profiles.filter((p) => {
    if (filter === "all") return true;
    return p.certificateStatus === filter;
  });

  const statusBadge = (status: string) => {
    const map: Record<string, { color: string; label: string; icon: ReactNode }> = {
      approved: { color: "#16a34a", label: "Approved", icon: <FiCheckCircle /> },
      pending: { color: "#d97706", label: "Pending", icon: <FiClock /> },
      rejected: { color: "#dc2626", label: "Rejected", icon: <FiXCircle /> },
      not_uploaded: { color: "#6b7280", label: "Not Uploaded", icon: <FiFileText /> },
    };
    const s = map[status] || map["not_uploaded"];
    return (
      <span className="adm-cert-status-icon" style={{ color: s.color, fontWeight: 600 }}>
        {s.icon}
        {s.label}
      </span>
    );
  };

  return (
    <section className="adm-section adm-cert-page">
      <div className="adm-cert-header">
        <div>
          <h1 className="adm-title">
            <FiAward className="adm-title-icon" />
            Dietician Certificate Review
          </h1>
          <p>Review uploaded certificates and verify dieticians</p>
        </div>
        <div className="adm-cert-counts">
          <span>{profiles.filter(p => p.certificateStatus === "pending").length} pending</span>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="adm-cert-tabs">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            className={`adm-cert-tab ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "pending" ? (
              <>
                <FiClock className="adm-tab-icon" />
                Pending
              </>
            ) : f === "approved" ? (
              <>
                <FiCheckCircle className="adm-tab-icon" />
                Approved
              </>
            ) : f === "rejected" ? (
              <>
                <FiXCircle className="adm-tab-icon" />
                Rejected
              </>
            ) : (
              "All"
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="adm-cert-loading">Loading profiles...</div>
      ) : loadError ? (
        <div className="adm-cert-empty">{loadError}</div>
      ) : filtered.length === 0 ? (
        <div className="adm-cert-empty">No profiles in this category</div>
      ) : (
        <div className="adm-cert-list">
          {filtered.map((p) => (
            <div key={p._id} className="adm-cert-card">
              <div className="adm-cert-info">
                <div className="adm-cert-avatar">{p.user?.username?.[0]?.toUpperCase()}</div>
                <div>
                  <h3>{p.user?.username}</h3>
                  <p>{p.user?.email}</p>
                  <p className="adm-cert-spec">{p.specialization}</p>
                  <div className="adm-cert-status">{statusBadge(p.certificateStatus)}</div>
                  {p.rejectionReason && (
                    <p className="adm-cert-reject-note">Reason: {p.rejectionReason}</p>
                  )}
                </div>
              </div>

              <div className="adm-cert-actions">
                {p.certificateUrl ? (
                  <a
                    href={p.certificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="adm-cert-view-btn"
                  >
                    <FiFileText className="adm-btn-icon" />
                    View Certificate
                  </a>
                ) : (
                  <span className="adm-cert-no-doc">No certificate uploaded</span>
                )}

                {p.certificateStatus === "pending" && p.certificateUrl && (
                  <>
                    <button
                      className="adm-cert-approve-btn"
                      onClick={() => handleApprove(p._id)}
                      disabled={processing === p._id}
                    >
                      {processing === p._id ? "..." : (
                        <>
                          <FiCheckCircle className="adm-btn-icon" />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      className="adm-cert-reject-btn"
                      onClick={() => { setRejectId(p._id); setRejectReason(""); }}
                      disabled={processing === p._id}
                    >
                      <FiXCircle className="adm-btn-icon" />
                      Reject
                    </button>
                  </>
                )}

                {p.certificateStatus === "approved" && (
                  <button
                    className="adm-cert-reject-btn"
                    onClick={() => { setRejectId(p._id); setRejectReason(""); }}
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectId && (
        <div className="adm-reject-overlay" onClick={(e) => e.target === e.currentTarget && setRejectId(null)}>
          <div className="adm-reject-modal">
            <h3>Rejection Reason</h3>
            <textarea
              placeholder="Please provide a reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
            <div className="adm-reject-btns">
              <button className="adm-cert-approve-btn" onClick={handleReject} disabled={!rejectReason.trim()}>
                Confirm Reject
              </button>
              <button onClick={() => setRejectId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}