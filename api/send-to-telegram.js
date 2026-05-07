// Vercel Serverless Function - токен бота на сервере
export default async function handler(req, res) {
    // CORS заголовки
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        // Токен бота берется из переменных окружения Vercel
        const BOT_TOKEN = process.env.BOT_TOKEN;
        
        if (!BOT_TOKEN) {
            console.error('❌ BOT_TOKEN not set in environment variables');
            return res.status(500).json({ 
                success: false, 
                error: 'Bot token not configured on server' 
            });
        }

        const { userId, content, filename } = req.body;

        if (!userId || !content) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields' 
            });
        }

        console.log(`📤 Sending file to user ${userId}...`);

        // Создаем FormData
        const FormData = require('form-data');
        const form = new FormData();
        
        form.append('chat_id', userId);
        form.append('document', Buffer.from(content, 'utf-8'), {
            filename: filename || 'exam-trainer.html',
            contentType: 'text/html',
        });
        form.append('caption', '📚 Ваш тренажёр для экзаменов готов!\n\n✅ Откройте файл в браузере\n🎯 Все вопросы и ответы внутри');

        // Отправка в Telegram
        const telegramResponse = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
            {
                method: 'POST',
                body: form,
                headers: form.getHeaders(),
            }
        );

        const result = await telegramResponse.json();

        if (result.ok) {
            console.log('✅ File sent successfully');
            return res.status(200).json({ 
                success: true,
                message: 'Файл отправлен в чат с ботом'
            });
        } else {
            console.error('❌ Telegram API error:', result.description);
            return res.status(400).json({ 
                success: false, 
                error: result.description || 'Telegram API error'
            });
        }
    } catch (error) {
        console.error('❌ Server error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Internal server error'
        });
    }
}
