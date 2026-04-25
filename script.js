class LoveChat {
    constructor() {
        this.messages = JSON.parse(localStorage.getItem('loveMessages')) || [];
        this.currentUser = 'Kamu';
        this.partnerName = 'Sayang';
        this.init();
    }

    init() {
        this.chatContainer = document.getElementById('chatContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.floatingHearts = document.getElementById('floatingHearts');
        this.typingIndicator = document.getElementById('typingIndicator');

        this.photosGrid = document.getElementById('photosGrid');
        this.photoUpload = document.getElementById('photoUpload');

        this.tabs = document.querySelectorAll('.nav-item');
        this.tabContents = document.querySelectorAll('.tab-content');

        this.currentTab = 'chat';

        this.loadMessages();
        this.loadPhotos();
        this.bindEvents();
        this.simulatePartner();
        this.createFloatingHearts();
    }

    bindEvents() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.messageInput.value += e.target.dataset.emoji;
                this.messageInput.focus();
            });
        });

        this.messageInput.addEventListener('input', () => {
            this.showTypingIndicator();
        });

        this.photoUpload.addEventListener('change', (e) => this.handlePhotoUpload(e));

        // Tab navigation
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.changeTab(tab.dataset.tab);
            });
        });
    }

    changeTab(tab) {
        if (tab === this.currentTab) return;
        this.currentTab = tab;

        this.tabs.forEach(t => t.classList.remove('active'));
        this.tabContents.forEach(c => c.classList.remove('active'));

        document.querySelector(`.nav-item[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}Tab`).classList.add('active');
    }

    sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text) return;

        const message = {
            id: Date.now(),
            text: text,
            sender: this.currentUser,
            timestamp: new Date(),
            isYou: true
        };

        this.messages.push(message);
        this.saveMessages();
        this.renderMessage(message);
        this.messageInput.value = '';
        this.createHeartAnimation();
        this.simulatePartnerResponse();
    }

    renderMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.isYou ? 'you' : 'partner'}`;
        messageDiv.style.animationDelay = '0.1s';

        const time = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.innerHTML = `
            <div class="message-content">
                ${this.emojify(message.text)}
                <div class="message-time">${time}</div>
            </div>
        `;

        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    emojify(text) {
        return text
            .replace(/sayang|baby|say|kak|mak/gi, match => `<span style="color: #ff6b6b; font-weight: bold;">${match}</span>`)
            .replace(/cinta|love|heart/gi, match => `<i class="fas fa-heart" style="color: #ff6b6b;"></i>`)
            .replace(/\n/g, '<br>');
    }

    loadMessages() {
        this.messages.forEach(msg => this.renderMessage(msg));
    }

    scrollToBottom() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    saveMessages() {
        localStorage.setItem('loveMessages', JSON.stringify(this.messages));
    }

    showTypingIndicator() {
        clearTimeout(this.typingTimeout);
        this.typingIndicator.textContent = '💭 Sayang lagi ngetik...';
        this.typingTimeout = setTimeout(() => {
            this.typingIndicator.textContent = '';
        }, 2000);
    }

    simulatePartner() {
        const responses = [
            "Aww sayangku manis banget 😘",
            "I love you too baby ❤️",
            "Kamu bikin aku senyum terus 🥰",
            "Makasih ya udah ada buat aku 💕",
            "Sayang juga nih sama kamu 😍",
            "Hihihi kamu lucu deh 😜",
            "Miss you too sayangku 💖",
            "You're the best! 🥰",
            "Aku sayang kamu banget ❤️",
            "Hugs & kisses buat kamu 😘"
        ];

        setInterval(() => {
            if (Math.random() > 0.7 && this.messages.length % 2 === 0) {
                const response = responses[Math.floor(Math.random() * responses.length)];
                const message = {
                    id: Date.now(),
                    text: response,
                    sender: this.partnerName,
                    timestamp: new Date(),
                    isYou: false
                };
                this.messages.push(message);
                this.saveMessages();
                this.renderMessage(message);
            }
        }, 9000 + Math.random() * 11000);
    }

    simulatePartnerResponse() {
        // Optional quick reply from partner after user sends message
    }

    createHeartAnimation() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.innerHTML = '💖';
                heart.className = 'heart';
                heart.style.left = Math.random() * 100 + '%';
                heart.style.animationDuration = (3 + Math.random() * 2) + 's';
                this.floatingHearts.appendChild(heart);

                setTimeout(() => heart.remove(), 5000);
            }, i * 100);
        }
    }

    createFloatingHearts() {
        setInterval(() => {
            if (Math.random() > 0.8) {
                this.createHeartAnimation();
            }
        }, 10000);
    }

    // Photo upload
    handlePhotoUpload(e) {
        const files = [...e.target.files];
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                this.addPhoto(event.target.result);
            };
            reader.readAsDataURL(file);
        });
    }

    addPhoto(dataUrl) {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.innerHTML = `<img src="${dataUrl}" alt="Foto Kita"/>`;
        this.photosGrid.prepend(photoItem);
        this.savePhotos(dataUrl);
    }

    savePhotos(dataUrl) {
        const photos = JSON.parse(localStorage.getItem('lovePhotos')) || [];
        photos.unshift(dataUrl);
        localStorage.setItem('lovePhotos', JSON.stringify(photos));
    }

    loadPhotos() {
        const photos = JSON.parse(localStorage.getItem('lovePhotos')) || [];
        photos.forEach(dataUrl => {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';
            photoItem.innerHTML = `<img src="${dataUrl}" alt="Foto Kita"/>`;
            this.photosGrid.appendChild(photoItem);
        });
    }
}

// Init LoveChat when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    window.loveChat = new LoveChat();
});