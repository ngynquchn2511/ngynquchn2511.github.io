/* So do cho trang case study Sweet Cake: mo hinh du lieu va kien truc */
(function () {
'use strict';
const $ = id => document.getElementById(id);
const P = { panel: $('dock-body'), onSelect: () => $('dock').classList.add('open') };
const M = 'database/migrations/';

function erd(svg = $('sc-erd'), opts = P) {
    if (!svg) return;
    const d = Sketch(svg, Object.assign({ w: 1200, h: 800, seed: 41 }, opts));
    const T = (id, x0, y0, w, rows, info) => {
        const h = 26 + rows.length * 16 + 10;
        return d.node(id, { shape: 'table', x: x0 + w / 2, y: y0 + h / 2, w, h, t: id, rows, info: Object.assign({ tag: 'Bảng dữ liệu', t: id }, info) });
    };
    T('users', 20, 50, 210, ['PK id', 'username, full_name', 'email (UQ), phone', 'role: admin / customer', 'status (3 trạng thái)', 'email_verified_at, last_login'],
        { d: 'Một bảng cho cả khách hàng và quản trị viên, phân biệt bằng <b>role</b>. Tài khoản <b>banned</b> bị chặn đăng nhập và bị đăng xuất ngay ở trang quản trị.' });
    T('shipping_addresses', 20, 260, 210, ['PK id', 'FK user_id', 'receiver_name, phone', 'province, district, ward', 'address, is_default'],
        { d: 'Mỗi khách có nhiều địa chỉ, một địa chỉ mặc định được dùng khi đặt hàng nếu khách không chọn.' });
    T('messages', 20, 460, 210, ['PK id', 'FK user_id (có thể trống)', 'guest_name, guest_email', 'subject, content', 'admin_reply, status'],
        { d: 'Câu hỏi của khách. Khách vãng lai để lại tên và email; khách đã đăng nhập được gắn tài khoản.' });
    T('admin_logs', 20, 640, 210, ['PK id', 'FK user_id', 'action, table_name, record_id', 'old_value, new_value', 'ip_address'],
        { d: 'Nhật ký thao tác của quản trị viên, lưu giá trị trước và sau khi thay đổi.' });

    T('carts', 255, 50, 215, ['PK id', 'FK user_id (UQ)'], { d: 'Mỗi khách hàng có đúng một giỏ hàng.' });
    T('cart_items', 255, 180, 215, ['PK id', 'FK cart_id', 'FK product_id', 'quantity, price', 'status, abandoned_at'],
        { d: 'Lưu giá tại lúc thêm vào giỏ. Món nằm trong giỏ quá 30 ngày được đánh dấu <b>abandoned</b> để phân tích giỏ hàng bị bỏ dở.' });
    T('wishlists', 255, 380, 215, ['PK id', 'FK user_id', 'FK product_id (UQ cặp)'], { d: 'Danh sách yêu thích; mỗi sản phẩm chỉ xuất hiện một lần với mỗi khách.' });
    T('reviews', 255, 540, 215, ['PK id', 'FK user_id', 'FK product_id', 'FK order_id', 'rating, comment, images', 'status: chờ duyệt / đã duyệt'],
        { d: 'Chỉ đánh giá được sản phẩm thuộc đơn <b>đã hoàn tất</b> của chính mình. Đánh giá mới ở trạng thái chờ duyệt.' });

    T('orders', 495, 50, 250, ['PK id', 'FK user_id', 'FK shipping_address_id', 'FK promotion_id', 'order_code (UQ)', 'subtotal, shipping_fee', 'discount_amount, total_amount', 'order_status (7 trạng thái)', 'payment_method, payment_status', 'note, cancelled_reason'],
        { d: 'Đơn hàng lưu đủ các thành phần tiền: tạm tính, phí giao hàng 30.000đ, giảm giá và tổng. <b>Trạng thái đơn</b> và <b>trạng thái thanh toán</b> là hai cột riêng.' });
    T('order_items', 495, 330, 250, ['PK id', 'FK order_id', 'FK product_id', 'product_name, quantity', 'price, subtotal'],
        { d: 'Lưu lại tên và giá sản phẩm tại thời điểm mua, nên sửa hoặc xóa sản phẩm sau đó không làm sai đơn cũ.' });
    T('products', 495, 520, 250, ['PK id', 'FK category_id', 'name, slug (UQ)', 'price, discount_price', 'stock, unit, weight', 'status', 'view_count, sold_count'],
        { d: 'Giá bán áp dụng là giá khuyến mãi nếu có. Tồn kho được khóa và trừ khi chốt đơn, cộng lại khi đơn bị hủy.' });

    T('promotions', 790, 50, 205, ['PK id', 'code (UQ)', 'discount_type, discount_value', 'min_order_value, max_discount', 'usage_limit, used_count', 'start_date, end_date, status'],
        { d: 'Mã giảm theo phần trăm (có trần) hoặc số tiền cố định, có thời hạn, giới hạn lượt dùng và giá trị đơn tối thiểu.' });
    T('payments', 790, 260, 205, ['PK id', 'FK order_id', 'payment_method', 'transaction_id, amount', 'payment_status, paid_at'], { d: 'Giao dịch thanh toán của đơn hàng.' });
    T('categories', 790, 540, 205, ['PK id', 'name, slug (UQ)', 'status, display_order'], { d: 'Danh mục sản phẩm; quản trị viên sắp xếp thứ tự hiển thị.' });

    T('banners', 1015, 50, 175, ['PK id', 'title, image, link', 'position, display_order', 'status, start/end_date'], { d: 'Banner trang chủ theo vị trí và thời gian hiển thị.' });
    T('contact_messages', 1015, 200, 175, ['PK id', 'name, email, phone', 'subject, message', 'status, admin_reply'], { d: 'Form “Liên hệ”; quản trị viên trả lời qua email.' });

    const rel = (pts, sl, el) => d.edge({ k: 'rel', pts, sl, el });
    rel([[230, 80], [255, 80]], '1', '1');
    rel([[230, 140], [495, 140]], '1', 'n');
    rel([[125, 182], [125, 260]], '1', 'n');
    rel([[230, 330], [478, 330], [478, 225], [495, 225]], '1', 'n');
    rel([[362, 118], [362, 180]], '1', 'n');
    rel([[470, 270], [487, 270], [487, 585], [495, 585]], 'n', '1');
    rel([[470, 615], [495, 615]], 'n', '1');
    rel([[620, 246], [620, 330]], '1', 'n');
    rel([[620, 446], [620, 520]], 'n', '1');
    rel([[745, 210], [768, 210], [768, 300], [790, 300]], '1', 'n');
    rel([[790, 110], [745, 110]], '1', 'n');
    rel([[790, 590], [745, 590]], '1', 'n');
    d.text(600, 785, 'users còn liên kết với wishlists, reviews, messages và admin_logs (lược bớt đường nối cho dễ đọc).');
    return d.mount();
}

function architecture(svg = $('sc-arch'), opts = P) {
    if (!svg) return;
    const d = Sketch(svg, Object.assign({ w: 1100, h: 640, seed: 42 }, opts));
    const n = (id, o) => d.node(id, o);
    n('br', { x: 300, y: 60, w: 400, h: 54, t: 'Trình duyệt · React (Inertia.js)', s: 'trang khách hàng và trang quản trị', cls: 'soft',
        info: { t: 'Inertia.js', d: 'Giao diện viết bằng React nhưng điều hướng như ứng dụng nhiều trang: Laravel trả dữ liệu cho từng trang, không cần xây API riêng cho giao diện.' } });
    d.edge({ from: 'br', to: 'rt', lb: 'HTTP', lp: [312, 104, 'start'] });
    n('app', { shape: 'box', x: 430, y: 368, w: 820, h: 500, t: 'Laravel 12 · PHP 8.2' });
    n('rt', { x: 300, y: 185, w: 400, h: 52, t: 'Routes', s: 'web.php · api.php · auth.php' });
    d.edge({ from: 'rt', to: 'mw' });
    n('mw', { x: 300, y: 270, w: 560, h: 56, t: 'Middleware', s: 'auth · verified (xác minh email) · admin · throttle 10 lần/phút', cls: 'warm',
        info: { t: 'Kiểm soát truy cập', ul: ['<b>auth + verified</b>: giỏ hàng, đặt hàng, hồ sơ chỉ dành cho khách đã xác minh email', '<b>admin</b>: kiểm tra vai trò và tài khoản bị khóa ở mọi request quản trị', '<b>throttle</b>: giới hạn gửi câu hỏi 10 lần/phút/IP'] } });
    d.edge({ from: 'mw', to: 'ct' });
    n('ct', { x: 300, y: 360, w: 560, h: 56, t: 'Controllers', s: 'Cart · Order · Payment · Wishlist · Review · Message · Admin/*' });
    d.edge({ from: 'ct', to: 'sv' });
    n('sv', { x: 300, y: 450, w: 560, h: 56, t: 'OrderPlacementService', s: 'một quy trình đặt hàng cho COD, API và MoMo', cls: 'sys',
        info: { t: 'Gom nghiệp vụ đặt hàng', d: 'Mọi kênh đặt hàng dùng chung một quy trình: kiểm tra giỏ, địa chỉ, tồn kho, mã khuyến mãi, tạo đơn và trừ kho trong cùng một giao dịch.' } });
    d.edge({ from: 'sv', to: 'md' });
    n('md', { x: 300, y: 540, w: 560, h: 56, t: 'Eloquent Models (16)', s: 'User · Product · Cart · Order · Promotion · Review …' });
    n('mail', { x: 745, y: 360, w: 170, h: 56, t: 'Mail', s: 'trả lời tin nhắn, liên hệ', cls: 'sys' });
    d.edge({ from: 'ct', to: 'mail' });
    d.edge({ from: 'md', to: 'db', pts: [[580, 540], [940, 540]], lb: 'SQL', lp: [760, 531] });
    n('db', { shape: 'cyl', x: 1010, y: 540, w: 150, h: 84, t: 'MySQL', s: '16 bảng nghiệp vụ' });
    n('momo', { x: 1010, y: 300, w: 150, h: 64, t: 'MoMo', s: 'cổng thanh toán', cls: 'gone',
        info: { t: 'Thanh toán MoMo', d: 'Hệ thống gửi yêu cầu có chữ ký sang MoMo; kết quả trả về qua IPN và trang chuyển hướng đều được xác thực chữ ký trước khi ghi nhận đã thanh toán.' } });
    d.edge({ k: 'dash', pts: [[580, 360], [610, 360], [610, 300], [935, 300]], lb: 'tạo giao dịch', lp: [770, 291] });
    d.edge({ k: 'async', pts: [[1010, 332], [1010, 414], [560, 414], [560, 390]], lb: 'IPN (server gọi lại)', lp: [800, 405] });
    n('smtp', { x: 1010, y: 160, w: 150, h: 56, t: 'Máy chủ email', cls: 'gone' });
    d.edge({ k: 'dash', pts: [[830, 360], [850, 360], [850, 160], [935, 160]] });
    return d.mount();
}

function scUseCase(svg = $('sc-uc'), opts = P) {
    if (!svg) return;
    const d = Sketch(svg, Object.assign({ w: 1200, h: 820, seed: 44 }, opts));
    d.node('sys', { shape: 'box', x: 560, y: 410, w: 640, h: 730, t: 'Hệ thống Sweet Cake' });

    const actor = (id, x, y, t, info) => d.node(id, { shape: 'actor', x, y, t, info });
    actor('kvl', 100, 200, 'Khách vãng lai', { t: 'Khách vãng lai', d: 'Người dùng chưa đăng nhập. Xem sản phẩm, thêm vào giỏ, đặt hàng COD và gửi tin nhắn được mà không cần tài khoản.' });
    actor('kh',  100, 590, 'Khách hàng',    { t: 'Khách hàng',    d: 'Đã đăng nhập và xác minh email (<code>auth + verified</code> middleware). Kế thừa toàn bộ chức năng của khách vãng lai, thêm lịch sử đơn, hủy đơn và đánh giá.' });
    actor('qt', 1100, 400, 'Quản trị viên', { t: 'Quản trị viên', d: 'Quản lý nội dung và đơn hàng. <code>AdminMiddleware</code> kiểm tra vai trò và tài khoản bị khóa ở mọi request; mọi thao tác được ghi vào <code>admin_logs</code>.' });

    /* noi actor → use case (ve truoc de nam duoi node) */
    const lys_kvl = [90, 160, 230, 300, 370, 440, 510];
    const lys_kh  = [580, 650, 720];
    const rys_qt  = [110, 200, 280, 360, 440, 520, 600, 680];
    lys_kvl.forEach(y => d.edge({ k: 'line', pts: [[124, 200], [275, y]] }));
    lys_kh.forEach(y  => d.edge({ k: 'line', pts: [[124, 590], [275, y]] }));
    rys_qt.forEach(y  => d.edge({ k: 'line', pts: [[1076, 400], [845, y]] }));

    const U = (id, x, y, t, info) => d.node(id, { shape: 'ellipse', x, y, w: 250, h: 50, t, small: true, info });
    /* cot trai — khach */
    U('u1',  400,  90, 'UC-01 Xem & tìm sản phẩm',         { t: 'UC-01', d: 'Duyệt theo danh mục, tìm kiếm theo tên; sản phẩm ngừng bán ẩn khỏi trang khách.' });
    U('u2',  400, 160, 'UC-02 Thêm vào giỏ hàng',           { t: 'UC-02', d: 'Kiểm tra còn bán và tồn kho đủ cho tổng sau khi cộng dồn; tăng số lượng hoặc thêm món mới vào giỏ.' });
    U('u3',  400, 230, 'UC-03 Mở giỏ: đồng bộ kho & giá',  { t: 'UC-03', d: 'Trước khi hiển thị giỏ: bỏ sản phẩm ngừng bán, giảm số lượng vượt tồn kho, cập nhật giá mới nhất.' });
    U('u4',  400, 300, 'UC-04 Đặt hàng (COD)',               { t: 'UC-04', d: '<code>OrderPlacementService::placeFromCart()</code> dùng chung cho COD, API và MoMo: kiểm tra kho, áp mã, tạo đơn, trừ kho trong cùng một giao dịch.' });
    U('u5',  400, 370, 'UC-05 Thanh toán MoMo',              { t: 'UC-05', d: 'Hệ thống tạo đơn trước, chuyển sang cổng MoMo; IPN và redirect đều được xác thực chữ ký HMAC-SHA256 trước khi ghi nhận.' });
    U('u6',  400, 440, 'UC-06 Kiểm tra mã khuyến mãi',      { t: 'UC-06', d: 'Chuỗi kiểm tra: tồn tại, đang bật, trong hạn, còn lượt, đạt đơn tối thiểu, rồi tính giảm có trần.' });
    U('u7',  400, 510, 'UC-07 Gửi tin nhắn hỏi đáp',        { t: 'UC-07', d: 'API công khai giới hạn 10 lần/phút/IP. Khách vãng lai để lại tên + email; khách đăng nhập được gắn tài khoản.' });
    U('u8',  400, 580, 'UC-08 Xem lịch sử đơn hàng');
    U('u9',  400, 650, 'UC-09 Hủy đơn',                     { t: 'UC-09', d: 'Chỉ hủy đơn của chính mình khi còn pending / confirmed; tồn kho cộng lại trong cùng giao dịch.' });
    U('u10', 400, 720, 'UC-10 Đánh giá sản phẩm',           { t: 'UC-10', d: 'Chỉ đánh giá sản phẩm thuộc đơn đã hoàn tất của chính mình; đánh giá mới ở trạng thái chờ duyệt.' });
    /* cot phai — quan tri */
    U('u11', 720, 110, 'UC-11 Quản lý sản phẩm & danh mục');
    U('u12', 720, 200, 'UC-12 Quản lý & cập nhật đơn hàng');
    U('u13', 720, 280, 'UC-13 Quản lý mã khuyến mãi');
    U('u14', 720, 360, 'UC-14 Trả lời tin nhắn khách');
    U('u15', 720, 440, 'UC-15 Xem doanh thu & thống kê');
    U('u16', 720, 520, 'UC-16 Quản lý banner trang chủ');
    U('u17', 720, 600, 'UC-17 Duyệt & ẩn đánh giá');
    U('u18', 720, 680, 'UC-18 Quản lý tài khoản khách');

    d.edge({ k: 'inherit', pts: [d.A('kh', 't'), d.A('kvl', 'b')] });
    return d.mount();
}

window.SCD = { erd, architecture, scUseCase };
if (!window.SCD_NO_AUTO) { erd(); architecture(); }
})();
