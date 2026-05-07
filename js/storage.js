// LocalStorage Management
class StorageManager {
    constructor(storageKey = 'exam_constructor_data') {
        this.storageKey = storageKey;
        this.themeKey = 'exam_constructor_theme';
    }

    // Load app data
    loadData() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
        return null;
    }

    // Save app data
    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    // Load theme preference
    loadTheme() {
        return localStorage.getItem(this.themeKey) || 'telegram';
    }

    // Save theme preference
    saveTheme(theme) {
        try {
            localStorage.setItem(this.themeKey, theme);
            return true;
        } catch (error) {
            console.error('Error saving theme:', error);
            return false;
        }
    }

    // Load default data from JSON file
    async loadDefaultData() {
        try {
            const response = await fetch('data/default.json');
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Error loading default data:', error);
        }
        return null;
    }

    // Clear all data
    clearData() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.themeKey);
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }

    // Export data as JSON
    exportData() {
        const data = this.loadData();
        if (data) {
            return JSON.stringify(data, null, 2);
        }
        return null;
    }

    // Import data from JSON
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            return this.saveData(data);
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
}

// Create global instance
const storage = new StorageManager();
