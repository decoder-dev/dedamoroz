// Динамическое создание гирлянд
(function() {
    function createGarland() {
        const garland = document.createElement('div');
        garland.className = 'garland-line';
        garland.style.cssText = `
            position: fixed;
            width: 100%;
            height: 2px;
            top: ${Math.random() * 100}%;
            left: 0;
            z-index: 0;
            pointer-events: none;
            opacity: 0.7;
        `;
        
        const lights = 20;
        let html = '';
        for (let i = 0; i < lights; i++) {
            const colors = ['#ff0000', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#ffd700'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const delay = Math.random() * 2;
            html += `
                <span class="garland-light" style="
                    position: absolute;
                    left: ${(i / lights) * 100}%;
                    width: 8px;
                    height: 8px;
                    background: ${color};
                    border-radius: 50%;
                    box-shadow: 0 0 10px ${color}, 0 0 20px ${color};
                    animation: lightBlink 1.5s ease-in-out infinite;
                    animation-delay: ${delay}s;
                "></span>
            `;
        }
        garland.innerHTML = html;
        document.body.appendChild(garland);
    }

    // Создаем несколько гирлянд
    for (let i = 0; i < 4; i++) {
        setTimeout(() => createGarland(), i * 500);
    }
})();

