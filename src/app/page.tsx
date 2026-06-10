'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Heart,
  Send,
  Settings,
  Sparkles,
  Trash2,
  Bot,
  User,
  Loader2,
  MessageCircleHeart,
  X,
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const LOVE_SYSTEM_PROMPT = `Bạn là "Tình Yêu AI" — một chuyên gia tình yêu ấm áp, thấu hiểu và hài hước. 

Vai trò của bạn:
- Tư vấn tình yêu, mối quan hệ, hôn nhân
- Lắng nghe và thấu hiểu tâm sự tình cảm
- Đưa ra lời khuyên thiết thực nhưng nhẹ nhàng
- Luôn tích cực, khích lệ và đầy yêu thương

Phong cách trả lời:
- Dùng ngôn ngữ gần gũi, ấm áp như một người bạn thân
- Thỉnh thoảng dùng emoji phù hợp (💕💝😍🥰)
- Có thể dùng thơ, ca dao tục ngữ Việt Nam về tình yêu khi phù hợp
- Trả lời ngắn gọn, súc tích, đi thẳng vào vấn đề
- Nếu câu hỏi không liên quan đến tình yêu, hãy khéo léo hướng về chủ đề tình yêu một cách hài hước

Quy tắc:
- KHÔNG bao giờ đưa ra lời khuyên độc hại, thao túng hay xúc phạm
- KHÔNG viết quá dài - tối đa 3-4 đoạn ngắn
- LUÔN tôn trọng mọi giới tính và xu hướng tình yêu
- Nếu vấn đề nghiêm trọng (bạo hành, trầm cảm), khuyên tìm chuyên gia`;

const SUGGESTED_QUESTIONS = [
  '💕 Làm sao để tỏ tình với người mình thích?',
  '💔 Cách quên người yêu cũ?',
  '🤔 Làm sao biết người ấy có thích mình không?',
  '💑 Bí quyết giữ lửa tình yêu dài lâu?',
  '😢 Người yêu lạnh nhạt phải làm sao?',
  '🌸 Thơ tình hay dành tặng người yêu',
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('sk-104b42ce535dd60b-9ozegr-fdd0f6b6');
  const [baseUrl, setBaseUrl] = useState('http://localhost:20128');
  const [model, setModel] = useState('gpt-4o');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Build message history for API
      const apiMessages = [
        { role: 'system' as const, content: LOVE_SYSTEM_PROMPT },
        ...newMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          apiKey,
          baseUrl,
          model,
        }),
      });

      const data = await res.json();

      if (data.error) {
        const errorMessage: Message = {
          role: 'assistant',
          content: `❌ ${data.error}`,
          timestamp: new Date(),
        };
        setMessages([...newMessages, errorMessage]);
      } else {
        const assistantContent =
          data.choices?.[0]?.message?.content || 'Không nhận được phản hồi 😢';
        const assistantMessage: Message = {
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date(),
        };
        setMessages([...newMessages, assistantMessage]);
      }
    } catch {
      const errorMessage: Message = {
        role: 'assistant',
        content: '❌ Không thể kết nối đến 9Router. Vui lòng kiểm tra cài đặt! 🔧',
        timestamp: new Date(),
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 flex flex-col">
      {/* Floating hearts background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${3 + i * 0.5}s`,
              opacity: 0.06,
            }}
          >
            <Heart className="w-16 h-16 text-pink-400 fill-pink-400" />
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-pink-100 bg-white/70 backdrop-blur-md shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-200">
                <MessageCircleHeart className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
                Tình Yêu AI 💕
              </h1>
              <p className="text-xs text-muted-foreground">Chuyên gia tình yêu • Sẵn sàng lắng nghe</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                className="text-muted-foreground hover:text-rose-500"
                title="Xóa cuộc trò chuyện"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}

            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-pink-500"
                  title="Cài đặt API"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Cài đặt kết nối 9Router
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="baseUrl">Base URL (9Router)</Label>
                    <Input
                      id="baseUrl"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      placeholder="http://localhost:20128"
                    />
                    <p className="text-xs text-muted-foreground">
                      Địa chỉ server 9Router của bạn
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-xxxxx"
                    />
                    <p className="text-xs text-muted-foreground">
                      API key từ Dashboard 9Router
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model AI</Label>
                    <Input
                      id="model"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="gpt-4o"
                    />
                    <p className="text-xs text-muted-foreground">
                      Tên model (gpt-4o, claude-3.5-sonnet, gemini-pro, v.v.)
                    </p>
                  </div>
                  <Button
                    onClick={() => setSettingsOpen(false)}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                  >
                    Lưu cài đặt ✓
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="relative z-10 flex-1 overflow-hidden flex flex-col max-w-3xl w-full mx-auto">
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="py-4 space-y-4">
            {/* Welcome Screen */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mb-4 shadow-xl shadow-pink-200 animate-pulse">
                  <Heart className="w-10 h-10 text-white fill-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent mb-2">
                  Chào bạn! 💕
                </h2>
                <p className="text-muted-foreground max-w-md mb-6 leading-relaxed">
                  Tôi là <strong>Tình Yêu AI</strong> — chuyên gia tư vấn tình yêu.
                  Hãy tâm sự với tôi về chuyện tình cảm nhé!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="text-left p-3 rounded-xl bg-white/80 hover:bg-pink-50 border border-pink-100 hover:border-pink-200 transition-all duration-200 text-sm text-foreground shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="w-3 h-3" />
                  <span>Powered by 9Router API</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {model}
                  </Badge>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-md'
                      : 'bg-white border border-pink-100 text-foreground rounded-bl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1.5 ${
                      msg.role === 'user' ? 'text-pink-100' : 'text-muted-foreground'
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-sm">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-pink-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />
                    <span className="text-sm text-muted-foreground">Đang suy nghĩ...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-pink-100 bg-white/70 backdrop-blur-md p-4">
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tâm sự về tình yêu của bạn... 💕"
                disabled={isLoading}
                className="pr-4 pl-4 h-12 rounded-full border-pink-200 focus:border-pink-400 focus:ring-pink-200 bg-white shadow-sm text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-12 w-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-200 disabled:opacity-50 disabled:shadow-none"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
          <p className="text-center text-[10px] text-muted-foreground mt-2">
            Tình Yêu AI có thể đưa ra lời khuyên sai • Không thay thế chuyên gia tâm lý
          </p>
        </div>
      </main>
    </div>
  );
}
