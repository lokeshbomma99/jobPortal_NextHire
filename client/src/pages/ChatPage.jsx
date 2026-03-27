import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, MessageSquare, Search, Circle } from "lucide-react";
import { chatAPI } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { getSocket } from "../lib/socket";
import { Avatar, EmptyState, Spinner } from "../components/ui";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import toast from "react-hot-toast";

function formatMessageTime(date) {
  const d = new Date(date);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

export default function ChatPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [search, setSearch] = useState("");

  const socket = getSocket();

  // Load conversations
  useEffect(() => {
    chatAPI.getConversations()
      .then(({ data }) => {
        const convList = Array.isArray(data) ? data : [];
        setConversations(convList);
        if (conversationId && conversationId !== 'undefined') {
          const conv = convList.find((c) => c._id === conversationId);
          if (conv) {
            setActiveConv(conv);
          } else {
            // If conversation not in list, try to fetch it directly
            // This handles the case where a conversation was just created
            chatAPI.getConversations()
              .then(({ data: freshData }) => {
                const freshList = Array.isArray(freshData) ? freshData : [];
                setConversations(freshList);
                const freshConv = freshList.find((c) => c._id === conversationId);
                if (freshConv) setActiveConv(freshConv);
              })
              .catch(() => { });
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load conversations:", err);
        toast.error("Failed to load conversations");
      })
      .finally(() => setLoading(false));
  }, [conversationId]);

  // Load messages when active conv changes
  useEffect(() => {
    if (!activeConv) return;
    navigate(`/chat/${activeConv._id}`, { replace: true });
    chatAPI.getMessages(activeConv._id)
      .then(({ data }) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to load messages"));

    socket.emit("chat:join", activeConv._id);
    return () => {
      // No leave event needed, socket.io handles this automatically
    };
  }, [activeConv?._id, navigate, socket]);

  // Socket listeners
  useEffect(() => {
    const handleNewMessage = ({ message, conversationId: cid }) => {
      if (cid === activeConv?._id) {
        setMessages((prev) => [...prev, message]);
      }
      setConversations((prev) =>
        (Array.isArray(prev) ? prev : []).map((c) => c._id === cid ? { ...c, lastMessage: message, lastMessageAt: message.createdAt } : c)
          .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
    };

    const handleTyping = (data) => {
      if (data.userId !== user._id && data.conversationId === activeConv?._id) {
        setTyping(true);
      }
    };

    const handleStopTyping = (data) => {
      if (data.userId !== user._id && data.conversationId === activeConv?._id) {
        setTyping(false);
      }
    };

    socket.on("chat:message", handleNewMessage);
    socket.on("chat:typing", handleTyping);
    socket.on("chat:stop-typing", handleStopTyping);

    return () => {
      socket.off("chat:message", handleNewMessage);
      socket.off("chat:typing", handleTyping);
      socket.off("chat:stop-typing", handleStopTyping);
    };
  }, [activeConv?._id, user._id, socket]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMsg.trim() || !activeConv || sending) return;
    const content = newMsg.trim();
    setNewMsg("");
    setSending(true);
    try {
      const { data } = await chatAPI.sendMessage(activeConv._id, content);
      // Don't add message here - let Socket.io handle it for consistency
      // setMessages((prev) => [...prev, data]);
      socket.emit("chat:stop-typing", {
        conversationId: activeConv._id,
        userId: user._id
      });
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMsg(e.target.value);
    if (!activeConv) return;

    socket.emit("chat:typing", {
      conversationId: activeConv._id,
      userId: user._id
    });

    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(
      setTimeout(() => {
        socket.emit("chat:stop-typing", {
          conversationId: activeConv._id,
          userId: user._id
        });
      }, 2000)
    );
  };

  const getOtherParticipant = (conv) => conv?.participants?.find((p) => p._id !== user._id);

  const filteredConvs = (Array.isArray(conversations) ? conversations : []).filter((c) => {
    const other = getOtherParticipant(c);
    return other?.name?.toLowerCase().includes(search.toLowerCase()) || other?.companyName?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>Messages</h1>

      <div className="flex rounded-2xl overflow-hidden" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)", height: "calc(100vh - 220px)", minHeight: "500px" }}>
        {/* Sidebar */}
        <div className="w-full sm:w-80 flex flex-col border-r" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
              <Search size={15} className="text-slate-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 text-sm text-white placeholder-slate-500 bg-transparent border-none focus:outline-none"
                style={{ border: "none", boxShadow: "none" }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : filteredConvs.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">No conversations yet</div>
            ) : (
              filteredConvs.map((conv) => {
                const other = getOtherParticipant(conv);
                const isActive = activeConv?._id === conv._id;
                return (
                  <button key={conv._id} onClick={() => setActiveConv(conv)}
                    className="w-full p-4 flex items-center gap-3 text-left transition-all"
                    style={{ background: isActive ? "rgba(233,69,96,0.1)" : "transparent", borderLeft: isActive ? "2px solid #e94560" : "2px solid transparent" }}>
                    <div className="relative flex-shrink-0">
                      <Avatar src={other?.avatar} name={other?.name} size="md" />
                      {isUserOnline(other?._id) && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 bg-emerald-400" style={{ borderColor: "#1e2a47" }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">{other?.name}</p>
                        {conv.lastMessageAt && (
                          <p className="text-xs text-slate-500">{formatMessageTime(conv.lastMessageAt)}</p>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {conv.lastMessage?.content || (other?.role === "employer" ? other.companyName : other?.headline || "Start chatting")}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        {activeConv ? (
          <div className="flex-1 flex flex-col hidden sm:flex">
            {/* Header */}
            {(() => {
              const other = getOtherParticipant(activeConv);
              return (
                <div className="p-4 flex items-center gap-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="relative">
                    <Avatar src={other?.avatar} name={other?.name} size="md" />
                    {isUserOnline(other?._id) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 bg-emerald-400" style={{ borderColor: "#1e2a47" }} />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{other?.name}</p>
                    <p className="text-xs text-slate-500">
                      {isUserOnline(other?._id) ? (
                        <span className="text-emerald-400">Online</span>
                      ) : other?.lastSeen ? (
                        `Last seen ${formatDistanceToNow(new Date(other.lastSeen), { addSuffix: true })}`
                      ) : "Offline"}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Messages */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isMe = msg.sender?._id === user._id || msg.sender === user._id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2`}>
                    {!isMe && <Avatar src={msg.sender?.avatar} name={msg.sender?.name} size="sm" />}
                    <div className="max-w-xs lg:max-w-md">
                      <div className="px-4 py-2.5 rounded-2xl text-sm"
                        style={isMe
                          ? { background: "#e94560", color: "white", borderRadius: "18px 18px 4px 18px" }
                          : { background: "rgba(255,255,255,0.07)", color: "#e2e8f0", borderRadius: "18px 18px 18px 4px" }}>
                        {msg.content}
                      </div>
                      <p className={`text-xs text-slate-600 mt-1 ${isMe ? "text-right" : ""}`}>
                        {format(new Date(msg.createdAt), "h:mm a")}
                      </p>
                    </div>
                  </div>
                );
              })}
              {typing && (
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <form onSubmit={handleSend} className="flex gap-3">
                <input
                  type="text"
                  value={newMsg}
                  onChange={handleTyping}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend(e)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <button type="submit" disabled={!newMsg.trim() || sending}
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ background: "#e94560" }}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 items-center justify-center hidden sm:flex">
            <EmptyState icon={MessageSquare} title="Select a conversation" description="Choose a conversation from the left to start messaging." />
          </div>
        )}
      </div>
    </div>
  );
}
