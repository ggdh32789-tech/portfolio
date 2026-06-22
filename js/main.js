/* ============================================================
   main.js — 所有交互逻辑
   0. 页面加载动画
   1. 语言切换
   2. 打字机效果
   3. 导航高亮 + 手机菜单
   4. 代码预览弹窗
   5. 文章阅读弹窗
   6. 留言板（giscus + GitHub Discussions）
   7. 音乐播放器
   8. 回到顶部
   ============================================================ */

// ==================== 0. 页面加载动画 ====================
(function initLoader() {
    const loader = document.getElementById('loader');
    const loaderMantra = document.getElementById('loaderMantra');
    const loaderBarFill = document.getElementById('loaderBarFill');
    const loaderPercent = document.getElementById('loaderPercent');
    const snowContainer = document.getElementById('loaderSnowflakes');

    // ===== 创建飘落雪花（像素小方块） =====
    function createSnowflakes(count) {
        for (let i = 0; i < count; i++) {
            const snow = document.createElement('div');
            snow.className = 'loader-snow';
            // 像素方块大小：2~5px
            const size = Math.floor(Math.random() * 4) + 2;
            snow.style.width = size + 'px';
            snow.style.height = size + 'px';
            // 水平随机位置
            snow.style.left = Math.random() * 100 + '%';
            // 随机飘落速度：2.5~5.5秒
            const dur = Math.random() * 3 + 2.5;
            snow.style.animationDuration = dur + 's';
            // 随机延迟，让雪花不是一起出发
            snow.style.animationDelay = Math.random() * 3 + 's';
            snowContainer.appendChild(snow);
        }
    }
    // 创建25片像素雪花
    createSnowflakes(25);

    // ===== 六字真言打字机效果 =====
    // 藏文六字真言：唵嘛呢叭咪吽
    const mantraSyllables = ['ཨོཾ', '་མ', '་ཎི', '་པ', '་དྨེ', '་ཧཱུྃ'];
    let mantraIndex = 0;

    function typeMantra() {
        if (mantraIndex < mantraSyllables.length) {
            // 创建当前音节
            const span = document.createElement('span');
            span.textContent = mantraSyllables[mantraIndex];
            span.className = 'mantra-pop';
            loaderMantra.appendChild(span);

            mantraIndex++;
            // 每个音节间隔 0.3~0.4 秒
            setTimeout(typeMantra, 350);
        }
    }
    // 稍微等一下再开始打字，让转经筒先转起来
    setTimeout(typeMantra, 500);

    // ===== 进度条动画 =====
    // 模拟加载进度：先快后慢，更像真实加载
    const progressSteps = [
        { t: 0,   v: 0 },
        { t: 300, v: 35 },   // 0.3秒到35%
        { t: 700, v: 58 },   // 0.7秒到58%
        { t: 1200, v: 75 },  // 1.2秒到75%
        { t: 1800, v: 88 },  // 1.8秒到88%
        { t: 2300, v: 97 },  // 2.3秒到97%
        { t: 2800, v: 100 }, // 2.8秒到100%
    ];

    let stepIndex = 0;
    const startTime = Date.now();

    function updateProgress() {
        const elapsed = Date.now() - startTime;
        const step = progressSteps[stepIndex];
        const nextStep = progressSteps[stepIndex + 1];

        if (!nextStep) {
            // 到达最后一步：100%
            loaderBarFill.style.width = '100%';
            loaderPercent.textContent = '100%';
            // 进度完成后，短暂停顿再淡出
            setTimeout(finishLoader, 400);
            return;
        }

        if (elapsed >= nextStep.t) {
            stepIndex++;
            updateProgress();
            return;
        }

        // 在当前步和下一步之间插值
        const tDiff = nextStep.t - step.t;
        const progress = (elapsed - step.t) / tDiff;
        const value = step.v + (nextStep.v - step.v) * progress;
        const intValue = Math.floor(value);

        loaderBarFill.style.width = intValue + '%';
        loaderPercent.textContent = intValue + '%';

        requestAnimationFrame(updateProgress);
    }

    // 加载期间禁止滚动，防止看到下面的内容
    document.body.style.overflow = 'hidden';

    // 转经筒先转一小会儿再开始进度条
    setTimeout(function() {
        requestAnimationFrame(updateProgress);
    }, 200);

    // ===== 结束加载：淡出 → 隐藏 → 删除 =====
    function finishLoader() {
        // 第一步：淡出
        loader.classList.add('fade-out');
        // 恢复页面滚动
        document.body.style.overflow = '';

        // 第二步：等淡出动画播完（0.6s），彻底移除
        setTimeout(function() {
            loader.classList.add('hidden');
            // 从DOM里彻底删掉，不影响后续使用
            if (loader.parentNode) {
                loader.parentNode.removeChild(loader);
            }
        }, 650);
    }

})();
// ==================== 加载动画结束 ====================

// ==================== 0.5 视频背景加载 ====================
(function initVideo() {
    var video = document.querySelector('.hero-video');
    if (!video) return;

    // 直接尝试播放（静音的，浏览器一般不会拦）
    var playPromise = video.play();
    if (playPromise !== undefined) {
        playPromise.catch(function() {
            // 自动播放被拦也不怕，CSS 已经设了封面图兜底
            console.log('📱 视频自动播放被拦，显示静态背景图');
        });
    }
})();

// ==================== 全局状态 ====================
let currentLang = localStorage.getItem('lang') || 'zh';

// ==================== 1. 语言切换 ====================
const langToggle = document.getElementById('langToggle');

function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    // 更新 data-i18n 元素
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        const key = el.getAttribute('data-i18n');
        const text = t(key, lang);
        if (text) el.textContent = text;
    });

    // 更新 placeholder 属性
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
        const key = el.getAttribute('data-i18n-placeholder');
        const text = t(key, lang);
        if (text) el.placeholder = text;
    });

    // 按钮高亮
    const zhEl = langToggle.querySelector('.lang-label-zh');
    const enEl = langToggle.querySelector('.lang-label-en');
    if (lang === 'zh') {
        zhEl.style.color = '#d4a843';
        enEl.style.color = '';
    } else {
        enEl.style.color = '#d4a843';
        zhEl.style.color = '';
    }

    // 更新 HTML lang
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

    // 重启打字机
    restartTyping();
}

langToggle.addEventListener('click', function() {
    switchLanguage(currentLang === 'zh' ? 'en' : 'zh');
});

// ==================== 2. 打字机效果 ====================
const typingText = document.getElementById('typingText');
const phrases = {
    zh: ['像素与代码之间', '经幡在风中飘扬', '代码也能有温度', '雪山下的程序员'],
    en: ['Between pixels & code', 'Prayer flags in wind', 'Code has warmth too', 'Coder under the snow'],
};
var typingTimer = null;  // var 会变量提升，避免 let 的暂时性死区
var phraseIdx = 0;

// 页面加载时应用语言（放在 typingTimer 声明之后）
switchLanguage(currentLang);

function typePhrase(text, done) {
    let i = 0;
    typingText.textContent = '';
    function step() {
        if (i < text.length) {
            typingText.textContent += text.charAt(i);
            i++;
            typingTimer = setTimeout(step, 75 + Math.random() * 35);
        } else if (done) {
            typingTimer = setTimeout(done, 2000);
        }
    }
    step();
}

function startTyping() {
    const list = phrases[currentLang] || phrases.zh;
    phraseIdx = phraseIdx % list.length;
    typePhrase(list[phraseIdx], function() {
        phraseIdx++;
        startTyping();
    });
}

function restartTyping() {
    clearTimeout(typingTimer);
    phraseIdx = 0;
    startTyping();
}
startTyping();

// ==================== 3. 导航 ====================
const sections = document.querySelectorAll('.section[id]');
const navLinksAll = document.querySelectorAll('.nav-links a');

function updateNav() {
    const sy = window.scrollY;
    let current = '';
    for (let sec of sections) {
        if (sy >= sec.offsetTop - 150) {
            current = sec.getAttribute('id');
        }
    }
    for (let link of navLinksAll) {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    }
}
window.addEventListener('scroll', updateNav);

// 手机菜单
const mobileBtn = document.getElementById('mobileBtn');
const navLinksEl = document.getElementById('navLinks');
mobileBtn.addEventListener('click', function() {
    navLinksEl.classList.toggle('show');
});
for (let link of navLinksAll) {
    link.addEventListener('click', function() {
        navLinksEl.classList.remove('show');
    });
}

// ==================== 4. 代码预览弹窗 ====================
const codeContents = {
    code3: {
        zh: `<!-- 藏文问候卡片 - 核心代码 -->
<div class="card">
    <h2>ཞུ་འཚམས་པོ།</h2>
    <p class="msg"></p>
    <canvas id="cc" width="200" height="80"></canvas>
</div>
<script>
    const blessings = [
        'བཀྲ་ཤིས་བདེ་ལེགས།',
        'སྐྱིད་པོ་ཡོང་བར་ཤོག',
        'ལས་དོན་ལམ་འགྲོ་ཡོང་བར་ཤོག',
    ];
    function randomBlessing() {
        const i = Math.floor(Math.random() * blessings.length);
        document.querySelector('.msg').textContent = blessings[i];
    }
    function drawFrame() {
        const c = document.getElementById('cc');
        const ctx = c.getContext('2d');
        const px = 4;
        ctx.fillStyle = '#9b1b1b';
        for (let x = 0; x < 200; x += px) {
            ctx.fillRect(x, 0, px, px);
            ctx.fillRect(x, 76, px, px);
        }
        for (let y = 0; y < 80; y += px) {
            ctx.fillRect(0, y, px, px);
            ctx.fillRect(196, y, px, px);
        }
    }
    randomBlessing();
    drawFrame();
</script>`,
        en: `<!-- Tibetan Greeting Card - Core Code -->
<div class="card">
    <h2>Tashi Delek!</h2>
    <p class="msg"></p>
    <canvas id="cc" width="200" height="80"></canvas>
</div>
<script>
    const blessings = [
        'Tashi Delek!',
        'May you be happy!',
        'Wish you success!',
    ];
    function randomBlessing() {
        const i = Math.floor(Math.random() * blessings.length);
        document.querySelector('.msg').textContent = blessings[i];
    }
    function drawFrame() {
        const c = document.getElementById('cc');
        const ctx = c.getContext('2d');
        const px = 4;
        ctx.fillStyle = '#9b1b1b';
        for (let x = 0; x < 200; x += px) {
            ctx.fillRect(x, 0, px, px);
            ctx.fillRect(x, 76, px, px);
        }
        for (let y = 0; y < 80; y += px) {
            ctx.fillRect(0, y, px, px);
            ctx.fillRect(196, y, px, px);
        }
    }
    randomBlessing();
    drawFrame();
</script>`
    }
};

const codeModal = document.getElementById('codeModal');
const codeModalTitle = document.getElementById('codeModalTitle');
const codeModalCode = document.getElementById('codeModalCode');
const codeModalClose = document.getElementById('codeModalClose');

function openCodeModal(codeId) {
    const content = codeContents[codeId];
    if (!content) return;
    const code = content[currentLang] || content.zh;

    codeModalTitle.textContent = currentLang === 'zh' ? '📁 代码预览' : '📁 Code Preview';
    codeModalCode.textContent = code;
    codeModalCode.className = 'language-html';

    if (typeof hljs !== 'undefined') {
        hljs.highlightElement(codeModalCode);
    }

    codeModal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCodeModal() {
    codeModal.classList.remove('open');
    document.body.style.overflow = '';
}

// 所有"查看代码"按钮
document.querySelectorAll('.preview-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        openCodeModal(this.getAttribute('data-code'));
    });
});

codeModalClose.addEventListener('click', closeCodeModal);
codeModal.querySelector('.modal-backdrop').addEventListener('click', closeCodeModal);

// ==================== 4.5 视频演示弹窗 ====================
var videoModal = document.getElementById('videoModal');
var videoModalTitle = document.getElementById('videoModalTitle');
var videoPlayer = document.getElementById('videoPlayer');
var videoModalClose = document.getElementById('videoModalClose');

// 视频文件路径（根据 data-video 属性映射）
var videoSources = {
    'targly-magic': 'images/599effa6bb95d55dbada79a72f3ff4ed.mp4'
};

/** 打开视频弹窗 */
function openVideoModal(videoKey) {
    // 检查关键元素是否存在
    if (!videoModal || !videoPlayer) {
        console.error('[视频弹窗] 找不到 videoModal 或 videoPlayer 元素');
        return;
    }
    var src = videoSources[videoKey];
    if (!src) {
        console.warn('[视频弹窗] 没有找到视频:', videoKey);
        return;
    }
    // 直接用 src 属性设置视频源（比 source 元素更可靠）
    videoPlayer.src = src;
    // 设置标题
    if (videoModalTitle) {
        videoModalTitle.textContent = currentLang === 'zh' ? '🎬 演示视频' : '🎬 Demo Video';
    }
    // 显示弹窗
    videoModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    // 开始播放
    videoPlayer.load();
    videoPlayer.play().catch(function(e) {
        console.warn('[视频弹窗] 自动播放失败，需要用户手动点击播放:', e.message);
    });
}

/** 关闭视频弹窗 */
function closeVideoModal() {
    if (!videoModal) return;
    videoModal.classList.remove('open');
    document.body.style.overflow = '';
    if (videoPlayer) {
        videoPlayer.pause();
        videoPlayer.src = '';
    }
}

// 所有"查看演示"按钮 — 等 DOM 加载完再绑定
function bindVideoButtons() {
    var btns = document.querySelectorAll('.video-btn');
    console.log('[视频弹窗] 找到 ' + btns.length + ' 个视频按钮');
    btns.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            console.log('[视频弹窗] 按钮被点击了');
            openVideoModal(this.getAttribute('data-video'));
        });
    });
}

// 页面 DOM 已经解析完毕（script 在 body 末尾），直接绑定
bindVideoButtons();

if (videoModalClose) {
    videoModalClose.addEventListener('click', closeVideoModal);
}
if (videoModal) {
    var backdrop = videoModal.querySelector('.modal-backdrop');
    if (backdrop) {
        backdrop.addEventListener('click', closeVideoModal);
    }
}

// ==================== 5. 文章阅读弹窗 ====================
const articleContents = {
    // 《窄门》读书笔记
    book1: {
        zh: `<h3>📖 《窄门》— 纪德</h3>
<p><em>关于信仰、爱与逃避</em></p>

<h3>一面镜子</h3>

<p>关于《窄门》，我感觉它像一面镜子——不同的人看，会看到不一样的东西。</p>

<p>有人觉得阿丽莎近乎变态的精神洁癖；有人看她是一个追求纯粹圆满的修行者；也有人觉得她只是一个喜欢追求幻想的受虐者。</p>

<h3>我的理解</h3>

<p>在爱的窄门里，我们都是爱的朝圣者。阿丽莎犹如朝拜者，一直在追求窄门，从而去远离或逃避现实世俗的欲望和束缚。</p>

<p>但是——我觉得逃避并不是解决问题的办法。</p>

<blockquote>她所追求的窄门，应该是面对现实困境、看透之后为解脱的一道门。而偏执的折磨，更像是形式主义的苦行僧，没有去真正思考所追求的纯粹。</blockquote>

<h3>那颗种子</h3>

<p>最后在阿丽莎的影响下，杰罗姆的后续人生里种下了一颗种子——他也在寻找他的窄门。</p>

<p>他说：<em>"靠近你就靠近了痛苦，远离你就远离了幸福。"</em></p>

<p>现在阿丽莎已经走了，失去了坐标。他能找到属于他的窄门吗？谁也不知道。</p>

<p>看到这里，我本以为这本书是围绕着绝对主义——绝对的神性、圆满——来展开剧情，但最后却埋下谜题，让我们想象。</p>

<blockquote>佛说自空，道说自知，上帝说窄门。</blockquote>`,
        en: `<h3>📖 "Strait Is the Gate" — André Gide</h3>
<p><em>On faith, love, and escape</em></p>

<h3>A Mirror</h3>

<p>About this book — I feel it's like a mirror. Different people see different things in it.</p>

<p>Some see Alissa as having an almost pathological obsession with purity. Others see a spiritual practitioner seeking absolute perfection. Still others see someone in love with chasing a fantasy.</p>

<h3>My Understanding</h3>

<p>In the narrow gate of love, we are all pilgrims. Alissa, like a pilgrim, keeps pursuing the narrow gate — using it to escape the desires and constraints of the mundane world.</p>

<p>But — I don't think escape is the answer.</p>

<blockquote>The narrow gate she seeks should be a door to liberation — found by facing reality's hardships and seeing through them. Her obsessive self-torment feels more like the formalism of an ascetic, never truly contemplating the purity she claims to pursue.</blockquote>

<h3>The Seed</h3>

<p>Under Alissa's influence, a seed is planted in Jérôme's life — he too begins searching for his narrow gate.</p>

<p>He says: <em>"To come close to you is to come close to pain. To stay away from you is to stay away from happiness."</em></p>

<p>Alissa is gone now. He's lost his coordinates. Will he find his narrow gate? No one knows.</p>

<p>I thought this book would revolve around absolutism — absolute divinity, absolute perfection. But it ends with a question mark, leaving us to imagine.</p>

<blockquote>The Buddha says emptiness. The Tao says self-knowing. God says the narrow gate.</blockquote>`
    },
    // 《霍乱时期的爱情》读书笔记
    book2: {
        zh: `<h3>💔 《霍乱时期的爱情》— 马尔克斯</h3>
<p><em>关于爱情的千百种形态</em></p>

<h3>被掏空的感觉</h3>

<p>看完真的感觉被掏空——一种深深的无力感。人和人的感情太复杂了。</p>

<p>当我们无法用亲情、友情来概括两个人之间的感情的时候，就把它丢到爱情这个框子里。我们既把爱情奉上神坛，但又把它踩在脚下。</p>

<blockquote>爱的形态是千变万化的——稳定的、激情的、放荡的、妥协的……</blockquote>

<h3>两个震撼的瞬间</h3>

<p>当出轨的医生在临死前说出<em>"只有上帝知道我有多爱你"</em>——</p>

<p>当阿里萨与600多位女士发生关系，但面对费尔明娜仍能发自内心说出<em>"我为你保住了童贞"</em>——</p>

<p>难道这不是爱吗？</p>

<h3>爱情是什么</h3>

<p>安全感、和谐与幸福——这些东西一旦相加，或许看似爱情，也几乎等于爱情。但它们终究不是爱情。</p>

<p>爱情与幸福有必然的关系吗？不一定。</p>

<blockquote>但我确定的是：当我们用各种条条框框来定义爱情的时候，那才是对爱情真正的亵渎。</blockquote>

<h3>最后的领悟</h3>

<p>看完这本书我才真正觉得——男人普遍是爱欲分离，渴厌一体；而女人是爱欲一体，渴厌分离。</p>`,
        en: `<h3>💔 "Love in the Time of Cholera" — Márquez</h3>
<p><em>On the thousand forms of love</em></p>

<h3>Emptied Out</h3>

<p>After finishing this book, I felt completely emptied — a deep sense of powerlessness. Human emotions are just too complex.</p>

<p>When we can't describe what's between two people as family or friendship, we throw it into the box called "love." We worship love and trample it at the same time.</p>

<blockquote>Love takes a thousand forms — stable, passionate, debauched, compromised…</blockquote>

<h3>Two Unforgettable Moments</h3>

<p>When the cheating doctor says on his deathbed: <em>"Only God knows how much I loved you"</em> —</p>

<p>When Ariza, after sleeping with over 600 women, still says to Fermina from the heart: <em>"I kept my virginity for you"</em> —</p>

<p>Is that not love?</p>

<h3>What Is Love?</h3>

<p>Security, harmony, and happiness — add them together, and they may look like love, almost equal love. But they are ultimately not love.</p>

<p>Is there a necessary connection between love and happiness? Not necessarily.</p>

<blockquote>But I am certain of this: when we use rules and checkboxes to define love — that is the true desecration of love.</blockquote>

<h3>A Final Realization</h3>

<p>After reading this book, I've come to think — men generally separate love from desire, their thirst and disgust are one; while women unite love and desire, their thirst and disgust are apart.</p>`
    }
};

const articleModal = document.getElementById('articleModal');
const articleModalTitle = document.getElementById('articleModalTitle');
const articleModalBody = document.getElementById('articleModalBody');
const articleModalClose = document.getElementById('articleModalClose');

function openArticleModal(id) {
    const content = articleContents[id];
    if (!content) return;
    const html = content[currentLang] || content.zh;
    const m = html.match(/<h3>[^<]+<\/h3>/);
    if (m) articleModalTitle.innerHTML = m[0];
    articleModalBody.innerHTML = html;
    articleModal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeArticleModal() {
    articleModal.classList.remove('open');
    document.body.style.overflow = '';
}

document.querySelectorAll('.read-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        openArticleModal(this.getAttribute('data-article'));
    });
});

articleModalClose.addEventListener('click', closeArticleModal);
articleModal.querySelector('.modal-backdrop').addEventListener('click', closeArticleModal);

// ==================== 6. 留言板（Firebase REST API） ====================
// 直接用 REST API，不依赖 Firebase SDK
var GB_API_KEY = 'AIzaSyB_k_tNTjOQc2Ek8BeICcCvPiMF-JXh2NQ';
var GB_BASE = 'https://firestore.googleapis.com/v1/projects/dtj-portfolio/databases/(default)/documents/guestbook';

var gbName = document.getElementById('gbName');
var gbMessage = document.getElementById('gbMessage');
var gbSubmit = document.getElementById('gbSubmit');
var gbList = document.getElementById('gbList');
var gbEmpty = document.getElementById('gbEmpty');
var gbLoading = document.getElementById('gbLoading');
var gbCharCount = document.getElementById('gbCharCount');

/** 从 Firestore 加载留言 */
function loadMessages() {
    if (!gbLoading) return;
    gbLoading.style.display = 'block';
    gbList.innerHTML = '';
    gbEmpty.style.display = 'none';

    fetch(GB_BASE + '?key=' + GB_API_KEY)
        .then(function(res) { return res.json(); })
        .then(function(data) {
            gbLoading.style.display = 'none';
            var docs = data.documents || [];
            if (docs.length === 0) {
                gbEmpty.style.display = 'block';
                return;
            }
            gbEmpty.style.display = 'none';

            // 按时间倒序排列
            docs.sort(function(a, b) {
                var ta = a.fields.time ? a.fields.time.timestampValue : a.createTime;
                var tb = b.fields.time ? b.fields.time.timestampValue : b.createTime;
                return tb.localeCompare(ta);
            });

            docs.forEach(function(doc) {
                var f = doc.fields;
                var name = (f.name && f.name.stringValue) || '匿名';
                var text = (f.text && f.text.stringValue) || '';
                var timeVal = (f.time && f.time.timestampValue) || doc.createTime;

                var d = new Date(timeVal);
                var timeStr = d.toLocaleString(
                    currentLang === 'zh' ? 'zh-CN' : 'en-US',
                    { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                );

                var item = document.createElement('div');
                item.className = 'gb-item';
                item.innerHTML =
                    '<div class="gb-item-header">' +
                        '<span class="gb-item-name">' + escapeHTML(name) + '</span>' +
                        '<span class="gb-item-time">' + timeStr + '</span>' +
                    '</div>' +
                    '<div class="gb-item-text">' + escapeHTML(text) + '</div>';
                gbList.appendChild(item);
            });
        })
        .catch(function(err) {
            gbLoading.style.display = 'none';
            console.error('[留言板] 加载失败:', err);
            gbEmpty.style.display = 'block';
            gbEmpty.querySelector('p').textContent =
                (currentLang === 'zh' ? '加载失败，请刷新重试 😢' : 'Failed to load, please refresh 😢');
        });
}

/** 转义 HTML */
function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/** 提交留言 */
function submitMessage() {
    var name = gbName.value.trim();
    var text = gbMessage.value.trim();

    if (!name) {
        gbName.focus();
        gbName.style.borderColor = '#9b1b1b';
        setTimeout(function() { gbName.style.borderColor = ''; }, 1500);
        return;
    }
    if (!text) {
        gbMessage.focus();
        gbMessage.style.borderColor = '#9b1b1b';
        setTimeout(function() { gbMessage.style.borderColor = ''; }, 1500);
        return;
    }

    gbSubmit.disabled = true;
    gbSubmit.textContent = '...';

    var body = JSON.stringify({
        fields: {
            name: { stringValue: name },
            text: { stringValue: text },
            time: { timestampValue: new Date().toISOString() }
        }
    });

    fetch(GB_BASE + '?key=' + GB_API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body
    })
    .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        // 清空表单
        gbName.value = '';
        gbMessage.value = '';
        gbCharCount.textContent = '0';
        // 刷新列表
        loadMessages();
        // 恢复按钮
        gbSubmit.disabled = false;
        gbSubmit.innerHTML = '<span data-i18n="guestbook.submit">' +
            t('guestbook.submit', currentLang) + '</span> ✉️';
    })
    .catch(function(err) {
        console.error('[留言板] 提交失败:', err);
        alert(currentLang === 'zh'
            ? '发送失败，请检查网络后重试 😢'
            : 'Failed to send. Check your connection and retry 😢');
        gbSubmit.disabled = false;
        gbSubmit.innerHTML = '<span data-i18n="guestbook.submit">' +
            t('guestbook.submit', currentLang) + '</span> ✉️';
    });
}

// 字符计数
gbMessage.addEventListener('input', function() {
    var len = this.value.length;
    gbCharCount.textContent = len;
    gbCharCount.style.color = len > 450 ? '#9b1b1b' : '';
});

// 提交按钮
gbSubmit.addEventListener('click', submitMessage);

// Ctrl+Enter 提交
gbMessage.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        submitMessage();
    }
});

// 初始加载
loadMessages();

// ==================== 7. 背景音乐播放器 ====================
const musicToggle = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');
const musicHint = document.getElementById('musicHint');

// 国际化提示文字
var musicLabels = {
    zh: { play: '🎵 BGM', playing: '🎶 播放中…', paused: '⏸ 已暂停', loading: '🎵 加载中…' },
    en: { play: '🎵 BGM', playing: '🎶 Playing…', paused: '⏸ Paused', loading: '🎵 Loading…' }
};

function updateMusicUI() {
    var labels = musicLabels[currentLang] || musicLabels.zh;
    if (bgMusic.paused) {
        musicToggle.classList.remove('playing');
        musicHint.classList.remove('playing');
        musicToggle.title = currentLang === 'zh' ? '暂停背景音乐' : 'Pause BGM';
        musicHint.textContent = bgMusic.currentTime > 0 ? labels.paused : labels.play;
    } else {
        musicToggle.classList.add('playing');
        musicHint.classList.add('playing');
        musicToggle.title = currentLang === 'zh' ? '暂停背景音乐' : 'Pause BGM';
        musicHint.textContent = labels.playing;
    }
}

/** 开始播放（带失败重试） */
function startBGM() {
    var labels = musicLabels[currentLang] || musicLabels.zh;
    musicHint.textContent = labels.loading;
    bgMusic.play().then(function() {
        updateMusicUI();
        console.log('[BGM] ✅ 背景音乐开始播放');
    }).catch(function(e) {
        console.warn('[BGM] 自动播放被浏览器拦截，等用户点一下屏幕:', e.message);
        musicHint.textContent = labels.play;
    });
}

// 按钮点击：手动切换播放/暂停
musicToggle.addEventListener('click', function() {
    if (bgMusic.paused) {
        startBGM();
    } else {
        bgMusic.pause();
        updateMusicUI();
    }
});

// 尝试自动播放（loading 动画结束后）
window.addEventListener('load', function() {
    // 推迟 500ms，等 loading 动画完全结束
    setTimeout(function() {
        startBGM();
    }, 500);
});

// 如果自动播放被拦，用户第一次点击页面任意位置就播
document.addEventListener('click', function tryAutoPlay() {
    if (bgMusic.paused && bgMusic.currentTime === 0) {
        startBGM();
    }
}, { once: false }); // 不设 once，每次点击都检查，直到播起来

// 初始化 UI
updateMusicUI();
document.querySelector('.music-icon').style.transition = 'transform 0.3s';

// ==================== 8. 回到顶部 ====================
const backTop = document.getElementById('backTop');
window.addEventListener('scroll', function() {
    if (window.scrollY > 600) {
        backTop.style.opacity = '1';
        backTop.style.pointerEvents = 'auto';
    } else {
        backTop.style.opacity = '0';
        backTop.style.pointerEvents = 'none';
    }
});
backTop.style.opacity = '0';
backTop.style.pointerEvents = 'none';
backTop.style.transition = 'opacity 0.3s';
backTop.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ==================== 9. ESC 关闭弹窗 ====================
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (codeModal.classList.contains('open')) closeCodeModal();
        if (articleModal.classList.contains('open')) closeArticleModal();
        if (videoModal.classList.contains('open')) closeVideoModal();
    }
});

console.log('🏔️ 旦增塔杰的 Portfolio — 加载完成！');
console.log('💡 试试：切换语言 / 播放音乐 / 留言板留个言~');
console.log('☁️ 留言存储在云端，所有人可见');
