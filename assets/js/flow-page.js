/* Trang so-do/luong-dat-phong.html: sidebar chon luong, bam luong nao thi hien luong do */
(function () {
'use strict';
const H = window.HMD, F = window.FLOWS;
const GROUPS = [
    { name: 'Homestay Mây', sub: 'Spring Boot', icon: 'bi-house-heart', cls: '', items: [
        { id: 'dat-phong', t: 'Đặt phòng trực tuyến', k: 'Hoạt động · kịch bản', icon: 'bi-play-circle' },
        { id: 'hai-khach', t: 'Hai khách cùng đặt 1 phòng', k: 'Tuần tự', icon: 'bi-people', fn: H.sequence,
            d: 'Khóa dòng phòng <code>SELECT … FOR UPDATE</code> + giao dịch <code>READ_COMMITTED</code>: khách đặt sau phải chờ, sau đó nhận thông báo phòng đã được đặt. Một phòng không bao giờ có hai đơn trùng ngày.' },
        { id: 'ma-giam-gia', t: 'Kiểm tra mã giảm giá', k: 'Hoạt động · AJAX', icon: 'bi-ticket-perforated', fn: F.hmDiscount,
            d: 'Nút <b>“Kiểm tra mã”</b> cho khách xem trước số tiền được giảm mà chưa tạo đơn. Khi xác nhận đặt phòng, mọi điều kiện được kiểm tra lại.' },
        { id: 'sua-huy', t: 'Khách đổi giờ · combo · hủy', k: 'Hoạt động', icon: 'bi-pencil-square', fn: F.hmModify,
            d: 'Ba thao tác khách tự làm trên trang đơn. Đổi giờ / combo cần còn <b>≥ 6 giờ</b> trước giờ nhận phòng; hủy chỉ xét trạng thái.' },
        { id: 'quay-le-tan', t: 'Quầy lễ tân: nhận → trả phòng', k: 'Hoạt động', icon: 'bi-door-open', fn: H.checkinFlow,
            d: 'Xác nhận / nhận cọc → khai báo lưu trú bắt buộc → check-in → phụ phí → thanh toán → check-out → hóa đơn email → dọn phòng.' },
        { id: 'tu-huy', t: 'Tự hủy đơn quá hạn', k: 'Tác vụ định kỳ', icon: 'bi-alarm', fn: F.hmScheduler,
            d: '<code>@Scheduled</code> chạy mỗi 5 phút, hủy đơn PENDING quá hạn chuyển cọc hoặc sát giờ nhận phòng mà chưa được xác nhận.' },
        { id: 'dang-nhap', t: 'Đăng nhập hai cổng', k: 'Bảo mật', icon: 'bi-shield-lock', fn: F.hmLogin,
            d: 'Hai <code>SecurityFilterChain</code> cho khách và quản trị; đúng mật khẩu nhưng sai cổng vẫn bị đăng xuất ngay.' },
        { id: 'vong-doi-don', t: 'Vòng đời đơn đặt phòng', k: 'Trạng thái', icon: 'bi-arrow-repeat', fn: H.bookingState,
            d: 'Chờ xác nhận, đã xác nhận, đã nhận phòng, đã trả phòng, kèm nhánh hủy. Mỗi lần chuyển trạng thái đều có điều kiện bắt buộc.' },
        { id: 'trang-thai-phong', t: 'Trạng thái phòng', k: 'Trạng thái', icon: 'bi-door-closed', fn: H.roomState,
            d: 'AVAILABLE → OCCUPIED → NOT_READY → AVAILABLE, cùng MAINTENANCE; lịch trống luôn tính từ đơn chứ không từ trạng thái phòng.' },
    ] },
    { name: 'Sweet Cake', sub: 'Laravel 12 · React', icon: 'bi-cake2', cls: 'sc', items: [
        { id: 'sc-gio-hang', t: 'Thêm vào giỏ hàng', k: 'Hoạt động', icon: 'bi-cart-plus', fn: F.scAddCart,
            d: 'Kiểm tra sản phẩm còn bán và <b>tồn kho đủ cho tổng số lượng</b> sau khi cộng dồn, rồi tăng số lượng hoặc tạo món mới trong giỏ.' },
        { id: 'sc-dong-bo', t: 'Mở giỏ: đồng bộ giá & kho', k: 'Hoạt động', icon: 'bi-arrow-clockwise', fn: F.scCartSync,
            d: 'Trước khi hiển thị, giỏ hàng được cập nhật theo dữ liệu mới nhất: bỏ sản phẩm ngừng bán, giảm số lượng vượt tồn kho, cập nhật giá.' },
        { id: 'sc-dat-hang', t: 'Đặt hàng (COD)', k: 'Hoạt động · giao dịch', icon: 'bi-bag-check', fn: F.scOrder,
            d: '<code>OrderPlacementService::placeFromCart()</code> dùng chung cho COD, API và MoMo: kiểm tra tồn kho, áp mã, tạo đơn, trừ kho và xóa giỏ trong cùng một giao dịch.' },
        { id: 'sc-momo', t: 'Thanh toán MoMo', k: 'Tuần tự', icon: 'bi-wallet2', fn: F.scMomo,
            d: 'Hệ thống tạo đơn trước khi chuyển sang cổng MoMo; kết quả trả về qua IPN và redirect đều được <b>xác thực chữ ký HMAC-SHA256</b> trước khi đánh dấu đã thanh toán.' },
        { id: 'sc-khuyen-mai', t: 'Kiểm tra mã khuyến mãi', k: 'Hoạt động', icon: 'bi-percent', fn: F.scPromotion,
            d: 'Chuỗi kiểm tra trong <code>Promotion::validateAndCalculate()</code>: tồn tại, đang bật, trong hạn, còn lượt, đạt đơn tối thiểu, rồi tính giảm có trần.' },
        { id: 'sc-huy-don', t: 'Hủy đơn & hoàn kho', k: 'Hoạt động', icon: 'bi-x-circle', fn: F.scCancel,
            d: 'Khách chỉ hủy được đơn của chính mình khi còn pending / confirmed; tồn kho được cộng lại trong cùng giao dịch.' },
        { id: 'sc-vong-doi', t: 'Vòng đời đơn hàng', k: 'Trạng thái', icon: 'bi-truck', fn: F.scOrderState,
            d: 'Trạng thái đơn và trạng thái thanh toán là hai cột tách biệt; mỗi lần admin đổi trạng thái đều ghi <code>admin_logs</code>.' },
        { id: 'sc-admin', t: 'Đăng nhập quản trị', k: 'Bảo mật', icon: 'bi-person-lock', fn: F.scAdminLogin,
            d: 'Đăng nhập kiểm vai trò và tài khoản bị khóa, tạo lại session; <code>AdminMiddleware</code> kiểm lại ở mọi request.' },
        { id: 'sc-tin-nhan', t: 'Hỏi đáp & admin trả lời', k: 'Hoạt động', icon: 'bi-chat-left-text', fn: F.scMessage,
            d: 'API công khai giới hạn 10 lần/phút/IP; khách vãng lai phải để lại tên + email; admin trả lời thì khách nhận email.' },
    ] },
];

const side = document.getElementById('flSide');
const content = document.getElementById('flContent');
const dock = document.getElementById('dock');
const opts = { panel: document.getElementById('dock-body'), onSelect: () => dock.classList.add('open') };
const ITEMS = {};
let total = 0;

side.innerHTML = GROUPS.map(g => `
    <div class="grp">
        <h5><i class="bi ${g.icon}"></i>${g.name}<small>${g.sub}</small></h5>
        ${g.items.map(it => { ITEMS[it.id] = Object.assign({ group: g }, it); total++;
            return `<a href="#${it.id}" data-id="${it.id}"><i class="bi ${it.icon}"></i><span>${it.t}</span><small>${it.k}</small></a>`; }).join('')}
    </div>`).join('') + `<div class="count">${total} sơ đồ · 2 dự án · bấm khối để xem code</div>`;

// Tao khung cho moi luong (tru luong dat phong da co san trong HTML)
Object.values(ITEMS).forEach(it => {
    if (it.id === 'dat-phong') { it.section = document.getElementById('f-dat-phong'); return; }
    const sec = document.createElement('section');
    sec.className = 'flow';
    sec.id = 'f-' + it.id;
    sec.hidden = true;
    sec.innerHTML = `
        <div class="flow-head">
            <div>
                <span class="proj-tag ${it.group.cls}"><i class="bi ${it.group.icon}"></i>${it.group.name}</span> <span class="proj-tag kind">${it.k}</span>
                <h2>${it.t}</h2>
                <p>${it.d}</p>
            </div>
            <div class="acts">
                <button class="btn" data-act="replay"><i class="bi bi-arrow-counterclockwise"></i>Vẽ lại</button>
                <button class="btn" data-act="all"><i class="bi bi-lightning-charge"></i>Hiện hết</button>
            </div>
        </div>
        <div class="card canvas"><svg role="img" aria-label="${it.t}"></svg></div>
        <div class="tip"><i class="bi bi-hand-index-thumb"></i>Bấm vào các bước có viền đậm khi rê chuột để xem diễn giải.</div>`;
    content.appendChild(sec);
    it.section = sec;
    sec.querySelector('[data-act="replay"]').addEventListener('click', () => it.sk && it.sk.replay());
    sec.querySelector('[data-act="all"]').addEventListener('click', () => it.sk && it.sk.showAll());
});

let current = null;
function show(id, scroll) {
    const it = ITEMS[id] || ITEMS['dat-phong'];
    if (current === it) return;
    Object.values(ITEMS).forEach(x => { x.section.hidden = x !== it; });
    side.querySelectorAll('a').forEach(a => a.classList.toggle('on', a.dataset.id === it.id));
    const link = side.querySelector(`a[data-id="${it.id}"]`);
    if (link && link.scrollIntoView && innerWidth <= 1000) link.scrollIntoView({ inline: 'center', block: 'nearest' });
    dock.classList.remove('open');
    if (it.fn) {
        // Ve lan dau khi duoc chon; lan sau thi ve lai tu dau
        if (!it.sk) it.sk = it.fn(it.section.querySelector('svg'), opts);
        else it.sk.replay();
    } else if (current) {
        document.getElementById('bReplay').click();
    }
    current = it;
    if (scroll) it.section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
side.addEventListener('click', ev => {
    const a = ev.target.closest('a[data-id]');
    if (!a) return;
    ev.preventDefault();
    history.replaceState(null, '', '#' + a.dataset.id);
    show(a.dataset.id, innerWidth > 1000 ? false : true);
});
addEventListener('keydown', ev => { if (ev.key === 'Escape') dock.classList.remove('open'); });

// ?f=<id> chon luong (dung kem #all de hien ngay toan bo); #<id> chon luong
const q = new URLSearchParams(location.search).get('f');
const h = location.hash.slice(1);
show(q || (ITEMS[h] ? h : 'dat-phong'));
})();
