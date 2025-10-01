import React from 'react';

interface MessageProps {
    text: string;
    sender: 'user' | 'bot';
    imageUrl?: string; // Add optional imageUrl prop
}

const Message: React.FC<MessageProps> = ({ text, sender, imageUrl }) => {
    return (
<div style={{ alignSelf: sender === 'user' ? 'flex-end' : 'flex-start', margin: '5px', padding: '10px', borderRadius: '5px', backgroundColor: sender === 'user' ? 'blue' : '#f1f1f1', color: sender === 'user' ? 'white' : 'black' }}>
            <strong>{sender}:</strong> {text}
            {imageUrl && (
                <div style={{ marginTop: '5px' }}>
                    <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }} />
                </div>
            )}
        </div>
    );
};

export default Message;
