/* ============================================================
   background.js — Canvas 像素背景动画 v2
   增强版：更高可见度、更多经幡、更壮观的远山
   ============================================================ */

const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const PX = 4;

// ==================== 雪花系统（大幅提高透明度） ====================
let snowflakes = [];

function makeSnowflake() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        speedY: Math.random() * 0.5 + 0.2,
        speedX: Math.random() * 0.3 - 0.15,
        size: Math.floor(Math.random() * 3) + 2,
        alpha: Math.random() * 0.4 + 0.35,  // 0.35~0.75 大幅提高
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: Math.random() * 0.01 + 0.005,
    };
}

function initSnow() {
    snowflakes = [];
    const n = Math.floor(canvas.width / 18); // 更密集
    for (let i = 0; i < n; i++) {
        const s = makeSnowflake();
        s.y = Math.random() * canvas.height;
        snowflakes.push(s);
    }
}
initSnow();
window.addEventListener('resize', initSnow);

function drawSnowflake(s) {
    const px = PX;
    const cx = Math.round(s.x / px) * px;
    const cy = Math.round(s.y / px) * px;
    const sz = s.size;

    ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;

    // 竖线
    for (let d = -sz; d <= sz; d++) {
        ctx.fillRect(cx, cy + d * px, px, px);
    }
    // 横线
    for (let d = -sz; d <= sz; d++) {
        ctx.fillRect(cx + d * px, cy, px, px);
    }
    // 对角线（大雪花）
    if (sz >= 3) {
        for (let d = 1; d <= sz - 1; d++) {
            ctx.fillRect(cx + d * px, cy + d * px, px, px);
            ctx.fillRect(cx - d * px, cy + d * px, px, px);
        }
    }

    // 外围微光
    if (sz >= 3 && Math.random() > 0.7) {
        ctx.fillStyle = `rgba(212, 168, 67, ${s.alpha * 0.5})`;
        ctx.fillRect(cx + (sz + 1) * px, cy, px, px);
        ctx.fillRect(cx - (sz + 1) * px, cy, px, px);
        ctx.fillRect(cx, cy + (sz + 1) * px, px, px);
        ctx.fillRect(cx, cy - (sz + 1) * px, px, px);
    }
}

function updateSnow() {
    for (let s of snowflakes) {
        s.y += s.speedY;
        s.phase += s.phaseSpeed;
        s.x += Math.sin(s.phase) * 0.3;
        if (s.y > canvas.height + 30) { s.y = -30; s.x = Math.random() * canvas.width; }
        if (s.x > canvas.width + 30) s.x = -30;
        if (s.x < -30) s.x = canvas.width + 30;
    }
}

// ==================== 经幡系统（更多旗帜 + 更高透明度） ====================
const FLAG_COLORS = ['#5aade8','#f0efe8','#d64545','#3cb371','#f5c842'];

let flagStrings = [];

function makeFlagString(x, y, dir) {
    const fw = PX * 8;
    const fh = PX * 13;
    const gap = PX * 4;
    const count = 6 + Math.floor(Math.random() * 4); // 6~9面旗帜
    const flags = [];
    for (let i = 0; i < count; i++) {
        flags.push({
            color: FLAG_COLORS[i % 5],
            ox: (fw + gap) * i
        });
    }
    return {
        x, y, dir,
        flags, fw, fh,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.004 + 0.003,
        swayAmp: Math.random() * 8 + 6,
        alpha: 0.35 + Math.random() * 0.25, // 0.35~0.60 大幅提高
    };
}

function initFlags() {
    flagStrings = [
        makeFlagString(canvas.width * 0.03, canvas.height * 0.05, 1),
        makeFlagString(canvas.width * 0.28, canvas.height * 0.03, -1),
    ];
    // 大屏幕更多经幡
    if (canvas.width > 768) {
        flagStrings.push(makeFlagString(canvas.width * 0.55, canvas.height * 0.08, 1));
        flagStrings.push(makeFlagString(canvas.width * 0.75, canvas.height * 0.06, -1));
    }
    if (canvas.width > 1024) {
        flagStrings.push(makeFlagString(canvas.width * 0.12, canvas.height * 0.15, -1));
    }
}
initFlags();
window.addEventListener('resize', initFlags);

function drawFlagString(fs) {
    ctx.save();
    ctx.globalAlpha = fs.alpha;
    const px = PX;
    const bx = Math.round(fs.x / px) * px;
    const by = Math.round(fs.y / px) * px;
    const sway = Math.sin(fs.swayPhase) * fs.swayAmp;

    // 绳子（更粗更明显）
    ctx.fillStyle = 'rgba(155, 27, 27, 0.55)';
    const totalLen = fs.flags.length * (fs.fw + px * 3);
    for (let rx = 0; rx < totalLen; rx += px * 2) {
        const ropeY = by + Math.sin((rx + fs.swayPhase * 30) * 0.04) * sway;
        ctx.fillRect(bx + rx, ropeY, px * 2, px);  // 双倍宽度的绳子
    }

    // 旗帜
    for (let i = 0; i < fs.flags.length; i++) {
        const f = fs.flags[i];
        const fx = bx + f.ox;
        const fy = by + Math.sin((f.ox + fs.swayPhase * 30) * 0.04) * sway;

        ctx.fillStyle = f.color;
        const afx = Math.round(fx / px) * px;
        const afy = Math.round(fy / px) * px;
        ctx.fillRect(afx, afy, fs.fw, fs.fh);

        // 像素边框
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        for (let bx2 = 0; bx2 < fs.fw; bx2 += px) {
            ctx.fillRect(afx + bx2, afy, px, px);
            ctx.fillRect(afx + bx2, afy + fs.fh - px, px, px);
        }
        for (let by2 = 0; by2 < fs.fh; by2 += px) {
            ctx.fillRect(afx, afy + by2, px, px);
            ctx.fillRect(afx + fs.fw - px, afy + by2, px, px);
        }

        // 中心十字装饰（更大）
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        const midX = afx + Math.floor(fs.fw / px / 2) * px;
        const midY = afy + Math.floor(fs.fh / px / 2) * px;
        ctx.fillRect(midX, midY, px, px);
        ctx.fillRect(midX - px * 2, midY, px, px);
        ctx.fillRect(midX + px * 2, midY, px, px);
        ctx.fillRect(midX, midY - px * 2, px, px);
        ctx.fillRect(midX, midY + px * 2, px, px);
    }
    ctx.restore();
}

function updateFlags() {
    for (let fs of flagStrings) fs.swayPhase += fs.swaySpeed;
}

// ==================== 远山剪影（更壮观） ====================
function drawMountains() {
    ctx.save();
    ctx.globalAlpha = 0.12; // 从0.06提高到0.12
    const px = PX * 2;
    const ground = canvas.height;
    const peaks = [
        { cx: canvas.width * 0.15, h: canvas.height * 0.20 },
        { cx: canvas.width * 0.35, h: canvas.height * 0.28 },
        { cx: canvas.width * 0.55, h: canvas.height * 0.22 },
        { cx: canvas.width * 0.78, h: canvas.height * 0.18 },
    ];
    for (let p of peaks) {
        ctx.fillStyle = '#c8d6e5';
        const w = p.h * 2.8;
        for (let y = ground - p.h; y < ground; y += px) {
            const t = (y - (ground - p.h)) / p.h;
            const hw = (w / 2) * t;
            for (let x = p.cx - hw; x <= p.cx + hw; x += px) {
                if (Math.random() > 0.68) continue;
                ctx.fillRect(Math.round(x / px) * px, Math.round(y / px) * px, px, px);
            }
        }
        // 雪顶
        const snowTop = ground - p.h;
        for (let sx = p.cx - w * 0.12; sx <= p.cx + w * 0.12; sx += px) {
            if (Math.random() > 0.5) continue;
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fillRect(Math.round(sx / px) * px, Math.round(snowTop / px) * px, px, px);
        }
    }
    ctx.restore();
}

// ==================== 像素星辰 ====================
let stars = [];
function initStars() {
    stars = [];
    const count = Math.floor(canvas.width / 30);
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.5, // 只在上半部分
            alpha: Math.random() * 0.15 + 0.05,
            twinkle: Math.random() * Math.PI * 2,
            twinkleSpeed: Math.random() * 0.02 + 0.005,
        });
    }
}
initStars();
window.addEventListener('resize', initStars);

function drawStars() {
    for (let s of stars) {
        s.twinkle += s.twinkleSpeed;
        const alpha = s.alpha + Math.sin(s.twinkle) * 0.05;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.02, alpha)})`;
        const sx = Math.round(s.x / PX) * PX;
        const sy = Math.round(s.y / PX) * PX;
        ctx.fillRect(sx, sy, PX, PX);
    }
}

// ==================== 主循环 ====================
function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 画星辰（最底层）
    drawStars();

    // 画远山
    drawMountains();

    // 画经幡
    for (let fs of flagStrings) drawFlagString(fs);
    updateFlags();

    // 画雪花
    for (let s of snowflakes) drawSnowflake(s);
    updateSnow();

    requestAnimationFrame(loop);
}
loop();
