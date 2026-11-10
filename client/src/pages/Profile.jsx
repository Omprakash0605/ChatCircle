import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  Camera,
  Upload,
  Trash2,
  Save,
  User as UserIcon,
  Mail,
  ShieldCheck,
  Calendar,
  Copy,
  Check,
  LogOut,
  Image as ImageIcon,
  Link2,
  MessageSquare,
  Users,
  ExternalLink,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  LogIn,
  X,
  FileText,
} from "lucide-react";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
];

const STATUS_PRESETS = [
  "🟢 Available to chat",
  "⚡ Deep focus mode",
  "💼 In a meeting",
  "☕ Taking a quick break",
  "🌙 Away from keyboard",
  "🚀 Building awesome apps",
];

function Profile() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

  const fileInputRef = useRef(null);

  // Form states
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [about, setAbout] = useState(
    user?.about || "Hey there! I am using ChatCircle."
  );

  // UI state
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedId, setCopiedId] = useState(false);

  // Media sharing details state
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [mediaStats, setMediaStats] = useState({
    totalMessages: 0,
    totalConversations: 0,
    mediaCount: 0,
    linksCount: 0,
  });
  const [mediaItems, setMediaItems] = useState([]);
  const [linkItems, setLinkItems] = useState([]);
  const [activeMediaTab, setActiveMediaTab] = useState("media"); // 'media' | 'links'
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);

  // Sync form when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatar(user.avatar || "");
      setAbout(user.about || "Hey there! I am using ChatCircle.");
    }
  }, [user]);

  // Fetch media sharing details and stats
  useEffect(() => {
    const fetchMediaDetails = async () => {
      try {
        setLoadingMedia(true);
        const res = await api.get("/users/media-sharing");
        if (res.data?.success) {
          setMediaStats(res.data.stats || {});
          setMediaItems(res.data.media || []);
          setLinkItems(res.data.links || []);
        }
      } catch (err) {
        console.error("Failed to load media sharing details:", err);
      } finally {
        setLoadingMedia(false);
      }
    };

    fetchMediaDetails();
  }, []);

  // Avatar file upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPEG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image file size should be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
      setErrorMessage("");
    };
    reader.readAsDataURL(file);
  };

  // Copy User ID
  const handleCopyId = () => {
    const userId = user?.id || user?._id;
    if (!userId) return;
    navigator.clipboard.writeText(String(userId));
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Handle Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage("Name must be at least 2 characters long.");
      return;
    }

    if (name.trim().length > 50) {
      setErrorMessage("Name cannot exceed 50 characters.");
      return;
    }

    setSaving(true);

    try {
      const response = await api.put("/users/profile", {
        name: name.trim(),
        avatar: avatar.trim(),
        about: about.trim(),
      });

      if (response.data?.success) {
        updateUser(response.data.user);
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3500);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      socket.disconnect();
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const getInitial = (str) => str?.charAt(0)?.toUpperCase() || "U";

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9fc] text-slate-800 antialiased selection:bg-[#6067f5] selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 md:px-8">
          <div className="flex items-center gap-3">
            <Link
              to="/chat"
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#edeef9] text-slate-700 transition hover:bg-[#e4e6f5]"
              title="Return to conversations"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                My Profile & Settings
              </h1>
              <p className="text-xs text-slate-400">
                Manage your account identity, profile photo, and shared media
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/chat"
              className="hidden items-center gap-2 rounded-2xl bg-[#edeef9] px-4 py-2 text-xs font-bold text-[#6067f5] transition hover:bg-[#e4e6f5] sm:flex"
            >
              <MessageSquare size={14} />
              <span>Back to Chat</span>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
              title="Sign out of your session"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8">
        {/* Alerts */}
        {successMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-sm animate-fade-in">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 shadow-sm">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT COLUMN: Profile Setup & Account Card (7 cols on lg) */}
          <div className="space-y-6 lg:col-span-7">
            {/* Profile Setup Form Card */}
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Profile Information
                  </h2>
                  <p className="text-xs text-slate-400">
                    Update your public display name, photo, and bio status
                  </p>
                </div>
                <span className="rounded-full bg-[#edeef9] px-3 py-1 text-[11px] font-semibold text-[#6067f5]">
                  Public Profile
                </span>
              </div>

              <form onSubmit={handleSaveProfile} className="mt-6 space-y-6">
                {/* Avatar Setup Section */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Profile Picture
                  </label>

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    {/* Avatar Display */}
                    <div className="relative group shrink-0 self-center sm:self-auto">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt="Profile Preview"
                          className="h-28 w-28 rounded-3xl object-cover shadow-md ring-4 ring-slate-50"
                        />
                      ) : (
                        <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-tr from-[#6067f5] to-indigo-600 text-3xl font-extrabold text-white shadow-md ring-4 ring-slate-50">
                          {getInitial(name || user?.name)}
                        </div>
                      )}

                      {/* Quick upload overlay */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-black/40 text-white opacity-0 transition group-hover:opacity-100"
                        title="Upload new photo"
                      >
                        <Camera size={22} />
                        <span className="text-[10px] font-medium mt-1">Upload</span>
                      </button>

                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>

                    {/* Avatar Actions & Presets */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 rounded-2xl bg-[#edeef9] px-3.5 py-2 text-xs font-bold text-[#6067f5] transition hover:bg-[#e4e6f5]"
                        >
                          <Upload size={14} />
                          <span>Upload Image</span>
                        </button>

                        {avatar && (
                          <button
                            type="button"
                            onClick={() => setAvatar("")}
                            className="flex items-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
                          >
                            <Trash2 size={13} />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      {/* Preset Avatars Row */}
                      <div>
                        <p className="text-[11px] font-semibold text-slate-400 mb-1.5">
                          Or choose a curated squircle preset:
                        </p>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {AVATAR_PRESETS.map((presetUrl, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setAvatar(presetUrl)}
                              className={`relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border-2 transition hover:scale-105 ${
                                avatar === presetUrl
                                  ? "border-[#6067f5] ring-2 ring-[#6067f5]/30"
                                  : "border-slate-200"
                              }`}
                            >
                              <img
                                src={presetUrl}
                                alt={`Preset ${i + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Display Name Input */}
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="displayName"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-500"
                    >
                      Display Name
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {name.length}/50 characters
                    </span>
                  </div>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <UserIcon size={16} />
                    </div>
                    <input
                      id="displayName"
                      type="text"
                      required
                      maxLength={50}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full rounded-2xl bg-[#edeef9] py-3 pr-4 pl-10 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#6067f5]/20 focus:border-[#6067f5]"
                    />
                  </div>
                </div>

                {/* About / Bio Status Input */}
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="aboutStatus"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-500"
                    >
                      About / Status
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {about.length}/150
                    </span>
                  </div>
                  <div className="mt-2">
                    <input
                      id="aboutStatus"
                      type="text"
                      maxLength={150}
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      placeholder="What are you up to?"
                      className="w-full rounded-2xl bg-[#edeef9] py-3 px-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#6067f5]/20 focus:border-[#6067f5]"
                    />
                  </div>

                  {/* Status Preset Pills */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {STATUS_PRESETS.map((statusText, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setAbout(statusText)}
                        className={`rounded-xl px-2.5 py-1 text-[11px] font-medium transition ${
                          about === statusText
                            ? "bg-[#6067f5] text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {statusText}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#6067f5] py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition hover:bg-[#5259e8] focus:ring-2 focus:ring-[#6067f5]/30 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Account Details & Sign In / Out Card */}
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                Account & Authentication
              </h2>

              <div className="mt-5 space-y-4">
                {/* Email (Readonly Verified) */}
                <div className="flex items-center justify-between rounded-2xl bg-[#fafbfe] p-3.5 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Registered Email
                      </p>
                      <p className="text-sm font-semibold text-slate-800">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                    <ShieldCheck size={13} />
                    <span>Verified</span>
                  </span>
                </div>

                {/* User ID with Copy */}
                <div className="flex items-center justify-between rounded-2xl bg-[#fafbfe] p-3.5 border border-slate-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#6067f5]">
                      <UserIcon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        ChatCircle User ID
                      </p>
                      <p className="truncate font-mono text-xs text-slate-700">
                        {user?.id || user?._id || "Not loaded"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-2xs border border-slate-200 transition hover:bg-slate-50"
                  >
                    {copiedId ? (
                      <>
                        <Check size={13} className="text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Member Since Date */}
                <div className="flex items-center justify-between rounded-2xl bg-[#fafbfe] p-3.5 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Member Since
                      </p>
                      <p className="text-sm font-semibold text-slate-800">
                        {formatDate(user?.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sign in / Switch Account & Sign Out Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    to="/login"
                    className="flex w-full sm:flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
                  >
                    <LogIn size={15} />
                    <span>Sign in with Another Account</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full sm:flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 py-3 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Media Sharing Details & Activity (5 cols on lg) */}
          <div className="space-y-6 lg:col-span-5">
            {/* Media Sharing Stats Overview */}
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Media Sharing Detail
                  </h2>
                  <p className="text-xs text-slate-400">
                    Summary of shared media, files, links, and messages
                  </p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#edeef9] text-[#6067f5]">
                  <Sparkles size={16} />
                </div>
              </div>

              {/* Stat Cards Grid */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#edeef9]/60 p-4 border border-[#edeef9]">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Messages
                    </span>
                    <MessageSquare size={14} className="text-[#6067f5]" />
                  </div>
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">
                    {mediaStats.totalMessages}
                  </p>
                  <p className="text-[10px] text-slate-400">Total sent</p>
                </div>

                <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-100">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Contacts
                    </span>
                    <Users size={14} className="text-emerald-600" />
                  </div>
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">
                    {mediaStats.totalConversations}
                  </p>
                  <p className="text-[10px] text-slate-400">Active chats</p>
                </div>

                <div className="rounded-2xl bg-indigo-50/70 p-4 border border-indigo-100">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Photos
                    </span>
                    <ImageIcon size={14} className="text-[#6067f5]" />
                  </div>
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">
                    {mediaStats.mediaCount}
                  </p>
                  <p className="text-[10px] text-slate-400">Media shared</p>
                </div>

                <div className="rounded-2xl bg-amber-50/70 p-4 border border-amber-100">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Links
                    </span>
                    <Link2 size={14} className="text-amber-600" />
                  </div>
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">
                    {mediaStats.linksCount}
                  </p>
                  <p className="text-[10px] text-slate-400">Web links shared</p>
                </div>
              </div>

              {/* Tab Selector for Shared Media vs Shared Links */}
              <div className="mt-6 flex rounded-2xl bg-[#edeef9] p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveMediaTab("media")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 transition ${
                    activeMediaTab === "media"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <ImageIcon size={14} />
                  <span>Photos & Media ({mediaItems.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTab("links")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 transition ${
                    activeMediaTab === "links"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Link2 size={14} />
                  <span>Links ({linkItems.length})</span>
                </button>
              </div>

              {/* Tab 1: Photos & Media Gallery */}
              {activeMediaTab === "media" && (
                <div className="mt-4">
                  {loadingMedia ? (
                    <div className="flex items-center justify-center p-8 text-slate-400">
                      <Loader2 size={20} className="animate-spin text-[#6067f5]" />
                    </div>
                  ) : mediaItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-[#fafbfe] p-8 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edeef9] text-[#6067f5] mb-2">
                        <ImageIcon size={20} />
                      </div>
                      <p className="text-xs font-bold text-slate-700">
                        No photos shared yet
                      </p>
                      <p className="mt-1 max-w-xs text-[11px] text-slate-400">
                        Attach images in any conversation using the paperclip button to see them cataloged here!
                      </p>
                      <Link
                        to="/chat"
                        className="mt-3 text-xs font-bold text-[#6067f5] hover:underline"
                      >
                        Go to Chats →
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
                      {mediaItems.map((item) => (
                        <button
                          key={item._id}
                          type="button"
                          onClick={() => setSelectedPreviewImage(item.mediaUrl)}
                          className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-slate-100 transition hover:scale-105"
                        >
                          <img
                            src={item.mediaUrl}
                            alt="Shared"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100 text-white">
                            <ImageIcon size={16} />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Shared Links List */}
              {activeMediaTab === "links" && (
                <div className="mt-4">
                  {loadingMedia ? (
                    <div className="flex items-center justify-center p-8 text-slate-400">
                      <Loader2 size={20} className="animate-spin text-[#6067f5]" />
                    </div>
                  ) : linkItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-[#fafbfe] p-8 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-2">
                        <Link2 size={20} />
                      </div>
                      <p className="text-xs font-bold text-slate-700">
                        No links shared yet
                      </p>
                      <p className="mt-1 max-w-xs text-[11px] text-slate-400">
                        When you send links or website URLs in your conversations, they will be organized right here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {linkItems.map((item) => {
                        // Extract URL from text
                        const match = item.text.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/i);
                        const url = match ? match[0] : item.text;
                        const formattedUrl = url.startsWith("http") ? url : `https://${url}`;

                        return (
                          <a
                            key={item._id}
                            href={formattedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between rounded-2xl bg-[#fafbfe] p-3 border border-slate-100 transition hover:bg-[#edeef9]/50"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                <Link2 size={14} />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-slate-800 group-hover:text-[#6067f5]">
                                  {url}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {formatDate(item.createdAt)}
                                </p>
                              </div>
                            </div>
                            <ExternalLink
                              size={14}
                              className="shrink-0 text-slate-400 group-hover:text-[#6067f5] transition"
                            />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Storage & Privacy Status Pill */}
              <div className="mt-6 flex items-center gap-2.5 rounded-2xl bg-[#fafbfe] p-3 text-[11px] text-slate-500 border border-slate-100">
                <FileText size={15} className="shrink-0 text-[#6067f5]" />
                <p className="leading-relaxed">
                  All media and files are securely linked to your account sessions through encrypted WebSocket and REST channels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Full-size Image Preview Modal */}
      {selectedPreviewImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-fade-in"
          onClick={() => setSelectedPreviewImage(null)}
        >
          <div
            className="relative max-h-[85vh] max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPreviewImage(null)}
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black"
            >
              <X size={16} />
            </button>
            <img
              src={selectedPreviewImage}
              alt="Preview"
              className="max-h-[80vh] w-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;

