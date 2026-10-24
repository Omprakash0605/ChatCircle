
import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft } from "lucide-react";

function Chat() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");

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
          err.response?.data?.message || "Unable to load users."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Connect Socket.IO
  useEffect(() => {
    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
    };

    const handleConnectError = (err) => {
      console.error("Socket connection error:", err.message);
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
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
              result?.message || "Unable to join conversation."
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
        err.response?.data?.message ||
          "Unable to open conversation."
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

  const filteredUsers = users.filter((person) => {
    const query = search.toLowerCase();

    return (
      person.name?.toLowerCase().includes(query) ||
      person.email?.toLowerCase().includes(query)
    );
  });

  const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "U";

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-slate-100 text-slate-800">
      {/* Sidebar */}
      <aside className={`${ mobileChatOpen ? "hidden" : "flex"} w-full shrink-0 flex-col border-r border-slate-200 bg-white md:flex md:w-80 lg:w-96`}>
        <div className="border-b border-slate-200 p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white">
              C
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Connect
              </h1>
              <p className="text-xs text-slate-500">
                Your conversations, together
              </p>
            </div>
          </div>

          <h2 className="mb-3 text-lg font-semibold">Messages</h2>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search people..."
            aria-label="Search people"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {loading && (
            <p className="p-4 text-sm text-slate-500">
              Loading users...
            </p>
          )}

          {!loading && filteredUsers.length === 0 && (
            <p className="p-4 text-sm text-slate-500">
              {users.length === 0
                ? "No other users yet. Create another test account."
                : "No users match your search."}
            </p>
          )}

          {filteredUsers.map((person) => {
            const isSelected = selectedUser?._id === person._id;

            return (
              <button
                type="button"
                key={person._id}
                onClick={() => handleSelectUser(person)}
                className={`mb-1 flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                  isSelected
                    ? "bg-indigo-50 ring-1 ring-indigo-100"
                    : "hover:bg-slate-50"
                }`}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold ${
                    isSelected
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {getInitial(person.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {person.name || "User"}
                  </p>
                  <p className="truncate text-sm text-slate-500">
                    {person.email}
                  </p>
                </div>

                {isSelected && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                )}
              </button>
            );
          })}
        </div>

        <div className="border-t border-slate-200 p-4">
          <p className="truncate text-xs text-slate-500">
            Signed in as {currentUser?.name || currentUser?.email || "User"}
          </p>
        </div>
      </aside>

      {/* Main chat panel */}
      <main className={`${ mobileChatOpen ? "flex" : "hidden"} min-h-0 min-w-0 flex-1 flex-col bg-slate-50 md:flex`}>
        {!selectedUser ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-100 text-4xl">
              💬
            </div>
            <h2 className="text-2xl font-bold">
              Your conversations start here
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Select someone from the sidebar to start chatting in real time.
            </p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-5 py-4 md:px-7">
              {/* back button */}
              <button
                type="button"
                onClick={() => setMobileChatOpen(false)}
                aria-label="Back to contacts"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 md:hidden"
              >
                <ArrowLeft size={20} />
              </button>
              
              
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                {getInitial(selectedUser.name)}
              </div>

              <div className="min-w-0">
                <h2 className="truncate font-semibold">
                  {selectedUser.name}
                </h2>
                <p className="truncate text-xs text-slate-500">
                  {selectedUser.email}
                </p>
              </div>
            </header>

            {/* Scrollable messages area */}
            <section className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 md:px-8">
              {conversationLoading && (
                <p className="m-auto text-sm text-slate-500">
                  Opening conversation...
                </p>
              )}

              {!conversationLoading && messagesLoading && (
                <p className="m-auto text-sm text-slate-500">
                  Loading messages...
                </p>
              )}

              {!conversationLoading &&
                !messagesLoading &&
                messages.length === 0 && (
                  <div className="m-auto text-center">
                    <div className="mb-3 text-4xl">👋</div>
                    <p className="font-semibold">Say hello!</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Your first message starts the conversation.
                    </p>
                  </div>
                )}

              <div className="mt-auto space-y-4">
                {messages.map((message) => {
                  const isOwnMessage =
                    currentUserId != null &&
                    String(getSenderId(message)) === String(currentUserId);

                  return (
                    <div
                      key={message._id}
                      className={`flex ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[70%] ${
                          isOwnMessage
                            ? "rounded-br-md bg-indigo-600 text-white"
                            : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words text-sm leading-6">
                          {message.text}
                        </p>

                        <p
                          className={`mt-1 text-right text-[10px] ${
                            isOwnMessage
                              ? "text-indigo-100"
                              : "text-slate-400"
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>
            </section>

            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="mx-4 mb-2 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700 md:mx-7"
              >
                {error}
              </div>
            )}

            {/* Fixed bottom composer */}
            <form
              onSubmit={handleSendMessage}
              className="flex shrink-0 items-center gap-3 border-t border-slate-200 bg-white p-4 md:px-7 md:py-5"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(event) => setNewMessage(event.target.value)}
                placeholder="Type your message..."
                aria-label="Type your message"
                maxLength={5000}
                disabled={sending || conversationLoading || !conversation}
                className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={
                  sending || !newMessage.trim() || !conversation
                }
                className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{sending ? "Sending..." : "Send"}</span>
                <span aria-hidden="true">➤</span>
              </button>
            </form>
          </>
        )}
      </main>

      
    </div>
  );
}

export default Chat;
