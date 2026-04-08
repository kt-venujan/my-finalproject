"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Camera,
  Globe,
  Heart,
  Loader2,
  LogIn,
  MapPin,
  Save,
  Trash2,
  UserCircle2,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { resolveBackendAssetUrl } from "@/lib/assetUrl";

type CommunityAuthor = {
  id: string;
  username: string;
  role: string;
  avatar: string;
};

type CommunityPost = {
  id: string;
  author: CommunityAuthor;
  content: string;
  image: string;
  likesCount: number;
  likedByMe: boolean;
  createdAt: string;
  updatedAt: string;
};

type CommunityProfile = {
  user: CommunityAuthor;
  displayName: string;
  bio: string;
  specialization: string;
  location: string;
  dietFocus: string;
  website: string;
  coverImage: string;
  isPublic: boolean;
};

type ProfileForm = {
  displayName: string;
  bio: string;
  specialization: string;
  location: string;
  dietFocus: string;
  website: string;
  isPublic: boolean;
};

const emptyProfileForm: ProfileForm = {
  displayName: "",
  bio: "",
  specialization: "",
  location: "",
  dietFocus: "",
  website: "",
  isPublic: true,
};

const roleLabel = (role?: string) => {
  const value = String(role || "").trim().toLowerCase();
  if (value === "dietician") return "Dietician";
  if (value === "admin") return "Admin";
  if (value === "kitchen") return "Kitchen";
  return "Customer";
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

const maroonButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-rose-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70";

export default function CommunityProfilePage() {
  const { user, openLogin } = useAuth();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [profile, setProfile] = useState<CommunityProfile | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfileForm);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");

  const userAvatar = useMemo(() => resolveBackendAssetUrl(user?.avatar), [user?.avatar]);

  const syncFormFromProfile = (nextProfile: CommunityProfile) => {
    setProfileForm({
      displayName: nextProfile.displayName || nextProfile.user.username,
      bio: nextProfile.bio || "",
      specialization: nextProfile.specialization || "",
      location: nextProfile.location || "",
      dietFocus: nextProfile.dietFocus || "",
      website: nextProfile.website || "",
      isPublic: nextProfile.isPublic,
    });

    setCoverImagePreview(resolveBackendAssetUrl(nextProfile.coverImage));
    setCoverImageFile(null);
  };

  useEffect(() => {
    if (!user) {
      setPosts([]);
      setProfile(null);
      setProfileForm(emptyProfileForm);
      setCoverImageFile(null);
      setCoverImagePreview("");
      return;
    }

    let canceled = false;

    const loadProfileData = async () => {
      setLoading(true);
      try {
        const [profileRes, postsRes] = await Promise.all([
          api.get("/community/me/profile"),
          api.get("/community/me/posts", { params: { page: 1, limit: 50 } }),
        ]);

        if (canceled) return;

        const nextProfile = profileRes.data?.profile as CommunityProfile;
        const nextPosts = (postsRes.data?.posts || []) as CommunityPost[];

        setProfile(nextProfile);
        setPosts(nextPosts);
        syncFormFromProfile(nextProfile);
      } catch (error: unknown) {
        if (!canceled) {
          toast.error(getErrorMessage(error, "Failed to load profile"));
        }
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      void loadProfileData();
    }, 0);

    return () => {
      canceled = true;
      clearTimeout(timer);
    };
  }, [user]);

  useEffect(
    () => () => {
      if (coverImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverImagePreview);
      }
    },
    [coverImagePreview]
  );

  const handleCoverImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setCoverImageFile(file);

    if (!file) {
      setCoverImagePreview(profile?.coverImage ? resolveBackendAssetUrl(profile.coverImage) : "");
      return;
    }

    const nextPreview = URL.createObjectURL(file);
    setCoverImagePreview(nextPreview);
  };

  const saveSettings = async (event: FormEvent) => {
    event.preventDefault();

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("displayName", profileForm.displayName.trim());
      formData.append("bio", profileForm.bio.trim());
      formData.append("specialization", profileForm.specialization.trim());
      formData.append("location", profileForm.location.trim());
      formData.append("dietFocus", profileForm.dietFocus.trim());
      formData.append("website", profileForm.website.trim());
      formData.append("isPublic", String(profileForm.isPublic));

      if (coverImageFile) {
        formData.append("coverImage", coverImageFile);
      }

      const response = await api.put("/community/me/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedProfile = response.data?.profile as CommunityProfile;
      setProfile(updatedProfile);
      syncFormFromProfile(updatedProfile);
      toast.success("Profile updated");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update profile"));
    } finally {
      setSaving(false);
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      const response = await api.post(`/community/posts/${postId}/like`);
      const updatedPost = response.data?.post as CommunityPost;

      setPosts((current) =>
        current.map((item) => (item.id === postId ? updatedPost : item))
      );
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Could not update like"));
    }
  };

  const deletePost = async (postId: string) => {
    const confirmed = window.confirm("Delete this post?");
    if (!confirmed) return;

    try {
      await api.delete(`/community/posts/${postId}`);
      setPosts((current) => current.filter((item) => item.id !== postId));
      toast.success("Post deleted");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to delete post"));
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_20%_8%,#ffffff_0%,#f3f4f6_50%,#e5e7eb_100%)] px-4 py-10 text-zinc-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/80 bg-white/55 p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
          <h1 className="text-3xl font-bold text-zinc-900">Community Profile</h1>
          <p className="mt-3 text-zinc-700">Please login with your existing account to access your profile.</p>
          <button
            type="button"
            onClick={openLogin}
            className={`${maroonButton} mx-auto mt-8 px-8 py-3`}
          >
            <LogIn className="h-4 w-4" />
            Login to Continue
          </button>
        </div>
      </main>
    );
  }

  const displayName = profileForm.displayName || user.username;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_8%,#ffffff_0%,#f3f4f6_50%,#e5e7eb_100%)] px-4 py-8 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link
          href="/community"
          className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm text-zinc-800 transition hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Community Feed
        </Link>

        <section className="overflow-hidden rounded-3xl border border-white/80 bg-white/55 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
          <div className="h-44 w-full bg-gradient-to-r from-rose-200 via-zinc-100 to-zinc-200">
            {coverImagePreview && (
              <img src={coverImagePreview} alt="Community cover" className="h-full w-full object-cover" />
            )}
          </div>

          <div className="-mt-12 px-6 pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-zinc-100 text-3xl font-semibold text-zinc-700">
                  {userAvatar ? (
                    <img src={userAvatar} alt={user.username} className="h-full w-full object-cover" />
                  ) : (
                    toInitial(displayName)
                  )}
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{displayName}</h1>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{roleLabel(user.role)}</p>
                  <p className="mt-1 text-sm text-zinc-600">{posts.length} posts</p>
                </div>
              </div>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm text-zinc-700 transition hover:bg-white">
                <Camera className="h-4 w-4 text-zinc-500" />
                Change Cover
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleCoverImageSelect}
                  className="hidden"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-700">
              {profileForm.location && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-zinc-500" />
                  {profileForm.location}
                </span>
              )}
              {profileForm.website && (
                <span className="inline-flex items-center gap-2 break-all">
                  <Globe className="h-4 w-4 text-zinc-500" />
                  {profileForm.website}
                </span>
              )}
              {profileForm.specialization && (
                <span className="inline-flex items-center gap-2">
                  <UserCircle2 className="h-4 w-4 text-zinc-500" />
                  {profileForm.specialization}
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/80 bg-white/55 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
          <h2 className="text-xl font-semibold text-zinc-900">Edit Community Profile</h2>
          <p className="mt-2 text-sm text-zinc-600">Manage your profile details and visibility from here.</p>

          <form onSubmit={saveSettings} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.18em] text-zinc-600">Display Name</span>
              <input
                value={profileForm.displayName}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, displayName: event.target.value }))
                }
                maxLength={60}
                className="mt-1.5 w-full rounded-xl border border-white/90 bg-white/70 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-rose-300 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-[0.18em] text-zinc-600">Bio</span>
              <textarea
                rows={4}
                value={profileForm.bio}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, bio: event.target.value }))
                }
                maxLength={400}
                className="mt-1.5 w-full rounded-xl border border-white/90 bg-white/70 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-rose-300 focus:outline-none"
                placeholder="Tell the community about your goals, practice, or diet style"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-600">Specialization</span>
                <input
                  value={profileForm.specialization}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, specialization: event.target.value }))
                  }
                  maxLength={120}
                  className="mt-1.5 w-full rounded-xl border border-white/90 bg-white/70 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-rose-300 focus:outline-none"
                  placeholder="Weight loss, sports nutrition"
                />
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-600">Diet Focus</span>
                <input
                  value={profileForm.dietFocus}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, dietFocus: event.target.value }))
                  }
                  maxLength={120}
                  className="mt-1.5 w-full rounded-xl border border-white/90 bg-white/70 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-rose-300 focus:outline-none"
                  placeholder="Keto, PCOS, diabetes"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-600">Location</span>
                <input
                  value={profileForm.location}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, location: event.target.value }))
                  }
                  maxLength={100}
                  className="mt-1.5 w-full rounded-xl border border-white/90 bg-white/70 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-rose-300 focus:outline-none"
                  placeholder="City, Country"
                />
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-600">Website</span>
                <input
                  value={profileForm.website}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, website: event.target.value }))
                  }
                  maxLength={180}
                  className="mt-1.5 w-full rounded-xl border border-white/90 bg-white/70 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-rose-300 focus:outline-none"
                  placeholder="https://..."
                />
              </label>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={profileForm.isPublic}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, isPublic: event.target.checked }))
                }
                className="h-4 w-4 rounded border-white bg-white text-rose-600"
              />
              Profile visible to all community members
            </label>

            <button
              type="submit"
              disabled={saving}
              className={maroonButton}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Profile
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-900">My Posts</h2>

          {loading ? (
            <div className="rounded-3xl border border-white/80 bg-white/55 p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-zinc-500" />
              <p className="mt-3 text-sm text-zinc-700">Loading your posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-3xl border border-white/80 bg-white/55 p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
              <p className="text-base text-zinc-800">You have not posted yet.</p>
            </div>
          ) : (
            posts.map((post) => {
              const postAvatar = resolveBackendAssetUrl(post.author.avatar);
              const postImage = resolveBackendAssetUrl(post.image);

              return (
                <article
                  key={post.id}
                  className="rounded-3xl border border-white/80 bg-white/55 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-2xl"
                >
                  <header className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 overflow-hidden rounded-full border border-white bg-zinc-100 text-sm font-semibold text-zinc-700">
                        {postAvatar ? (
                          <img src={postAvatar} alt={post.author.username} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            {toInitial(post.author.username)}
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-zinc-900">{post.author.username}</p>
                        <p className="text-xs text-zinc-500">
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deletePost(post.id)}
                      className={maroonButton}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </header>

                  {post.content && <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">{post.content}</p>}

                  {postImage && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-white/90">
                      <img src={postImage} alt="Post" className="max-h-[540px] w-full object-cover" />
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleLike(post.id)}
                      className={maroonButton}
                    >
                      <Heart className={`h-4 w-4 ${post.likedByMe ? "fill-current" : ""}`} />
                      {post.likesCount} likes
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}
