import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserInbox, replyToMessage } from '@/lib/apiClient';
import { getSocket } from '@/lib/socket';

const UserMessaging = ({ userProfile }) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    getUserInbox()
      .then(setMessages)
      .catch(() => toast({ title: 'Failed to load messages', variant: 'destructive' }))
      .finally(() => setLoading(false));

    // Join real-time room
    const socket = getSocket();
    socket.emit('join_conversation', userProfile.id);

    socket.on('message', (msg) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socket.off('message');
      socket.emit('leave_conversation', userProfile.id);
    };
  }, [userProfile.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const text = newMessage.trim();
    setNewMessage('');
    try {
      const msg = await replyToMessage(text);
      setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
    } catch (err) {
      toast({ title: err.message, variant: 'destructive' });
      setNewMessage(text);
    }
  };

  const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (iso) => new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });

  if (loading) return <div className="text-center py-12 luxury-text-accent">Loading messages...</div>;

  return (
    <div className="luxury-card flex flex-col" style={{ height: 'calc(100vh - 220px)', minHeight: '400px' }}>

      {/* Header */}
      <div className="p-4 border-b border-[#D4AF37]/30 flex items-center gap-3">
        <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
        <div>
          <h3 className="font-bold text-[#FFFDD0]">Messages</h3>
          <p className="text-xs text-muted-foreground">Your conversation with Mucho Gusto Xo</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2">
            <MessageSquare className="w-12 h-12 text-[#D4AF37]" />
            <p>No messages yet.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isFromUser = !!msg.from_user_id;
            const showDate = idx === 0 ||
              formatDate(messages[idx - 1].created_at) !== formatDate(msg.created_at);

            return (
              <React.Fragment key={msg.id}>
                {showDate && (
                  <div className="text-center">
                    <span className="text-[10px] text-muted-foreground bg-[rgba(15,0,26,0.8)] px-3 py-1 rounded-full">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isFromUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isFromUser
                      ? 'bg-[#D4AF37] text-[#0f001a] rounded-br-none'
                      : 'bg-[#2D1B4E] border border-[#D4AF37]/30 text-[#FFFDD0] rounded-bl-none'
                  }`}>
                    {!isFromUser && msg.admin_name && (
                      <p className="text-[10px] text-[#D4AF37]/70 mb-1 font-medium uppercase tracking-wider">
                        {msg.admin_name}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className={`text-[10px] mt-1 text-right ${isFromUser ? 'text-[#0f001a]/60' : 'text-muted-foreground'}`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#D4AF37]/30 bg-[rgba(15,0,26,0.95)]">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="luxury-input flex-1 bg-[rgba(0,0,0,0.2)]"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="luxury-button px-4 flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserMessaging;
