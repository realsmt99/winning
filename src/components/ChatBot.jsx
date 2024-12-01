import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

function ChatBot({ isOpen, onClose }) {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I can help you with questions about our queue system. What would you like to know?'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are a helpful assistant for a queue management system. You help users with questions about how to use the system, waiting times, and general queue management. Keep responses concise and friendly."
                        },
                        ...messages,
                        userMessage
                    ],
                    max_tokens: 150
                })
            });

            const data = await response.json();
            if (data.choices && data.choices[0]) {
                setMessages(prev => [...prev, data.choices[0].message]);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again later.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="chatbot-container">
            <div className="chatbot-header">
                <h3>Queue Assistant</h3>
                <button onClick={onClose} className="close-button">×</button>
            </div>
            <div className="messages-container">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
                    >
                        {message.content}
                    </div>
                ))}
                {isLoading && (
                    <div className="message assistant-message">
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="chatbot-input-form">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your question..."
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>
                    Send
                </button>
            </form>
        </div>
    );
}

ChatBot.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ChatBot; 