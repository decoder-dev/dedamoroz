/**
 * Анимация снежинок
 */
export class SnowAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.snowflakes = [];
        this.animationId = null;
        
        this.init();
    }

    init() {
        this.setCanvasSize();
        this.generateSnowflakes();
        this.animate();
        
        window.addEventListener('resize', () => {
            this.setCanvasSize();
            this.generateSnowflakes();
        });
    }

    setCanvasSize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    generateSnowflakes() {
        this.snowflakes = [];
        const count = Math.min(400, Math.floor((this.canvas.width * this.canvas.height) / 5000));
        
        for (let i = 0; i < count; i++) {
            this.snowflakes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 3 + 1,
                speed: Math.random() * 2 + 1.5,
                opacity: Math.random() * 0.5 + 0.5,
                sway: Math.random() * 0.5 - 0.25
            });
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.snowflakes.forEach(snowflake => {
            this.ctx.beginPath();
            this.ctx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${snowflake.opacity})`;
            this.ctx.fill();
            
            // Движение с покачиванием
            snowflake.y += snowflake.speed;
            snowflake.x += snowflake.sway;
            
            // Границы
            if (snowflake.y > this.canvas.height) {
                snowflake.y = 0;
                snowflake.x = Math.random() * this.canvas.width;
            }
            if (snowflake.x < 0) snowflake.x = this.canvas.width;
            if (snowflake.x > this.canvas.width) snowflake.x = 0;
        });
    }

    animate() {
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

