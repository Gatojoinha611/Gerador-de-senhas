const passwordField = document.getElementById('password');
const copyBtn = document.getElementById('copy-btn');
const saveBtn = document.getElementById('save-btn');
const lengthInput = document.getElementById('length');
const keywordInput = document.getElementById('keyword');
const uppercaseCheck = document.getElementById('uppercase');
const lowercaseCheck = document.getElementById('lowercase');
const numbersCheck = document.getElementById('numbers');
const symbolsCheck = document.getElementById('symbols');
const generateBtn = document.getElementById('generate-btn');
const diceBtn = document.getElementById('dice-btn');
const surpriseBtn = document.getElementById('surprise-btn');
const strengthBar = document.getElementById('strength-bar');
const strengthText = document.getElementById('strength-text');
const strengthEmoji = document.getElementById('strength-emoji');
const historyList = document.getElementById('history-list');
const themeButtons = document.querySelectorAll('.theme-btn');
const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d');

let history = [];
let particles = [];

const characters = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// Tema inicial
document.body.classList.add('dark');

// Mudança de tema
themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        document.body.classList.remove('dark', 'light', 'hacker');
        document.body.classList.add(btn.dataset.theme);
        updateParticleColor();
    });
});

// Fundo dinâmico
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }
    updateParticleColor();
}

function updateParticleColor() {
    const theme = document.body.classList[0];
    particles.forEach(p => {
        p.color = theme === 'dark' ? 'rgba(179, 204, 179, 0.3)' :
                  theme === 'light' ? 'rgba(61, 90, 61, 0.3)' :
                  'rgba(128, 255, 128, 0.3)';
    });
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
});

function generatePassword(length = parseInt(lengthInput.value), isSurprise = false) {
    let charSet = '';
    if (uppercaseCheck.checked) charSet += characters.uppercase;
    if (lowercaseCheck.checked) charSet += characters.lowercase;
    if (numbersCheck.checked) charSet += characters.numbers;
    if (symbolsCheck.checked) charSet += characters.symbols;

    if (charSet === '' && !keywordInput.value && !isSurprise) {
        alert('Selecione pelo menos uma opção ou digite uma palavra-chave!');
        return;
    }

    length = isNaN(length) ? 12 : Math.max(4, Math.min(24, length));
    lengthInput.value = length;

    if (isSurprise) {
        uppercaseCheck.checked = Math.random() > 0.5;
        lowercaseCheck.checked = Math.random() > 0.5;
        numbersCheck.checked = Math.random() > 0.5;
        symbolsCheck.checked = Math.random() > 0.5;

        if (!uppercaseCheck.checked && !lowercaseCheck.checked && !numbersCheck.checked && !symbolsCheck.checked) {
            lowercaseCheck.checked = true;
        }

        length = Math.floor(Math.random() * (24 - 4 + 1)) + 4;
        lengthInput.value = length;
        charSet = '';
        if (uppercaseCheck.checked) charSet += characters.uppercase;
        if (lowercaseCheck.checked) charSet += characters.lowercase;
        if (numbersCheck.checked) charSet += characters.numbers;
        if (symbolsCheck.checked) charSet += characters.symbols;
    }

    let password = '';
    const keyword = keywordInput.value.trim();

    if (keyword && !isSurprise) {
        password = keyword;
        password = password.split('').sort(() => Math.random() - 0.5).join('');
        password = password.split('').map(char => {
            if (Math.random() < 0.3 && charSet) {
                const randomChar = charSet[Math.floor(Math.random() * charSet.length)];
                return /[a-z]/i.test(char) ? randomChar : char;
            }
            return char;
        }).join('');
        while (password.length < length) {
            password += charSet[Math.floor(Math.random() * charSet.length)];
        }
        password = password.slice(0, length);
        password = password.split('').sort(() => Math.random() - 0.5).join('');
    } else {
        for (let i = 0; i < length; i++) {
            password += charSet[Math.floor(Math.random() * charSet.length)];
        }
    }

    animatePassword(password);
    updateStrength(password);
    addToHistory(password);
}

function animatePassword(password) {
    passwordField.value = '';
    let i = 0;
    const interval = setInterval(() => {
        if (i < password.length) {
            passwordField.value += password[i];
            i++;
        } else {
            clearInterval(interval);
        }
    }, 50);
}

function updateStrength(password) {
    let strength = 0;
    if (password.length > 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;

    strengthBar.style.width = `${strength}%`;
    if (strength <= 25) {
        strengthBar.style.background = '#4d6a4d';
        strengthText.textContent = 'Força: Fraca';
        strengthEmoji.textContent = '😣';
    } else if (strength <= 50) {
        strengthBar.style.background = '#6a856a';
        strengthText.textContent = 'Força: Média';
        strengthEmoji.textContent = '😐';
    } else if (strength <= 75) {
        strengthBar.style.background = '#8a9a8a';
        strengthText.textContent = 'Força: Boa';
        strengthEmoji.textContent = '😊';
    } else {
        strengthBar.style.background = '#a8b9a8';
        strengthText.textContent = 'Força: Excelente';
        strengthEmoji.textContent = '💪';
    }
}

function addToHistory(password) {
    if (password) {
        history.unshift(password);
        if (history.length > 5) history.pop();
    }
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = ''; // Limpa o histórico completamente
    if (history.length === 0) return;

    history.forEach((pwd, index) => {
        const li = document.createElement('li');
        const passwordSpan = document.createElement('span');
        passwordSpan.textContent = `🔒 ${pwd}`;
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.dataset.index = index;
        deleteBtn.textContent = '🗑️';

        // Adiciona evento ao botão de deletar
        deleteBtn.addEventListener('click', () => {
            history.splice(index, 1);
            renderHistory(); // Re-renderiza o histórico após deletar
        });

        li.appendChild(passwordSpan);
        li.appendChild(deleteBtn);
        historyList.appendChild(li);
    });
}

copyBtn.addEventListener('click', () => {
    passwordField.select();
    document.execCommand('copy');
    alert('Senha copiada!');
});

saveBtn.addEventListener('click', () => {
    const blob = new Blob([passwordField.value], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'senha.txt';
    link.click();
});

generateBtn.addEventListener('click', () => generatePassword());

diceBtn.addEventListener('click', () => {
    const randomLength = Math.floor(Math.random() * (24 - 4 + 1)) + 4;
    lengthInput.value = randomLength;
    generatePassword(randomLength);
});

surpriseBtn.addEventListener('click', () => {
    generatePassword(null, true);
});

keywordInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        generatePassword();
    }
});

lengthInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        let value = parseInt(lengthInput.value);
        value = isNaN(value) ? 12 : Math.max(4, Math.min(24, value));
        lengthInput.value = value;
        generatePassword(value);
    }
});