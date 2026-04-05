"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiMic, FiMicOff, FiPhoneOff, FiVideo, FiVideoOff } from "react-icons/fi";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

type BookingSession = {
  bookingId: string;
  roomName: string;
  jitsiDomain?: string;
  jitsiJwt?: string | null;
  date?: string;
  time?: string;
  mode?: string;
  user?: { _id?: string; username?: string; email?: string };
  dietician?: { _id?: string; username?: string; email?: string };
};

type JitsiApi = {
  executeCommand: (command: string, ...args: unknown[]) => void;
  addListener: (event: string, listener: (...args: unknown[]) => void) => void;
  dispose: () => void;
};

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (
      domain: string,
      options: {
        roomName: string;
        parentNode: HTMLElement;
        jwt?: string;
        userInfo?: { displayName?: string; email?: string };
        configOverwrite?: Record<string, unknown>;
        interfaceConfigOverwrite?: Record<string, unknown>;
      }
    ) => JitsiApi;
  }
}

const normalizeJitsiDomain = (value?: string) => {
  const normalized = String(value || "meet.jit.si")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");

  return normalized || "meet.jit.si";
};

const ensureJitsiScript = async (domain: string) => {
  if (window.JitsiMeetExternalAPI) return;

  const normalizedDomain = normalizeJitsiDomain(domain);
  const expectedSrc = `https://${normalizedDomain}/external_api.js`;

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-jitsi="external-api"]');

    if (existing) {
      const existingSrc = existing.getAttribute("src") || "";

      if (existingSrc.includes(expectedSrc)) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Failed to load Jitsi")), {
          once: true,
        });
        return;
      }

      existing.remove();
    }

    const script = document.createElement("script");
    script.src = expectedSrc;
    script.async = true;
    script.dataset.jitsi = "external-api";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Jitsi"));
    document.body.appendChild(script);
  });
};

export default function CallPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const bookingId = String(params?.bookingId || "");
  const jitsiNodeRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<JitsiApi | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  const [session, setSession] = useState<BookingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const dashboardHref = useMemo(() => {
    if (!user) return "/";
    if (user.role === "admin") return "/dashboard/admin";
    if (user.role === "dietician") return "/dashboard/dietician";
    if (user.role === "kitchen") return "/dashboard/kitchen";
    return "/dashboard/user";
  }, [user]);

  useEffect(() => {
    const enforceIframeSizing = () => {
      const iframe = jitsiNodeRef.current?.querySelector("iframe") as HTMLIFrameElement | null;
      if (!iframe) return;
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.minHeight = "100%";
      iframe.style.border = "0";
    };

    const bootstrap = async () => {
      if (!bookingId) {
        setError("Invalid booking id");
        setLoading(false);
        return;
      }

      try {
        const res = await api.get<BookingSession>(`/bookings/${bookingId}/session`);
        const nextSession = res.data;
        setSession(nextSession);

        if (!nextSession.jitsiJwt) {
          throw new Error("Secure call token was not issued. Enable Jitsi JWT on the backend.");
        }

        const domain = normalizeJitsiDomain(
          nextSession.jitsiDomain || process.env.NEXT_PUBLIC_JITSI_DOMAIN || "meet.jit.si"
        );

        await ensureJitsiScript(domain);
        if (!window.JitsiMeetExternalAPI || !jitsiNodeRef.current) {
          throw new Error("Jitsi setup failed");
        }

        const displayName = user?.username || "Dietara Member";

        const jitsi = new window.JitsiMeetExternalAPI(domain, {
          roomName: nextSession.roomName,
          parentNode: jitsiNodeRef.current,
          jwt: nextSession.jitsiJwt || undefined,
          userInfo: {
            displayName,
            email: user?.email || "",
          },
          configOverwrite: {
            prejoinPageEnabled: false,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableDeepLinking: true,
            disableModeratorIndicator: true,
            disableReactions: true,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "desktop",
              "fullscreen",
              "tileview",
              "chat",
              "hangup",
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            MOBILE_APP_PROMO: false,
            HIDE_INVITE_MORE_HEADER: true,
          },
        });

        enforceIframeSizing();
        if (jitsiNodeRef.current) {
          observerRef.current = new MutationObserver(() => enforceIframeSizing());
          observerRef.current.observe(jitsiNodeRef.current, {
            childList: true,
            subtree: true,
          });
        }

        jitsi.addListener("readyToClose", () => {
          router.push(dashboardHref);
        });

        apiRef.current = jitsi;
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error)?.message ||
          "Unable to start the call";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [bookingId, dashboardHref, router, user?.email, user?.username]);

  const toggleAudio = () => {
    if (!apiRef.current) return;
    apiRef.current.executeCommand("toggleAudio");
    setIsMuted((prev) => !prev);
  };

  const toggleVideo = () => {
    if (!apiRef.current) return;
    apiRef.current.executeCommand("toggleVideo");
    setIsVideoOff((prev) => !prev);
  };

  const endCall = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand("hangup");
      apiRef.current.dispose();
      apiRef.current = null;
    }
    router.push(dashboardHref);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1b0a16_0%,#07070a_52%,#050507_100%)] text-white pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push(dashboardHref)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 transition hover:bg-white/10"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="rounded-xl border border-[#ff8fab]/30 bg-[#160711] px-3 py-2 text-xs sm:text-sm text-[#ffe6ed]">
            Booking: {bookingId}
          </div>
        </div>

        <section className="rounded-3xl border border-[#ff9dbc]/20 bg-gradient-to-b from-[#1a0913] to-[#0c050a] p-4 sm:p-6 shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dietician Video Consultation</h1>
              <p className="mt-1 max-w-full break-all text-xs sm:text-sm text-white/70">
                {session ? `Room: ${session.roomName}` : "Preparing secure Jitsi room..."}
              </p>
            </div>

            {session && (
              <div className="rounded-xl border border-[#ff9dbc]/30 bg-[#2a0e1c] px-3 py-2 text-xs text-[#ffdce7]">
                {session.date || "Date TBD"} {session.time ? ` | ${session.time}` : ""}
              </div>
            )}
          </div>

          <div className="relative h-[70vh] min-h-[520px] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/35">
            {loading && (
              <div className="absolute inset-0 z-10 grid place-items-center bg-black/45 text-white/80">
                Connecting to Jitsi...
              </div>
            )}

            {!loading && error && (
              <div className="absolute inset-0 z-10 grid place-items-center bg-[#2a0b15]/85 p-6 text-center">
                <div>
                  <p className="text-lg font-semibold text-[#ffd4df]">Call unavailable</p>
                  <p className="mt-2 text-sm text-white/75">{error}</p>
                  <button
                    type="button"
                    onClick={() => router.push(dashboardHref)}
                    className="mt-4 rounded-xl bg-[#b21f49] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                  >
                    Back to dashboard
                  </button>
                </div>
              </div>
            )}

            <div
              ref={jitsiNodeRef}
              className={`${error ? "hidden" : "absolute inset-0"} dietara-jitsi-frame`}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={toggleAudio}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10"
            >
              {isMuted ? <FiMicOff className="h-4 w-4" /> : <FiMic className="h-4 w-4" />}
              {isMuted ? "Unmute" : "Mute"}
            </button>

            <button
              type="button"
              onClick={toggleVideo}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10"
            >
              {isVideoOff ? <FiVideoOff className="h-4 w-4" /> : <FiVideo className="h-4 w-4" />}
              {isVideoOff ? "Start video" : "Stop video"}
            </button>

            <button
              type="button"
              onClick={endCall}
              className="inline-flex items-center gap-2 rounded-xl border border-[#ff748f]/35 bg-[#3a0f1d] px-3 py-2 text-sm text-[#ffd8e2] transition hover:bg-[#4a1124]"
            >
              <FiPhoneOff className="h-4 w-4" />
              End call
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
