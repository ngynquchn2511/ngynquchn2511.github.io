/* =====================================================================
   Sketch — so do SVG phong cach "ve tay" tu ve trong ~2 giay khi cuon toi.
   Dung chung cho moi so do tren site:
     const d = Sketch(svg, { w, h, panel });
     d.node('id', { x, y, w, h, shape, t, s, info });   // x, y la TAM cua khoi
     d.edge({ from, to, pts, k, lb, lp });               // thu tu goi = thu tu ve
     d.mount();
   ===================================================================== */
(function (global) {
'use strict';

const NS = 'http://www.w3.org/2000/svg';
const DRAW_MS = 2000;
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

const el = (tag, attrs = {}, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
};
const clamp = v => Math.max(0, Math.min(1, v));
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ---------- Hinh ve tay (nhieu co dinh theo seed -> lan nao tai trang cung giong nhau) ---------- */
function rng(seed) {
    let s = seed;
    return a => { s = (s * 16807) % 2147483647; return (s / 2147483647 - .5) * 2 * a; };
}
function roughRect(j, x, y, w, h, r, J = 1.3) {
    r = Math.min(r, h / 2, w / 2);
    return `M${x + r},${y + j(.5)} Q${x + w / 2},${y + j(J)} ${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r}`
        + ` Q${x + w + j(J)},${y + h / 2} ${x + w},${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h}`
        + ` Q${x + w / 2},${y + h + j(J)} ${x + r},${y + h} Q${x},${y + h} ${x},${y + h - r}`
        + ` Q${x + j(J)},${y + h / 2} ${x},${y + r} Q${x},${y} ${x + r + 3},${y + j(.7)}`;
}
function roughDiamond(j, cx, cy, w, h, J = 1.5) {
    const t = [cx, cy - h / 2], r = [cx + w / 2, cy], b = [cx, cy + h / 2], l = [cx - w / 2, cy];
    const mid = (p, q) => `${(p[0] + q[0]) / 2 + j(J)},${(p[1] + q[1]) / 2 + j(J)}`;
    return `M${t} Q${mid(t, r)} ${r} Q${mid(r, b)} ${b} Q${mid(b, l)} ${l} Q${mid(l, t)} ${t[0] + 2},${t[1] + 1}`;
}
const ellipse = (cx, cy, rx, ry) => `M${cx - rx},${cy} A${rx},${ry} 0 1 1 ${cx + rx},${cy} A${rx},${ry} 0 1 1 ${cx - rx},${cy}`;
function cylinder(x, y, w, h) {
    const e = Math.min(10, h / 6);
    return {
        body: `M${x},${y + e} A${w / 2},${e} 0 0 1 ${x + w},${y + e} L${x + w},${y + h - e} A${w / 2},${e} 0 0 1 ${x},${y + h - e} Z`,
        extra: `M${x},${y + e} A${w / 2},${e} 0 0 0 ${x + w},${y + e}`,
    };
}
// Duong gap khuc, bo tron goc (doan cheo van ve thang)
function polyPath(pts) {
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i++) {
        const [px, py] = pts[i - 1], [x, y] = pts[i], [nx, ny] = pts[i + 1];
        const l1 = Math.hypot(x - px, y - py), l2 = Math.hypot(nx - x, ny - y);
        const r = Math.min(10, l1 / 2, l2 / 2);
        if (!l1 || !l2) continue;
        d += ` L${x - (x - px) / l1 * r},${y - (y - py) / l1 * r} Q${x},${y} ${x + (nx - x) / l2 * r},${y + (ny - y) / l2 * r}`;
    }
    const last = pts[pts.length - 1];
    return d + ` L${last[0]},${last[1]}`;
}
// Khoi chu nhieu dong, can giua theo chieu doc quanh y
function textBlock(g, text, x, y, cls, anchor = 'middle', lh = 16) {
    const lines = String(text).split('\n');
    const y0 = y - (lines.length - 1) * lh / 2;
    lines.forEach((ln, i) => {
        const t = el('text', { x, y: y0 + i * lh, class: cls, 'text-anchor': anchor, 'dominant-baseline': 'central' }, g);
        t.textContent = ln;
    });
    return lines.length;
}

const DASHED = { dash: 1, ret: 1, life: 1, async: 1 };
const ARROW = { flow: 1, dash: 1, err: 1, ret: 1, async: 1 };

/* ---------- Mot so do ---------- */
function Sketch(svg, opt) {
    const W = opt.w, H = opt.h;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.classList.add('sk');
    const j = rng(opt.seed || 20230221);
    const uid = 'sk' + Math.random().toString(36).slice(2, 7);
    const defs = el('defs', {}, svg);
    const gBack = el('g', {}, svg), gEdge = el('g', {}, svg), gNode = el('g', {}, svg);
    const N = {}, items = [];
    let stepNo = 0;

    const api = {
        N,
        A(id, side, f = .5) {
            const n = N[id];
            if (n.shape === 'actor') {
                if (side === 't') return [n.x, n.y - 44];
                if (side === 'b') return [n.x, n.y + 50 + n.lines * 15];
                return [n.x + (side === 'l' ? -24 : 24), n.y];
            }
            const x0 = n.x - n.w / 2, y0 = n.y - n.h / 2;
            if (side === 't') return [x0 + n.w * f, y0];
            if (side === 'b') return [x0 + n.w * f, y0 + n.h];
            if (side === 'l') return [x0, y0 + n.h * f];
            return [x0 + n.w, y0 + n.h * f];
        },
        lane(x, w, title, opts = {}) {
            const g = el('g', { opacity: 0 }, gBack);
            const top = opts.top ?? 0, hh = opts.hh ?? 40;
            el('rect', { x, y: top, width: w, height: H - top - (opts.bottom ?? 0), class: 'sk-lane ' + (opts.alt ? 'alt' : '') }, g);
            el('line', { x1: x, y1: top, x2: x, y2: H - (opts.bottom ?? 0), class: 'sk-lane-sep' }, g);
            if (opts.last) el('line', { x1: x + w, y1: top, x2: x + w, y2: H - (opts.bottom ?? 0), class: 'sk-lane-sep' }, g);
            const pw = Math.min(w - 24, Math.max(190, String(title).length * 10 + 36)), px = x + (w - pw) / 2;
            el('rect', { x: px + 4, y: top + 10 + 4, width: pw, height: hh - 8, rx: 9, class: 'sk-pill-sh' }, g);
            el('rect', { x: px, y: top + 10, width: pw, height: hh - 8, rx: 9, class: 'sk-pill' }, g);
            textBlock(g, title, x + w / 2, top + 10 + (hh - 8) / 2, 'sk-lane-t');
            items.push({ kind: 'lane', g });
        },
        node(id, o) {
            const n = Object.assign({ id, shape: 'rect', w: 160, h: 50 }, o);
            if (n.shape === 'start') n.w = n.h = 24;
            if (n.shape === 'end') n.w = n.h = 30;
            if (['evStart', 'evEnd', 'evTimer'].includes(n.shape)) n.w = n.h = 34;
            if (n.shape === 'gw') n.w = n.h = 54;
            N[id] = n;
            n.lines = n.t ? String(n.t).split('\n').length : 1;
            items.push({ kind: 'node', n });
            return n;
        },
        edge(o) {
            // Canh co the khai bao truoc khi khoi dich ton tai -> tinh duong di luc mount
            const e = Object.assign({ k: 'flow' }, o);
            items.push({ kind: 'edge', e });
            return e;
        },
        text(x, y, str, cls = 'sk-note-t', anchor = 'middle') {
            const g = el('g', { opacity: 0 }, gBack);
            textBlock(g, str, x, y, cls, anchor, 17);
            items.push({ kind: 'lane', g });
        },
        mount,
        replay() { reset(); S.started = true; S.playing = true; },
        showAll() { finish(); },
    };

    /* ----- Dung DOM cho tung khoi ----- */
    function buildNode(n) {
        const x0 = n.x - n.w / 2, y0 = n.y - n.h / 2;
        const g = el('g', { class: `sk-node s-${n.shape} ${n.cls || ''}`, 'data-id': n.id }, n.shape === 'box' ? gBack : gNode);
        let body, sh = null, extras = [];
        switch (n.shape) {
            case 'diamond':
                body = roughDiamond(j, n.x, n.y, n.w, n.h); sh = roughDiamond(() => 0, n.x + 4, n.y + 4, n.w, n.h); break;
            case 'cyl': {
                const c = cylinder(x0, y0, n.w, n.h); body = c.body; extras.push(c.extra); sh = cylinder(x0 + 4, y0 + 4, n.w, n.h).body; break;
            }
            case 'start': body = ellipse(n.x, n.y, 12, 12); break;
            // Ky hieu BPMN
            case 'evStart': case 'evEnd': body = ellipse(n.x, n.y, 16, 16); break;
            case 'evTimer':
                body = ellipse(n.x, n.y, 16, 16);
                extras.push(ellipse(n.x, n.y, 12, 12), `M${n.x},${n.y - 8} L${n.x},${n.y} L${n.x + 6},${n.y + 3}`); break;
            case 'gw':
                body = roughDiamond(j, n.x, n.y, n.w, n.h, .8); sh = roughDiamond(() => 0, n.x + 4, n.y + 4, n.w, n.h);
                extras.push(`M${n.x - 9},${n.y - 9} L${n.x + 9},${n.y + 9} M${n.x + 9},${n.y - 9} L${n.x - 9},${n.y + 9}`); break;
            case 'end': body = ellipse(n.x, n.y, 15, 15); break;
            case 'ellipse': body = ellipse(n.x, n.y, n.w / 2, n.h / 2); sh = ellipse(n.x + 4, n.y + 4, n.w / 2, n.h / 2); break;
            case 'actor': {
                const x = n.x, y = n.y;
                body = ellipse(x, y - 30, 10, 10) + ` M${x},${y - 20} L${x},${y + 12} M${x - 18},${y - 8} L${x + 18},${y - 8} M${x},${y + 12} L${x - 14},${y + 36} M${x},${y + 12} L${x + 14},${y + 36}`;
                break;
            }
            case 'bar': body = `M${x0},${y0} H${x0 + n.w} V${y0 + n.h} H${x0} Z`; break;
            case 'fork': body = `M${x0},${n.y} H${x0 + n.w}`; break;
            case 'table':
                body = roughRect(j, x0, y0, n.w, n.h, 5, .8); sh = roughRect(() => 0, x0 + 4, y0 + 4, n.w, n.h, 5);
                extras.push(`M${x0},${y0 + 26} H${x0 + n.w}`); break;
            case 'note':
                body = roughRect(j, x0, y0, n.w, n.h, 4, .8);
                extras.push(`M${x0 + n.w - 14},${y0} V${y0 + 12} H${x0 + n.w}`); break;
            default: {
                const r = { pill: 26, round: 14, head: 8, box: 18 }[n.shape] ?? 8;
                body = roughRect(j, x0, y0, n.w, n.h, r, n.shape === 'box' ? 2 : 1.3);
                if (n.shape !== 'box') sh = roughRect(() => 0, x0 + 4, y0 + 4, n.w, n.h, r);
            }
        }
        n.g = g;
        n.sh = sh ? el('path', { d: sh, class: 'sk-sh', opacity: 0 }, g) : null;
        if (n.shape === 'table') n.hdr = el('path', { d: `M${x0 + 1},${y0 + 26} V${y0 + 6} Q${x0 + 1},${y0 + 1} ${x0 + 6},${y0 + 1} H${x0 + n.w - 6} Q${x0 + n.w - 1},${y0 + 1} ${x0 + n.w - 1},${y0 + 6} V${y0 + 26} Z`, class: 'sk-thead', opacity: 0 }, g);
        n.body = el('path', { d: body, class: 'sk-body', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1, 'fill-opacity': 0 }, g);
        n.extras = extras.map(d => el('path', { d, class: 'sk-extra', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 }, g));
        if (n.shape === 'end') n.dot = el('circle', { cx: n.x, cy: n.y, r: 0, class: 'sk-dot' }, g);
        const tg = el('g', { class: 'sk-tx', opacity: 0 }, g);
        if (n.shape === 'table') {
            textBlock(tg, n.t, n.x, y0 + 13, 'sk-th');
            (n.rows || []).forEach((r, i) => {
                const t = el('text', { x: x0 + 10, y: y0 + 26 + 13 + i * 16, class: 'sk-tr' + (r.startsWith('PK') ? ' pk' : r.startsWith('FK') ? ' fk' : ''), 'dominant-baseline': 'central' }, tg);
                t.textContent = r;
            });
        } else if (n.shape === 'box') {
            textBlock(tg, n.t, x0 + 16, y0 + 20, 'sk-box-t', 'start');
        } else if (['evStart', 'evEnd', 'evTimer', 'gw'].includes(n.shape)) {
            const ln = String(n.t || '').split('\n').length;
            if (n.t && n.shape === 'gw') textBlock(tg, n.t, n.x + n.w / 2 + 4, n.y - n.h / 2 - 2 - (ln - 1) * 7, 'sk-evl', 'start', 14);
            else if (n.t) textBlock(tg, n.t, n.x, n.y + n.h / 2 + 10 + (ln - 1) * 7, 'sk-evl', 'middle', 14);
        } else if (n.shape === 'actor') {
            textBlock(tg, n.t, n.x, n.y + 52 + (n.lines - 1) * 7.5, 'sk-actor-t', 'middle', 15);
        } else if (n.t) {
            const hasSub = !!n.s;
            const lines = n.lines + (hasSub ? String(n.s).split('\n').length : 0);
            const lh = n.small ? 14 : 16;
            const top = n.y - (lines - 1) * lh / 2;
            textBlock(tg, n.t, n.x, top + (n.lines - 1) * lh / 2, n.small ? 'sk-t sm' : 'sk-t', 'middle', lh);
            if (hasSub) textBlock(tg, n.s, n.x, top + n.lines * lh + (String(n.s).split('\n').length - 1) * 13 / 2, 'sk-s', 'middle', 13);
            if (opt.number && ['rect', 'round', 'pill'].includes(n.shape) && !/\berr\b/.test(n.cls || '')) {
                stepNo++;
                el('text', { x: x0 + 7, y: y0 + 11, class: 'sk-no' }, tg).textContent = String(stepNo).padStart(2, '0');
            }
        }
        n.tg = tg;
        if (n.info) {
            g.classList.add('clickable');
            g.setAttribute('tabindex', 0);
            g.setAttribute('role', 'button');
            g.setAttribute('aria-label', n.info.t || String(n.t).replace(/\n/g, ' '));
            g.addEventListener('click', () => select(n));
            g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); select(n); } });
        }
    }

    function buildEdge(e, idx) {
        if (!e.pts) {
            const a = N[e.from], b = N[e.to];
            if (Math.abs(a.x - b.x) < 2) e.pts = a.y < b.y ? [api.A(e.from, 'b'), api.A(e.to, 't')] : [api.A(e.from, 't'), api.A(e.to, 'b')];
            else if (Math.abs(a.y - b.y) < 2) e.pts = a.x < b.x ? [api.A(e.from, 'r'), api.A(e.to, 'l')] : [api.A(e.from, 'l'), api.A(e.to, 'r')];
            else e.pts = [[a.x, a.y], [b.x, b.y]];
        }
        const g = el('g', { class: `sk-edge ${e.k.split(' ').map(k => 'k-' + k).join(' ')}` }, gEdge);
        const d = polyPath(e.pts);
        e.g = g;
        const ks = e.k.split(' ');
        if (ks.some(k => DASHED[k])) {
            const id = `${uid}-m${idx}`;
            const m = el('mask', { id, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H }, defs);
            e.drawEl = el('path', { d, fill: 'none', stroke: '#fff', 'stroke-width': 12, pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 }, m);
            e.ln = el('path', { d, class: 'sk-ln', mask: `url(#${id})` }, g);
        } else {
            e.ln = el('path', { d, class: 'sk-ln', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 }, g);
            e.drawEl = e.ln;
        }
        const p = e.pts[e.pts.length - 2], q = e.pts[e.pts.length - 1];
        e.ang = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI;
        e.tip = q;
        if (ks.some(k => ARROW[k])) e.arw = el('path', { d: 'M0,0 L-11,-5.5 L-8,0 L-11,5.5 Z', class: 'sk-arw' }, g);
        if (ks.includes('inherit')) e.arw = el('path', { d: 'M0,0 L-15,-8 L-15,8 Z', class: 'sk-tri' }, g);
        if (e.arw) e.arw.setAttribute('transform', `translate(${q[0]},${q[1]}) rotate(${e.ang}) scale(0)`);
        e.lbls = [];
        if (e.lb) {
            let [lx, ly, anchor] = e.lp || [];
            if (lx === undefined) {
                // Tu dat nhan o giua doan dai nhat
                let best = 0, bi = 0;
                for (let i = 0; i < e.pts.length - 1; i++) {
                    const L = Math.hypot(e.pts[i + 1][0] - e.pts[i][0], e.pts[i + 1][1] - e.pts[i][1]);
                    if (L > best) { best = L; bi = i; }
                }
                const a = e.pts[bi], b = e.pts[bi + 1];
                const horiz = Math.abs(b[1] - a[1]) < Math.abs(b[0] - a[0]);
                lx = (a[0] + b[0]) / 2 + (horiz ? 0 : 8);
                ly = (a[1] + b[1]) / 2 - (horiz ? 9 : 0);
                anchor = horiz ? 'middle' : 'start';
            }
            const lg = el('g', { opacity: 0 }, g);
            textBlock(lg, e.lb, lx, ly, e.lc === 'msg' ? 'sk-msg' : 'sk-lbl', anchor || 'middle', e.lc === 'msg' ? 15 : 17);
            e.lbls.push(lg);
        }
        // Ban so quan he (ERD): dat gan hai dau duong
        const card = (txt, P, Q) => {
            const L = Math.hypot(Q[0] - P[0], Q[1] - P[1]) || 1;
            const ux = (Q[0] - P[0]) / L, uy = (Q[1] - P[1]) / L;
            const lg = el('g', { opacity: 0 }, g);
            const t = el('text', { x: P[0] + ux * 13 - uy * 9 + (uy ? 3 : 0), y: P[1] + uy * 13 + ux * -9 + (ux ? 0 : 0), class: 'sk-card', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, lg);
            t.textContent = txt;
            e.lbls.push(lg);
        };
        if (e.sl) card(e.sl, e.pts[0], e.pts[1]);
        if (e.el) card(e.el, e.pts[e.pts.length - 1], e.pts[e.pts.length - 2]);
        e.len = e.ln.getTotalLength();
    }

    /* ----- Bang chi tiet ----- */
    let selected = null;
    function select(n) {
        if (!opt.panel) return;
        if (selected) selected.g.classList.remove('sel');
        selected = n; n.g.classList.add('sel');
        const i = n.info;
        opt.panel.innerHTML = `
            ${i.tag ? `<span class="tag">${i.tag}</span>` : ''}
            <h3>${i.t || esc(String(n.t).replace(/\n/g, ' '))}</h3>
            ${i.d ? `<p>${i.d}</p>` : ''}
            ${i.ul ? '<ul>' + i.ul.map(x => `<li>${x}</li>`).join('') + '</ul>' : ''}
            ${i.c ? `<pre class="code">${i.c}</pre>` : ''}
            ${i.r ? `<div class="ref"><i class="bi bi-file-earmark-code"></i> ${i.r}</div>` : ''}`;
        if (opt.onSelect) opt.onSelect(n);
    }

    /* ----- Dong co ve ----- */
    const S = { i: 0, t: 0, playing: false, started: false, scale: 1 };
    let pencil, tip = null;
    function weight(it) {
        if (it.kind === 'lane') return .45;
        if (it.kind === 'node') return it.n.shape === 'box' ? 1.2 : it.n.shape === 'start' || it.n.shape === 'end' ? .35 : .8;
        return Math.max(.3, Math.min(1.3, it.e.len / 240));
    }
    function apply(it, t) {
        tip = null;
        if (it.kind === 'lane') { it.g.setAttribute('opacity', ease(t)); return; }
        if (it.kind === 'node') {
            const n = it.n, o = clamp(t / .65), f = clamp((t - .45) / .55);
            n.body.setAttribute('stroke-dashoffset', 1 - ease(o));
            n.body.setAttribute('fill-opacity', f);
            n.extras.forEach(x => x.setAttribute('stroke-dashoffset', 1 - ease(clamp((t - .4) / .4))));
            if (n.sh) n.sh.setAttribute('opacity', f);
            if (n.hdr) n.hdr.setAttribute('opacity', f);
            if (n.dot) n.dot.setAttribute('r', 9 * f);
            n.tg.setAttribute('opacity', f);
            if (t > 0 && t < .65) tip = n.body.getPointAtLength(n.body.getTotalLength() * ease(o));
            return;
        }
        const e = it.e, p = ease(t);
        e.drawEl.setAttribute('stroke-dashoffset', 1 - p);
        if (e.arw) e.arw.setAttribute('transform', `translate(${e.tip[0]},${e.tip[1]}) rotate(${e.ang}) scale(${clamp((t - .85) / .15)})`);
        e.lbls.forEach(l => l.setAttribute('opacity', clamp((t - .55) / .45)));
        if (t > 0 && t < 1) tip = e.ln.getPointAtLength(e.len * p);
    }
    function finish() {
        while (S.i < items.length) { apply(items[S.i], 1); S.i++; }
        S.t = 0; S.playing = false; tip = null; S.started = true;
    }
    function reset() {
        items.forEach(it => apply(it, 0));
        S.i = 0; S.t = 0; tip = null;
    }
    function tick(dt) {
        if (!S.playing) return;
        let left = dt;
        while (left > 0 && S.i < items.length) {
            const it = items[S.i], d = weight(it) * S.scale;
            const need = (1 - S.t) * d;
            if (left >= need) { apply(it, 1); S.i++; S.t = 0; left -= need; }
            else { S.t += left / d; apply(it, S.t); left = 0; }
        }
        if (S.i >= items.length) { S.playing = false; tip = null; }
        if (tip && S.playing) {
            pencil.setAttribute('opacity', 1);
            pencil.setAttribute('transform', `translate(${tip.x},${tip.y})`);
        } else pencil.setAttribute('opacity', 0);
    }

    function mount() {
        let ei = 0;
        items.forEach(it => { if (it.kind === 'node') buildNode(it.n); else if (it.kind === 'edge') buildEdge(it.e, ei++); });
        S.scale = DRAW_MS / items.reduce((s, it) => s + weight(it), 0);
        pencil = el('g', { class: 'sk-pencil', opacity: 0 }, svg);
        const pin = el('g', { transform: 'rotate(-35)' }, pencil);
        el('path', { d: 'M0,0 L8,-4 L8,4 Z', fill: '#f4d3a1', stroke: '#14365a', 'stroke-width': 1.2 }, pin);
        el('rect', { x: 8, y: -4, width: 30, height: 8, fill: '#ffd76a', stroke: '#14365a', 'stroke-width': 1.2 }, pin);
        el('rect', { x: 38, y: -4, width: 6, height: 8, fill: '#ff9fb2', stroke: '#14365a', 'stroke-width': 1.2 }, pin);
        el('circle', { cx: .6, cy: 0, r: 1.4, fill: '#14365a' }, pin);
        reset();
        if (REDUCE || location.hash === '#all') { finish(); }
        else {
            // Tu ve khi so do lot vao man hinh (lan dau)
            const io = new IntersectionObserver(es => {
                es.forEach(en => { if (en.isIntersecting && !S.started) { S.started = true; S.playing = true; io.disconnect(); } });
            }, { threshold: .18 });
            io.observe(svg);
        }
        svg._sketch = api;
        LOOP.add(tick);
        return api;
    }
    return api;
}

/* Mot vong lap chung cho moi so do tren trang */
const LOOP = (() => {
    const fns = new Set();
    let last = 0;
    const frame = ts => {
        const dt = Math.min(64, ts - (last || ts));
        last = ts;
        fns.forEach(f => f(dt));
        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    return fns;
})();

global.Sketch = Sketch;
})(window);
