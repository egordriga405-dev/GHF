// Export functionality
class ExportManager {
    constructor() {
        this.appData = null;
        this.botToken = null;
        // API эндпоинт Vercel
        this.apiEndpoint = '/api/send-to-telegram';
    }

    setData(data) {
        this.appData = data;
    }

    setBotToken(token) {
        this.botToken = token;
        localStorage.setItem('exam_bot_token', token);
    }

    getBotToken() {
        if (this.botToken) return this.botToken;
        
        const saved = localStorage.getItem('exam_bot_token');
        if (saved) {
            this.botToken = saved;
            return saved;
        }
        
        return null;
    }

    // Generate standalone HTML file content
    generateHTML() {
        if (!this.appData || !this.appData.topics) {
            throw new Error('No data to export');
        }

        const dataStr = JSON.stringify(this.appData.topics);

        return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Тренажёр для подготовки к экзаменам</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: #f0f2f5; 
            padding: 16px; 
            max-width: 600px; 
            margin: 0 auto; 
            color: #1a1a1a;
            line-height: 1.5;
            min-height: 100vh;
        }
        .header { 
            background: white; 
            padding: 20px; 
            border-radius: 20px; 
            margin-bottom: 16px; 
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            text-align: center;
        }
        .title { 
            font-size: 1.8rem; 
            font-weight: 800; 
            background: linear-gradient(135deg, #007aff, #0056b3);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 8px;
        }
        .subtitle { color: #666; font-size: 0.9rem; }
        .topics-scroll { 
            display: flex; gap: 8px; overflow-x: auto; padding: 8px 0; margin-bottom: 16px;
            -webkit-overflow-scrolling: touch; scrollbar-width: none;
        }
        .topics-scroll::-webkit-scrollbar { display: none; }
        .topic-chip { 
            background: white; padding: 10px 20px; border-radius: 25px; 
            font-weight: 600; white-space: nowrap; cursor: pointer;
            border: 2px solid transparent; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: all 0.2s;
        }
        .topic-chip.active { background: #007aff; color: white; border-color: #007aff; }
        .question-card { 
            background: white; border-radius: 16px; padding: 16px; margin-bottom: 12px; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.1);
        }
        .question-text { font-weight: 600; font-size: 1.05rem; margin-bottom: 8px; }
        .answer-container { 
            background: #f0f0f0; border-radius: 12px; padding: 0; 
            max-height: 0; overflow: hidden; transition: all 0.3s; opacity: 0;
        }
        .answer-container.expanded { 
            padding: 12px; max-height: 500px; opacity: 1; margin-top: 8px;
        }
        .answer-text { font-size: 0.95rem; line-height: 1.5; }
        .btn { 
            padding: 8px 16px; border: none; border-radius: 10px; 
            font-weight: 600; cursor: pointer; background: #e8e8ed; color: #333;
            margin-top: 8px; font-size: 0.9rem; transition: all 0.2s;
        }
        .btn:active { transform: scale(0.96); }
        .toolbar { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .toolbar .btn { flex: 1; min-width: calc(50% - 4px); text-align: center; }
        .empty-state { text-align: center; padding: 40px; color: #999; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">📚 Тренажёр для экзаменов</div>
        <div class="subtitle">Создано с помощью Exam Constructor</div>
    </div>
    <div class="topics-scroll" id="topicsContainer"></div>
    <div id="questionsContainer"></div>
    <div class="toolbar">
        <button class="btn" onclick="hideAllAnswers()">🙈 Скрыть все ответы</button>
        <button class="btn" onclick="randomQuestion()">🎲 Случайный вопрос</button>
    </div>
    <script>
        const examData = ${dataStr};
        let currentTopicId = examData.length > 0 ? examData[0].id : null;
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        function renderTopics() {
            const container = document.getElementById('topicsContainer');
            if (!container) return;
            container.innerHTML = examData.map(topic => {
                return '<div class="topic-chip' + (topic.id === currentTopicId ? ' active' : '') + 
                       '" onclick="switchTopic(\\'' + topic.id + '\\')">' + escapeHtml(topic.name) + '</div>';
            }).join('');
        }
        function switchTopic(id) { currentTopicId = id; renderAll(); }
        function renderQuestions() {
            const topic = examData.find(t => t.id === currentTopicId);
            const container = document.getElementById('questionsContainer');
            if (!container) return;
            if (!topic || !topic.questions || topic.questions.length === 0) {
                container.innerHTML = '<div class="empty-state">Нет вопросов в этой теме</div>';
                return;
            }
            container.innerHTML = topic.questions.map((q, i) => {
                return '<div class="question-card">' +
                    '<div class="question-text">' + (i + 1) + '. ' + escapeHtml(q.question) + '</div>' +
                    '<div class="answer-container" id="answer-' + q.id + '">' +
                    '<div class="answer-text">' + escapeHtml(q.answer) + '</div></div>' +
                    '<button class="btn" onclick="toggleAnswer(\\'' + q.id + '\\')">👁️ Показать ответ</button></div>';
            }).join('');
        }
        function toggleAnswer(id) {
            const container = document.getElementById('answer-' + id);
            if (!container) return;
            const btn = container.parentElement.querySelector('.btn');
            if (container.classList.contains('expanded')) {
                container.classList.remove('expanded');
                if (btn) btn.textContent = '👁️ Показать ответ';
            } else {
                container.classList.add('expanded');
                if (btn) btn.textContent = '🙈 Скрыть ответ';
            }
        }
        function hideAllAnswers() {
            document.querySelectorAll('.answer-container').forEach(c => c.classList.remove('expanded'));
            document.querySelectorAll('.question-card .btn').forEach(b => b.textContent = '👁️ Показать ответ');
        }
        function randomQuestion() {
            const allQuestions = [];
            examData.forEach(topic => {
                topic.questions.forEach(q => allQuestions.push({...q, topicId: topic.id}));
            });
            if (allQuestions.length === 0) return;
            const random = allQuestions[Math.floor(Math.random() * allQuestions.length)];
            switchTopic(random.topicId);
            setTimeout(() => {
                toggleAnswer(random.id);
                const element = document.getElementById('answer-' + random.id);
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
        function renderAll() { renderTopics(); renderQuestions(); }
        renderAll();
    </script>
</body>
</html>`;
    }

    // Автоматическая отправка через бота
    async sendToTelegramAutomatically() {
        const botToken = this.getBotToken();
        
        if (!botToken) {
            await this.promptBotToken();
            return false;
        }

        const userId = telegram.getUserId();
        
        if (!userId) {
            telegram.showAlert('❌ Не удалось получить ID пользователя. Убедитесь, что вы открыли приложение через Telegram.');
            return false;
        }

        const htmlContent = this.generateHTML();
        const filename = `exam-trainer-${new Date().toISOString().slice(0, 10)}.html`;

        // Показываем уведомление о начале отправки
        ui.showNotification('📤 Отправка файла через бота...');

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    botToken: botToken,
                    userId: userId,
                    content: htmlContent,
                    filename: filename
                })
            });

            const result = await response.json();

            if (result.success) {
                telegram.showAlert('✅ Файл успешно отправлен!\n\nПроверьте чат с ботом - файл уже там! 🎉');
                ui.showNotification('✅ Файл отправлен в чат с ботом!');
                return true;
            } else {
                throw new Error(result.error || 'Ошибка отправки');
            }
        } catch (error) {
            console.error('Send error:', error);
            
            // Предлагаем альтернативу
            telegram.showConfirm(
                '❌ Не удалось отправить файл автоматически.\n\nСкачать файл вручную?',
                (confirmed) => {
                    if (confirmed) {
                        this.downloadHTML();
                    }
                }
            );
            
            return false;
        }
    }

    // Ручное скачивание (запасной вариант)
    downloadHTML() {
        try {
            const htmlContent = this.generateHTML();
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `exam-trainer-${new Date().toISOString().slice(0, 10)}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            ui.showNotification('✅ Файл скачан! Отправьте его в чат вручную.');
            return true;
        } catch (error) {
            console.error('Download error:', error);
            return false;
        }
    }

    // Запрос токена бота
    async promptBotToken() {
        return new Promise((resolve) => {
            const modal = document.getElementById('exportModal');
            if (!modal) {
                resolve(false);
                return;
            }

            modal.innerHTML = `
                <div class="export-modal-content">
                    <h3>🤖 Настройка бота</h3>
                    <p style="margin-bottom: 12px; font-size: 0.9rem; color: var(--tg-theme-hint-color, #666);">
                        Для автоматической отправки файлов введите токен бота от 
                        <a href="https://t.me/BotFather" target="_blank" style="color: #007aff;">@BotFather</a>
                    </p>
                    <input type="text" id="botTokenInput" 
                           placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                           style="width: 100%; padding: 12px; border-radius: 12px; 
                                  border: 2px solid rgba(0,0,0,0.1); margin-bottom: 12px;
                                  font-size: 0.9rem; background: var(--tg-theme-secondary-bg-color, #f8f9fa);
                                  color: var(--tg-theme-text-color, #333);">
                    <p style="font-size: 0.8rem; color: var(--tg-theme-hint-color, #999); margin-bottom: 12px;">
                        🔒 Токен сохраняется только в вашем браузере
                    </p>
                    <button class="btn btn-primary" id="saveTokenBtn" style="width: 100%;">
                        💾 Сохранить и отправить
                    </button>
                    <button class="btn btn-secondary" id="downloadInsteadBtn" 
                            style="width: 100%; margin-top: 8px;">
                        📥 Скачать файл вручную
                    </button>
                </div>
            `;
            modal.style.display = 'flex';

            const cleanup = () => {
                modal.style.display = 'none';
            };

            document.getElementById('saveTokenBtn').addEventListener('click', () => {
                const token = document.getElementById('botTokenInput').value.trim();
                if (token) {
                    this.setBotToken(token);
                    cleanup();
                    resolve(true);
                } else {
                    telegram.showAlert('Введите токен бота');
                }
            });

            document.getElementById('downloadInsteadBtn').addEventListener('click', () => {
                cleanup();
                this.downloadHTML();
                resolve(false);
            });
        });
    }
}

// Create global instance
const exportManager = new ExportManager();
