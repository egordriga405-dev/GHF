// Для использования с Vercel Serverless Functions
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { botToken, userId, content, filename } = req.body;

        if (!botToken || !userId || !content) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields' 
            });
        }

        // Используем fetch для отправки файла через Telegram API
        const FormData = require('form-data');
        const form = new FormData();
        
        // Создаем Blob из контента
        const buffer = Buffer.from(content, 'utf-8');
        
        form.append('chat_id', userId);
        form.append('document', buffer, {
            filename: filename || 'exam-trainer.html',
            contentType: 'text/html'
        });
        form.append('caption', '📚 Ваш тренажёр для экзаменов готов! Откройте файл в браузере.');

        const response = await fetch(
            `https://api.telegram.org/bot${botToken}/sendDocument`,
            {
                method: 'POST',
                body: form,
                headers: form.getHeaders()
            }
        );

        const result = await response.json();

        if (result.ok) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(400).json({ 
                success: false, 
                error: result.description || 'Telegram API error' 
            });
        }
    } catch (error) {
        console.error('Send file error:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}
