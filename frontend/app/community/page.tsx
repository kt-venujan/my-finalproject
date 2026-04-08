"use client";

import Link from "next/link";
import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  Bell,
  Briefcase,
  Compass,
  Globe,
  Heart,
  Home,
  ImagePlus,
  Loader2,
  LogIn,
  MapPin,
  Search,
  SendHorizontal,
  Trash2,
  UserCircle2,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { resolveBackendAssetUrl } from "@/lib/assetUrl";
import ImageCropModal from "@/components/community/ImageCropModal";

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
  "inline-flex items-center justify-center gap-2 rounded-full bg-rose-700 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70";

export default function CommunityPage() {
  const { user, openLogin } = useAuth();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [profile, setProfile] = useState<CommunityProfile | null>(null);

  const [feedLoading, setFeedLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [postText, setPostText] = useState("");
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState("");
  const [postCropSource, setPostCropSource] = useState("");
  const [pendingPostImageMeta, setPendingPostImageMeta] = useState<{
    name: string;
    type: string;
  } | null>(null);

  const userAvatar = useMemo(() => resolveBackendAssetUrl(user?.avatar), [user?.avatar]);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return posts;

    return posts.filter((post) => {
      const haystack = `${post.author.username} ${post.content}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [posts, searchQuery]);

  useEffect(() => {
    if (!user) {
      setPosts([]);
      setProfile(null);
      setSearchQuery("");
      setPostText("");
      setPostImageFile(null);
      setPostImagePreview("");
      return;
    }

    let canceled = false;

    const loadCommunityData = async () => {
      setFeedLoading(true);
      setProfileLoading(true);

      try {
        const [profileRes, feedRes] = await Promise.all([
          api.get("/community/me/profile"),
          api.get("/community/posts", { params: { page: 1, limit: 30 } }),
        ]);

        if (canceled) return;

        const nextProfile = profileRes.data?.profile as CommunityProfile;
        const nextPosts = (feedRes.data?.posts || []) as CommunityPost[];

        setProfile(nextProfile);
        setPosts(nextPosts);
      } catch (error: unknown) {
        if (!canceled) {
          toast.error(getErrorMessage(error, "Failed to load community data"));
        }
      } finally {
        if (!canceled) {
          setFeedLoading(false);
          setProfileLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      void loadCommunityData();
    }, 0);

    return () => {
      canceled = true;
      clearTimeout(timer);
    };
  }, [user]);

  useEffect(
    () => () => {
      if (postImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(postImagePreview);
      }
    },
    [postImagePreview]
  );

  useEffect(
    () => () => {
      if (postCropSource.startsWith("blob:")) {
        URL.revokeObjectURL(postCropSource);
      }
    },
    [postCropSource]
  );

  const handlePostImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    event.target.value = "";

    if (!file) {
      setPostImageFile(null);
      setPostImagePreview("");
      setPostCropSource("");
      setPendingPostImageMeta(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    setPendingPostImageMeta({
      name: file.name,
      type: file.type || "image/jpeg",
    });
    setPostCropSource(URL.createObjectURL(file));
  };

  const handlePostCropCancel = () => {
    setPostCropSource("");
    setPendingPostImageMeta(null);
  };

  const handlePostCropApply = (file: File, previewUrl: string) => {
    setPostImageFile(file);
    setPostImagePreview(previewUrl);
    setPostCropSource("");
    setPendingPostImageMeta(null);
  };

  const handleTopicClick = (topic: string) => {
    setPostText((current) => (current ? `${current} ${topic}` : topic));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const createPost = async (event: FormEvent) => {
    event.preventDefault();

    if (!user) {
      openLogin();
      return;
    }

    const trimmed = postText.trim();
    if (!trimmed && !postImageFile) {
      toast.info("Write something or attach an image.");
      return;
    }

    setCreatingPost(true);

    try {
      const formData = new FormData();
      formData.append("content", trimmed);
      if (postImageFile) {
        formData.append("image", postImageFile);
      }

      const response = await api.post("/community/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const nextPost = response.data?.post as CommunityPost;
      setPosts((current) => [nextPost, ...current]);
      setPostText("");
      setPostImageFile(null);
      setPostImagePreview("");
      toast.success("Your post is live.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to publish post"));
    } finally {
      setCreatingPost(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) {
      openLogin();
      return;
    }

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
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-white/80 bg-white/55 p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-zinc-600">
              Dietara Community
            </p>
            <h1 className="mt-4 text-4xl font-bold text-zinc-900 sm:text-5xl">
              Share your progress with customers and dieticians
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-700 sm:text-base">
              Use your existing account credentials to post meal photos, diet plans, and health wins.
              The community feed is private to signed-in members.
            </p>

            <button type="button" onClick={openLogin} className={`${maroonButton} mx-auto mt-8 px-8 py-3 text-sm`}>
              <LogIn className="h-4 w-4" />
              Login to Continue
            </button>
          </div>
        </div>
      </main>
    );
  }

  const displayName = profile?.displayName || user.username;
  const coverImage = resolveBackendAssetUrl(profile?.coverImage);
  const myPostsCount = posts.filter((post) => String(post.author.id) === String(user.id)).length;

  return (
    <>
      <main className="min-h-screen bg-[radial-gradient(circle_at_20%_8%,#ffffff_0%,#f3f4f6_50%,#e5e7eb_100%)] px-3 py-6 text-zinc-900 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-[1360px]">
        <section className="sticky top-2 z-20 rounded-2xl border border-white/80 bg-white/55 px-4 py-3 shadow-[0_16px_45px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-white/80 bg-white/85"
              aria-label="Go to home"
            >
              <Image src="/logo.png" alt="Dietara Hub logo" width={30} height={30} className="object-contain" />
            </Link>

            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search posts, dieticians, meal plans"
                className="w-full rounded-full border border-white/90 bg-white/70 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-rose-300 focus:outline-none"
              />
            </div>

            <nav className="ml-auto flex items-center gap-1 sm:gap-2">
              <Link href="/community" className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/70 px-3 py-2 text-xs font-medium text-zinc-800 transition hover:bg-white">
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link href="/community/network" className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/70 px-3 py-2 text-xs font-medium text-zinc-800 transition hover:bg-white">
                <Users className="h-4 w-4" />
                Network
              </Link>
              <Link href="/tracking" className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/70 px-3 py-2 text-xs font-medium text-zinc-800 transition hover:bg-white">
                <Briefcase className="h-4 w-4" />
                Goals
              </Link>
              <button type="button" onClick={() => toast.info("No new alerts right now.")} className={maroonButton}>
                <Bell className="h-4 w-4" />
                Alerts
              </button>
            </nav>
          </div>
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_300px]">
          <aside className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/55 shadow-[0_16px_45px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
              <div className="h-24 w-full bg-gradient-to-r from-rose-200 via-zinc-100 to-zinc-200">
                {coverImage && (
                  <img src={coverImage} alt="Community cover" className="h-full w-full object-cover" />
                )}
              </div>

              <div className="-mt-9 px-4 pb-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-zinc-100 text-xl font-semibold text-zinc-700">
                  {userAvatar ? (
                    <img src={userAvatar} alt={user.username} className="h-full w-full object-cover" />
                  ) : (
                    toInitial(displayName)
                  )}
                </div>

                <div className="mt-3 text-center">
                  <h2 className="text-lg font-semibold text-zinc-900">{displayName}</h2>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{roleLabel(user.role)}</p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-xl border border-white/80 bg-white/70 p-2 text-center">
                    <p className="text-zinc-600">My Posts</p>
                    <p className="mt-1 text-lg font-semibold text-zinc-900">{myPostsCount}</p>
                  </div>
                  <div className="rounded-xl border border-white/80 bg-white/70 p-2 text-center">
                    <p className="text-zinc-600">Profile</p>
                    <p className="mt-1 text-lg font-semibold text-zinc-900">
                      {profile?.isPublic === false ? "Private" : "Public"}
                    </p>
                  </div>
                </div>

                <Link href="/community/profile" className={`${maroonButton} mt-4 w-full`}>
                  Open My Profile
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/80 bg-white/55 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
              <h3 className="text-sm font-semibold text-zinc-900">Shortcuts</h3>
              <div className="mt-3 space-y-2 text-sm text-zinc-700">
                <Link href="/kitchen" className="inline-flex items-center gap-2 hover:text-zinc-900"><Compass className="h-4 w-4 text-zinc-500" /> Explore Recipes</Link>
                <Link href="/pricing" className="inline-flex items-center gap-2 hover:text-zinc-900"><MapPin className="h-4 w-4 text-zinc-500" /> Local Meal Plans</Link>
                <Link href="/dietician" className="inline-flex items-center gap-2 hover:text-zinc-900"><UserCircle2 className="h-4 w-4 text-zinc-500" /> Verified Dieticians</Link>
                <Link href="/community/profile" className="inline-flex items-center gap-2 hover:text-zinc-900"><Globe className="h-4 w-4 text-zinc-500" /> My Community Profile</Link>
              </div>
            </div>
          </aside>

          <section className="space-y-5">
            <form
              onSubmit={createPost}
              className="rounded-2xl border border-white/80 bg-white/55 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.12)] backdrop-blur-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white bg-zinc-100 text-sm font-semibold text-zinc-700">
                  {userAvatar ? (
                    <img src={userAvatar} alt={user.username} className="h-full w-full object-cover" />
                  ) : (
                    toInitial(displayName)
                  )}
                </div>
                <label htmlFor="postText" className="text-sm font-medium text-zinc-700">Start a post</label>
              </div>

              <textarea
                id="postText"
                value={postText}
                onChange={(event) => setPostText(event.target.value)}
                rows={3}
                placeholder="Share your diet journey, food progress, or meal plan..."
                className="mt-3 w-full rounded-xl border border-white/90 bg-white/70 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-rose-300 focus:outline-none"
              />

              {postImagePreview && (
                <div className="mt-3 overflow-hidden rounded-xl border border-white/90">
                  <img src={postImagePreview} alt="Preview" className="max-h-72 w-full object-cover" />
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-2 text-xs text-zinc-700 transition hover:bg-white">
                  <ImagePlus className="h-4 w-4 text-zinc-500" />
                  Photo
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handlePostImageSelect}
                    className="hidden"
                  />
                </label>

                <button type="submit" disabled={creatingPost} className={maroonButton}>
                  {creatingPost ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
                  Post
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {feedLoading ? (
                <div className="rounded-2xl border border-white/80 bg-white/55 p-8 text-center shadow-[0_16px_45px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-zinc-500" />
                  <p className="mt-3 text-sm text-zinc-700">Loading community feed...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="rounded-2xl border border-white/80 bg-white/55 p-8 text-center shadow-[0_16px_45px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
                  <p className="text-base text-zinc-800">
                    {searchQuery ? "No posts matched your search." : "No posts yet. Be the first to share your diet journey."}
                  </p>
                </div>
              ) : (
                filteredPosts.map((post) => {
                  const postAvatar = resolveBackendAssetUrl(post.author.avatar);
                  const postImage = resolveBackendAssetUrl(post.image);
                  const isOwner = String(post.author.id) === String(user.id);

                  return (
                    <article
                      key={post.id}
                      className="rounded-2xl border border-white/80 bg-white/55 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.12)] backdrop-blur-2xl"
                    >
                      <header className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 overflow-hidden rounded-full border border-white bg-zinc-100 text-sm font-semibold text-zinc-700">
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
                            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                              {roleLabel(post.author.role)}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>

                        {isOwner && (
                          <button type="button" onClick={() => deletePost(post.id)} className={maroonButton}>
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        )}
                      </header>

                      {post.content && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">{post.content}</p>}

                      {postImage && (
                        <div className="mt-3 overflow-hidden rounded-xl border border-white/90">
                          <img src={postImage} alt="Post" className="max-h-[540px] w-full object-cover" />
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-3">
                        <button type="button" onClick={() => toggleLike(post.id)} className={maroonButton}>
                          <Heart className={`h-4 w-4 ${post.likedByMe ? "fill-current" : ""}`} />
                          {post.likesCount} likes
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-white/80 bg-white/55 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
              <h3 className="text-sm font-semibold text-zinc-900">Today&apos;s Challenges</h3>
              <div className="mt-3 space-y-3 text-sm text-zinc-700">
                <button type="button" onClick={() => handleTopicClick("#HydrationStreak")} className="block w-full rounded-xl border border-white/90 bg-white/70 p-3 text-left transition hover:bg-white">
                  <p className="font-medium text-zinc-900">Hydration Streak</p>
                  <p className="mt-1 text-xs text-zinc-600">Drink 8 glasses and share your tracker screenshot.</p>
                </button>
                <button type="button" onClick={() => handleTopicClick("#ProteinPlate")} className="block w-full rounded-xl border border-white/90 bg-white/70 p-3 text-left transition hover:bg-white">
                  <p className="font-medium text-zinc-900">Protein Plate</p>
                  <p className="mt-1 text-xs text-zinc-600">Post one protein-rich meal with calories.</p>
                </button>
                <button type="button" onClick={() => handleTopicClick("#NoSugarNight")} className="block w-full rounded-xl border border-white/90 bg-white/70 p-3 text-left transition hover:bg-white">
                  <p className="font-medium text-zinc-900">No Sugar Night</p>
                  <p className="mt-1 text-xs text-zinc-600">Share your sugar-free dinner choice.</p>
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/80 bg-white/55 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
              <h3 className="text-sm font-semibold text-zinc-900">Recommended Topics</h3>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {["#WeightLoss", "#PCOS", "#Keto", "#MealPrep", "#HealthySnacks"].map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleTopicClick(topic)}
                    className="rounded-full border border-white/90 bg-white/70 px-3 py-1.5 text-zinc-700 transition hover:bg-white"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/80 bg-white/55 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
              <h3 className="text-sm font-semibold text-zinc-900">Profile Note</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-700">
                {profileLoading
                  ? "Loading profile..."
                  : profile?.bio || "Open your profile page to add bio, specialization, and other details."}
              </p>
            </div>
          </aside>
        </div>
      </div>
      </main>

      <ImageCropModal
        isOpen={!!postCropSource}
        imageSrc={postCropSource}
        title="Crop Post Image"
        aspect={4 / 3}
        fileName={pendingPostImageMeta?.name || "community-post"}
        fileType={pendingPostImageMeta?.type || "image/jpeg"}
        onCancel={handlePostCropCancel}
        onApply={handlePostCropApply}
      />
    </>
  );
}
