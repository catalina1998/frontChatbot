import React, { useState, useEffect, useRef } from 'react';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Message from './Message';


const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [faqQuestions, setFaqQuestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingDots, setTypingDots] = useState('');
  const [isAtStart, setIsAtStart] = useState(true);
  const [currentCategory, setCurrentCategory] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const messagesEndRef = useRef(null);
  const typingIntervalRef = useRef(null);

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  useEffect(() => {
    fetchInitialGreeting();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const fetchInitialGreeting = () => {
    fetch('http://localhost:8080/chat/start')
      .then(response => response.text())
      .then(data => {
        setMessages([{ text: data, sender: 'bot' }]);
        setShowOptions(true);
        setFaqQuestions([]);
        setIsAtStart(true);
      })
      .catch(error => console.error('Error fetching initial message:', error));
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const startTypingAnimation = () => {
    typingIntervalRef.current = setInterval(() => {
      setTypingDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 300);
  };

  const stopTypingAnimation = () => {
    clearInterval(typingIntervalRef.current);
    setTypingDots('');
  };

  const handleSend = (msg) => {
    const userMessage = msg || input;
    if (!userMessage.trim()) return;

    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setIsAtStart(false);
    setShowOptions(false);
    setFaqQuestions([]);
    setInput('');
    setIsTyping(true);
    startTypingAnimation();

    const normalizedMessage = normalizeText(userMessage);

    if (['1', '2', '3', 'admision', 'carreras', 'academico'].includes(normalizedMessage)) {
      let category = '';
      if (userMessage === '1' || normalizedMessage === 'admision') category = 'Admisión';
      else if (userMessage === '2' || normalizedMessage === 'carreras') category = 'Carreras';
      else if (userMessage === '3' || normalizedMessage === 'academico') category = 'Académico';

      fetch(`http://localhost:8080/chat/category/${encodeURIComponent(category)}`, { method: 'POST' })
        .then(response => response.text())
        .then(data => {
          const questions = data.match(/\u00bf[^?]+\?/g) || [];
          setCurrentCategory(category);
          setTimeout(() => {
            setFaqQuestions(questions);
            setIsTyping(false);
            stopTypingAnimation();
          }, 1000);
        })
        .catch(error => {
          console.error('Error fetching category:', error);
          setIsTyping(false);
          stopTypingAnimation();
        });
    } else if (userMessage.toLowerCase() === 'inicio' || userMessage.toLowerCase() === 'volver') {
      setTimeout(() => {
        fetchInitialGreeting();
        setIsTyping(false);
        stopTypingAnimation();
      }, 600);
    } else {
      fetch('http://localhost:8080/chat/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      })
        .then(response => response.text())
        .then(data => {
          setTimeout(() => {
            setMessages(prev => [...prev, { text: data, sender: 'bot' }]);
            setIsTyping(false);
            stopTypingAnimation();
          }, 1000);
        })
        .catch(error => {
          console.error('Error fetching response:', error);
          setIsTyping(false);
          stopTypingAnimation();
        });
    }
  };

  const messageStyle = (sender) => ({
    textAlign: sender === 'user' ? 'right' : 'left',
    margin: '10px 0'
  });

  const bubbleStyle = (sender) => ({
    display: 'inline-block',
    padding: '10px',
    borderRadius: '10px',
    background: sender === 'user' ? '#daf8cb' : '#eee',
    maxWidth: '80%',
    textAlign: 'left'
  });

  const optionButtonStyle = {
    backgroundColor: '#f0f0f0',
    color: '#333333',
    border: '1px solid #ccc',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'normal',
    width: 'fit-content',
    textAlign: 'left',
    marginBottom: '8px'
  };

  return (
    <div style={{
      width: 400,
      position: 'fixed',
      bottom: 20,
      right: 20,
      border: '1px solid #ccc',
      borderRadius: 10,
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      backgroundColor: '#fff',
      zIndex: 999
    }}>
      {/* Encabezado */}
      <div style={{
        backgroundColor: '#3f51b5',
        color: 'white',
        padding: '10px 15px',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logorobot.png" alt="Bot" style={{ width: 40, height: 40 }} />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Facultad Politécnica</div>
            <div style={{ fontSize: '12px', color: '#bbffbb' }}>🟢 En línea</div>
          </div>
        </div>

        {/* Botón minimizar/maximizar */}
        <div
          title={isMinimized ? "Expandir chat" : "Minimizar chat"}
          style={{ cursor: 'pointer', backgroundColor: 'transparent', border: 'none' }}
          onClick={() => setIsMinimized(!isMinimized)}
        >
          {isMinimized ? <AddIcon style={{ color: 'white' }} /> : <RemoveIcon style={{ color: 'white' }} />}
        </div>
      </div>

      {/* Botón para abrir el chat */}
      {!isOpen && (
        <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f1f5fb', cursor: 'pointer' }} onClick={() => {
          setIsOpen(true);
          fetchInitialGreeting();
        }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: '#ffffff',
            padding: '10px 20px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            color: '#3f51b5',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
          }}>
            CHATEA CON NOSOTROS <span style={{ color: 'limegreen' }}>•</span>
          </div>
        </div>
      )}

      {/* Cuerpo del chat */}
      {isOpen && !isMinimized && (
        <>
          <div style={{
            height: 400,
            padding: 10,
            overflowY: 'scroll',
            background: '#f9f9f9'
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={messageStyle(msg.sender)}>
                <div style={{
                  ...bubbleStyle(msg.sender),
                  whiteSpace: 'pre-line'
                }}>
                  {
                    msg.text.includes('•')
                      ? msg.text.split('•').map((line, idx) => {
                          const trimmed = line.trim();
                          if (!trimmed) return null; // evitar líneas vacías
                          return (
                            <div key={idx}>
                              {trimmed.startsWith('La Facultad') || trimmed.startsWith('*') || trimmed.endsWith(':')
                                ? trimmed // sin viñeta si es encabezado o nota
                                : `• ${trimmed}`
                              }
                            </div>
                          );
                        })
                      : msg.text
                  }
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={messageStyle('bot')}>
                <div style={bubbleStyle('bot')}>Escribiendo{typingDots}</div>
              </div>
            )}

            {showOptions && (
              <div style={{ marginTop: 10, textAlign: 'left' }}>
                <button style={optionButtonStyle} onClick={() => handleSend('Admisión')}>1️⃣ Admisión</button><br />
                <button style={optionButtonStyle} onClick={() => handleSend('Carreras')}>2️⃣ Carreras</button><br />
                <button style={optionButtonStyle} onClick={() => handleSend('Académico')}>3️⃣ Académico</button><br />
              </div>
            )}

            {faqQuestions.length > 0 && (
              <div style={{ marginTop: 10, textAlign: 'left' }}>
                <div style={messageStyle('bot')}>
                  <div style={bubbleStyle('bot')}>
                    Oh, elegiste {currentCategory.toLowerCase()}, algunas preguntas frecuentes suelen ser:
                  </div>
                </div>

                {faqQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    style={optionButtonStyle}
                    onClick={() => handleSend(question)}
                  >
                    {question}
                  </button>
                ))}

                <div style={messageStyle('bot')}>
                  <div style={bubbleStyle('bot')}>
                    Selecciona o formula tu propia duda 👀
                  </div>
                </div>
              </div>
            )}

            {!isAtStart && (
              <div style={{
                marginTop: 15,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 10px'
              }}>
                <button
                  style={{ ...optionButtonStyle, backgroundColor: '#d7eaff' }}
                  onClick={() => handleSend('inicio')}
                >
                  🔙 Volver al Inicio
                </button>
                <button
                  style={{ ...optionButtonStyle, backgroundColor: '#d7eaff' }}
                  onClick={() => {
                    setIsOpen(false);
                    setMessages([]);
                    setInput('');
                    setFaqQuestions([]);
                    setShowOptions(false);
                    setIsAtStart(true);
                    setCurrentCategory('');
                    setIsTyping(false);
                    setTypingDots('');
                  }}
                >
                  ❌ Salir
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div style={{ marginTop: 10, display: 'flex', padding: '10px' }}>
            <input
              style={{ flex: 1, padding: 10 }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe un mensaje..."
            />
            <button onClick={() => handleSend()} style={{ padding: '10px 15px' }}>
              Enviar
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;
