import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, User, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n.jsx';
import { getMessagingUsers, getConversation, sendMessage, markConversationRead } from '@/lib/apiClient';
import { getSocket } from '@/lib/socket';

const MessagingSystem = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    getMessagingUsers()
      .then(setUsers)
      .catch(() => toast({ title: 'Failed to load users', variant: 'destructive' }))
      .finally(() => setLoading(false));

    // Admin joins global room to get notified of new user messages
    const socket = getSocket();
    socket.emit('join_admin');
    socket.on('user_message', ({ userId, message }) => {
      setUsers(prev => prev.map(u =>
        u.id === userId
          ? { ...u, last_message: message.content, last_message_at: message.created_at, unread_count: (parseInt(u.unread_count || 0) + 1).toString() }
          : u
      ));
      // If this conversation is open, append the message
      setSelectedUser(sel => {
        if (sel?.id === userId) {
          setMessages(msgs => msgs.find(m => m.id === message.id) ? msgs : [...msgs, message]);
        }
        return sel;
      });
    });

    return () => { socket.off('user_message'); };
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    getConversation(selectedUser.id)
      .then(setMessages)
      .catch(() => toast({ title: 'Failed to load messages', variant: 'destructive' }));

    // Join the conversation room for real-time
    const socket = getSocket();
    socket.emit('join_conversation', selectedUser.id);

    socket.on('message', (msg) => {
      setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
    });

    // Mark user replies as read
    markConversationRead(selectedUser.id).catch(() => {});
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, unread_count: '0' } : u));

    return () => {
      socket.off('message');
      socket.emit('leave_conversation', selectedUser.id);
    };
  }, [selectedUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredUsers = users.filter(u =>
    (u.instagram || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const msg = await sendMessage(selectedUser.id, newMessage.trim());
      setMessages(prev => [...prev, msg]);
      setNewMessage('');

      // Update last message preview in sidebar
      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id
          ? { ...u, last_message: msg.content, last_message_at: msg.created_at }
          : u
      ));
    } catch (err) {
      toast({ title: err.message, variant: 'destructive' });
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="text-center py-12 luxury-text-accent">Loading...</div>;

  return (
    <div className="luxury-card h-[600px] flex overflow-hidden">

      {/* Sidebar — Users List */}
      <div className="w-1/3 border-r border-[#D4AF37]/30 flex flex-col bg-[rgba(15,0,26,0.95)]">
        <div className="p-4 border-b border-[#D4AF37]/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
            <input
              type="text"
              placeholder={t('msg.search_ph')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="luxury-input pl-9 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <p className="text-center text-muted-foreground p-4 text-sm">{t('msg.no_users')}</p>
          ) : (
            filteredUsers.map(user => {
              const isSelected = selectedUser?.id === user.id;
              return (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-4 border-b border-[#D4AF37]/10 cursor-pointer transition-colors ${isSelected ? 'bg-[rgba(212,175,55,0.15)] border-l-2 border-l-[#D4AF37]' : 'hover:bg-[rgba(212,175,55,0.05)]'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-[#FFFDD0] text-sm truncate">@{user.instagram || 'unknown'}</span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {parseInt(user.unread_count) > 0 && (
                        <span className="bg-[#D4AF37] text-[#0f001a] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {user.unread_count}
                        </span>
                      )}
                      {user.last_message_at && (
                        <span className="text-[10px] luxury-text-accent whitespace-nowrap">{formatTime(user.last_message_at)}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground truncate block">{user.name || 'User'}</span>
                  {user.last_message && (
                    <p className="text-xs text-muted-foreground truncate mt-1">{user.last_message}</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0f001a]/50 relative">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-[#D4AF37]/30 bg-[rgba(15,0,26,0.95)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(212,175,55,0.2)] flex items-center justify-center">
                <User className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="font-bold text-[#FFFDD0]">@{selectedUser.instagram}</h3>
                <p className="text-xs text-muted-foreground">{selectedUser.name}</p>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2 opacity-50">
                  <MessageSquare className="w-12 h-12" />
                  <p>{t('msg.no_msgs')}</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isAdmin = !!msg.from_admin_id; // admin sent = show on right
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl p-3 ${
                        isAdmin
                          ? 'bg-[#2D1B4E] border border-[#D4AF37]/50 text-[#FFFDD0] rounded-tr-none shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                          : 'bg-[rgba(212,175,55,0.12)] border border-[#D4AF37]/20 text-[#FFFDD0] rounded-tl-none'
                      }`}>
                        {!isAdmin && <p className="text-[10px] text-[#D4AF37]/70 mb-1 font-medium uppercase tracking-wider">Member</p>}
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-[10px] mt-1 text-right ${isAdmin ? 'text-[#D4AF37]/70' : 'text-muted-foreground'}`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-[rgba(15,0,26,0.95)] border-t border-[#D4AF37]/30">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('msg.type')}
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
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
            <MessageSquare className="w-16 h-16 mb-4 text-[#D4AF37]" />
            <p className="text-lg">{t('msg.select_user')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingSystem;
