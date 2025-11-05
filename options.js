const bitElement = document.getElementById('bit');
const toggleBtn = document.getElementById('toggle');
const openTabBtn = document.getElementById('openTab');

// Загружаем бит при открытии
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get({ bit: 0 }, (data) => {
        bitElement.textContent = data.bit;
    });

    // === 1. Scroll Progress ===
    const progressBar = document.querySelector('.scroll-progress');
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const max = document.body.scrollHeight - window.innerHeight;
        const width = max > 0 ? (scrolled / max) * 100 : 0;
        progressBar.style.width = width + '%';
    });

    // === 3. Частицы ===
    const particles = document.querySelector('.particles');
    const colors = ['var(--primary-color)', 'var(--accent-color)', 'var(--success-color)'];
    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.top = Math.random() * 100 + 'vh';
        p.style.opacity = Math.random() * 0.5 + 0.3;
        p.style.animationDuration = Math.random() * 5 + 6 + 's';
        particles.appendChild(p);
    }

    // === 4. Появление при скролле ===
    const fadeEls = document.querySelectorAll('.animate-fade');
    const fadeObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                fadeObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });
    fadeEls.forEach(el => fadeObs.observe(el));

    // === 5. Терминал: посимвольный ввод, курсор только в конце ===
    const terminalBody = document.querySelector('.terminal-body');
    const lines = Array.from(terminalBody.children);
    lines.forEach(line => {
        line.style.display = 'none';
        if (line.querySelector('.terminal-cursor')) line.querySelector('.terminal-cursor').remove();
    });

    const lastLine = lines[lines.length - 1];
    const cursor = document.createElement('span');
    cursor.className = 'terminal-cursor';
    lastLine.appendChild(cursor);
    lastLine.style.display = 'flex';

    const termObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            typeTerminal(lines, 0, () => {
                lastLine.style.display = 'flex';
                lastLine.appendChild(cursor);
            });
            termObserver.unobserve(entries[0].target);
        }
    }, { threshold: 0.2 });
    termObserver.observe(document.querySelector('.terminal'));

    function typeTerminal(lines, index, callback) {
        if (index >= lines.length - 1) {
            if (callback) callback();
            return;
        }

        const line = lines[index];
        line.style.display = 'flex';
        const isCommand = line.textContent.trim().startsWith('$');
        let text = line.textContent.trim();
        if (isCommand) text = text.substring(2).trim();

        line.textContent = '';
        if (isCommand) line.classList.add('command');
        else line.classList.add('output');

        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                line.textContent += text[i];
                i++;
            } else {
                clearInterval(timer);
                typeTerminal(lines, index + 1, callback);
            }
        }, 30);
    }

    // === 6. Dynamic Text ===
    const dynText = document.querySelector('.dynamic-text');
    const words = ['privacy.', 'confidentiality.', 'secrecy.', 'experiences.'];
    let wIndex = 0, cIndex = 0, isDeleting = false;

    function typeWord() {
        const cur = words[wIndex];
        dynText.textContent = cur.substring(0, cIndex);
        if (!isDeleting && cIndex === cur.length) {
            isDeleting = true;
            setTimeout(typeWord, 1500);
        } else if (isDeleting && cIndex === 0) {
            isDeleting = false;
            wIndex = (wIndex + 1) % words.length;
            setTimeout(typeWord, 500);
        } else {
            const delta = isDeleting ? 10 : 40;
            cIndex += isDeleting ? -1 : 1;
            setTimeout(typeWord, delta);
        }
    }
    setTimeout(typeWord, 1000);

    // === 7. Тема и прокрутка ===
    const toggle = document.querySelector('.theme-toggle');
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-theme');
    }
    toggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
        updateHeader();
    });

    const header = document.querySelector('header');
    function updateHeader() {
        const isLight = document.body.classList.contains('light-theme');
        const scrolled = window.scrollY > 50;
        header.classList.toggle('scrolled', scrolled);
        header.style.backgroundColor = isLight
            ? `rgba(255,255,255,${scrolled ? 0.75 : 0.6})`
            : `rgba(18,18,18,${scrolled ? 0.75 : 0.6})`;
    }
    window.addEventListener('scroll', updateHeader);
    updateHeader();

});

// Переключение по кнопке
toggleBtn.addEventListener('click', () => {
    const current = bitElement.textContent;
    const newBit = current === '0' ? '1' : '0';
    bitElement.textContent = newBit;
    chrome.storage.sync.set({ bit: newBit });
});

