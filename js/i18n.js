/* ============================================================
   i18n.js — 中英文翻译表
   ============================================================ */

const translations = {
    // 导航
    'nav.logo':     { zh: 'DTJ',           en: 'DTJ' },
    'nav.home':     { zh: '首页',           en: 'Home' },
    'nav.about':    { zh: '关于我',         en: 'About' },
    'nav.tibetan':  { zh: '藏文文章',       en: 'Tibetan' },
    'nav.reading':  { zh: '读书笔记',       en: 'Readings' },
    'nav.code':     { zh: '代码作品',       en: 'Code' },
    'nav.guestbook':{ zh: '留言板',         en: 'Guestbook' },

    // 首页
    'hero.name':    { zh: '旦增塔杰',       en: 'Tenzin Tagye' },
    'hero.bio':     { zh: '像素与经幡之间，代码与雪山之下。', en: 'Between pixels and prayer flags, beneath code and snow mountains.' },

    // 代码作品
    'code.title':   { zh: '代码作品',       en: 'Code Works' },
    'code.desc':    { zh: '一些小项目，用代码连接藏文化与像素世界', en: 'Small projects connecting Tibetan culture with the pixel world' },
    'code.viewCode':{ zh: '查看代码',       en: 'View Code' },
    'code.viewRepo':{ zh: '项目仓库',       en: 'Repo' },
    'code.c3.title':{ zh: '藏文问候卡片',   en: 'Tibetan Greeting Card' },
    'code.c3.desc': { zh: '像素风格的电子贺卡，支持藏文祝福语，可以发给亲友。', en: 'A pixel e-card with Tibetan blessings to share with family and friends.' },
    'code.c4.title':{ zh: '藏文数字交互 · Targly Magic', en: 'Targly Magic · Tibetan AI' },
    'code.c4.desc': { zh: '藏文数字识别与交互网页，基于机器学习模型，探索藏文化与AI技术的结合。', en: 'Tibetan digit recognition & interaction. ML-powered — bridging Tibetan culture and AI.' },
    'code.viewDemo': { zh: '查看演示', en: 'Watch Demo' },
    'code.liveDemo': { zh: '在线体验', en: 'Live Demo' },

    // 读书笔记
    'reading.title':  { zh: '读书笔记',        en: 'Reading Notes' },
    'reading.desc':   { zh: '读过的书，走过的路', en: 'Books I have read, paths I have walked' },
    'reading.expand': { zh: '展开阅读',         en: 'Read More' },
    'reading.b1.quote': { zh: '在爱的窄门里，我们都是爱的朝圣者。', en: 'In the narrow gate of love, we are all pilgrims.' },
    'reading.b1.preview': { zh: '阿丽莎犹如朝拜者，一直在追求窄门，从而去远离或逃避现实世俗的欲望和束缚。但逃避并不是解决问题的办法——她所追求的窄门，应该是面对现实困境、看透之后为解脱的一道门。', en: 'Alissa is like a pilgrim, always seeking the narrow gate, escaping worldly desires. But escape solves nothing — the narrow gate she seeks should be a door to liberation found by facing reality head-on.' },
    'reading.b2.quote': { zh: '我来自拉萨，一座安静的城市，我觉得它很温暖。', en: 'I\'m from Lhasa, which is a quiet city, and I find it very cozy.' },
    'reading.b2.preview': { zh: '我很崇拜我的老师，他也是我的哥哥。他耐心又幽默，特别是教我英语的时候…', en: 'I\'m a big fan of my teacher, who is my brother. He is patient and humorous, especially when he teaches me English…' },

    // 关于我
    'about.title':  { zh: '关于我',         en: 'About Me' },
    'about.text':   { zh: '来自藏地的编程初学者。喜欢把代码和藏文化结合起来做有趣的东西。相信技术不只是冷冰冰的逻辑，也可以有温度、有故事。正在学习用 HTML、CSS 和 JavaScript 构建心中的世界。', en: 'A coding beginner from Tibet. I love combining code with Tibetan culture to make fun things. I believe technology is more than cold logic — it can have warmth and stories too. Currently learning to build the world in my heart with HTML, CSS, and JavaScript.' },
    'about.email':  { zh: '邮箱：等你补充',  en: 'Email: TBD' },
    'about.photo1': { zh: '舞蹈课 · 19岁',     en: 'Dance class, age 19' },
    'about.photo2': { zh: '和哥哥 · 江苏路',   en: 'With my brother, Jiangsu Rd' },
    'about.photo3': { zh: '小时候的我',        en: 'Me as a child' },
    'about.photo4': { zh: '大一 · 过林卡',     en: 'Freshman year, Lingka picnic' },

    // 藏文文章
    'tibetan.title':    { zh: '藏文文章',          en: 'Tibetan Writing' },
    'tibetan.desc':     { zh: '用母语思考，用母语写作', en: 'Think in my mother tongue, write in my mother tongue' },
    'tibetan.subtitle': { zh: '藏地僧人为何食肉',  en: 'Why Tibetan Monks Eat Meat' },

    // 留言板
    'guestbook.title':       { zh: '留言板',          en: 'Guestbook' },
    'guestbook.desc':        { zh: '说点什么吧，像素也会发光 ✨', en: 'Say something — even pixels can shine ✨' },
    'guestbook.namePlaceholder': { zh: '你的名字',    en: 'Your name' },
    'guestbook.msgPlaceholder':  { zh: '写下你想说的话…', en: 'Write something…' },
    'guestbook.submit':      { zh: '发送留言',        en: 'Send' },
    'guestbook.empty':       { zh: '还没有留言，来做第一个留下足迹的人吧 👣', en: 'No messages yet. Be the first to leave a footprint 👣' },
    'guestbook.deleted':     { zh: '留言已删除',      en: 'Deleted' },  // 暂未使用（GitHub Issues 不支持客户端删除）

    // 藏文贺卡
    'greeting.openEditor':  { zh: '生成贺卡',       en: 'Create Card' },
    'greeting.selectQuote': { zh: '— 选择宗萨钦哲仁波切语录 —', en: '— Select a Quote —' },
    'greeting.generate':    { zh: '生成贺卡',       en: 'Generate Card' },
    'greeting.download':    { zh: '下载保存',       en: 'Download' },
    'greeting.regenerate':  { zh: '自己写',         en: 'Write My Own' },

    // 页脚
    'footer.name':    { zh: '旦增塔杰',      en: 'Tenzin Tagye' },
    'footer.tagline': { zh: '用像素和经幡搭建', en: 'Built with pixels & prayer flags' },
    'footer.top':     { zh: '回到顶部',       en: 'Back to Top' },
};

/**
 * 获取翻译
 * @param {string} key - 翻译键
 * @param {string} lang - 'zh' 或 'en'
 * @returns {string}
 */
function t(key, lang) {
    if (translations[key] && translations[key][lang]) {
        return translations[key][lang];
    }
    console.warn('[i18n] 缺少翻译:', key, lang);
    return key;
}
