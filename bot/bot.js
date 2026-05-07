const TelegramBot = require('node-telegram-bot-api');

// Замените на ваш токен
const token = '8554077193:AAG9mq1ri8fUR_7GomL4KOY-fI6MpC8IVVM';
const bot = new TelegramBot(token, { polling: true });

// Команда /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId, '📚 Добро пожаловать в Exam Constructor!', {
        reply_markup: {
            inline_keyboard: [[
                {
                    text: '🚀 Открыть конструктор',
                    web_app: { url: 'https://your-app-url.com' }
                }
            ]]
        }
    });
});

// Обработка WebApp данных
bot.on('message', async (msg) => {
    if (msg.web_app_data) {
        try {
            const data = JSON.parse(msg.web_app_data.data);
            
            if (data.action === 'export') {
                const htmlContent = data.content;
                const chatId = msg.chat.id;
                
                // Создаем временный файл
                const fs = require('fs');
                const path = require('path');
                const tempFile = path.join(__dirname, 'temp', `exam-${Date.now()}.html`);
                
                fs.writeFileSync(tempFile, htmlContent);
                
                // Отправляем файл
                await bot.sendDocument(chatId, tempFile, {
                    caption: '📚 Ваш тренажёр для экзаменов готов!'
                });
                
                // Удаляем временный файл
                fs.unlinkSync(tempFile);
            }
        } catch (error) {
            console.error('WebApp data error:', error);
        }
    }
});

console.log('🤖 Bot is running...');
