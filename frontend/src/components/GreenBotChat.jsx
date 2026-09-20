import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  Sparkles, 
  MapPin, 
  Clock, 
  Phone, 
  ShoppingBag, 
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Package,
  Truck,
  Leaf
} from 'lucide-react';
import { sendChatMessage } from '../api';

export default function GreenBotChat({ 
  onSelectProduct, 
  onOpenTrackOrder,
  isOpen: externalIsOpen,
  onToggleOpen
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleToggle = () => {
    if (onToggleOpen) {
      onToggleOpen(!isOpen);
    } else {
      setInternalIsOpen(!isOpen);
    }
  };
  const handleClose = () => {
    if (onToggleOpen) {
      onToggleOpen(false);
    } else {
      setInternalIsOpen(false);
    }
  };
  const [conversationId, setConversationId] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ganapathi_rag_conversation_id');
      if (saved) return saved;
      const newId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      sessionStorage.setItem('ganapathi_rag_conversation_id', newId);
      return newId;
    } catch {
      return 'conv_' + Date.now();
    }
  });

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `### 🌿 Welcome to Ganapathi Gardens!

I am **GreenBot**, your AI Horticulturist connected to our **Unified Vector Database** and **Plant Catalog**.

Ask me anything about:
• **Plant recommendations** (Indoor, outdoor, flowering, fruit saplings)
• **Care instructions** (Soil requirements, sunlight, watering schedule)
• **Fertilizers & Pots** (Vermicompost, terracotta pots, planters)
• **Live prices & availability** in our Cheediga nursery
• **Delivery information** (Areas across Kakinada, shipping charges)
• **Order tracking** (e.g. *GG1001* or *GG1002*)

How can I help your garden bloom today? 🌱`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    // Append user message
    const userMsg = { id: 'usr-' + Date.now(), sender: 'user', text: query };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(query, conversationId, messages.slice(-4));
      
      const botMsg = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: res.answer || res.reply || "I couldn't find that information in our plant store data.",
        sources: res.sources || [],
        products: res.products || [],
        order: res.order || null,
        provider: res.contextSource?.provider
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev, 
        { 
          id: 'bot-err-' + Date.now(),
          sender: 'bot', 
          text: "⚠️ Sorry, I had trouble reaching our nursery database. Please try again or call Ganapathi Gardens directly at **090008 35323**." 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    const newId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    setConversationId(newId);
    try {
      sessionStorage.setItem('ganapathi_rag_conversation_id', newId);
    } catch {}
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: `### 🌿 GreenBot AI Horticulturist

Conversation cleared! How can I assist you with our plants, care guides, pricing, or nursery services today?`
      }
    ]);
  };

  const quickChips = [
    '🪴 Best indoor plants',
    '💧 How to water Snake Plant?',
    '🌹 Flowering plants & prices',
    '🪴 What soil mix is recommended?',
    '🚚 Delivery areas and charges',
    '📍 Nursery Location & Hours'
  ];

  // Helper to render basic markdown safely
  const renderFormattedText = (content) => {
    if (!content) return null;

    // Split by lines
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Heading 3: ### Title
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} style={{ margin: '8px 0 4px 0', fontSize: '1rem', fontWeight: '700', color: '#1B4332' }}>
            {line.replace('### ', '')}
          </h4>
        );
      }
      // Heading 4: #### Title
      if (line.startsWith('#### ')) {
        return (
          <h5 key={idx} style={{ margin: '6px 0 2px 0', fontSize: '0.92rem', fontWeight: '600', color: '#2D6A4F' }}>
            {line.replace('#### ', '')}
          </h5>
        );
      }
      // Bullet points
      if (line.startsWith('• ') || line.startsWith('- ')) {
        const bulletText = line.substring(2);
        return (
          <div key={idx} style={{ display: 'flex', gap: '6px', margin: '2px 0', paddingLeft: '4px' }}>
            <span style={{ color: '#2D6A4F' }}>•</span>
            <div>{formatInline(bulletText)}</div>
          </div>
        );
      }
      // Empty line
      if (line.trim() === '') {
        return <div key={idx} style={{ height: '6px' }} />;
      }
      // Normal paragraph
      return (
        <p key={idx} style={{ margin: '2px 0' }}>
          {formatInline(line)}
        </p>
      );
    });
  };

  // Helper for inline markdown: **bold**, *italic*, [link](url)
  const formatInline = (text) => {
    if (!text) return '';
    
    // Replace links: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(parseBoldItalic(text.substring(lastIndex, match.index)));
      }

      const linkText = match[1];
      const linkHref = match[2];
      const isProductAction = linkHref.includes('/product/') || linkText.toLowerCase().includes('view product');

      if (isProductAction && onSelectProduct) {
        const prodId = linkHref.split('/product/')[1] || '';
        parts.push(
          <button
            key={match.index}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onSelectProduct({ id: prodId, _id: prodId });
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: '#1B4332',
              background: '#D8F3DC',
              border: '1px solid #74C69D',
              borderRadius: '6px',
              padding: '2px 8px',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              margin: '3px 0'
            }}
          >
            🌿 {linkText} →
          </button>
        );
      } else {
        parts.push(
          <a 
            key={match.index} 
            href={linkHref} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#2D6A4F', textDecoration: 'underline', fontWeight: '600' }}
          >
            {linkText}
          </a>
        );
      }
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(parseBoldItalic(text.substring(lastIndex)));
    }

    return parts.length > 0 ? parts : parseBoldItalic(text);
  };

  const parseBoldItalic = (str) => {
    if (typeof str !== 'string') return str;
    // Replace **bold**
    const tokens = str.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return tokens.map((tok, i) => {
      if (tok.startsWith('**') && tok.endsWith('**')) {
        return <strong key={i}>{tok.slice(2, -2)}</strong>;
      }
      if (tok.startsWith('*') && tok.endsWith('*')) {
        return <em key={i}>{tok.slice(1, -1)}</em>;
      }
      return tok;
    });
  };

  return (
    <>
      {/* Floating Launcher Button ("down round icon" in bottom right corner) */}
      <div 
        id="greenbot-launcher-btn"
        className="greenbot-launcher"
        onClick={handleToggle}
        title="Chat with GreenBot AI Horticulturist"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 950,
          width: '62px',
          height: '62px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #40916C 100%)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 26px rgba(27, 67, 50, 0.42)',
          border: '2.5px solid rgba(255, 255, 255, 0.4)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          animation: isOpen ? 'none' : 'greenbotPulse 3s infinite'
        }}
      >
        {isOpen ? (
          <X size={26} />
        ) : (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={28} />
            <span 
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '12px',
                height: '12px',
                background: '#52B788',
                borderRadius: '50%',
                border: '2px solid #FFFFFF'
              }} 
            />
          </div>
        )}
      </div>

      {/* Floating RAG Chat Window */}
      {isOpen && (
        <div 
          className="greenbot-window" 
          id="greenbot-chat-window"
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: '420px',
            maxWidth: 'calc(100vw - 36px)',
            height: '620px',
            maxHeight: 'calc(100vh - 120px)',
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 24px 60px rgba(15, 45, 33, 0.35)',
            border: '1px solid rgba(45, 106, 79, 0.2)',
            zIndex: 960,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUpFade 0.25s ease-out'
          }}
        >
          {/* Header */}
          <div 
            className="greenbot-header"
            style={{
              background: 'linear-gradient(135deg, #081C15 0%, #1B4332 50%, #2D6A4F 100%)',
              color: '#FFFFFF',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="bot-avatar-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div 
                className="bot-icon-circle"
                style={{
                  width: '38px',
                  height: '38px',
                  background: 'rgba(82, 183, 136, 0.25)',
                  border: '1.5px solid rgba(82, 183, 136, 0.5)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem'
                }}
              >
                🌱
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ fontSize: '0.98rem', letterSpacing: '-0.2px' }}>GreenBot AI</strong>
                  <span style={{ fontSize: '0.68rem', background: '#40916C', padding: '1px 6px', borderRadius: '8px', color: '#D8F3DC', fontWeight: '600' }}>
                    RAG
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#B7E4C7', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#52B788', display: 'inline-block' }}></span>
                  Ganapathi Gardens • Atlas Synced
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button 
                onClick={handleClearChat}
                title="Clear conversation"
                style={{ background: 'none', border: 'none', color: '#B7E4C7', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
              >
                <RotateCcw size={16} />
              </button>
              <button 
                onClick={handleClose}
                title="Close chat"
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                id="close-greenbot-window"
              >
                <X size={19} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            className="greenbot-messages-area"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              background: '#F8FAF9'
            }}
          >
            {messages.map((m) => (
              <div 
                key={m.id} 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div 
                  className={`chat-bubble ${m.sender}`}
                  style={{
                    maxWidth: '88%',
                    padding: '12px 15px',
                    borderRadius: '16px',
                    fontSize: '0.88rem',
                    lineHeight: '1.48',
                    background: m.sender === 'user' ? '#1B4332' : '#FFFFFF',
                    color: m.sender === 'user' ? '#FFFFFF' : '#1F2937',
                    border: m.sender === 'user' ? 'none' : '1px solid #E5E7EB',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    borderBottomRightRadius: m.sender === 'user' ? '3px' : '16px',
                    borderBottomLeftRadius: m.sender === 'bot' ? '3px' : '16px'
                  }}
                >
                  {renderFormattedText(m.text)}
                </div>

                {/* Interactive Product Recommendation Cards */}
                {m.products && m.products.length > 0 && (
                  <div 
                    style={{
                      width: '100%',
                      marginTop: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ fontSize: '0.74rem', fontWeight: '700', color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      🍃 Matching Catalog Plants ({m.products.length})
                    </div>
                    {m.products.slice(0, 3).map((prod, pIdx) => (
                      <div
                        key={pIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 10px',
                          background: '#FFFFFF',
                          borderRadius: '10px',
                          border: '1px solid #D8F3DC',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                        }}
                      >
                        {prod.image ? (
                          <img 
                            src={prod.image} 
                            alt={prod.name}
                            style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px' }} 
                          />
                        ) : (
                          <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#D8F3DC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Leaf size={18} color="#2D6A4F" />
                          </div>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.84rem', fontWeight: '600', color: '#1B4332', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {prod.name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ color: '#2D6A4F' }}>₹{prod.price}</strong>
                            {prod.originalPrice > prod.price && (
                              <span style={{ textDecoration: 'line-through', fontSize: '0.68rem' }}>₹{prod.originalPrice}</span>
                            )}
                            <span style={{ color: prod.availability === 'In Stock' ? '#2D6A4F' : '#DC2626', fontSize: '0.7rem' }}>
                              • {prod.availability || 'In Stock'}
                            </span>
                          </div>
                        </div>

                        {onSelectProduct && (
                          <button
                            onClick={() => onSelectProduct(prod)}
                            style={{
                              padding: '5px 10px',
                              background: '#1B4332',
                              border: 'none',
                              borderRadius: '6px',
                              color: '#FFFFFF',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            View Product
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Verified RAG Sources Badges */}
                {m.sources && m.sources.length > 0 && (
                  <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center', maxWidth: '88%' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: '700', color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      📚 Sources:
                    </span>
                    {m.sources.slice(0, 3).map((src, sIdx) => (
                      <span
                        key={sIdx}
                        onClick={() => {
                          if (src.source === 'catalog_product' && onSelectProduct) {
                            onSelectProduct({ id: src.product_id, _id: src.product_id, name: src.product_name });
                          }
                        }}
                        style={{
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: '#E8F5E9',
                          color: '#1B4332',
                          border: '1px solid #C8E6C9',
                          fontWeight: '600',
                          cursor: src.source === 'catalog_product' ? 'pointer' : 'default',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        🌿 {src.product_name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#FFFFFF', borderRadius: '14px', width: 'fit-content', border: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span style={{ width: '7px', height: '7px', background: '#2D6A4F', borderRadius: '50%', animation: 'typingPulse 1.2s infinite ease-in-out' }}></span>
                  <span style={{ width: '7px', height: '7px', background: '#40916C', borderRadius: '50%', animation: 'typingPulse 1.2s infinite ease-in-out 0.2s' }}></span>
                  <span style={{ width: '7px', height: '7px', background: '#52B788', borderRadius: '50%', animation: 'typingPulse 1.2s infinite ease-in-out 0.4s' }}></span>
                </div>
                <span style={{ fontSize: '0.76rem', color: '#52796F', fontStyle: 'italic' }}>
                  Searching Vector DB & nursery records...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div 
            className="bot-chips-bar"
            style={{
              display: 'flex',
              gap: '6px',
              padding: '8px 12px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              background: '#FFFFFF',
              borderTop: '1px solid #EFF3F0'
            }}
          >
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                className="bot-chip-btn"
                onClick={() => handleSend(chip)}
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: '0.74rem',
                  padding: '5px 10px',
                  borderRadius: '12px',
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  color: '#166534',
                  cursor: 'pointer'
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message Input Footer */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="bot-input-footer"
            style={{
              padding: '10px 12px',
              background: '#FFFFFF',
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              id="greenbot-input"
              className="form-input"
              style={{
                flex: 1,
                padding: '9px 14px',
                fontSize: '0.86rem',
                border: '1.5px solid #D1D5DB',
                borderRadius: '10px',
                outline: 'none',
                background: '#FAFAFA'
              }}
              placeholder="Ask about plants, care, prices, order #..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              id="greenbot-send-btn"
              disabled={loading || !input.trim()}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: input.trim() ? '#1B4332' : '#9CA3AF',
                color: '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'default',
                transition: 'background 0.2s'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
