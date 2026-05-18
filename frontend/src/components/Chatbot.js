import React, { useEffect, useRef, useState } from 'react';

import { aiApi, productApi } from '../services/api';
import { useStore } from '../context/StoreContext';

import './Chatbot.css';

const quickChips = [
  'Show gaming laptops',
  'Best phone under $1000',
  'Show Apple products',
  'Best camera phone',
  'Recommend gaming accessories',
];

function extractSearchQuery(message) {
  const text = String(message || '').toLowerCase();

  if (text.includes('gaming laptop')) return 'gaming laptop';
  if (text.includes('laptop')) return 'laptop';
  if (text.includes('apple') || text.includes('iphone')) return 'iphone';
  if (text.includes('phone') || text.includes('camera')) return 'smartphone';
  if (text.includes('accessories') || text.includes('headphone')) return 'headphones';
  if (text.includes('watch')) return 'watch';
  if (text.includes('monitor')) return 'monitor';
  if (text.includes('mouse')) return 'gaming mouse';

  return message;
}

function Chatbot({ floating = false }) {
  const { addToCart, showToast } = useStore();

  const [open, setOpen] = useState(!floating);
  const [message, setMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hi! I'm TechBot. I can help you search products, compare specs, track orders and choose the best item.",
    },
  ]);

  const listRef = useRef(null);
  const inputRef = useRef(null);
  const requestRef = useRef(0);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, typing, suggestedProducts]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  const addBotMessage = (text) => {
    setMessages((items) => [
      ...items,
      {
        role: 'bot',
        text,
      },
    ]);
  };

  const sendMessage = async (value = message) => {
    const clean = value.trim();

    if (!clean || typing) {
      return;
    }

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    setMessages((items) => [
      ...items,
      {
        role: 'user',
        text: clean,
      },
    ]);

    setMessage('');
    setTyping(true);

    try {
      const query = extractSearchQuery(clean);

      const searchResponse = await productApi.searchProducts({
        q: query,
        limit: 4,
        sort: 'rating',
      });

      if (requestRef.current !== requestId) {
        return;
      }

      const products = (searchResponse?.products || []).map((product) => ({
        ...product,
        stock: Number(product.stock || 0) > 0 ? Number(product.stock) : 25,
        availability: 'In stock',
      }));

      setSuggestedProducts(products);

      const response = await aiApi.chat(clean, products);

      if (requestRef.current !== requestId) {
        return;
      }

      if (products.length > 0) {
        addBotMessage(
          response?.reply ||
            `I found ${products.length} suitable product options for "${query}". You can add one to cart or open product details from the product page.`
        );
      } else {
        addBotMessage(
          response?.reply ||
            'I can help you search products, compare specifications, track orders and choose products by budget.'
        );
      }
    } catch {
      if (requestRef.current === requestId) {
        addBotMessage('I am having trouble connecting right now, but you can still search products from the navbar.');
      }
    } finally {
      if (requestRef.current === requestId) {
        setTyping(false);
      }
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const handleChipClick = (chip) => {
    sendMessage(chip);
  };

  const clearChat = () => {
    requestRef.current += 1;
    setTyping(false);
    setMessages([
      {
        role: 'bot',
        text: 'Chat restarted. What technology product are you looking for today?',
      },
    ]);
    setSuggestedProducts([]);
    setMessage('');
  };

  if (floating && !open) {
    return (
      <button
        type="button"
        className="chatbot-launcher"
        onClick={() => setOpen(true)}
        aria-label="Open TechBot AI assistant"
      >
        <span>🤖</span>
        <strong>Ask AI</strong>
      </button>
    );
  }

  return (
    <section className={floating ? 'chatbot-widget floating open' : 'chatbot-widget'}>
      <header className="chatbot-header">
        <div className="chatbot-header-left">
          <span className="chatbot-avatar">🤖</span>
          <div className="chatbot-title-block">
            <strong>TechBot</strong>
            <small>Online AI Assistant</small>
          </div>
        </div>

        <div className="chatbot-actions">
          <button type="button" onClick={clearChat} className="chatbot-action-button">
            Clear
          </button>

          {floating && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="chatbot-close-button"
              aria-label="Close chatbot"
            >
              ×
            </button>
          )}
        </div>
      </header>

      <div className="chatbot-content">
        <div className="chatbot-messages" ref={listRef}>
          {messages.map((item, index) => (
            <div
              key={`${item.role}-${index}`}
              className={item.role === 'user' ? 'chat-message user' : 'chat-message bot'}
            >
              <span className="chat-message-avatar">{item.role === 'user' ? '👤' : '🤖'}</span>
              <p>{item.text}</p>
            </div>
          ))}

          {typing && (
            <div className="chat-message bot">
              <span className="chat-message-avatar">🤖</span>
              <p className="typing-dots">
                <i />
                <i />
                <i />
              </p>
            </div>
          )}

          {suggestedProducts.length > 0 && (
            <div className="chatbot-products">
              <strong>Recommended products</strong>

              {suggestedProducts.slice(0, 3).map((product) => (
                <article key={product.id || product.productId} className="chatbot-product-card">
                  <img
                    src={product.image || product.images?.[0]}
                    alt={product.title}
                    onError={(event) => {
                      event.currentTarget.src =
                        'https://dummyjson.com/image/120x120/eeeeee/111111?text=Tech';
                    }}
                  />

                  <div>
                    <span>{product.title}</span>
                    <small>
                      ${Number(product.price || 0).toLocaleString('en-US')} · In stock
                    </small>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      addToCart(product, 1);
                      showToast(`${product.title} added from TechBot`, 'success');
                    }}
                  >
                    Add
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="chatbot-chips">
          {quickChips.map((chip) => (
            <button key={chip} type="button" onClick={() => handleChipClick(chip)}>
              {chip}
            </button>
          ))}
        </div>
      </div>

      <form className="chatbot-input" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          value={message}
          placeholder="Ask about laptops, phones, orders..."
          onChange={(event) => setMessage(event.target.value)}
        />
        <button type="submit" disabled={typing || !message.trim()}>
          ➤
        </button>
      </form>
    </section>
  );
}

export default Chatbot;