"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, LogIn, UserPlus, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { resolveBackendAssetUrl } from "@/lib/assetUrl";

type Suggestion = {
  id: string;
  username: string;
  role: string;
  avatar: string;
  location: string;
  headline: string;
  mutualCount: number;
};

type SuggestionSections = {
  fromCommunity: Suggestion[];
  fromActivity: Suggestion[];
};

const maroonButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-rose-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70";

const roleLabel = (role?: string) => {
  const value = String(role || "").trim().toLowerCase();
  if (value === "dietician") return "Dietician";
  if (value === "admin") return "Admin";
  if (value === "kitchen") return "Kitchen";
  return "Member";
};

const toInitial = (name?: string) => (name?.trim()?.charAt(0)?.toUpperCase() || "U");

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosError = error as {
      response?: {
        data?: {
          message?: string;
        };
      };
    };

    return axiosError.response?.data?.message || fallback;
  }

  return fallback;
};

const removeSuggestion = (sections: SuggestionSections, id: string): SuggestionSections => ({
  fromCommunity: sections.fromCommunity.filter((item) => item.id !== id),
  fromActivity: sections.fromActivity.filter((item) => item.id !== id),
});

export default function CommunityNetworkPage() {
  const { user, openLogin } = useAuth();

  const [sections, setSections] = useState<SuggestionSections>({ fromCommunity: [], fromActivity: [] });
  const [loading, setLoading] = useState(false);
  const [showAllFirst, setShowAllFirst] = useState(false);
  const [showAllSecond, setShowAllSecond] = useState(false);
  const [busyByUser, setBusyByUser] = useState<Record<string, boolean>>({});
  const [connectedByUser, setConnectedByUser] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) {
      setSections({ fromCommunity: [], fromActivity: [] });
      setBusyByUser({});
      setConnectedByUser({});
      return;
    }

    let canceled = false;

    const loadSuggestions = async () => {
      setLoading(true);

      try {
        const response = await api.get("/community/network/suggestions", {
          params: { limit: 24 },
        });

        if (canceled) return;

        const nextSections = response.data?.sections as SuggestionSections;
        setSections({
          fromCommunity: nextSections?.fromCommunity || [],
          fromActivity: nextSections?.fromActivity || [],
        });
      } catch (error: unknown) {
        if (!canceled) {
          toast.error(getErrorMessage(error, "Failed to load network suggestions"));
        }
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      void loadSuggestions();
    }, 0);

    return () => {
      canceled = true;
      clearTimeout(timer);
    };
  }, [user]);

  const firstSectionItems = useMemo(
    () => (showAllFirst ? sections.fromCommunity : sections.fromCommunity.slice(0, 8)),
    [sections.fromCommunity, showAllFirst]
  );

  const secondSectionItems = useMemo(
    () => (showAllSecond ? sections.fromActivity : sections.fromActivity.slice(0, 8)),
    [sections.fromActivity, showAllSecond]
  );

  const handleConnect = async (id: string) => {
    setBusyByUser((current) => ({ ...current, [id]: true }));
    try {
      await api.post(`/community/network/connect/${id}`);
      setConnectedByUser((current) => ({ ...current, [id]: true }));
      toast.success("Connection request sent");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to connect"));
    } finally {
      setBusyByUser((current) => ({ ...current, [id]: false }));
    }
  };

  const handleDismiss = async (id: string) => {
    setBusyByUser((current) => ({ ...current, [id]: true }));
    try {
      await api.post(`/community/network/dismiss/${id}`);
      setSections((current) => removeSuggestion(current, id));
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to dismiss"));
    } finally {
      setBusyByUser((current) => ({ ...current, [id]: false }));
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_20%_8%,#ffffff_0%,#f3f4f6_50%,#e5e7eb_100%)] px-4 py-10 text-zinc-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/80 bg-white/55 p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
          <h1 className="text-3xl font-bold text-zinc-900">Community Network</h1>
          <p className="mt-3 text-zinc-700">Login to see people you may know and connect.</p>
          <button type="button" onClick={openLogin} className={`${maroonButton} mx-auto mt-8 px-8 py-3 text-sm`}>
            <LogIn className="h-4 w-4" />
            Login to Continue
          </button>
        </div>
      </main>
    );
  }

  const SuggestionCard = ({ item }: { item: Suggestion }) => {
    const avatar = resolveBackendAssetUrl(item.avatar);
    const busy = !!busyByUser[item.id];
    const connected = !!connectedByUser[item.id];

    return (
      <article className="overflow-hidden rounded-2xl border border-white/80 bg-white/55 shadow-[0_16px_45px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
        <div className="relative h-16 bg-gradient-to-r from-zinc-200 via-white to-zinc-100">
          <button
            type="button"
            onClick={() => handleDismiss(item.id)}
            disabled={busy}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900/75 text-white transition hover:bg-zinc-900"
            aria-label={`Dismiss ${item.username}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-3 pb-3">
          <div className="-mt-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-zinc-100 text-xl font-semibold text-zinc-700">
              {avatar ? (
                <img src={avatar} alt={item.username} className="h-full w-full object-cover" />
              ) : (
                toInitial(item.username)
              )}
            </div>
          </div>

          <h3 className="mt-2 line-clamp-1 text-center text-lg font-semibold text-zinc-900">{item.username}</h3>
          <p className="line-clamp-2 min-h-10 text-center text-sm text-zinc-600">{item.headline}</p>
          <p className="mt-1 text-center text-xs text-zinc-500">{item.location || roleLabel(item.role)}</p>
          <p className="mt-2 text-xs text-zinc-500">{item.mutualCount} mutual connections</p>

          <button
            type="button"
            onClick={() => handleConnect(item.id)}
            disabled={busy || connected}
            className={`${maroonButton} mt-3 w-full`}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {connected ? "Connected" : "Connect"}
          </button>
        </div>
      </article>
    );
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_8%,#ffffff_0%,#f3f4f6_50%,#e5e7eb_100%)] px-4 py-8 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/55 px-5 py-4 shadow-[0_16px_45px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Community Network</h1>
            <p className="text-sm text-zinc-600">Find and connect with people in your nutrition community.</p>
          </div>

          <Link href="/community" className={`${maroonButton} px-4 py-2 text-xs`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Feed
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/80 bg-white/55 p-10 text-center shadow-[0_16px_45px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-zinc-500" />
            <p className="mt-3 text-zinc-700">Loading suggestions...</p>
          </div>
        ) : (
          <>
            <section className="rounded-2xl border border-white/80 bg-white/55 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">People you may know from Dietara Community</h2>
                <button type="button" onClick={() => setShowAllFirst((v) => !v)} className={`${maroonButton} px-4 py-2`}>
                  {showAllFirst ? "Show less" : "Show all"}
                </button>
              </div>

              {firstSectionItems.length === 0 ? (
                <p className="text-sm text-zinc-600">No more suggestions in this section.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {firstSectionItems.map((item) => (
                    <SuggestionCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-white/80 bg-white/55 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">People you may know based on your activity</h2>
                <button type="button" onClick={() => setShowAllSecond((v) => !v)} className={`${maroonButton} px-4 py-2`}>
                  {showAllSecond ? "Show less" : "Show all"}
                </button>
              </div>

              {secondSectionItems.length === 0 ? (
                <p className="text-sm text-zinc-600">No more suggestions in this section.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {secondSectionItems.map((item) => (
                    <SuggestionCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
