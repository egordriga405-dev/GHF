// UI Management
class UIManager {
    constructor() {
        this.elements = {};
        this.cacheElements();
    }

    cacheElements() {
        this.elements = {
            themeSelector: document.getElementById('themeSelector'),
            modeSwitch: document.querySelector('.mode-switch'),
            topicsContainer: document.getElementById('topicsContainer'),
            questionsContainer: document.getElementById('questionsContainer'),
            formContainer: document.getElementById('formContainer'),
            notification: document.getElementById('notification'),
            exportModal: document.getElementById('exportModal'),
            topicInput: document.getElementById('topicInput'),
            questionInput: document.getElementById('questionInput'),
            answerInput: document.getElementById('answerInput'),
            addQuestionBtn: document.getElementById('addQuestionBtn'),
            createTopicBtn: document.getElementById('createTopicBtn'),
            hideAllBtn: document.getElementById('hideAllBtn'),
            randomBtn: document.getElementById('randomBtn'),
            exportBtn: document.getElementById('exportBtn')
        };
    }

    // Render topics navigation
    renderTopics(topics, currentTopicId, onSelect, onDelete) {
        const container = this.elements.topicsContainer;
        container.innerHTML = '';

        topics.forEach(topic => {
            const chip = document.createElement('div');
            chip.className = `topic-chip ${topic.id === currentTopicId ? 'active' : ''}`;
            chip.innerHTML = `${this.escapeHtml(topic.name)} <span class="delete-icon">×</span>`;

            chip.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-icon')) {
                    e.stopPropagation();
                    if (onDelete) onDelete(topic.id);
                } else {
                    if (onSelect) onSelect(topic.id);
                }
            });

            container.appendChild(chip);
        });

        // Add new topic button
        const addChip = document.createElement('div');
        addChip.className = 'topic-chip add-topic-chip';
        addChip.textContent = '+';
        addChip.addEventListener('click', () => {
            this.elements.topicInput.focus();
        });
        container.appendChild(addChip);
    }

    // Render questions
    renderQuestions(questions, mode, onDelete, onToggle) {
        const container = this.elements.questionsContainer;

        if (!questions || questions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">❓</div>
                    <div>Нет вопросов в этой теме</div>
                </div>`;
            return;
        }

        container.innerHTML = '';

        questions.forEach((q, index) => {
            const card = document.createElement('div');
            card.className = 'question-card';
            card.innerHTML = `
                <div class="question-header">
                    <div class="question-text">${index + 1}. ${this.escapeHtml(q.question)}</div>
                    ${mode === 'edit' ? '<button class="delete-question">×</button>' : ''}
                </div>
                <div class="answer-container" id="answer-${q.id}">
                    <div class="answer-text">${this.escapeHtml(q.answer)}</div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-secondary toggle-btn">👁️ Показать ответ</button>
                </div>
            `;

            // Delete handler
            const deleteBtn = card.querySelector('.delete-question');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    if (onDelete) onDelete(q.id);
                });
            }

            // Toggle handler
            const toggleBtn = card.querySelector('.toggle-btn');
            toggleBtn.addEventListener('click', () => {
                if (onToggle) onToggle(q.id);
            });

            container.appendChild(card);
        });
    }

    // Toggle answer visibility
    toggleAnswer(questionId) {
        const answerContainer = document.getElementById(`answer-${questionId}`);
        if (!answerContainer) return;

        const isExpanded = answerContainer.classList.contains('expanded');
        const toggleBtn = answerContainer.parentElement.querySelector('.toggle-btn');

        if (isExpanded) {
            answerContainer.classList.remove('expanded');
            if (toggleBtn) toggleBtn.textContent = '👁️ Показать ответ';
        } else {
            answerContainer.classList.add('expanded');
            if (toggleBtn) toggleBtn.textContent = '🙈 Скрыть ответ';
        }
    }

    // Hide all answers
    hideAllAnswers() {
        document.querySelectorAll('.answer-container').forEach(container => {
            container.classList.remove('expanded');
        });
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.textContent = '👁️ Показать ответ';
        });
    }

    // Show notification
    showNotification(message, duration = 3000) {
        const notification = this.elements.notification;
        notification.textContent = message;
        notification.style.display = 'block';

        clearTimeout(notification._timeout);
        notification._timeout = setTimeout(() => {
            notification.style.display = 'none';
        }, duration);
    }

    // Show export modal
    showExportModal(onDownload, onCopy, onShare) {
        const modal = this.elements.exportModal;
        modal.innerHTML = `
            <div class="export-modal-content">
                <h3>📤 Экспорт тренажёра</h3>
                <p style="margin-bottom: 16px; color: var(--tg-theme-hint-color, #666);">
                    Выберите способ экспорта:
                </p>
                <button class="btn btn-primary" id="downloadBtn">💾 Скачать HTML файл</button>
                <button class="btn btn-secondary" id="copyBtn">📋 Копировать HTML код</button>
                <button class="btn btn-secondary" id="shareBtn">🔗 Поделиться ссылкой</button>
                <button class="btn btn-secondary" id="closeModalBtn" style="margin-top: 12px;">❌ Закрыть</button>
            </div>
        `;
        modal.style.display = 'flex';

        // Event listeners
        document.getElementById('downloadBtn').addEventListener('click', () => {
            if (onDownload) onDownload();
            modal.style.display = 'none';
        });

        document.getElementById('copyBtn').addEventListener('click', () => {
            if (onCopy) onCopy();
            modal.style.display = 'none';
        });

        document.getElementById('shareBtn').addEventListener('click', () => {
            if (onShare) onShare();
        });

        document.getElementById('closeModalBtn').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Switch mode (edit/train)
    switchMode(mode) {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        this.elements.formContainer.style.display = mode === 'edit' ? 'block' : 'none';
        
        if (mode === 'train') {
            this.hideAllAnswers();
        }
    }

    // Apply theme
    applyTheme(theme) {
        document.body.className = '';
        if (theme === 'light') {
            document.body.classList.add('theme-light');
        } else if (theme === 'dark') {
            document.body.classList.add('theme-dark');
        }
    }

    // Get form data
    getFormData() {
        return {
            topic: this.elements.topicInput.value.trim(),
            question: this.elements.questionInput.value.trim(),
            answer: this.elements.answerInput.value.trim()
        };
    }

    // Clear form
    clearForm() {
        this.elements.questionInput.value = '';
        this.elements.answerInput.value = '';
    }

    // Clear topic input
    clearTopicInput() {
        this.elements.topicInput.value = '';
    }

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }


    scrollToQuestion(questionId) {
        const answerContainer = document.getElementById(`answer-${questionId}`);
        if (answerContainer) {
            answerContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Create global instance
const ui = new UIManager();
