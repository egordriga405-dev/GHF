// Telegram WebApp Integration
class TelegramIntegration {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.initialized = false;
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

            this.initialized = true;
            console.log('✅ Telegram WebApp initialized');
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

    getUserId() {
        return this.tg?.initDataUnsafe?.user?.id || null;
    }

    getUserName() {
        const user = this.tg?.initDataUnsafe?.user;
        return user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'User';
    }

    isAvailable() {
        return !!this.tg;
    }
}

// Create global instance
const telegram = new TelegramIntegration();
