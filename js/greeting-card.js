/* ============================================================
   greeting-card.js — 极简书本贺卡生成器
   1. 宗萨钦哲仁波切语录库（藏汉双语）
   2. Canvas 极简书本卡片绘制
   3. 弹窗交互（打开/关闭/ESC）
   4. 下载高清 PNG
   5. 中英文界面切换
   ============================================================ */

(function() {

// ==================== 1. 宗萨钦哲仁波切语录库 ====================
// 每条语录分两行藏文 + 两行中文
// ⚠️ 藏文是 AI 根据中文意思尝试写的，请藏族朋友检查和修改！
var quotes = [
    {
        tib1: 'འདོད་ཆགས་བྲལ་བས།',
        tib2: 'སྡུག་བསྔལ་སེལ་བར་བྱེད།',
        chn1: '消除痛苦的方法，',
        chn2: '是放弃你的执着。'
    },
    {
        tib1: 'གཞན་ལ་བྱ་བ་གང་ཡིན་པ།',
        tib2: 'རང་ལ་བྱེད་པ་ཡིན།',
        chn1: '凡你对别人所做的，',
        chn2: '就是对自己所做。'
    },
    {
        tib1: 'ཕྱིའི་གཟུགས་བརྙན་གྱིས་མ་ཟིན་པར།',
        tib2: 'དེར་ཞེན་པས་ཟིན་པ་ཡིན།',
        chn1: '不是外相困住了你，',
        chn2: '而是你对外相的执着，困住了你。'
    },
    {
        tib1: 'རྟག་པར་མ་ཡིན་པའི་དངོས་པོ།',
        tib2: 'རྟག་པར་འཛིན་པས་སྡུག་བསྔལ་མྱོང་།',
        chn1: '把不是永恒的事物看作永恒，',
        chn2: '所以才感到痛苦。'
    },
    {
        tib1: 'ཁྱེད་ཀྱི་རྨི་ལམ་བརྒྱ་ཕྲག།',
        tib2: 'མི་འགྲུབ་པར་སྨོན་ལམ་འདེབས།',
        chn1: '我祝愿你一百个梦想，',
        chn2: '都不会实现。'
    },
    {
        tib1: 'ང་རྒྱལ་དང་ངར་འཛིན་དང་།',
        tib2: 'འཐབ་རྩོད་བྱེད་པ་ནི་ཆོས་ཉམས་ལེན་ཡིན།',
        chn1: '佛法修行，是不断与自己的傲慢、',
        chn2: '与我执对抗。'
    },
    {
        tib1: 'གང་ལ་ཞེན་པ་དེ་ཉིད།',
        tib2: 'སྡུག་བསྔལ་གྱི་ཁུངས་ཡིན།',
        chn1: '你所执着的东西，',
        chn2: '就是痛苦的根源。'
    },
    {
        tib1: 'ད་ལྟའི་སྐད་ཅིག་ལ་གནས་པ་ནི།',
        tib2: 'སྒོམ་སྒྲུབ་ཀྱི་སྙིང་པོ་ཡིན།',
        chn1: '安住于当下，',
        chn2: '就是禅修的精髓。'
    }
];

// ==================== 2. DOM 引用 ====================
var modal = document.getElementById('greetingModal');
var modalTitle = document.getElementById('greetingModalTitle');
var modalClose = document.getElementById('greetingModalClose');
var quoteSelect = document.getElementById('greetingQuoteSelect');
var tibInput1 = document.getElementById('greetingTib1');
var tibInput2 = document.getElementById('greetingTib2');
var chnInput1 = document.getElementById('greetingChn1');
var chnInput2 = document.getElementById('greetingChn2');
var generateBtn = document.getElementById('greetingGenerate');
var editorArea = document.getElementById('greetingEditor');
var previewArea = document.getElementById('greetingPreview');
var canvas = document.getElementById('greetingCanvas');
var downloadBtn = document.getElementById('greetingDownload');
var regenerateBtn = document.getElementById('greetingRegenerate');

// ==================== 3. 填充下拉框选项 ====================
function populateQuoteSelect() {
    // 保留第一个"请选择"option，清掉后面的
    while (quoteSelect.options.length > 1) {
        quoteSelect.remove(1);
    }

    var lang = (typeof currentLang !== 'undefined') ? currentLang : 'zh';

    for (var i = 0; i < quotes.length; i++) {
        var q = quotes[i];
        var option = document.createElement('option');
        option.value = i;
        // 中文显示语录的内容摘要，英文显示英文
        if (lang === 'zh') {
            option.textContent = (i + 1) + '. ' + q.chn1 + q.chn2;
        } else {
            option.textContent = (i + 1) + '. Quote ' + (i + 1);
        }
        quoteSelect.appendChild(option);
    }
}

// ==================== 4. Canvas 绘制：极简书本风 ====================
function drawCard() {
    var ctx = canvas.getContext('2d');
    var W = canvas.width;   // 1200
    var H = canvas.height;  // 1600

    // 读取四行文字（去掉首尾空格）
    var tib1 = (tibInput1.value || '').trim();
    var tib2 = (tibInput2.value || '').trim();
    var chn1 = (chnInput1.value || '').trim();
    var chn2 = (chnInput2.value || '').trim();

    // ---- 第1步：纸张底色（暖白/旧书页色） ----
    ctx.fillStyle = '#faf7f0';
    ctx.fillRect(0, 0, W, H);

    // ---- 第2步：纸张纹理（细微噪点，模拟纸纤维） ----
    ctx.fillStyle = 'rgba(0, 0, 0, 0.006)';
    for (var i = 0; i < 3000; i++) {
        var nx = Math.floor(Math.random() * W);
        var ny = Math.floor(Math.random() * H);
        ctx.fillRect(nx, ny, 2, 2);
    }

    // ---- 第3步：书页立体阴影（四周向内渐淡） ----
    // 用多个半透明矩形叠加，模拟书页的轻微立体感
    var shadowSteps = 30; // 阴影渐变的步数
    var shadowWidth = 40; // 阴影宽度（px）

    // 左侧阴影
    for (var s = 0; s < shadowSteps; s++) {
        var alpha = 0.02 * (1 - s / shadowSteps);
        ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha.toFixed(3) + ')';
        ctx.fillRect(s * 2, 0, 2, H);
    }
    // 右侧阴影
    for (var s2 = 0; s2 < shadowSteps; s2++) {
        var alpha2 = 0.02 * (1 - s2 / shadowSteps);
        ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha2.toFixed(3) + ')';
        ctx.fillRect(W - (s2 + 1) * 2, 0, 2, H);
    }
    // 底部阴影（书脊方向）
    for (var s3 = 0; s3 < shadowSteps; s3++) {
        var alpha3 = 0.015 * (1 - s3 / shadowSteps);
        ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha3.toFixed(3) + ')';
        ctx.fillRect(0, H - (s3 + 1) * 2, W, 2);
    }

    // ---- 第4步：藏文第一行 ----
    if (tib1) {
        ctx.fillStyle = '#1a1a2e';
        ctx.font = '38px "Microsoft Himalaya", "Kailasa", "Noto Sans SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        // 在 Canvas 上分行：如果文字太长就自动换行
        drawTibetanLine(ctx, tib1, W / 2, 380, W - 240, 56);
    }

    // ---- 第5步：藏文第二行 ----
    if (tib2) {
        ctx.fillStyle = '#1a1a2e';
        ctx.font = '38px "Microsoft Himalaya", "Kailasa", "Noto Sans SC", sans-serif';
        ctx.textAlign = 'center';
        drawTibetanLine(ctx, tib2, W / 2, 450, W - 240, 56);
    }

    // ---- 第6步：微妙分隔线 ----
    var sepY = 580;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W * 0.25, sepY);
    ctx.lineTo(W * 0.75, sepY);
    ctx.stroke();

    // ---- 第7步：中文第一行 ----
    if (chn1) {
        ctx.fillStyle = '#4a4a4a';
        ctx.font = '28px "Noto Sans SC", sans-serif';
        ctx.textAlign = 'center';
        drawChineseLine(ctx, chn1, W / 2, sepY + 80, W - 240, 44);
    }

    // ---- 第8步：中文第二行 ----
    if (chn2) {
        ctx.fillStyle = '#4a4a4a';
        ctx.font = '28px "Noto Sans SC", sans-serif';
        ctx.textAlign = 'center';
        drawChineseLine(ctx, chn2, W / 2, sepY + 130, W - 240, 44);
    }

    // ---- 第9步：页脚署名 ----
    ctx.fillStyle = '#9b1b1b';
    ctx.font = '14px "Press Start 2P", "Noto Sans SC", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('— 宗萨钦哲仁波切', W - 160, H - 120);
}

/**
 * 在 Canvas 上绘制藏文行（支持自动换行）
 * 藏文以 tsek（་）为音节分隔符，换行时尽量在 tsek 处断开
 */
function drawTibetanLine(ctx, text, cx, startY, maxWidth, lineHeight) {
    var lines = wrapTibetanText(ctx, text, maxWidth);
    var y = startY;
    for (var i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], cx, y);
        y += lineHeight;
    }
}

/**
 * 在 Canvas 上绘制中文行（按字符换行）
 */
function drawChineseLine(ctx, text, cx, startY, maxWidth, lineHeight) {
    var lines = wrapChineseText(ctx, text, maxWidth);
    var y = startY;
    for (var i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], cx, y);
        y += lineHeight;
    }
}

/**
 * 藏文换行——尽量在 tsek（་）处断行
 */
function wrapTibetanText(ctx, text, maxWidth) {
    var lines = [];
    // 按 tsek 分割成音节组
    var segments = text.split('་');
    var currentLine = '';

    for (var i = 0; i < segments.length; i++) {
        var seg = segments[i];
        // 最后一个 segment 不加 tsek，前面的加回 tsek
        var testLine;
        if (i === segments.length - 1 && seg.length === 0) {
            // 原文字以 tsek 结尾的情况
            testLine = currentLine + '་';
        } else if (i < segments.length - 1) {
            testLine = currentLine + seg + '་';
        } else {
            testLine = currentLine + seg;
        }

        var metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = seg + (i < segments.length - 1 ? '་' : '');
        } else {
            currentLine = testLine;
        }
    }

    if (currentLine.length > 0) {
        lines.push(currentLine);
    }

    return lines;
}

/**
 * 中文换行——按字符逐个判断
 */
function wrapChineseText(ctx, text, maxWidth) {
    var lines = [];
    var currentLine = '';

    for (var i = 0; i < text.length; i++) {
        var testLine = currentLine + text.charAt(i);
        var metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = text.charAt(i);
        } else {
            currentLine = testLine;
        }
    }

    if (currentLine.length > 0) {
        lines.push(currentLine);
    }

    return lines;
}

// ==================== 5. 弹窗交互 ====================

/** 随机选一条语录并填入 */
function fillRandomQuote() {
    var idx = Math.floor(Math.random() * quotes.length);
    quoteSelect.value = idx;
    var q = quotes[idx];
    tibInput1.value = q.tib1;
    tibInput2.value = q.tib2;
    chnInput1.value = q.chn1;
    chnInput2.value = q.chn2;
    return idx;
}

/** 打开弹窗 —— 直接随机选一条语录、生成贺卡 */
function openModal() {
    var lang = (typeof currentLang !== 'undefined') ? currentLang : 'zh';
    modalTitle.innerHTML = (lang === 'zh') ? '📖 书本贺卡' : '📖 Book Card';

    // 重新填充下拉框
    populateQuoteSelect();

    // 随机选一条语录填入
    fillRandomQuote();

    // 直接绘制贺卡
    drawCard();

    // 只显示预览，隐藏编辑区和生成按钮
    editorArea.style.display = 'none';
    previewArea.style.display = 'block';
    generateBtn.style.display = 'none';

    // 显示弹窗
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

/** 关闭弹窗 */
function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
}

/** 切换语录 → 自动填入并重绘 */
function onQuoteSelected() {
    var idx = parseInt(quoteSelect.value);
    if (idx < 0 || idx >= quotes.length) return;

    var q = quotes[idx];
    tibInput1.value = q.tib1;
    tibInput2.value = q.tib2;
    chnInput1.value = q.chn1;
    chnInput2.value = q.chn2;

    // 自动重绘卡片
    drawCard();
}

/** 切换到自定义编辑模式 */
function switchToEdit() {
    editorArea.style.display = 'block';
    previewArea.style.display = 'none';
    generateBtn.style.display = 'flex';
    tibInput1.focus();
}

/** 生成贺卡（编辑模式下点击"生成贺卡"按钮） */
function generateCard() {
    var t1 = (tibInput1.value || '').trim();
    var t2 = (tibInput2.value || '').trim();
    var c1 = (chnInput1.value || '').trim();
    var c2 = (chnInput2.value || '').trim();

    if (!t1 && !t2 && !c1 && !c2) {
        tibInput1.style.borderColor = '#9b1b1b';
        setTimeout(function() { tibInput1.style.borderColor = ''; }, 1500);
        tibInput1.focus();
        return;
    }

    drawCard();
    editorArea.style.display = 'none';
    previewArea.style.display = 'block';
    generateBtn.style.display = 'none';
}

/** 下载 PNG */
function downloadCard() {
    if (canvas.toBlob) {
        canvas.toBlob(function(blob) {
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'book-card.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(function() {
                URL.revokeObjectURL(url);
            }, 1000);
        }, 'image/png');
    } else {
        var dataUrl = canvas.toDataURL('image/png');
        var a2 = document.createElement('a');
        a2.href = dataUrl;
        a2.download = 'book-card.png';
        document.body.appendChild(a2);
        a2.click();
        document.body.removeChild(a2);
    }
}

// ==================== 6. 实时预览（编辑模式输入时自动更新） ====================
var debounceTimer = null;
function onInputChange() {
    var t1 = (tibInput1.value || '').trim();
    var t2 = (tibInput2.value || '').trim();
    var c1 = (chnInput1.value || '').trim();
    var c2 = (chnInput2.value || '').trim();

    if (!t1 && !t2 && !c1 && !c2) return;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function() {
        drawCard();
        if (editorArea.style.display !== 'none') {
            editorArea.style.display = 'none';
            previewArea.style.display = 'block';
            generateBtn.style.display = 'none';
        }
    }, 400);
}

// ==================== 7. 事件绑定 ====================

// 打开弹窗按钮（主页卡片上那个"生成贺卡"按钮）
var openBtn = document.querySelector('.greeting-open-btn');
if (openBtn) {
    openBtn.addEventListener('click', function(e) {
        e.preventDefault();
        openModal();
    });
}

// 关闭弹窗
modalClose.addEventListener('click', closeModal);
modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

// 切换语录 → 自动更换卡片内容
quoteSelect.addEventListener('change', onQuoteSelected);

// "生成贺卡"按钮（编辑模式下才显示）
generateBtn.addEventListener('click', generateCard);

// 下载
downloadBtn.addEventListener('click', downloadCard);

// "自己写" → 切回编辑模式
regenerateBtn.addEventListener('click', switchToEdit);

// 编辑模式：四个输入框内容变化时实时预览
tibInput1.addEventListener('input', onInputChange);
tibInput2.addEventListener('input', onInputChange);
chnInput1.addEventListener('input', onInputChange);
chnInput2.addEventListener('input', onInputChange);

// Enter 快速生成
chnInput2.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateCard();
    }
});

// ==================== 8. ESC 关闭 ====================
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
    }
});

// ==================== 9. 语言切换时刷新 UI ====================
// 这个函数会被 main.js 的 switchLanguage 调用
window.refreshGreetingUI = function() {
    var lang = (typeof currentLang !== 'undefined') ? currentLang : 'zh';

    // 更新弹窗标题
    if (modalTitle) {
        modalTitle.innerHTML = (lang === 'zh') ? '📖 书本贺卡' : '📖 Book Card';
    }

    // 重新生成下拉框选项（语言变了）
    if (quoteSelect) {
        var prevVal = quoteSelect.value;
        populateQuoteSelect();
        quoteSelect.value = prevVal; // 恢复之前的选择
    }

    // 更新按钮文字
    if (generateBtn) {
        generateBtn.innerHTML = (lang === 'zh') ? '✨ 生成贺卡' : '✨ Generate Card';
    }
    if (downloadBtn) {
        downloadBtn.innerHTML = (lang === 'zh') ? '💾 下载保存' : '💾 Download';
    }
    if (regenerateBtn) {
        regenerateBtn.innerHTML = (lang === 'zh') ? '✏️ 自己写' : '✏️ Write My Own';
    }

    // 更新 placeholder
    if (tibInput1) tibInput1.placeholder = (lang === 'zh') ? '藏文第一行…' : 'Tibetan line 1…';
    if (tibInput2) tibInput2.placeholder = (lang === 'zh') ? '藏文第二行…' : 'Tibetan line 2…';
    if (chnInput1) chnInput1.placeholder = (lang === 'zh') ? '中文第一行…' : 'Chinese line 1…';
    if (chnInput2) chnInput2.placeholder = (lang === 'zh') ? '中文第二行…' : 'Chinese line 2…';
};

// ==================== 10. 初始化 ====================
populateQuoteSelect();
console.log('📖 极简书本贺卡生成器 — 已就绪');

})();
