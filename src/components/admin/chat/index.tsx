"use client";
import { Input, Spin } from "antd";
import {
  Send,
  Paperclip,
  ImagePlus,
  Download,
  FileText,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { getToken } from "@/api/ServerActions";
import { sendRequest } from "@/utils/api";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import {
  IConversation,
  IConversationsResponse,
  IChatMessage,
  IChatHistoryResponse,
} from "@/types/admin/chat";
import Pusher from "pusher-js";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface PendingFile {
  file: File;
  previewUrl: string | null;
  isImage: boolean;
}

const ChatPage = () => {
  const profile = useSelector((state: RootState) => state.profile.profile);
  const currentUserId = profile?.id ? Number(profile.id) : null;
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("user_id") ? Number(searchParams.get("user_id")) : null;
  const autoSelectedRef = useRef(false);

  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loadingConv, setLoadingConv] = useState(false);
  const [loadingMoreConv, setLoadingMoreConv] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [sending, setSending] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

  // Pagination state
  const [convPage, setConvPage] = useState(1);
  const [convTotalPages, setConvTotalPages] = useState(1);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const convListRef = useRef<HTMLDivElement>(null);
  const pusherRef = useRef<Pusher | null>(null);
  const selectedConvRef = useRef<IConversation | null>(null);
  const prevMsgCountRef = useRef<number>(0);

  // Build conversation URL thủ công để tránh encode dấu +
  const buildConvUrl = (page: number, search?: string) => {
    let url = `/chat/conversations?page=${page}&limit=20&is_hidden=false`;
    if (search?.trim()) {
      const searchVal = search.trim().replace(/\s+/g, "+");
      url += `&search=${searchVal}&message_search=${searchVal}`;
    }
    return url;
  };

  // Fetch conversations (page 1)
  const fetchConversations = useCallback(async (search?: string) => {
    try {
      setLoadingConv(true);
      setConvPage(1);
      const token = getToken();
      const res = await sendRequest<IConversationsResponse>({
        url: buildConvUrl(1, search),
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(res.data.conversations || []);
      setConvTotalPages(res.data.pagination?.total_pages || 1);
    } catch {
      setConversations([]);
    } finally {
      setLoadingConv(false);
    }
  }, []);

  // Fetch more conversations (next page)
  const fetchMoreConversations = useCallback(async () => {
    if (loadingMoreConv || convPage >= convTotalPages) return;
    const nextPage = convPage + 1;
    try {
      setLoadingMoreConv(true);
      const token = getToken();
      const res = await sendRequest<IConversationsResponse>({
        url: buildConvUrl(nextPage, searchKeyword),
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const newConvs = res.data.conversations || [];
      setConversations((prev) => [...prev, ...newConvs]);
      setConvPage(nextPage);
      setConvTotalPages(res.data.pagination?.total_pages || 1);
    } catch {
    } finally {
      setLoadingMoreConv(false);
    }
  }, [loadingMoreConv, convPage, convTotalPages, searchKeyword]);

  const handleConvScroll = useCallback(() => {
    const el = convListRef.current;
    if (!el || loadingMoreConv || convPage >= convTotalPages) return;
    const scrolledRatio = (el.scrollTop + el.clientHeight) / el.scrollHeight;
    if (scrolledRatio >= 0.5) {
      fetchMoreConversations();
    }
  }, [fetchMoreConversations, loadingMoreConv, convPage, convTotalPages]);

  // Fetch chat history
  const fetchHistory = useCallback(async (receiverId: number) => {
    try {
      setLoadingMsg(true);
      const token = getToken();
      const res = await sendRequest<IChatHistoryResponse>({
        url: `/chat/history/list?receiver_id=${receiverId}&limit=50`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      // API trả về mới nhất trước -> reverse để cũ nhất lên trên
      const msgs = res.data.messages || [];
      setMessages(msgs.slice().reverse());
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsg(false);
    }
  }, []);

  // Auto-select conversation from order detail (user_id query param)
  useEffect(() => {
    if (!targetUserId || autoSelectedRef.current || conversations.length === 0) return;
    const conv = conversations.find((c) => c.id === targetUserId);
    if (conv) {
      autoSelectedRef.current = true;
      handleSelectConv(conv);
    }
  }, [conversations, targetUserId]);

  // Keep selectedConvRef in sync
  useEffect(() => {
    selectedConvRef.current = selectedConv;
  }, [selectedConv]);

  // Pusher realtime
  useEffect(() => {
    if (!currentUserId) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    pusherRef.current = pusher;

    const channel = pusher.subscribe("chat-channel");

    channel.bind("chat-event", (data: any) => {
      // Chỉ xử lý tin nhắn liên quan đến mình
      if (data.user_id !== currentUserId && data.receiver_id !== currentUserId)
        return;

      const conv = selectedConvRef.current;
      // Nếu đang mở conversation với người gửi/nhận -> fetch lại history + đánh dấu đã đọc
      if (conv && (data.user_id === conv.id || data.receiver_id === conv.id)) {
        fetchHistorySilent(conv.id);
        if (data.user_id !== currentUserId) {
          markAsRead(data.user_id);
        }
      }
      // Cập nhật conversation list
      fetchConversationsSilent();
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("chat-channel");
      pusher.disconnect();
      pusherRef.current = null;
    };
  }, [currentUserId]);

  const fetchHistorySilent = async (receiverId: number) => {
    try {
      const token = getToken();
      const res = await sendRequest<IChatHistoryResponse>({
        url: `/chat/history/list?receiver_id=${receiverId}&limit=50`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const msgs = res.data.messages || [];
      setMessages(msgs.slice().reverse());
    } catch {}
  };

  const fetchConversationsSilent = async () => {
    try {
      const token = getToken();
      const res = await sendRequest<IConversationsResponse>({
        url: buildConvUrl(1, searchKeyword),
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations((prev) => {
        const freshConvs = res.data.conversations || [];
        const freshIds = new Set(freshConvs.map((c) => c.id));
        const remaining = prev.filter((c) => !freshIds.has(c.id));
        return [...freshConvs, ...remaining];
      });
    } catch {}
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (messages.length === 0) return;
    const isNewMsg =
      messages.length > prevMsgCountRef.current && prevMsgCountRef.current > 0;
    prevMsgCountRef.current = messages.length;
    // Dùng setTimeout để đảm bảo DOM đã render xong
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: isNewMsg ? "smooth" : "instant",
      });
    }, 50);
  }, [messages]);

  const markAsRead = async (chatPartnerId: number) => {
    try {
      const token = getToken();
      await sendRequest({
        url: "/chat/messages/mark-as-read",
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: { chat_partner_id: chatPartnerId },
      });
      // Cập nhật unread_count về 0 trong conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === chatPartnerId ? { ...c, unread_count: 0 } : c,
        ),
      );
      // Notify menu to refresh unread count
      window.dispatchEvent(new Event("chat-unread-changed"));
    } catch {}
  };

  const handleSelectConv = (conv: IConversation) => {
    setSelectedConv(conv);
    setPendingFiles([]);
    setInputText("");
    prevMsgCountRef.current = 0;
    fetchHistory(conv.id);
    markAsRead(conv.id);
  };

  const handleSearch = () => {
    fetchConversations(searchKeyword);
  };

  // Search khi gõ (debounce 500ms, fetch ngay khi keyword rỗng)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    const delay = searchKeyword ? 500 : 0;
    searchTimerRef.current = setTimeout(() => {
      if (!cancelled) fetchConversations(searchKeyword);
    }, delay);
    return () => {
      cancelled = true;
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchKeyword]);

  // ========== Pending files (preview) ==========
  const addPendingFiles = (files: FileList | File[]) => {
    const newPending: PendingFile[] = Array.from(files).map((file) => {
      const isImage = file.type.startsWith("image/");
      return {
        file,
        previewUrl: isImage ? URL.createObjectURL(file) : null,
        isImage,
      };
    });
    setPendingFiles((prev) => [...prev, ...newPending]);
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => {
      const item = prev[index];
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearPendingFiles = () => {
    pendingFiles.forEach((p) => {
      if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
    });
    setPendingFiles([]);
  };

  // ========== Send ==========
  const handleSendMessage = async () => {
    if (!selectedConv || sending) return;
    const hasText = inputText.trim().length > 0;
    const hasFiles = pendingFiles.length > 0;
    if (!hasText && !hasFiles) return;

    const receiverId = selectedConv.id;
    setSending(true);
    try {
      const token = getToken();

      // Gửi từng file riêng
      if (hasFiles) {
        for (const pending of pendingFiles) {
          const formData = new FormData();
          formData.append("receiver_id", String(receiverId));
          formData.append("file", pending.file);
          await fetch(`${BASE_URL}/chat/message`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            body: formData,
          });
        }
        clearPendingFiles();
      }

      // Gửi text nếu có
      if (hasText) {
        const formData = new FormData();
        formData.append("receiver_id", String(receiverId));
        formData.append("message", inputText.trim());
        await fetch(`${BASE_URL}/chat/message`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: formData,
        });
        setInputText("");
      }

      fetchHistorySilent(receiverId);
      fetchConversationsSilent();
    } catch {
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    addPendingFiles(files);
    e.target.value = "";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    addPendingFiles(files);
    e.target.value = "";
  };

  // ========== Helpers ==========
  const getInitials = (firstName: string, lastName: string) => {
    return (
      (firstName?.charAt(0) || "").toUpperCase() +
      (lastName?.charAt(0) || "").toUpperCase()
    );
  };

  const getConvName = (conv: IConversation) => {
    return (
      `${conv.first_name || ""} ${conv.last_name || ""}`.trim() || conv.email
    );
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) {
        return date.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      if (diffDays === 1) return "Hôm qua";
      if (diffDays < 7) return `${diffDays} ngày`;
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const formatMsgTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const isImageType = (msg: IChatMessage) => {
    if (msg.message_type === "image") return true;
    if (msg.file_type && msg.file_type.startsWith("image/")) return true;
    if (
      msg.file_name &&
      /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(msg.file_name)
    )
      return true;
    return false;
  };

  const isVideoType = (msg: IChatMessage) => {
    if (msg.message_type === "video") return true;
    if (msg.file_type && msg.file_type.startsWith("video/")) return true;
    if (msg.file_name && /\.(mp4|webm|ogg|mov|avi)$/i.test(msg.file_name))
      return true;
    return false;
  };

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

  const hasContent = inputText.trim().length > 0 || pendingFiles.length > 0;

  return (
    <div className="w-full flex flex-col justify-start items-start">
      <div className="text-start h-[22px] text-[18px] font-medium text-[#212222]">
        Chat
      </div>
      <div
        className="w-full mt-[15px] bg-[#FFFFFF] rounded-[12px] overflow-hidden"
        style={{ height: "calc(100vh - 150px)" }}
      >
        <div className="w-full h-full flex">
          {/* Left - Conversation list */}
          <div className="w-[320px] min-w-[320px] h-full border-r-[1px] border-[#E6E6E6] flex flex-col">
            <div className="px-[16px] pt-[16px] pb-[12px]">
              <div className="text-[16px] font-medium text-[#212222] mb-[12px]">
                Đoạn chat
              </div>
              <Input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onPressEnter={handleSearch}
                placeholder="Tìm kiếm..."
                className="h-[36px] rounded-[20px] bg-[#F5F5F5] text-[13px]"
              />
            </div>
            <div
              ref={convListRef}
              onScroll={handleConvScroll}
              className="flex-1 overflow-y-auto hidden-scroll"
            >
              {loadingConv ? (
                <div className="flex justify-center py-[20px]">
                  <Spin size="small" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-[20px] text-[13px] text-[#9E9E9E]">
                  Chưa có cuộc trò chuyện nào
                </div>
              ) : (
                <>
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConv(conv)}
                      className={`flex items-center gap-[10px] px-[16px] py-[10px] cursor-pointer transition-all duration-150 ${
                        selectedConv?.id === conv.id
                          ? "bg-[#e5efff]"
                          : "hover:bg-[#F5F5F5]"
                      }`}
                    >
                      <div className="w-[48px] h-[48px] min-w-[48px] rounded-full bg-[#E6E6E6] flex justify-center items-center overflow-hidden">
                        {conv.avatar_url ? (
                          <img
                            src={conv.avatar_url}
                            alt={getConvName(conv)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[16px] font-bold text-[#9E9E9E]">
                            {getInitials(conv.first_name, conv.last_name)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span
                            className={`text-[14px] truncate ${
                              conv.unread_count > 0
                                ? "font-[600] text-[#212222]"
                                : "font-[400] text-[#212222]"
                            }`}
                          >
                            {getConvName(conv)}
                          </span>
                          <span className="text-[11px] text-[#9E9E9E] ml-[8px] whitespace-nowrap">
                            {formatTime(
                              conv.last_activity ||
                                conv.latest_message?.created_at ||
                                null,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-[2px]">
                          <span
                            className={`text-[12px] truncate ${
                              conv.unread_count > 0
                                ? "font-[500] text-[#212222]"
                                : "font-[400] text-[#9E9E9E]"
                            }`}
                          >
                            {conv.latest_message
                              ? conv.latest_message.message_type === "text"
                                ? conv.latest_message.message ||
                                  "Chưa có tin nhắn"
                                : conv.latest_message.message_type === "image"
                                  ? "Đã gửi ảnh"
                                  : conv.latest_message.message_type === "video"
                                    ? "Đã gửi video"
                                    : conv.latest_message.file_name ||
                                      "Đã gửi file"
                              : "Chưa có tin nhắn"}
                          </span>
                          {conv.unread_count > 0 && (
                            <span className="ml-[8px] min-w-[18px] h-[18px] rounded-full bg-[#1572FF] text-white text-[10px] font-medium flex justify-center items-center px-[5px]">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {loadingMoreConv && (
                    <div className="flex justify-center py-[10px]">
                      <Spin size="small" />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right - Chat room */}
          <div className="flex-1 h-full flex flex-col">
            {selectedConv ? (
              <>
                {/* Chat header */}
                <div className="h-[60px] min-h-[60px] px-[16px] flex items-center gap-[12px] border-b-[1px] border-[#E6E6E6]">
                  <div className="w-[40px] h-[40px] min-w-[40px] rounded-full bg-[#E6E6E6] flex justify-center items-center overflow-hidden">
                    {selectedConv.avatar_url ? (
                      <img
                        src={selectedConv.avatar_url}
                        alt={getConvName(selectedConv)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[14px] font-bold text-[#9E9E9E]">
                        {getInitials(
                          selectedConv.first_name,
                          selectedConv.last_name,
                        )}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-[#212222]">
                      {getConvName(selectedConv)}
                    </div>
                    <div className="text-[11px] text-[#9E9E9E]">
                      {selectedConv.email}
                    </div>
                  </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto hidden-scroll px-[16px] py-[12px]">
                  {loadingMsg ? (
                    <div className="flex justify-center py-[20px]">
                      <Spin size="small" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-[20px] text-[13px] text-[#9E9E9E]">
                      Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe =
                        currentUserId !== null && msg.user_id === currentUserId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex mb-[8px] ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          {!isMe && (
                            <div className="w-[32px] h-[32px] min-w-[32px] rounded-full bg-[#E6E6E6] flex justify-center items-center overflow-hidden mr-[8px] mt-auto">
                              {msg.sender_avatar ? (
                                <img
                                  src={msg.sender_avatar}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-[10px] font-bold text-[#9E9E9E]">
                                  {getInitials(
                                    selectedConv.first_name,
                                    selectedConv.last_name,
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                          <div
                            className={`max-w-[65%] flex flex-col ${
                              isMe ? "items-end" : "items-start"
                            }`}
                          >
                            {/* Text message */}
                            {msg.message_type === "text" && msg.message && (
                              <div
                                className={`px-[12px] py-[8px] text-[14px] leading-[20px] break-words ${
                                  isMe
                                    ? "bg-[#1572FF] text-white rounded-[18px] rounded-br-[4px]"
                                    : "bg-[#F0F0F0] text-[#212222] rounded-[18px] rounded-bl-[4px]"
                                }`}
                              >
                                {String(msg.message)}
                              </div>
                            )}

                            {/* Image message */}
                            {isImageType(msg) && msg.file_url && (
                              <div className="relative group">
                                <div
                                  className={`rounded-[12px] overflow-hidden ${
                                    isMe
                                      ? "rounded-br-[4px]"
                                      : "rounded-bl-[4px]"
                                  }`}
                                >
                                  <img
                                    src={msg.file_url}
                                    alt={msg.file_name || "image"}
                                    className="max-w-[250px] max-h-[200px] object-cover cursor-pointer"
                                    onClick={() =>
                                      window.open(msg.file_url!, "_blank")
                                    }
                                    onError={(e) => {
                                      const img = e.target as HTMLImageElement;
                                      // Thử sửa URL lặp storage/storage -> storage
                                      if (
                                        img.src.includes("/storage/storage/")
                                      ) {
                                        img.src = img.src.replace(
                                          "/storage/storage/",
                                          "/storage/",
                                        );
                                        return;
                                      }
                                      img.style.display = "none";
                                    }}
                                  />
                                </div>
                                <div
                                  onClick={() =>
                                    handleDownload(
                                      msg.file_url!,
                                      msg.file_name || "image",
                                    )
                                  }
                                  className="absolute top-[6px] right-[6px] w-[28px] h-[28px] rounded-full bg-black/50 flex justify-center items-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Download size={14} className="text-white" />
                                </div>
                              </div>
                            )}

                            {/* Video message */}
                            {isVideoType(msg) && msg.file_url && (
                              <div className="relative group">
                                <div
                                  className={`rounded-[12px] overflow-hidden ${
                                    isMe
                                      ? "rounded-br-[4px]"
                                      : "rounded-bl-[4px]"
                                  }`}
                                >
                                  <video
                                    src={msg.file_url}
                                    controls
                                    className="max-w-[300px] max-h-[220px] rounded-[12px]"
                                  />
                                </div>
                                <div
                                  onClick={() =>
                                    handleDownload(
                                      msg.file_url!,
                                      msg.file_name || "video",
                                    )
                                  }
                                  className="absolute top-[6px] right-[6px] w-[28px] h-[28px] rounded-full bg-black/50 flex justify-center items-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Download size={14} className="text-white" />
                                </div>
                              </div>
                            )}

                            {/* File message */}
                            {!isImageType(msg) &&
                              !isVideoType(msg) &&
                              msg.file_url && (
                                <div
                                  className={`px-[12px] py-[8px] flex items-center gap-[8px] rounded-[12px] ${
                                    isMe
                                      ? "bg-[#1572FF] rounded-br-[4px]"
                                      : "bg-[#F0F0F0] rounded-bl-[4px]"
                                  }`}
                                >
                                  <FileText
                                    size={18}
                                    className={
                                      isMe ? "text-white" : "text-[#1572FF]"
                                    }
                                  />
                                  <span
                                    className={`text-[13px] truncate max-w-[180px] ${
                                      isMe ? "text-white" : "text-[#212222]"
                                    }`}
                                  >
                                    {msg.file_name || "File"}
                                  </span>
                                  <div
                                    onClick={() =>
                                      handleDownload(
                                        msg.file_url!,
                                        msg.file_name || "file",
                                      )
                                    }
                                    className={`w-[26px] h-[26px] min-w-[26px] rounded-full flex justify-center items-center cursor-pointer transition-all ${
                                      isMe
                                        ? "hover:bg-white/20"
                                        : "hover:bg-[#E0E0E0]"
                                    }`}
                                  >
                                    <Download
                                      size={14}
                                      className={
                                        isMe ? "text-white" : "text-[#1572FF]"
                                      }
                                    />
                                  </div>
                                </div>
                              )}

                            <span className="text-[10px] text-[#9E9E9E] mt-[2px] px-[4px]">
                              {formatMsgTime(msg.created_at)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Preview pending files */}
                {pendingFiles.length > 0 && (
                  <div className="px-[12px] py-[8px] border-t-[1px] border-[#E6E6E6] flex gap-[8px] overflow-x-auto hidden-scroll">
                    {pendingFiles.map((p, idx) => (
                      <div
                        key={idx}
                        className="relative min-w-[80px] h-[80px] rounded-[8px] overflow-hidden bg-[#F5F5F5] flex justify-center items-center"
                      >
                        {p.isImage && p.previewUrl ? (
                          <img
                            src={p.previewUrl}
                            alt=""
                            className="w-[80px] h-[80px] object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-[4px] px-[6px]">
                            <FileText size={24} className="text-[#1572FF]" />
                            <span className="text-[10px] text-[#212222] truncate max-w-[68px] text-center">
                              {p.file.name}
                            </span>
                          </div>
                        )}
                        <div
                          onClick={() => removePendingFile(idx)}
                          className="absolute top-[2px] right-[2px] w-[20px] h-[20px] rounded-full bg-black/60 flex justify-center items-center cursor-pointer"
                        >
                          <X size={12} className="text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input area */}
                <div className="min-h-[56px] px-[12px] py-[8px] border-t-[1px] border-[#E6E6E6] flex items-center gap-[8px]">
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="w-[36px] h-[36px] min-w-[36px] rounded-full flex justify-center items-center cursor-pointer hover:bg-[#F5F5F5] transition-all text-[#1572FF]"
                  >
                    <ImagePlus size={20} />
                  </div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onClick={(e) => {
                      (e.target as HTMLInputElement).value = "";
                    }}
                    onChange={handleImageSelect}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-[36px] h-[36px] min-w-[36px] rounded-full flex justify-center items-center cursor-pointer hover:bg-[#F5F5F5] transition-all text-[#1572FF]"
                  >
                    <Paperclip size={20} />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onClick={(e) => {
                      (e.target as HTMLInputElement).value = "";
                    }}
                    onChange={handleFileSelect}
                  />
                  <Input.TextArea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Aa"
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    className="flex-1 rounded-[20px] bg-[#F5F5F5] text-[14px] border-none resize-none"
                    style={{ padding: "8px 16px" }}
                    disabled={sending}
                  />
                  <div
                    onClick={handleSendMessage}
                    className={`w-[36px] h-[36px] min-w-[36px] rounded-full flex justify-center items-center cursor-pointer transition-all ${
                      hasContent && !sending
                        ? "text-[#1572FF] hover:bg-[#e5efff]"
                        : "text-[#C8C8C8]"
                    }`}
                  >
                    <Send size={20} />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-[#9E9E9E]">
                <div className="w-[80px] h-[80px] rounded-full bg-[#F5F5F5] flex justify-center items-center mb-[16px]">
                  <Send size={32} className="text-[#C8C8C8]" />
                </div>
                <div className="text-[16px] font-medium text-[#212222]">
                  Chào mừng đến Chat
                </div>
                <div className="text-[13px] mt-[4px]">
                  Chọn một cuộc trò chuyện để bắt đầu
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatPage;
