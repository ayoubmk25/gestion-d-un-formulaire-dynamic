export const sendMessageToChatbot = async (message: string, token: string | null, imageUrl?: string) => {
    try {
        const messagesContent: any[] = [
            {
                "type": "text",
                "text": message
            }
        ];

        if (imageUrl) {
            messagesContent.push({
                "type": "image_url",
                "image_url": {
                    "url": imageUrl
                }
            });
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer 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`,
                "HTTP-Referer": "https://example.com", 
                "X-Title": "My Chatbot",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.5-flash-preview-05-20",
                "messages": [
                    {
                        "role": "user",
                        "content": messagesContent
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error sending message to chatbot:', error);
        throw error;
    }
};
