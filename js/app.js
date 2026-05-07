// Main Application Logic
class ExamConstructorApp {
    constructor() {
        this.data = {
            topics: [],
            currentTopicId: null,
            mode: 'edit'
        };
    }

    init() {
        // Initialize Telegram
        telegram.init();

        // Load data
        this.loadData();

        // Set data for export manager
        exportManager.setData(this.data);

        // Apply saved theme
        const savedTheme = storage.loadTheme();
        ui.applyTheme(savedTheme);
        document.getElementById('themeSelector').value = savedTheme;

        // Render UI
        this.render();

        // Bind events
        this.bindEvents();

        console.log('✅ Exam Constructor App initialized');
        console.log('📊 Topics:', this.data.topics.length);
        console.log('❓ Total questions:', this.getTotalQuestions());
    }

    loadData() {
        const savedData = storage.loadData();
        
        if (savedData) {
            this.data.topics = savedData.topics || [];
            this.data.currentTopicId = savedData.currentTopicId || null;
        }

        // Create default data if empty
        if (this.data.topics.length === 0) {
            this.createDefaultData();
        }

        // Set current topic if not set
        if (!this.data.currentTopicId && this.data.topics.length > 0) {
            this.data.currentTopicId = this.data.topics[0].id;
        }
    }

    saveData() {
        storage.saveData({
            topics: this.data.topics,
            currentTopicId: this.data.currentTopicId
        });
        
        // Update export manager data
        exportManager.setData(this.data);
    }

    createDefaultData() {
        this.data.topics = [{
            id: this.generateId(),
            name: 'HTML/CSS основы',
            questions: [
                {
                    id: this.generateId(),
                    question: 'Что такое HTML?',
                    answer: 'HyperText Markup Language - язык разметки для создания веб-страниц'
                },
                {
                    id: this.generateId(),
                    question: 'Для чего нужен CSS?',
                    answer: 'Cascading Style Sheets - для стилизации и оформления веб-страниц'
                }
            ]
        }];
        this.data.currentTopicId = this.data.topics[0].id;
        this.saveData();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    getCurrentTopic() {
        return this.data.topics.find(t => t.id === this.data.currentTopicId);
    }

    getTotalQuestions() {
        return this.data.topics.reduce((sum, t) => sum + t.questions.length, 0);
    }

    render() {
        ui.renderTopics(
            this.data.topics,
            this.data.currentTopicId,
            (id) => this.selectTopic(id),
            (id) => this.deleteTopic(id)
        );

        const currentTopic = this.getCurrentTopic();
        ui.renderQuestions(
            currentTopic ? currentTopic.questions : [],
            this.data.mode,
            (id) => this.deleteQuestion(id),
            (id) => ui.toggleAnswer(id)
        );

        ui.switchMode(this.data.mode);
    }

    selectTopic(topicId) {
        this.data.currentTopicId = topicId;
        this.saveData();
        this.render();
    }

    deleteTopic(topicId) {
        if (this.data.topics.length <= 1) {
            ui.showNotification('Должна быть хотя бы одна тема');
            return;
        }

        telegram.showConfirm('Удалить тему и все вопросы в ней?', (confirmed) => {
            if (confirmed) {
                this.data.topics = this.data.topics.filter(t => t.id !== topicId);
                
                if (this.data.currentTopicId === topicId) {
                    this.data.currentTopicId = this.data.topics[0].id;
                }
                
                this.saveData();
                this.render();
                ui.showNotification('Тема удалена');
            }
        });
    }

    deleteQuestion(questionId) {
        const topic = this.getCurrentTopic();
        if (topic) {
            topic.questions = topic.questions.filter(q => q.id !== questionId);
            this.saveData();
            this.render();
            ui.showNotification('Вопрос удалён');
        }
    }

    addQuestion() {
        const formData = ui.getFormData();
        
        if (!formData.question || !formData.answer) {
            ui.showNotification('Заполните вопрос и ответ');
            return;
        }

        let targetTopic = this.getCurrentTopic();

        // Handle topic creation
        if (formData.topic) {
            let existingTopic = this.data.topics.find(t => 
                t.name.toLowerCase() === formData.topic.toLowerCase()
            );

            if (existingTopic) {
                targetTopic = existingTopic;
                this.data.currentTopicId = existingTopic.id;
            } else {
                targetTopic = {
                    id: this.generateId(),
                    name: formData.topic,
                    questions: []
                };
                this.data.topics.push(targetTopic);
                this.data.currentTopicId = targetTopic.id;
            }

            ui.clearTopicInput();
        }

        if (!targetTopic) {
            ui.showNotification('Создайте или выберите тему');
            return;
        }

        // Add question
        targetTopic.questions.push({
            id: this.generateId(),
            question: formData.question,
            answer: formData.answer
        });

        ui.clearForm();
        this.saveData();
        this.render();
        ui.showNotification('Вопрос добавлен ✓');
    }

    createTopic() {
        const topicName = ui.elements.topicInput.value.trim();
        
        if (!topicName) {
            ui.showNotification('Введите название темы');
            return;
        }

        const exists = this.data.topics.some(t => 
            t.name.toLowerCase() === topicName.toLowerCase()
        );

        if (exists) {
            ui.showNotification('Такая тема уже существует');
            return;
        }

        const newTopic = {
            id: this.generateId(),
            name: topicName,
            questions: []
        };

        this.data.topics.push(newTopic);
        this.data.currentTopicId = newTopic.id;
        ui.clearTopicInput();

        this.saveData();
        this.render();
        ui.showNotification('Тема создана ✓');
    }

    hideAllAnswers() {
        ui.hideAllAnswers();
        ui.showNotification('Все ответы скрыты');
    }

    showRandomQuestion() {
        const allQuestions = [];

        this.data.topics.forEach(topic => {
            topic.questions.forEach(question => {
                allQuestions.push({
                    ...question,
                    topicId: topic.id,
                    topicName: topic.name
                });
            });
        });

        if (allQuestions.length === 0) {
            ui.showNotification('Нет вопросов для выбора');
            return;
        }

        const random = allQuestions[Math.floor(Math.random() * allQuestions.length)];

        // Switch to topic
        this.data.currentTopicId = random.topicId;
        this.render();

        // Show answer after render
        setTimeout(() => {
            ui.toggleAnswer(random.id);
            ui.scrollToQuestion(random.id);
        }, 300);

        ui.showNotification(`Случайный вопрос: ${random.topicName}`);
    }

    switchMode(mode) {
        this.data.mode = mode;
        this.render();
    }

    // В методе exportApp() замените на:
// В методе exportApp() используйте:
exportApp() {
    const botToken = exportManager.getBotToken();
    
    if (botToken) {
        // Если токен уже есть - сразу отправляем
        exportManager.sendToTelegramAutomatically();
    } else {
        // Если токена нет - показываем диалог
        ui.showExportModal(
            // Автоматическая отправка через бота
            async () => {
                await exportManager.promptBotToken();
            },
            // Ручное скачивание
            () => {
                exportManager.downloadHTML();
            },
            // Копирование в буфер
            async () => {
                const htmlContent = exportManager.generateHTML();
                try {
                    await navigator.clipboard.writeText(htmlContent);
                    ui.showNotification('📋 HTML код скопирован! Сохраните как .html файл.');
                } catch (error) {
                    ui.showNotification('❌ Ошибка копирования');
                }
            }
        );
    }
}

    bindEvents() {
        // Mode switch
        document.querySelector('.mode-switch').addEventListener('click', (e) => {
            if (e.target.classList.contains('mode-btn')) {
                this.switchMode(e.target.dataset.mode);
            }
        });

        // Theme selector
        document.getElementById('themeSelector').addEventListener('change', (e) => {
            const theme = e.target.value;
            ui.applyTheme(theme);
            storage.saveTheme(theme);
        });

        // Form buttons
        document.getElementById('addQuestionBtn').addEventListener('click', () => this.addQuestion());
        document.getElementById('createTopicBtn').addEventListener('click', () => this.createTopic());

        // Toolbar buttons
        document.getElementById('hideAllBtn').addEventListener('click', () => this.hideAllAnswers());
        document.getElementById('randomBtn').addEventListener('click', () => this.showRandomQuestion());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportApp());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.addQuestion();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.exportApp();
            }
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new ExamConstructorApp();
    app.init();
    
    // Make app accessible globally for debugging
    window.examApp = app;
});
