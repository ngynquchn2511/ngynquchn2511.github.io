/* Hanh vi chung cua site: hien dan khi cuon, tab, phong to anh, ve lai so do */
(function () {
'use strict';
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Hien dan khi cuon toi
const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .12 });
// #all: hien ngay moi thu (dung khi in / chup man hinh)
const SHOW_ALL = REDUCE || location.hash === '#all';
document.querySelectorAll('.reveal').forEach(el => SHOW_ALL ? el.classList.add('in') : io.observe(el));

// Tab (tu ve lai so do trong tab vua mo)
document.querySelectorAll('[role="tablist"]').forEach(list => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const show = tab => {
        tabs.forEach(t => {
            const on = t === tab;
            t.setAttribute('aria-selected', on);
            t.tabIndex = on ? 0 : -1;
            document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
        });
        const svg = document.getElementById(tab.getAttribute('aria-controls')).querySelector('svg');
        if (svg && svg._sketch && !REDUCE) svg._sketch.replay();
    };
    tabs.forEach((t, i) => {
        t.addEventListener('click', () => show(t));
        t.addEventListener('keydown', ev => {
            const d = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
            if (d) { const n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); show(n); }
        });
    });
});

// Nut "Ve lai"
document.querySelectorAll('[data-replay]').forEach(b => b.addEventListener('click', () => {
    const svg = document.getElementById(b.dataset.replay);
    if (svg && svg._sketch) svg._sketch.replay();
}));

// Phong to anh
const lb = document.getElementById('lb');
if (lb) {
    const img = lb.querySelector('img'), cap = lb.querySelector('figcaption');
    document.querySelectorAll('[data-lb]').forEach(a => a.addEventListener('click', ev => {
        ev.preventDefault();
        img.src = a.getAttribute('href');
        img.alt = a.querySelector('img')?.alt || '';
        cap.textContent = a.querySelector('.cap')?.textContent || '';
        lb.classList.add('open');
    }));
    lb.addEventListener('click', () => lb.classList.remove('open'));
}
addEventListener('keydown', ev => {
    if (ev.key !== 'Escape') return;
    lb && lb.classList.remove('open');
    const dock = document.getElementById('dock');
    dock && dock.classList.remove('open');
});

// Thanh ty le test
const stack = document.getElementById('stack');
if (stack) {
    const fill = () => stack.querySelectorAll('i').forEach(i => { i.style.width = i.dataset.w + '%'; });
    if (SHOW_ALL) fill();
    else new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { fill(); o.disconnect(); } }, { threshold: .4 }).observe(stack);
}


// Muc luc bam theo: to sang muc dang doc
const toc = document.querySelector('.toc');
if (toc) {
    const links = [...toc.querySelectorAll('a[href^="#"]')];
    const spy = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(a => {
            const on = a.getAttribute('href') === '#' + e.target.id;
            a.classList.toggle('on', on);
            if (on) toc.scrollTo({ left: a.offsetLeft - toc.clientWidth / 2 + a.clientWidth / 2, behavior: REDUCE ? 'auto' : 'smooth' });
        });
    }), { rootMargin: '-35% 0px -60% 0px' });
    links.forEach(a => { const sec = document.querySelector(a.getAttribute('href')); if (sec) spy.observe(sec); });
}


// Nut len dau trang: hien khi da cuon xuong
const top = document.createElement('button');
top.className = 'totop';
top.type = 'button';
top.setAttribute('aria-label', 'Lên đầu trang');
top.title = 'Lên đầu trang';
top.innerHTML = '<i class="bi bi-arrow-up"></i>';
document.body.appendChild(top);
top.addEventListener('click', () => scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' }));
const onScroll = () => top.classList.toggle('show', scrollY > innerHeight * .8);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Dong menu sau khi chon (man hinh nho)
document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => document.querySelector('.nav').classList.remove('open')));
})();
