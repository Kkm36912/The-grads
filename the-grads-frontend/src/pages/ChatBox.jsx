import React, { useEffect, useState, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getSocket } from "../lib/socket";
import { Send, Users, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

export default function ChatBox({ switchTab }) {
  const socket = getSocket();
  const { user } = useContext(AuthContext);
  
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState(new Map());
  const [inputFocused, setInputFocused] = useState(false);

  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const oldestSnowflakeRef = useRef(null);

  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const typingTimer = useRef(null);
  const isPrependingRef = useRef(false);
  const lastTypingSent = useRef(0);

  const API_URL = import.meta.env.VITE_API_URL || "https://the-grads.onrender.com";

  // ✅ CENTRAL SORT FUNCTION (single source of truth)
  const sortMessages = (msgs) =>
    msgs.sort((a, b) => Number(a.snowflake) - Number(b.snowflake));

  useEffect(() => {
    if (!user) return;
    socket.emit("presence:online", { userId: user._id, username:  user.fullName || user.username });

    const handler = (payload) => {
      if (Array.isArray(payload.users)) {
        setOnlineUsers(payload.users.filter((u) => u.status === "online"));
        return;
      }
      const u = payload;
      setOnlineUsers((prev) => {
        const map = new Map(prev.map((p) => [p.userId, p]));
        if (u.status === "online") map.set(u.userId, u);
        else map.delete(u.userId);
        return Array.from(map.values());
      });
    };

    socket.on("presence:update", handler);
    return () => socket.off("presence:update", handler);
  }, [user, socket]);

  // ✅ INITIAL LOAD
  useEffect(() => {
    fetch(`${API_URL}/api/messages?limit=50`)
      .then((res) => res.json())
      .then((data) => {
        const msgs = data.messages ?? data;
        if (!Array.isArray(msgs)) return;

        const sorted = sortMessages([...msgs]);

        setMessages(sorted);
        setHasMoreHistory(data.hasMore ?? true);

        if (sorted.length > 0) {
          oldestSnowflakeRef.current = sorted[0].snowflake;
        }
      })
      .catch(err => console.error("History fetch error:", err));
  }, [API_URL]);

  // ✅ PAGINATION FIXED
  const loadOlderHistory = async () => {
    if (!hasMoreHistory || loadingHistory || !oldestSnowflakeRef.current) return;
    setLoadingHistory(true);

    const container = containerRef.current;
    const prevHeight = container?.scrollHeight ?? 0;

    try {
      const res = await fetch(`${API_URL}/api/messages?limit=50&before=${oldestSnowflakeRef.current}`);
      const data = await res.json();
      const older = data.messages ?? data;

      if (older.length > 0) {
        const sortedOlder = sortMessages([...older]);

        oldestSnowflakeRef.current = sortedOlder[0].snowflake;
        isPrependingRef.current = true;

        setMessages((prev) => sortMessages([...sortedOlder, ...prev]));
      }

      setHasMoreHistory(data.hasMore ?? older.length === 50);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - prevHeight + container.scrollTop;
        }
      });
    }
  };

  const handleScroll = () => {
    if (loadingHistory || !hasMoreHistory || !containerRef.current) return;
    if (containerRef.current.scrollTop < 120) loadOlderHistory();
  };

  // ✅ REALTIME FIXED
  useEffect(() => {
    socket.on("new-message", (msg) => {
      setMessages((prev) => {
        if (prev.find((m) => m.snowflake === msg.snowflake)) return prev;
        return sortMessages([...prev, msg]);
      });
    });

    socket.on("new-message-batch", (batch) => {
      setMessages(prev => {
        const existing = new Set(prev.map(m => m.snowflake));
        const newMessages = batch.filter(m => !existing.has(m.snowflake));
        return sortMessages([...prev, ...newMessages]);
      });
    });

    socket.on("message:ack:batch", ({ snowflakes }) => {
      setMessages((prev) =>
        prev.map((m) =>
          snowflakes.includes(m.snowflake)
            ? { ...m, delivered: true }
            : m
        )
      );
    });

    return () => {
      socket.off("new-message");
      socket.off("message:ack:batch");
      socket.off("new-message-batch");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("typing:start", ({ userId, username }) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(userId, username);
        return newMap;
      });
    });

    socket.on("typing:stop", (userId) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
    });

    return () => {
      socket.off("typing:start");
      socket.off("typing:stop");
    };
  }, [socket]);

  useEffect(() => {
    if (isPrependingRef.current) {
      isPrependingRef.current = false;
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleTyping = () => {
    if (!socket.connected || !inputFocused) return;
    const now = Date.now();
    if (now - lastTypingSent.current > 4000) {
      socket.emit("typing:start");
      lastTypingSent.current = now;
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket.emit("typing:stop"), 1500);
  };

  const send = () => {
    if (!input.trim() || !user) return;
    socket.emit("send-message", {
      userId: user._id,
      username: user.fullName || user.username || "Unknown",
      content: input,
    });
    setInput("");
    socket.emit("typing:stop");
  };

  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach(m => {
      const dateKey = new Date(m.createdAt).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(m);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  
  return (
    <div className="flex h-[calc(100vh-120px)] w-full gap-4 p-2 md:p-4 animate-in fade-in duration-500">
      
      {/* LEFT: ONLINE LIST */}
      <div className="hidden lg:flex flex-col w-64 bg-[#040a0f]/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 mb-6 px-2">
          <Users className="w-4 h-4 text-grads-cyan" />
          <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Active Grads</h4>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
          {onlineUsers.map((u) => (
            <motion.div
              key={u.userId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all group cursor-pointer"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-grads-cyan/20 border border-grads-cyan/30 flex items-center justify-center text-grads-cyan text-xs font-bold">
                  ({(u.username || "U").charAt(0).toUpperCase()})
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#040a0f]"></div>
              </div>
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors truncate">{u.username || "Unknown"}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* RIGHT: CHAT INTERFACE */}
      <div className="flex-1 flex flex-col bg-[#040a0f]/60 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
        
        {/* HEADER */}
        <div className="px-6 md:px-8 py-4 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-grads-cyan/10 rounded-lg">
              <MessageSquare className="w-5 h-5 text-grads-cyan" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Query Forum</h3>
              <p className="text-[10px] text-slate-500 font-mono hidden md:block">SECTOR: COMMUNITY_HUB</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => switchTab('audio')}
            className="text-[10px] font-mono px-4 py-2 bg-grads-cyan/10 border border-grads-cyan/20 text-grads-cyan rounded-full hover:bg-grads-cyan/20 transition-all uppercase tracking-widest"
          >
            Switch to Audio
          </motion.button>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar" ref={containerRef} onScroll={handleScroll}>
          
          {!hasMoreHistory && (
            <div className="text-center text-[10px] font-mono text-slate-600 my-4 uppercase tracking-widest">
              — End of Transmission —
            </div>
          )}
          {loadingHistory && (
            <div className="text-center text-xs text-grads-cyan my-2 animate-pulse">
              Decrypting older records...
            </div>
          )}

          {Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
            <div key={dateKey}>
              <div className="flex items-center justify-center my-6 relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <div className="relative bg-[#040a0f] px-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">{dateKey}</div>
              </div>
              
              <div className="space-y-4">
                {dateMessages.map((m, i) => {
                  const isMe = m.userId === user?._id;
                  const prev = dateMessages[i - 1];
                  const isSameUserAsPrev = prev && prev.userId === m.userId;

                  return (
                    <motion.div
                      key={m.snowflake}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} group`}
                    >
                      <div className={`max-w-[85%] md:max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                        {!isMe && !isSameUserAsPrev && (
                          <motion.span 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[10px] font-mono text-slate-400 ml-2 mt-2"
                          >
                            {m.username}
                          </motion.span>
                        )}
                        <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm relative ${
                          isMe 
                          ? "bg-gradient-to-br from-grads-teal to-grads-cyan text-black font-medium rounded-tr-sm" 
                          : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm"
                        }`}>
                          <div className="whitespace-pre-wrap break-words">{m.content}</div>
                          {isMe && (
                            <div className="absolute right-2 bottom-1 text-[8px] text-black/50 font-bold">
                              {m.delivered ? "✔✔" : "✔"}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}

          <AnimatePresence>
            {typingUsers.size > 0 && (() => {
              const users = Array.from(typingUsers.values());
              const visible = users.slice(0, 3);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start my-2"
                >
                  <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-3">
                    <div className="flex space-x-1.5">
                      <div className="w-1.5 h-1.5 bg-grads-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-grads-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-grads-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs text-slate-400">
                      {visible.join(", ")} {users.length > 3 && `+${users.length - 3}`} typing...
                    </span>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* INPUT BOX */}
        <div className="p-4 md:p-6 bg-white/5 border-t border-white/5">
          <div className="relative flex items-center gap-3">
            <input
              value={input}
              onFocus={() => setInputFocused(true)}
              onBlur={() => { setInputFocused(false); socket.emit("typing:stop"); }}
              onChange={(e) => { setInput(e.target.value); handleTyping(); }}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Inject your query into the stream..."
              className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-grads-cyan/50 focus:ring-1 focus:ring-grads-cyan/30 transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={send}
              disabled={!input.trim()}
              className={`p-4 rounded-2xl transition-all shadow-lg ${
                input.trim()
                  ? 'bg-gradient-to-br from-grads-teal to-grads-cyan text-black shadow-[0_0_20px_rgba(14,165,233,0.3)]'
                  : 'bg-slate-800 text-slate-600'
              }`}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}