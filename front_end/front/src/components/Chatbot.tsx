import React, { useState, useRef } from 'react';
import Message from './Message'; // Import the Message component
import { sendMessageToChatbot } from '../services/chatbotService'; // Import the new service

const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [showChatbot, setShowChatbot] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for scrolling to bottom

    // Scroll to the bottom of the chat messages
    React.useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (input.trim() || imageUrl) {
            const userMessage = { text: input, sender: 'user', imageUrl: imageUrl };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            setInput('');
            setImageUrl(null);
            if (imageInputRef.current) {
                imageInputRef.current.value = ''; // Clear the file input
            }

            setIsTyping(true); // Set typing indicator to true

            try {
                // Send message to OpenRouter API
                const response = await sendMessageToChatbot(input, null, imageUrl); // Pass null for token, as it's not used by OpenRouter directly
                const botMessage = { text: response.choices[0].message.content, sender: 'bot' };
                setMessages((prevMessages) => [...prevMessages, botMessage]);
            } catch (error) {
                console.error('Error sending message:', error);
                const errorMessage = { text: 'Error: Could not get a response from the chatbot.', sender: 'bot' };
                setMessages((prevMessages) => [...prevMessages, errorMessage]);
            } finally {
                setIsTyping(false); // Set typing indicator to false
            }
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClearImage = () => {
        setImageUrl(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };

    return (
        <>
            {!showChatbot && (
                <button
                    onClick={() => setShowChatbot(true)}
                    style={{
                        position: 'fixed',
                        bottom: '35px',
                        right: '35px',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: 'blue',
                        color: 'white',
                        border: 'none',
                        fontSize: '16px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                    }}
                >
                   chat bot
                </button>
            )}

            {showChatbot && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '350px',
                    height: '500px',
                    backgroundColor: 'white',
                    border: '1px solid blue',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 1000,
                }}>
                    <div style={{
                        padding: '10px',
                        backgroundColor: 'blue',
                        color: '#fff',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <h3 style={{ margin: 0 }}>Chatbot</h3>
                        <button
                            onClick={() => setShowChatbot(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                fontSize: '20px',
                                cursor: 'pointer',
                            }}
                        >
                            &times;
                        </button>
                    </div>
                    <div style={{ flexGrow: 1, overflowY: 'auto', padding: '10px', backgroundColor: 'white' }}>
                        {messages.map((msg, index) => (
                            <Message key={index} text={msg.text} sender={msg.sender} imageUrl={msg.imageUrl}  />
                        ))}
                        {isTyping && (
                            <div style={{ alignSelf: 'flex-start', margin: '5px', padding: '10px', borderRadius: '5px', backgroundColor: 'blue', color: 'white' }}>
                                <em>Bot is typing...</em>
                            </div>
                        )}
                        <div ref={messagesEndRef} /> {/* For auto-scrolling */}
                    </div>
                    {imageUrl && (
                        <div style={{ padding: '10px', textAlign: 'center', borderTop: '1px solid #eee' }}>
                            <img src={imageUrl} alt="Selected" style={{ maxWidth: '80px', maxHeight: '80px', border: '1px solid #ddd', borderRadius: '4px', marginRight: '10px' }} />
                            <button onClick={handleClearImage} style={{ padding: '5px 10px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Clear</button>
                        </div>
                    )}
                    <div style={{ display: 'flex', padding: '10px', borderTop: '1px solid #eee', gap: '5px' }}>
                        <input
                            type="file"
                            accept="image/*"
                            ref={imageInputRef}
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                        />
                        <button onClick={() => imageInputRef.current?.click()} style={{ padding: '8px 12px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2zm1 9v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12Zm5-6.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0"/>
                            </svg>
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Type your message..."
                            style={{ flexGrow: 1, padding: '8px', border: '1px solid blue', borderRadius: '4px', color: 'black' }}
                        />
                        <button onClick={handleSendMessage} style={{ padding: '8px 12px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.5.5 0 0 1-.923.04L.002 12.103a.5.5 0 0 1 .01-.934L15.314.116a.5.5 0 0 1 .54.03Z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
