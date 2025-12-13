/**
 * Анимация звезд
 */
export class StarsAnimation {
    constructor(containerId, count = 100) {
        this.container = document.getElementById(containerId);
        this.count = count;
        
        if (!this.container) return;
        
        this.init();
    }

    init() {
        for (let i = 0; i < this.count; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            star.style.animationDuration = (Math.random() * 2 + 2) + 's';
            this.container.appendChild(star);
        }
    }
}

