
// --- 鼠标粒子拖尾效果（就可以在所有页面生效）---
let lastX = 0;
let lastY = 0;
let isMoving = false;

// 创建粒子函数
function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // 随机决定使用红色或蓝色
    const isRed = Math.random() > 0.5;
    const color = isRed ? 'rgba(255, 87, 87, 0.8)' : 'rgba(87, 192, 255, 0.8)';
    
    // 随机大小 (3-8px)
    const size = Math.random() * 5 + 3;
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.backgroundColor = color;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    
    document.body.appendChild(particle);
    
    // 添加随机移动
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    
    // 动画
    let posX = x;
    let posY = y;
    
    const animate = () => {
        posX += vx;
        posY += vy;
        particle.style.left = `${posX}px`;
        particle.style.top = `${posY}px`;
        
        if (!particle.classList.contains('fade')) {
            requestAnimationFrame(animate);
        }
    };
    
    requestAnimationFrame(animate);
    
    // 淡出并移除
    setTimeout(() => {
        particle.classList.add('fade');
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1000);
    }, 1000);
}

// 鼠标移动时创建粒子
document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    
    // 计算移动距离
    const distance = Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2);
    
    // 只有在移动足够距离时才创建粒子
    if (distance > 5) {
        createParticle(x, y);
        lastX = x;
        lastY = y;
    }
    
    // 标记正在移动
    if (!isMoving) {
        isMoving = true;
        lastX = x;
        lastY = y;
    }
});

// 鼠标停止移动时
document.addEventListener('mousestop', () => {
    isMoving = false;
});

// 自定义mousestop事件
(function() {
    let timeout;
    
    document.addEventListener('mousemove', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const event = new CustomEvent('mousestop');
            document.dispatchEvent(event);
        }, 150);
    });
})();