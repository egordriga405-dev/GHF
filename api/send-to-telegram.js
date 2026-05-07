// Vercel Serverless Function для отправки файлов в Telegram
export default async function handler(req, res) {
    // CORS заголовки
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Обработка preflight запроса
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Только POST запросы
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
        });
    }

    try {
        const { botToken, userId, content, filename } = req.body;

        // Проверяем наличие всех необходимых данных
        if (!botToken || !userId || !content) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields: botToken, userId, content' 
            });
        }

        console.log(`📤 Sending file to user ${userId}...`);

        // Создаем FormData для отправки файла
        const FormData = require('form-data');
        const form = new FormData();
        
        // Добавляем chat_id
        form.append('chat_id', userId);
        
        // Добавляем файл как buffer
        const buffer = Buffer.from(content, 'utf-8');
        form.append('document', buffer, {
            filename: filename || 'exam-trainer.html',
            contentType: 'text/html',
        });
        
        // Добавляем подпись
        form.append('caption', '📚 Ваш тренажёр для экзаменов готов!\n\nОткройте файл в любом браузере для начала тренировки.');

        // Отправляем запрос к Telegram API
        const telegramResponse = await fetch(
            `https://api.telegram.org/bot${botToken}/sendDocument`,
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
            error: error.message || 'Internal server error'
        });
    }
}
