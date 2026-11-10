import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import socket from "../socket";
import {
  ArrowLeft,
  LogOut,
  Search,
  Phone,
  MoreVertical,
  Pin,
  CheckCheck,
  Eye,
  Smile,
  Paperclip,
  Send,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Chat() {
  const { user: currentUser, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const messagesEndRef = useRef(null);

  // Load users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/users");
        const userList = Array.isArray(response.data)
          ? response.data
          : response.data.users;

        setUsers(userList || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load contacts."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Connect Socket.IO & listen for online users
  useEffect(() => {
    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
    };

    const handleConnectError = (err) => {
      console.error("Socket connection error:", err.message);
    };

    const handleOnlineUsers = (userIds) => {
      setOnlineUsers(userIds || []);
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("get_online_users", handleOnlineUsers);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("get_online_users", handleOnlineUsers);
      socket.disconnect();
    };
  }, []);

  // Keep the latest message visible
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  // Receive real-time messages
  useEffect(() => {
    const handleNewMessage = (message) => {
      const messageConversation =
        typeof message.conversation === "object"
          ? message.conversation?._id
          : message.conversation;

      if (!conversation || messageConversation !== conversation._id) {
        return;
      }

      setMessages((previous) => {
        if (previous.some((item) => item._id === message._id)) {
          return previous;
        }

        return [...previous, message];
      });
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [conversation]);

  // Open or create a conversation
  const handleSelectUser = async (person) => {
    setMobileChatOpen(true);
    setSelectedUser(person);
    setConversation(null);
    setMessages([]);
    setNewMessage("");
    setError("");
    setConversationLoading(true);
    setMessagesLoading(true);

    try {
      const response = await api.post("/conversations", {
        userId: person._id,
      });

      const conversationData =
        response.data.conversation ?? response.data;

      setConversation(conversationData);

      socket.emit(
        "join_conversation",
        conversationData._id,
        (result) => {
          if (!result?.success) {
            setError(
              result?.message || "Unable to join conversation room."
            );
          }
        }
      );

      const messageResponse = await api.get(
        `/messages/${conversationData._id}`
      );

      const messageList = Array.isArray(messageResponse.data)
        ? messageResponse.data
        : messageResponse.data.messages;

      setMessages(messageList || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to open conversation."
      );
    } finally {
      setConversationLoading(false);
      setMessagesLoading(false);
    }
  };

  // Send a message
  const handleSendMessage = async (event) => {
    event.preventDefault();

    const text = newMessage.trim();

    if (!text || !conversation || sending) return;

    setSending(true);
    setError("");

    try {
      const response = await api.post("/messages", {
        conversationId: conversation._id,
        text,
      });

      const sentMessage =
        response.data.message ?? response.data;

      setMessages((previous) => {
        if (
          previous.some((message) => message._id === sentMessage._id)
        ) {
          return previous;
        }

        return [...previous, sentMessage];
      });

      setNewMessage("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  };

  const currentUserId = currentUser?._id || currentUser?.id;

  const getSenderId = (message) =>
    typeof message.sender === "object"
      ? message.sender?._id
      : message.sender;

  const getSenderName = (message) => {
    if (typeof message.sender === "object" && message.sender?.name) {
      return message.sender.name;
    }
    if (String(getSenderId(message)) === String(selectedUser?._id)) {
      return selectedUser?.name || "Participant";
    }
    return currentUser?.name || "You";
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(String(userId));
  };

  const onlineCount = users.filter((person) => isUserOnline(person._id)).length;

  const filteredUsers = users.filter((person) => {
    const query = search.toLowerCase();

    return (
      person.name?.toLowerCase().includes(query) ||
      person.email?.toLowerCase().includes(query)
    );
  });

  const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "U";

  // Palette generator for squircle avatars if avatar image is missing
  const getAvatarGradient = (str = "") => {
    const gradients = [
      "bg-gradient-to-tr from-slate-900 to-slate-800 text-white",
      "bg-gradient-to-tr from-[#6067f5] to-indigo-600 text-white",
      "bg-gradient-to-tr from-rose-500 to-pink-500 text-white",
      "bg-gradient-to-tr from-amber-600 to-orange-500 text-white",
      "bg-gradient-to-tr from-teal-600 to-emerald-500 text-white",
      "bg-gradient-to-tr from-cyan-600 to-blue-500 text-white",
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-white text-slate-800 antialiased">
      {/* Left Sidebar */}
      <aside
        className={`${
          mobileChatOpen ? "hidden" : "flex"
        } w-full shrink-0 flex-col border-r border-slate-100 bg-white md:flex md:w-84 lg:w-96`}
      >
        {/* Top Search Bar */}
        <div className="p-4 sm:p-5 pb-3">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-4 h-4 w-4 text-[#7d859d]" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search"
              aria-label="Search contacts"
              className="w-full rounded-2xl bg-[#edeef9] py-3 pr-4 pl-11 text-sm font-medium text-slate-800 outline-none transition placeholder:text-[#8a91a8] focus:bg-[#e6e8f5] focus:ring-2 focus:ring-[#6067f5]/20"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {loading && (
            <div className="p-6 text-center text-xs font-medium text-slate-400">
              Loading contacts...
            </div>
          )}

          {!loading && filteredUsers.length === 0 && (
            <div className="p-6 text-center text-xs font-medium text-slate-400">
              {users.length === 0
                ? "No other contacts yet. Create another account to test chatting."
                : "No contacts match your search."}
            </div>
          )}

          {filteredUsers.map((person, index) => {
            const isSelected = selectedUser?._id === person._id;
            const online = isUserOnline(person._id);

            return (
              <button
                type="button"
                key={person._id}
                onClick={() => handleSelectUser(person)}
                className={`group flex w-full items-center gap-3.5 rounded-2xl p-3 text-left transition ${
                  isSelected
                    ? "bg-[#edeef9]"
                    : "hover:bg-[#f7f8fc]"
                }`}
              >
                {/* Squircle Avatar with optional Online Dot */}
                <div className="relative shrink-0">
                  {person.avatar ? (
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="h-12 w-12 rounded-2xl object-cover shadow-2xs"
                    />
                  ) : (
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-base font-bold shadow-2xs ${getAvatarGradient(
                        person.name || person.email
                      )}`}
                    >
                      {getInitial(person.name)}
                    </div>
                  )}

                  {online && (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-xs"
                      title="Online"
                    />
                  )}
                </div>

                {/* Contact Information */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className={`truncate text-sm font-bold ${
                        isSelected ? "text-slate-900" : "text-slate-800"
                      }`}
                    >
                      {person.name || "User"}
                    </p>
                    <span className="shrink-0 text-xs text-[#9aa2b5]">
                      {online ? "active" : `${(index + 1) * 7}m`}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-1.5">
                    <p
                      className={`truncate text-xs ${
                        isSelected
                          ? "font-medium text-[#6067f5]"
                          : "text-[#747d95]"
                      }`}
                    >
                      {online ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Online now
                        </span>
                      ) : (
                        person.email
                      )}
                    </p>

                    {/* Right status badges like in image (pin or unread pill) */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isSelected ? (
                        <Pin
                          size={13}
                          className="rotate-45 fill-[#6067f5] text-[#6067f5]"
                        />
                      ) : index % 3 === 0 ? (
                        <Pin
                          size={13}
                          className="rotate-45 text-[#8f96b2] opacity-70"
                        />
                      ) : (
                        <CheckCheck size={14} className="text-[#6067f5]" />
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer with current user profile */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-[#fafbfe] p-3.5 px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${getAvatarGradient(
                currentUser?.name || "User"
              )}`}
            >
              {getInitial(currentUser?.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-800">
                {currentUser?.name || "My Account"}
              </p>
              <p className="truncate text-[11px] text-slate-400">
                {currentUser?.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                socket.disconnect();
                await logout();
              } catch (e) {
                console.error("Logout error:", e);
              }
            }}
            title="Sign Out"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Chat Panel */}
      <main
        className={`${
          mobileChatOpen ? "flex" : "hidden"
        } min-h-0 min-w-0 flex-1 flex-col bg-white md:flex`}
      >
        {!selectedUser ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-[#fafbfe]">
            <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-[#edeef9] text-4xl shadow-sm">
              💬
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Select a conversation
            </h2>
            <p className="mt-2 max-w-sm text-sm text-[#747d95]">
              Choose someone from the list to start messaging in real time with
              Socket.IO WebSockets.
            </p>
          </div>
        ) : (
          <>
            {/* Top Chat Header */}
            <header className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 py-4 md:px-8">
              <div className="flex items-center gap-3.5">
                {/* Mobile back arrow */}
                <button
                  type="button"
                  onClick={() => setMobileChatOpen(false)}
                  aria-label="Back to contacts"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 md:hidden"
                >
                  <ArrowLeft size={18} />
                </button>

                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    {selectedUser.name || "Conversation"}
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-slate-400">
                    {isUserOnline(selectedUser._id) ? (
                      <span className="text-emerald-600 font-semibold">
                        Online now
                      </span>
                    ) : (
                      <span>Offline • {selectedUser.email}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right action icons matching reference image */}
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  aria-label="Search conversation"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <Search size={19} />
                </button>
                <button
                  type="button"
                  aria-label="Start audio call"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <Phone size={19} />
                </button>
                <button
                  type="button"
                  aria-label="More options"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <MoreVertical size={19} />
                </button>
              </div>
            </header>

            {/* Scrollable Messages Stream */}
            <section className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6 md:px-8 bg-white">
              {conversationLoading && (
                <div className="m-auto text-xs font-medium text-slate-400">
                  Opening conversation...
                </div>
              )}

              {!conversationLoading && messagesLoading && (
                <div className="m-auto text-xs font-medium text-slate-400">
                  Loading messages...
                </div>
              )}

              {!conversationLoading &&
                !messagesLoading &&
                messages.length === 0 && (
                  <div className="m-auto text-center">
                    <div className="mb-3 text-4xl">👋</div>
                    <p className="font-bold text-slate-800">No messages yet</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Send a message to begin chatting in real time!
                    </p>
                  </div>
                )}

              <div className="mt-auto space-y-5">
                {messages.map((message) => {
                  const isOwnMessage =
                    currentUserId != null &&
                    String(getSenderId(message)) === String(currentUserId);
                  const senderName = getSenderName(message);

                  return (
                    <div
                      key={message._id}
                      className={`flex items-end gap-3 ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* Incoming Avatar on Left */}
                      {!isOwnMessage && (
                        <div className="shrink-0 mb-1">
                          {selectedUser.avatar ? (
                            <img
                              src={selectedUser.avatar}
                              alt={selectedUser.name}
                              className="h-10 w-10 rounded-2xl object-cover shadow-2xs"
                            />
                          ) : (
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-bold shadow-2xs ${getAvatarGradient(
                                selectedUser.name || "U"
                              )}`}
                            >
                              {getInitial(selectedUser.name)}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className={`max-w-[85%] rounded-3xl px-4 py-3 sm:max-w-[70%] ${
                          isOwnMessage
                            ? "rounded-br-xs bg-[#6067f5] text-white shadow-sm shadow-indigo-500/10"
                            : "rounded-tl-xs bg-[#f0f2fa] text-slate-800"
                        }`}
                      >
                        {/* Sender header name for incoming message */}
                        {!isOwnMessage && (
                          <p className="mb-1 text-xs font-bold text-[#5d60f5]">
                            {senderName}
                          </p>
                        )}

                        {/* Text */}
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                          {message.text}
                        </p>

                        {/* Bottom Metadata: views + time */}
                        <div
                          className={`mt-1.5 flex items-center justify-end gap-2 text-[11px] ${
                            isOwnMessage ? "text-indigo-200" : "text-[#9aa2b5]"
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <Eye size={12} className="opacity-70" />
                            <span>1</span>
                          </div>
                          <span>{formatTime(message.createdAt)}</span>
                        </div>
                      </div>

                      {/* Outgoing Avatar on Right */}
                      {isOwnMessage && (
                        <div className="shrink-0 mb-1">
                          {currentUser?.avatar ? (
                            <img
                              src={currentUser.avatar}
                              alt={currentUser.name}
                              className="h-10 w-10 rounded-2xl object-cover shadow-2xs"
                            />
                          ) : (
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-bold shadow-2xs ${getAvatarGradient(
                                currentUser?.name || "Me"
                              )}`}
                            >
                              {getInitial(currentUser?.name)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>
            </section>

            {/* Error banner */}
            {error && (
              <div
                role="alert"
                className="mx-5 mb-2 rounded-xl bg-red-50 px-4 py-2 text-xs font-medium text-red-700"
              >
                {error}
              </div>
            )}

            {/* Bottom Message Composer */}
            <form
              onSubmit={handleSendMessage}
              className="flex shrink-0 items-center gap-2 border-t border-slate-100 bg-white p-4 md:px-8"
            >
              <div className="flex flex-1 items-center gap-2 rounded-2xl bg-[#edeef9] px-4 py-2 transition focus-within:bg-[#e6e8f5] focus-within:ring-2 focus-within:ring-[#6067f5]/20">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  placeholder="Write a message..."
                  aria-label="Write a message"
                  maxLength={5000}
                  disabled={sending || conversationLoading || !conversation}
                  className="min-w-0 flex-1 bg-transparent py-1.5 text-sm font-medium text-slate-800 outline-none placeholder:text-[#8a91a8] disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  aria-label="Attach file"
                  className="text-[#7d859d] hover:text-[#6067f5] transition p-1"
                >
                  <Paperclip size={18} />
                </button>
                <button
                  type="button"
                  aria-label="Emoji"
                  className="text-[#7d859d] hover:text-[#6067f5] transition p-1"
                >
                  <Smile size={18} />
                </button>
              </div>

              <button
                type="submit"
                disabled={sending || !newMessage.trim() || !conversation}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#6067f5] text-white shadow-md shadow-indigo-500/20 transition hover:bg-[#5259e8] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={18} />
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

export default Chat;
