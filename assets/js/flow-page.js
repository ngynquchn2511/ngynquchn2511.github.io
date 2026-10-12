/* Trang so-do/luong-dat-phong.html: sidebar accordion 2 cap (san pham → loai → bieu do) */
(function () {
'use strict';
const H = window.HMD, F = window.FLOWS, SC = window.SCD, BA = window.BAD;
const GROUPS = [
    { name: 'Homestay Mây', sub: 'Spring Boot', icon: 'bi-house-heart', cls: '', items: [
        { id: 'dat-phong',   t: 'Đặt phòng trực tuyến',        k: 'Hoạt động · kịch bản', icon: 'bi-play-circle' },
        { id: 'hai-khach',   t: 'Hai khách cùng đặt 1 phòng',  k: 'Tuần tự',              icon: 'bi-people',           fn: H.sequence,
            d: 'Khóa dòng phòng <code>SELECT … FOR UPDATE</code> + giao dịch <code>READ_COMMITTED</code>: khách đặt sau phải chờ, sau đó nhận thông báo phòng đã được đặt. Một phòng không bao giờ có hai đơn trùng ngày.' },
        { id: 'ma-giam-gia', t: 'Kiểm tra mã giảm giá',        k: 'Hoạt động · AJAX',     icon: 'bi-ticket-perforated', fn: F.hmDiscount,
            d: 'Nút <b>"Kiểm tra mã"</b> cho khách xem trước số tiền được giảm mà chưa tạo đơn. Khi xác nhận đặt phòng, mọi điều kiện được kiểm tra lại.' },
        { id: 'sua-huy',     t: 'Khách đổi giờ · combo · hủy', k: 'Hoạt động',            icon: 'bi-pencil-square',    fn: F.hmModify,
            d: 'Ba thao tác khách tự làm trên trang đơn. Đổi giờ / combo cần còn <b>≥ 6 giờ</b> trước giờ nhận phòng; hủy chỉ xét trạng thái.' },
        { id: 'quay-le-tan', t: 'Quầy lễ tân: nhận → trả phòng', k: 'Hoạt động',          icon: 'bi-door-open',        fn: H.checkinFlow,
            d: 'Xác nhận / nhận cọc → khai báo lưu trú bắt buộc → check-in → phụ phí → thanh toán → check-out → hóa đơn email → dọn phòng.' },
        { id: 'tu-huy',      t: 'Tự hủy đơn quá hạn',          k: 'Tác vụ định kỳ',       icon: 'bi-alarm',            fn: F.hmScheduler,
            d: '<code>@Scheduled</code> chạy mỗi 5 phút, hủy đơn PENDING quá hạn chuyển cọc hoặc sát giờ nhận phòng mà chưa được xác nhận.' },
        { id: 'dang-nhap',   t: 'Đăng nhập hai cổng',           k: 'Bảo mật',              icon: 'bi-shield-lock',      fn: F.hmLogin,
            d: 'Hai <code>SecurityFilterChain</code> cho khách và quản trị; đúng mật khẩu nhưng sai cổng vẫn bị đăng xuất ngay.' },
        { id: 'vong-doi-don',  t: 'Vòng đời đơn đặt phòng',    k: 'Trạng thái',           icon: 'bi-arrow-repeat',     fn: H.bookingState,
            d: 'Chờ xác nhận, đã xác nhận, đã nhận phòng, đã trả phòng, kèm nhánh hủy. Mỗi lần chuyển trạng thái đều có điều kiện bắt buộc.' },
        { id: 'trang-thai-phong', t: 'Trạng thái phòng',        k: 'Trạng thái',           icon: 'bi-door-closed',      fn: H.roomState,
            d: 'AVAILABLE → OCCUPIED → NOT_READY → AVAILABLE, cùng MAINTENANCE; lịch trống luôn tính từ đơn chứ không từ trạng thái phòng.' },
        { id: 'bpmn-hm',         t: 'Đặt phòng trực tuyến',     k: 'BPMN',                 icon: 'bi-signpost-split',   fn: BA.bpmn,
            d: 'Ba swimlane: Khách hàng · Lễ tân · Hệ thống. Luồng từ chọn phòng → kiểm tra trùng → tạo đơn → cọc VietQR → xác nhận; nhánh timer tự hủy đơn quá hạn.' },
        { id: 'uc-hm',           t: 'Use Case (18 UC)',          k: 'Use Case',             icon: 'bi-person-circle',    fn: BA.useCase,
            d: '18 use case của hệ thống đặt phòng: khách vãng lai và khách hàng (kế thừa), lễ tân, quản trị viên và bộ hẹn giờ. Mối quan hệ kế thừa giữa các actor được thể hiện rõ.' },
        { id: 'kien-truc-hm',    t: 'Kiến trúc hệ thống',       k: 'Kiến trúc',            icon: 'bi-diagram-2',        fn: H.architecture,
            d: 'Caddy → Spring Boot: hai <code>SecurityFilterChain</code>, Controller → Service (20 lớp) → JPA → MySQL 8; gửi email bất đồng bộ sau commit; <code>@Scheduled</code> tự hủy đơn quá hạn.' },
        { id: 'tinh-gia-hm',     t: 'Tính giá phòng từng đêm',   k: 'Hoạt động',            icon: 'bi-calculator',       fn: F.hmTinhGia,
            d: 'Duyệt từng đêm từ checkIn → checkOut: special_rate (ngày lễ) ưu tiên tuyệt đối → cuối tuần → ngày thường. Cọc = min(total × %, max). Hạn cọc = min(now + hours, checkIn − 6h).' },
        { id: 'chatbot-hm',      t: 'Chatbot tư vấn phòng',      k: 'Hoạt động',            icon: 'bi-chat-dots',        fn: F.hmChatbot,
            d: 'API công khai <code>/api/chatbot/ask</code> giới hạn 10 lần/phút/IP; phân tích từ khóa → tra DB (phòng/giá) hoặc bảng FAQ tĩnh → trả <code>{ message, suggestions }</code>.' },
        { id: 'walkin-hm',       t: 'Đặt phòng tại quầy (walk-in)', k: 'Hoạt động',          icon: 'bi-person-walking',   fn: F.hmWalkIn,
            d: 'Lễ tân tìm phòng trống → nhập thông tin khách → <code>createWalkInBooking()</code> tạo thẳng trạng thái CONFIRMED (bỏ qua PENDING, không cần cọc) → email xác nhận async.' },
        { id: 'checkout-hm',     t: 'Check-out & thanh toán',     k: 'Hoạt động',            icon: 'bi-receipt',          fn: F.hmCheckout,
            d: 'Xem đơn CHECKED_IN → thêm phụ phí (BookingCharge) → tính <code>amountDue = grandTotal − depositPaidAmount</code> → tiền mặt hoặc chuyển khoản → PAID → CHECKED_OUT → hóa đơn email.' },
        { id: 'qmk-hm',          t: 'Quên & đặt lại mật khẩu',   k: 'Bảo mật',              icon: 'bi-key',              fn: F.hmForgotPassword,
            d: 'Tạo token SecureRandom 32 byte (hạn 30 phút), gửi SMTP đồng bộ; không lộ email có tồn tại không; nhấn link → validate token → reset → token = null (dùng một lần).' },
        { id: 'payment-state-hm', t: 'Vòng đời PaymentStatus',    k: 'Trạng thái',           icon: 'bi-credit-card',      fn: F.hmPaymentState,
            d: 'UNPAID (mặc định khi tạo đơn) → PAID (sau check-out thu đủ tiền) → REFUNDED (hủy sau khi đã thanh toán). Không tự thay đổi theo BookingStatus.' },
        { id: 'coc-hm',          t: 'Vòng đời đặt cọc',          k: 'Trạng thái',           icon: 'bi-coin',             fn: F.hmDepositState,
            d: 'Hai nhánh: không yêu cầu cọc (lễ tân xác nhận ngay) hoặc CHỜ CỌC → ĐÃ CỌC → THANH TOÁN ĐỦ; nhánh phụ: QUÁ HẠN (timer tự hủy) và HOÀN TIỀN (hủy sau khi đã cọc).' },
        { id: 'async-email-hm',  t: 'Gửi email bất đồng bộ',     k: 'Tuần tự',              icon: 'bi-envelope-arrow-up', fn: F.hmAsyncEmail,
            d: '<code>EmailService.deliverAfterCommit()</code>: nếu trong transaction thì đăng ký <code>afterCommit</code>, nếu không thì gửi ngay vào <code>MailExecutor</code> — đảm bảo không gửi email khi đơn chưa lưu.' },
        { id: 'confirm-deposit-hm', t: 'Xác nhận đơn & nhận cọc', k: 'Tuần tự',             icon: 'bi-check-circle',     fn: F.hmConfirmDeposit,
            d: 'AdminBookingController → BookingService: khóa dòng phòng FOR UPDATE → <code>ensureNoConfirmedConflict()</code> kiểm tra trùng lịch → PENDING → CONFIRMED; lăn lại nếu có đơn khác trùng ngày.' },
        { id: 'checkin-seq-hm',  t: 'Check-in tại quầy',          k: 'Tuần tự',              icon: 'bi-arrow-left-right', fn: F.hmCheckinSeq,
            d: 'Lễ tân → BookingController → BookingService → MySQL: khóa dòng FOR UPDATE, kiểm tra status = CONFIRMED và đã khai báo lưu trú, rồi cập nhật phòng + đơn đồng thời.' },
    ] },
    { name: 'Sweet Cake', sub: 'Laravel 12 · React', icon: 'bi-cake2', cls: 'sc', items: [
        { id: 'sc-gio-hang',  t: 'Thêm vào giỏ hàng',          k: 'Hoạt động',            icon: 'bi-cart-plus',        fn: F.scAddCart,
            d: 'Kiểm tra sản phẩm còn bán và <b>tồn kho đủ cho tổng số lượng</b> sau khi cộng dồn, rồi tăng số lượng hoặc tạo món mới trong giỏ.' },
        { id: 'sc-dong-bo',   t: 'Mở giỏ: đồng bộ giá & kho', k: 'Hoạt động',            icon: 'bi-arrow-clockwise',  fn: F.scCartSync,
            d: 'Trước khi hiển thị, giỏ hàng được cập nhật theo dữ liệu mới nhất: bỏ sản phẩm ngừng bán, giảm số lượng vượt tồn kho, cập nhật giá.' },
        { id: 'sc-dat-hang',  t: 'Đặt hàng (COD)',              k: 'Hoạt động · giao dịch', icon: 'bi-bag-check',       fn: F.scOrder,
            d: '<code>OrderPlacementService::placeFromCart()</code> dùng chung cho COD, API và MoMo: kiểm tra tồn kho, áp mã, tạo đơn, trừ kho và xóa giỏ trong cùng một giao dịch.' },
        { id: 'sc-momo',      t: 'Thanh toán MoMo',             k: 'Tuần tự',              icon: 'bi-wallet2',          fn: F.scMomo,
            d: 'Hệ thống tạo đơn trước khi chuyển sang cổng MoMo; kết quả trả về qua IPN và redirect đều được <b>xác thực chữ ký HMAC-SHA256</b> trước khi đánh dấu đã thanh toán.' },
        { id: 'sc-khuyen-mai', t: 'Kiểm tra mã khuyến mãi',    k: 'Hoạt động',            icon: 'bi-percent',          fn: F.scPromotion,
            d: 'Chuỗi kiểm tra trong <code>Promotion::validateAndCalculate()</code>: tồn tại, đang bật, trong hạn, còn lượt, đạt đơn tối thiểu, rồi tính giảm có trần.' },
        { id: 'sc-huy-don',   t: 'Hủy đơn & hoàn kho',         k: 'Hoạt động',            icon: 'bi-x-circle',         fn: F.scCancel,
            d: 'Khách chỉ hủy được đơn của chính mình khi còn pending / confirmed; tồn kho được cộng lại trong cùng giao dịch.' },
        { id: 'sc-vong-doi',  t: 'Vòng đời đơn hàng',          k: 'Trạng thái',           icon: 'bi-truck',            fn: F.scOrderState,
            d: 'Trạng thái đơn và trạng thái thanh toán là hai cột tách biệt; mỗi lần admin đổi trạng thái đều ghi <code>admin_logs</code>.' },
        { id: 'sc-admin',     t: 'Đăng nhập quản trị',          k: 'Bảo mật',              icon: 'bi-person-lock',      fn: F.scAdminLogin,
            d: 'Đăng nhập kiểm vai trò và tài khoản bị khóa, tạo lại session; <code>AdminMiddleware</code> kiểm lại ở mọi request.' },
        { id: 'sc-tin-nhan',  t: 'Hỏi đáp & admin trả lời',    k: 'Hoạt động',            icon: 'bi-chat-left-text',   fn: F.scMessage,
            d: 'API công khai giới hạn 10 lần/phút/IP; khách vãng lai phải để lại tên + email; admin trả lời thì khách nhận email.' },
        { id: 'bpmn-sc',         t: 'Đặt hàng & thanh toán MoMo', k: 'BPMN',               icon: 'bi-signpost-split',   fn: SC.scBpmn,
            d: 'Ba swimlane: Khách hàng · Hệ thống Sweet Cake · Cổng MoMo. Luồng từ thêm giỏ → placeFromCart() → COD hoặc MoMo → xác thực HMAC-SHA256 IPN; nhánh timer hủy đơn quá hạn.' },
        { id: 'uc-sc',           t: 'Use Case (18 UC)',          k: 'Use Case',             icon: 'bi-person-circle',    fn: SC.scUseCase,
            d: '18 use case của Sweet Cake: khách vãng lai (giỏ, đặt hàng, MoMo, hỏi đáp), khách hàng (lịch sử, hủy, đánh giá) và quản trị viên (sản phẩm, đơn hàng, khuyến mãi, banner).' },
        { id: 'kien-truc-sc',    t: 'Kiến trúc hệ thống',       k: 'Kiến trúc',            icon: 'bi-diagram-2',        fn: SC.architecture,
            d: 'Trình duyệt React (Inertia.js) → Laravel 12: Routes → Middleware (auth, admin, throttle) → Controllers → OrderPlacementService → Eloquent (16 model) → MySQL; tích hợp MoMo HMAC-SHA256.' },
        { id: 'dang-ky-sc',      t: 'Đăng ký tài khoản',          k: 'Bảo mật',              icon: 'bi-person-plus',      fn: F.scDangKy,
            d: 'Validate unique email → tự sinh <b>username</b> từ prefix email (thêm số đuôi nếu trùng) → <code>User::create(role=customer)</code> → <code>Auth::login()</code> → redirect ngay, <b>không</b> cần xác minh email.' },
        { id: 'danh-gia-sc',     t: 'Viết & duyệt đánh giá',     k: 'Hoạt động',            icon: 'bi-star-half',        fn: F.scDanhGia,
            d: 'Chỉ tài khoản có đơn <code>completed</code> chứa sản phẩm mới được đánh giá (1 đánh giá/sản phẩm); review tạo ở trạng thái <b>pending</b>, hiện lên trang sau khi admin duyệt.' },
        { id: 'wishlist-sc',     t: 'Yêu thích (toggle)',         k: 'Hoạt động',            icon: 'bi-heart',            fn: F.scWishlist,
            d: 'POST /wishlist/toggle: kiểm tra sản phẩm đang bán → nếu đã có thì xóa, chưa có thì thêm → trả <code>{ is_in_wishlist: bool }</code>. Optimistic toggle đơn giản.' },
        { id: 'shipping-sc',     t: 'Địa chỉ giao hàng',          k: 'Hoạt động',            icon: 'bi-geo-alt',          fn: F.scShippingAddr,
            d: 'Thêm/sửa/xóa địa chỉ; không thể xóa địa chỉ mặc định; khi đặt mặc định mới phải <b>save địa chỉ này trước</b> rồi mới reset các địa chỉ khác (quirk của Eloquent dirty-check).' },
        { id: 'qmk-sc',          t: 'Quên & đặt lại mật khẩu',   k: 'Bảo mật',              icon: 'bi-key',              fn: F.scForgotPassword,
            d: 'Laravel Breeze: <code>Password::sendResetLink()</code> lưu token hashed vào <code>password_reset_tokens</code> → gửi email → user click → <code>Password::reset()</code> validate SHA-256 và hạn 60 phút.' },
        { id: 'review-state-sc', t: 'Vòng đời đánh giá',          k: 'Trạng thái',           icon: 'bi-star',             fn: F.scReviewState,
            d: 'Ba trạng thái: pending (vừa tạo) → approved (hiện lên trang, tính vào rating trung bình) hoặc rejected (ẩn). Sửa đánh giá đã duyệt đặt lại về pending.' },
        { id: 'payment-state-sc', t: 'Vòng đời payment_status',   k: 'Trạng thái',           icon: 'bi-wallet',           fn: F.scPaymentState,
            d: 'unpaid (mặc định) → paid (admin xác nhận COD hoặc MoMo IPN HMAC hợp lệ) → refunded. Độc lập với order_status; COD hoàn tất <b>không</b> tự thành "đã thanh toán".' },
        { id: 'order-seq-sc',    t: 'Đặt hàng COD: luồng đầy đủ', k: 'Tuần tự',             icon: 'bi-arrow-left-right', fn: F.scOrderSeq,
            d: 'React/Inertia → CartController → OrderPlacementService: khóa sản phẩm FOR UPDATE trong giao dịch, validate tồn kho, áp mã KM, tạo đơn + trừ kho + xóa giỏ atomically, dispatch email async.' },
        { id: 'admin-order-sc',  t: 'Admin cập nhật đơn & thanh toán', k: 'Tuần tự',         icon: 'bi-person-gear',      fn: F.scAdminUpdateOrder,
            d: 'Hai endpoint riêng: cập nhật <code>order_status</code> và <code>payment_status</code>; mỗi lần đổi đều ghi <code>admin_logs</code> với action, old_value, new_value, IP, user_agent.' },
    ] },
];

const side    = document.getElementById('flSide');
const content = document.getElementById('flContent');
const dock    = document.getElementById('dock');
const opts    = { panel: document.getElementById('dock-body'), onSelect: () => dock.classList.add('open') };
const ITEMS   = {};
let total = 0;

/* ---------- icon cho tung loai bieu do ---------- */
const TYPE_ICON = {
    'Hoạt động':      'bi-diagram-3',
    'Tuần tự':        'bi-arrow-left-right',
    'Trạng thái':     'bi-circle-half',
    'Bảo mật':        'bi-shield-lock',
    'Tác vụ định kỳ': 'bi-alarm',
    'Kiến trúc':      'bi-buildings',
    'Dữ liệu':        'bi-table',
    'Use Case':       'bi-person-circle',
    'BPMN':           'bi-columns-gap',
};
const mainType = k => k.split(' · ')[0];

/* ---------- dang ky tat ca item truoc khi ve HTML ---------- */
GROUPS.forEach(g => g.items.forEach(it => {
    ITEMS[it.id] = Object.assign({ group: g }, it);
    total++;
}));

/* ---------- ve sidebar accordion ---------- */
side.innerHTML = GROUPS.map(g => {
    const typeMap = new Map();
    g.items.forEach(it => {
        const t = mainType(it.k);
        if (!typeMap.has(t)) typeMap.set(t, []);
        typeMap.get(t).push(it);
    });
    return `
    <div class="grp">
        <button class="grp-toggle" aria-expanded="true">
            <span class="grp-ic"><i class="bi ${g.icon}"></i></span>
            <b class="grp-name">${g.name}</b>
            <small>${g.sub}</small>
            <i class="bi bi-chevron-down grp-chev" aria-hidden="true"></i>
        </button>
        <div class="grp-body">
            ${[...typeMap.entries()].map(([type, items]) => `
            <div class="type-grp">
                <button class="type-toggle" aria-expanded="false">
                    <i class="bi ${TYPE_ICON[type] || 'bi-diagram-2'} ti" aria-hidden="true"></i>
                    <span>${type}</span>
                    <small class="tc">${items.length}</small>
                    <i class="bi bi-chevron-down type-chev" aria-hidden="true"></i>
                </button>
                <div class="type-body">
                    ${items.map(it => `<a href="#${it.id}" data-id="${it.id}"><i class="bi ${it.icon}"></i><span>${it.t}</span><small>${it.k}</small></a>`).join('')}
                </div>
            </div>`).join('')}
        </div>
    </div>`;
}).join('') + `<div class="count">${total} sơ đồ · 2 dự án · bấm khối để xem code</div>`;

/* ---------- tao section cho moi luong (dat-phong da co san trong HTML) ---------- */
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

/* ---------- mo rong accordion den item hien tai ---------- */
function expandToItem(id) {
    const link = side.querySelector(`a[data-id="${id}"]`);
    if (!link) return;
    const typeBody = link.closest('.type-body');
    if (typeBody && !typeBody.classList.contains('open')) {
        typeBody.classList.add('open');
        const tb = typeBody.previousElementSibling;
        if (tb) tb.setAttribute('aria-expanded', 'true');
    }
    const grpBody = link.closest('.grp-body');
    if (grpBody && grpBody.classList.contains('closed')) {
        grpBody.classList.remove('closed');
        const gb = grpBody.previousElementSibling;
        if (gb) gb.setAttribute('aria-expanded', 'true');
    }
}

/* ---------- show: hien thi 1 luong ---------- */
let current = null;
function show(id, scroll) {
    const it = ITEMS[id] || ITEMS['dat-phong'];
    if (current === it) return;
    Object.values(ITEMS).forEach(x => { x.section.hidden = x !== it; });
    side.querySelectorAll('a').forEach(a => a.classList.toggle('on', a.dataset.id === it.id));
    expandToItem(it.id);
    const link = side.querySelector(`a[data-id="${it.id}"]`);
    if (link && innerWidth <= 1000) link.scrollIntoView({ inline: 'center', block: 'nearest' });
    dock.classList.remove('open');
    if (it.fn) {
        if (!it.sk) it.sk = it.fn(it.section.querySelector('svg'), opts);
        else it.sk.replay();
    } else if (current) {
        document.getElementById('bReplay').click();
    }
    current = it;
    if (scroll) it.section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- xu ly click tren sidebar ---------- */
side.addEventListener('click', ev => {
    /* nut thu gon / mo rong san pham */
    const grpBtn = ev.target.closest('.grp-toggle');
    if (grpBtn) {
        const body = grpBtn.nextElementSibling;
        const open = grpBtn.getAttribute('aria-expanded') === 'true';
        grpBtn.setAttribute('aria-expanded', String(!open));
        body.classList.toggle('closed', open);
        return;
    }
    /* nut thu gon / mo rong loai bieu do */
    const typeBtn = ev.target.closest('.type-toggle');
    if (typeBtn) {
        const body = typeBtn.nextElementSibling;
        const open = typeBtn.getAttribute('aria-expanded') === 'true';
        typeBtn.setAttribute('aria-expanded', String(!open));
        body.classList.toggle('open', !open);
        return;
    }
    /* link bieu do */
    const a = ev.target.closest('a[data-id]');
    if (!a) return;
    ev.preventDefault();
    history.replaceState(null, '', '#' + a.dataset.id);
    show(a.dataset.id, innerWidth > 1000 ? false : true);
});

addEventListener('keydown', ev => { if (ev.key === 'Escape') dock.classList.remove('open'); });

/* ---------- khoi tao: chon luong theo URL hash hoac mac dinh ---------- */
const q = new URLSearchParams(location.search).get('f');
const h = location.hash.slice(1);
const initId = q || (ITEMS[h] ? h : 'dat-phong');
show(initId);
if (ITEMS[h]) setTimeout(() => document.getElementById('f-' + initId)?.scrollIntoView({ block: 'start' }), 80);

/* ---------- pre-draw tat ca bieu do con lai (hien ngay khi chuyen trang, bo qua animation) ---------- */
const preDraw = () => {
    Object.values(ITEMS).forEach(it => {
        if (it.fn && !it.sk) {
            it.sk = it.fn(it.section.querySelector('svg'), opts);
            if (it.sk && it.sk.showAll) it.sk.showAll();
        }
    });
};
if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(preDraw, { timeout: 3000 });
} else {
    setTimeout(preDraw, 600);
}
})();
