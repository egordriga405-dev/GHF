// Telegram WebApp Integration
class TelegramIntegration {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.initialized = false;
        this.botToken = null; // Будет запрашиваться у пользователя
    }

    init() {
        if (!this.tg) {
            console.warn('Telegram WebApp API not available');
            return false;
        }

        try {
            this.tg.ready();
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            
            // Apply Telegram theme
            this.applyTelegramTheme();
            
            // Listen for theme changes
            this.tg.onEvent('themeChanged', () => {
                this.applyTelegramTheme();
            });

            // Получаем initData для отправки на сервер
            this.initData = this.tg.initData || '';
            this.initDataUnsafe = this.tg.initDataUnsafe || {};

            this.initialized = true;
            console.log('✅ Telegram WebApp initialized');
            console.log('User ID:', this.getUserId());
            return true;
        } catch (error) {
            console.error('Telegram initialization error:', error);
            return false;
        }
    }

    applyTelegramTheme() {
        if (!this.tg) return;

        const root = document.documentElement;
        root.style.setProperty('--tg-theme-bg-color', this.tg.backgroundColor || '#f0f2f5');
        root.style.setProperty('--tg-theme-text-color', this.tg.textColor || '#1a1a1a');
        root.style.setProperty('--tg-theme-hint-color', this.tg.hintColor || '#999999');
        root.style.setProperty('--tg-theme-button-color', this.tg.buttonColor || '#007aff');
        root.style.setProperty('--tg-theme-button-text-color', this.tg.buttonTextColor || '#ffffff');
        root.style.setProperty('--tg-theme-secondary-bg-color', this.tg.secondaryBackgroundColor || '#e8e8ed');
    }

    showAlert(message) {
        if (this.tg) {
            this.tg.showAlert(message);
        } else {
            alert(message);
        }
    }

    showConfirm(message, callback) {
        if (this.tg) {
            this.tg.showConfirm(message, callback);
        } else {
            const result = confirm(message);
            if (callback) callback(result);
        }
    }

    showPopup(title, message, buttons, callback) {
        if (this.tg) {
            this.tg.showPopup({
                title: title,
                message: message,
                buttons: buttons
            }, callback);
        }
    }

    getUserId() {
        return this.tg?.initDataUnsafe?.user?.id || null;
    }

    getChatId() {
        // В Mini App chat_id может быть недоступен напрямую
        // Но мы можем получить user_id
        return this.getUserId();
    }

    getUserName() {
        const user = this.tg?.initDataUnsafe?.user;
        return user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'User';
    }

    isAvailable() {
        return !!this.tg;
    }

    // Отправка данных на сервер
    async sendToServer(url, data) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    initData: this.initData,
                    userId: this.getUserId()
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Send to server error:', error);
            return { success: false, error: error.message };
        }
    }

    // Скачивание файла через Telegram
    downloadFile(content, filename) {
        // Создаем blob и скачиваем
        const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        // Используем Telegram API для открытия ссылки
        if (this.tg) {
            // Показываем инструкцию
            this.showPopup(
                '📥 Скачивание файла',
                'Нажмите кнопку ниже, чтобы скачать файл. Затем отправьте его в чат вручную.',
                [
                    { type: 'cancel', text: 'Отмена' },
                    { type: 'ok', text: 'Скачать' }
                ],
                (buttonId) => {
                    if (buttonId === 'ok') {
                        // Открываем ссылку на скачивание
                        this.tg.openLink(url);
                    }
                }
            );
        } else {
            // Обычное скачивание для браузера
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }
}

// Create global instance
const telegram = new TelegramIntegration();
