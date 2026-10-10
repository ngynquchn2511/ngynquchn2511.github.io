/* =====================================================================
   Cac so do cua du an Homestay May — dung lai tu MA NGUON THAT
   (D:\CongNgheJava\hotel-booking, package com.hotel). Moi khoi bam vao
   duoc se hien giai thich + doan code tuong ung.
   ===================================================================== */
(function () {
'use strict';
const $ = id => document.getElementById(id);
const SVC = 'service/BookingService.java';
const PAY = 'service/PaymentService.java';
// Mot bang chi tiet noi dung chung cho moi so do
const P = { panel: $('dock-body'), onSelect: () => $('dock').classList.add('open') };

/* ================= 1. KIEN TRUC ================= */
function architecture(svg = $('dg-arch'), opts = P) {
    if (!svg) return;
    const d = Sketch(svg, { w: 1180, h: 720, ...opts, seed: 11 });
    const n = (id, o) => d.node(id, o);

    n('browser', { x: 300, y: 60, w: 380, h: 52, t: 'Trình duyệt', s: 'khách · lễ tân · quản trị — HTML + fetch JSON', cls: 'soft',
        info: { tag: 'Client', t: 'Trình duyệt', d: 'Trang được render phía server bằng Thymeleaf. Chỉ hai chỗ gọi JSON bằng <code>fetch</code>: <b>chatbot Mây</b> (<code>/api/chatbot/**</code>) và nút <b>“Kiểm tra mã”</b> giảm giá (<code>/customer/bookings/check-discount</code>).' } });
    d.edge({ from: 'browser', to: 'caddy', lb: 'HTTPS' });
    n('caddy', { x: 300, y: 150, w: 380, h: 50, t: 'Caddy 2 — HTTPS tự động', s: 'Let’s Encrypt · reverse_proxy app:8080',
        info: { tag: 'Deploy', t: 'Caddy reverse proxy', d: 'Container riêng trong <code>docker-compose.yml</code>, tự xin và gia hạn chứng chỉ HTTPS cho tên miền, nén gzip, cho phép upload tới 200MB (video đánh giá).',
            c: `{$DOMAIN} {
    encode gzip
    request_body { max_size 200MB }
    reverse_proxy app:8080
}`, r: 'deploy/Caddyfile' } });

    n('app', { shape: 'box', x: 465, y: 440, w: 870, h: 480, t: 'Docker · app — Spring Boot 3.3 · Java 17 · Tomcat nhúng' });

    d.edge({ pts: [[300, 175], [300, 232], [195, 232], [195, 242]] });
    n('sec1', { x: 195, y: 268, w: 270, h: 52, t: 'SecurityFilterChain @Order(1)', s: '/admin/** · /staff/** · login /admin',
        info: { tag: 'Spring Security', t: 'Cổng quản trị', d: 'Chuỗi bảo vệ riêng cho khu lễ tân / quản trị, xét <b>trước</b>. Phân quyền chi tiết theo URL: tài khoản nhân viên, nhật ký, giá & đặt cọc chỉ <b>ADMIN</b>; còn lại ADMIN hoặc STAFF.',
            c: `<span class="k">@Bean</span> <span class="k">@Order</span>(1)
SecurityFilterChain adminFilterChain(HttpSecurity http) {
  http.securityMatcher(<span class="s">"/admin"</span>, <span class="s">"/admin/**"</span>, <span class="s">"/staff/**"</span>)
    .authorizeHttpRequests(a -> a
      .requestMatchers(<span class="s">"/admin/staff-accounts/**"</span>, <span class="s">"/admin/audit-logs/**"</span>).hasRole(<span class="s">"ADMIN"</span>)
      .requestMatchers(<span class="s">"/admin/pricing/**"</span>).hasRole(<span class="s">"ADMIN"</span>)
      .requestMatchers(<span class="s">"/admin/**"</span>).hasAnyRole(<span class="s">"ADMIN"</span>, <span class="s">"STAFF"</span>))
    .formLogin(f -> f.loginPage(<span class="s">"/admin"</span>) ...);`, r: 'config/SecurityConfig.java:75' } });
    d.edge({ pts: [[300, 232], [485, 232], [485, 242]] });
    n('sec2', { x: 485, y: 268, w: 270, h: 52, t: 'SecurityFilterChain @Order(2)', s: 'mọi URL còn lại · login /login',
        info: { tag: 'Spring Security', t: 'Cổng khách hàng', d: 'Trang giới thiệu, danh sách phòng, đặt phòng, chatbot mở cho mọi người; <code>/customer/**</code> (lịch sử, sửa / hủy đơn) cần vai trò <b>CUSTOMER</b>. Đăng nhập sai cổng bị chặn bởi <code>CustomerPortalSuccessHandler</code>.',
            c: `<span class="k">@Bean</span> <span class="k">@Order</span>(2)
SecurityFilterChain customerFilterChain(HttpSecurity http) {
  http.authorizeHttpRequests(a -> a
      .requestMatchers(<span class="s">"/"</span>, <span class="s">"/about"</span>, <span class="s">"/rooms/**"</span>, <span class="s">"/login"</span>, ...).permitAll()
      .requestMatchers(<span class="s">"/api/chatbot/**"</span>).permitAll()
      .requestMatchers(<span class="s">"/customer/**"</span>).hasRole(<span class="s">"CUSTOMER"</span>))
    .formLogin(f -> f.loginPage(<span class="s">"/login"</span>) ...);`, r: 'config/SecurityConfig.java:123' } });
    n('csrf', { x: 762, y: 268, w: 235, h: 52, t: 'CSRF · BCrypt', s: 'csrfTokenEagerLoadFilter', cls: 'warm',
        info: { tag: 'Bảo mật', t: 'CSRF token tạo sớm', d: 'Spring Security 6 tạo CSRF token lười (chống BREACH). Một filter đặt ngay sau <code>CsrfFilter</code> gọi <code>getToken()</code> từ đầu request để widget chatbot và các form luôn có token, tránh trang bị cắt giữa chừng khi response đã commit. Mật khẩu băm bằng <b>BCrypt</b>.', r: 'config/SecurityConfig.java:51' } });

    d.edge({ from: 'sec1', to: 'ctrl', pts: [[195, 294], [195, 323]] });
    d.edge({ from: 'sec2', to: 'ctrl', pts: [[485, 294], [485, 323]] });
    n('ctrl', { x: 340, y: 350, w: 560, h: 54, t: 'Controller · Spring MVC (25 lớp)', s: 'Customer* · Admin* · Auth · ChatbotController (JSON) · GlobalExceptionHandler',
        info: { tag: 'Tầng web', t: 'Controller', d: 'Nhận request, gọi service, trả về tên view Thymeleaf hoặc JSON. Mọi lỗi nghiệp vụ là <code>BusinessException</code> — controller bắt và hiện lại form; còn lại do <code>GlobalExceptionHandler</code> trả trang lỗi thân thiện (404 thay cho 500).', r: 'controller/' } });
    d.edge({ from: 'ctrl', to: 'view' });
    n('view', { x: 762, y: 350, w: 235, h: 54, t: 'Thymeleaf · 47 trang', s: 'messages_vi / messages_en',
        info: { tag: 'Giao diện', t: 'View song ngữ', d: 'Toàn bộ chữ trên trang khách, thông báo lỗi và chatbot lấy từ <code>messages.properties</code> / <code>messages_en.properties</code>. Nội dung phòng, combo có cột tiếng Anh riêng (<code>name_en</code>, <code>description_en</code>).', r: 'resources/templates/ · messages*.properties' } });

    d.edge({ from: 'ctrl', to: 'svc', pts: [[340, 377], [340, 408]] });
    n('svc', { x: 340, y: 440, w: 560, h: 64, t: 'Service · nghiệp vụ (20 lớp)', s: 'Booking · Pricing · Payment · RoomCalendar · GuestRegistration\nReview · Chatbot · Email · AuditLog · RevenueExport (Excel)',
        info: { tag: 'Tầng nghiệp vụ', t: 'Service', d: 'Toàn bộ quy tắc nằm ở đây, không ở controller:',
            ul: ['<b>BookingService</b> — đặt phòng, khóa phòng, vòng đời đơn', '<b>PricingService</b> — giá từng đêm, phụ thu cuối tuần / ngày lễ, tiền cọc', '<b>PaymentService</b> — VietQR, phụ phí, check-out, hóa đơn', '<b>ChatbotService</b> — trả lời bằng dữ liệu thật, không gọi AI bên ngoài', '<b>RevenueExport / GuestRegistrationExport</b> — xuất Excel (Apache POI)'], r: 'service/' } });
    d.edge({ from: 'svc', to: 'files' });
    n('files', { x: 762, y: 440, w: 235, h: 54, t: 'FileStorageService', s: 'uploads/ · ảnh phòng, combo, video',
        info: { tag: 'Lưu file', t: 'Ảnh & video upload', d: 'Lưu vào thư mục <code>uploads/</code> (volume Docker riêng nên deploy lại không mất). Kiểm tra định dạng, ảnh tối đa 5MB, video đánh giá tối đa 30MB/tệp.', r: 'service/FileStorageService.java' } });

    d.edge({ from: 'svc', to: 'repo', pts: [[340, 472], [340, 503]] });
    n('repo', { x: 340, y: 530, w: 560, h: 54, t: 'Repository · Spring Data JPA / Hibernate', s: 'JPQL · findByIdForUpdate (PESSIMISTIC_WRITE) · existsOverlappingBooking',
        info: { tag: 'Truy cập dữ liệu', t: 'Repository', d: 'Kế thừa <code>JpaRepository</code>; truy vấn đặc thù viết bằng JPQL. Hai truy vấn quan trọng nhất cho bài toán chống đặt trùng:',
            c: `<span class="k">@Lock</span>(LockModeType.PESSIMISTIC_WRITE)
<span class="k">@QueryHints</span>(<span class="k">@QueryHint</span>(name = <span class="s">"jakarta.persistence.lock.timeout"</span>, value = <span class="s">"5000"</span>))
Optional&lt;Room&gt; findByIdForUpdate(Long id);

<span class="c">// BR-01: don giu cho PENDING / CONFIRMED / CHECKED_IN chong khoang ngay</span>
<span class="k">boolean</span> existsOverlappingBooking(Long roomId, LocalDate in, LocalDate out);`, r: 'repository/RoomRepository.java · BookingRepository.java' } });
    d.edge({ from: 'repo', to: 'audit', k: 'dash', pts: [[620, 548], [632, 548], [632, 620], [645, 620]], lb: 'sự kiện', lp: [638, 586, 'start'] });

    d.edge({ k: 'async', pts: [[60, 440], [44, 440], [44, 620], [60, 620]] });
    n('mail', { x: 195, y: 620, w: 270, h: 54, t: 'mailExecutor (ThreadPool)', s: 'gửi email sau khi COMMIT', cls: 'sys',
        info: { tag: 'Bất đồng bộ', t: 'Gửi email ở luồng riêng', d: 'Email chỉ được gửi <b>sau khi giao dịch commit</b> và chạy trên thread pool riêng: trang không phải chờ SMTP, khóa dòng phòng được nhả nhanh nhất, rollback thì không có email sai.',
            c: `TransactionSynchronizationManager.registerSynchronization(
    <span class="k">new</span> TransactionSynchronization() {
        <span class="k">@Override public void</span> afterCommit() { mailExecutor.execute(send); }
    });`, r: 'service/EmailService.java:102 · config/MailConfig.java' } });
    n('sched', { x: 485, y: 620, w: 270, h: 54, t: '@Scheduled · 5 phút/lần', s: 'BookingExpirationScheduler', cls: 'sys',
        info: { tag: 'Tác vụ định kỳ', t: 'Tự hủy đơn quá hạn', d: 'Đơn <b>PENDING</b> bị chuyển <b>CANCELLED</b> khi quá hạn chuyển cọc, hoặc còn dưới 6 giờ tới giờ nhận phòng mà chưa được xác nhận; khách nhận email báo hủy.',
            c: `<span class="k">@Scheduled</span>(fixedRate = 5 * 60 * 1000)
<span class="k">public void</span> expireUnconfirmedBookings() {
    <span class="k">if</span> (now.isAfter(confirmDeadline) || depositOverdue)
        booking.setStatus(BookingStatus.CANCELLED);`, r: 'config/BookingExpirationScheduler.java:34' } });
    d.edge({ from: 'sched', to: 'repo', pts: [[485, 593], [485, 557]] });
    n('audit', { x: 762, y: 620, w: 235, h: 54, t: 'AuditEntityListener', s: 'ghi nhật ký mọi INSERT / UPDATE / DELETE', cls: 'warm',
        info: { tag: 'Nhật ký', t: 'Nhật ký thao tác tự động', d: 'Lắng nghe sự kiện Hibernate <code>PostInsert / PostUpdate / PostDelete</code> của mọi entity và ghi một dòng <code>audit_logs</code>: ai, vai trò, thay đổi gì, IP, URL. Không cần gọi tay ở từng service.', r: 'audit/AuditEntityListener.java' } });

    // Ben ngoai
    d.edge({ k: 'dash', pts: [[490, 50], [1045, 50], [1045, 105]], lb: 'mở liên kết', lp: [780, 41] });
    n('zalo', { x: 1045, y: 130, w: 230, h: 50, t: 'Zalo · Google Maps', s: 'liên kết ngoài', cls: 'gone',
        info: { tag: 'Bên ngoài', t: 'Liên kết ngoài', d: 'Nút nhắn Zalo nổi trên trang khách và bản đồ đường tới homestay — chỉ là liên kết, số Zalo lấy từ biến môi trường <code>ZALO_PHONE</code>.' } });
    d.edge({ k: 'dash', pts: [[490, 70], [912, 70], [912, 350], [930, 350]], lb: 'tải ảnh QR', lp: [918, 220, 'start'] });
    n('qr', { x: 1045, y: 350, w: 230, h: 54, t: 'img.vietqr.io', s: 'QR cọc & thanh toán, điền sẵn tiền', cls: 'gone',
        info: { tag: 'Bên ngoài', t: 'VietQR', d: 'Server chỉ dựng URL ảnh; trình duyệt tải ảnh QR chuẩn Napas đã điền sẵn số tiền và nội dung chuyển khoản.',
            c: `<span class="k">return</span> <span class="s">"https://img.vietqr.io/image/"</span> + bankId + <span class="s">"-"</span> + accountNo
        + <span class="s">"-compact2.png?amount="</span> + amount + <span class="s">"&addInfo="</span> + content ...;`, r: PAY + ':93' } });
    d.edge({ from: 'repo', to: 'db', pts: [[620, 530], [930, 530]], lb: 'JDBC', lp: [775, 521] });
    n('db', { shape: 'cyl', x: 1045, y: 530, w: 230, h: 84, t: 'MySQL 8 (Docker)', s: 'hotel_booking · 15 bảng · utf8mb4',
        info: { tag: 'Cơ sở dữ liệu', t: 'MySQL 8', d: 'Container <code>mysql:8.0</code> có healthcheck; app chỉ khởi động khi DB sẵn sàng. Dữ liệu nằm trong volume <code>db_data</code>. Hibernate <code>ddl-auto=update</code> tự tạo / bổ sung bảng.', r: 'deploy/docker-compose.yml' } });
    d.edge({ k: 'async', pts: [[195, 647], [195, 696], [912, 696], [912, 640], [930, 640]], lb: 'SMTP', lp: [560, 688] });
    n('gmail', { x: 1045, y: 640, w: 230, h: 54, t: 'Gmail SMTP', s: 'xác nhận đơn · hóa đơn · đặt lại MK', cls: 'gone',
        info: { tag: 'Bên ngoài', t: 'Gmail SMTP', d: 'Spring Mail gửi qua Gmail. Thiếu cấu hình <code>MAIL_USERNAME / MAIL_PASSWORD</code> thì chỉ ghi log — đặt phòng vẫn thành công.', r: 'service/EmailService.java' } });
    return d.mount();
    return d;
}

/* ================= 2. TUAN TU: HAI KHACH CUNG DAT 1 PHONG ================= */
function sequence(svg = $('dg-seq'), opts = P) {
    if (!svg) return;
    const d = Sketch(svg, { w: 1180, h: 760, ...opts, seed: 7 });
    const X = { a: 80, b: 230, c: 420, s: 680, db: 930, m: 1100 };
    const head = (id, x, w, t, info) => d.node(id, { shape: 'head', x, y: 46, w, h: 54, t, info });
    head('hA', X.a, 120, 'Khách A');
    head('hB', X.b, 120, 'Khách B');
    head('hC', X.c, 190, 'CustomerBooking\nController');
    head('hS', X.s, 250, 'BookingService\n@Transactional READ_COMMITTED', { t: 'Giao dịch READ_COMMITTED', d: 'Mặc định MySQL là <b>REPEATABLE READ</b>: sau khi chờ khóa, B vẫn đọc “ảnh chụp” cũ và <b>bỏ sót</b> đơn A. Hạ xuống <b>READ_COMMITTED</b> để câu kiểm tra trùng chạy sau khi chờ khóa đọc được đơn A vừa commit.', c: `<span class="k">@Transactional</span>(isolation = Isolation.READ_COMMITTED)
<span class="k">public</span> Booking createBooking(...)`, r: SVC + ':208' });
    head('hD', X.db, 150, 'MySQL');
    head('hM', X.m, 130, 'mailExecutor');
    Object.entries(X).forEach(([k, x]) => d.edge({ k: 'life', pts: [[x, 74], [x, 735]] }));

    const msg = (x1, x2, y, lb, k = 'flow', below) => d.edge({ k, lc: 'msg', pts: [[x1, y], [x2, y]], lb, lp: [(x1 + x2) / 2, below ? y + 12 : y - 10] });
    msg(X.a, X.c - 4, 112, 'POST /customer/bookings/new');
    msg(X.b, X.c - 4, 136, 'POST — cùng phòng, cùng ngày', 'flow', true);
    d.node('actA', { shape: 'bar', x: X.s, y: 300, w: 14, h: 280 });
    msg(X.c, X.s - 7, 170, 'createBooking(A)');
    msg(X.s + 7, X.db - 4, 204, 'SELECT … FOR UPDATE (khóa)');
    d.node('nLock', { shape: 'note', x: X.db + 92, y: 204, w: 128, h: 40, t: '🔒 A giữ khóa', small: true,
        info: { t: 'Khóa dòng phòng', d: 'Khóa bi quan trên đúng <b>một dòng</b> của bảng <code>rooms</code> — các phòng khác vẫn đặt song song bình thường. Người sau chờ tối đa <b>5 giây</b>, quá thì báo “phòng đang bận”.', c: `<span class="k">private</span> Optional&lt;Room&gt; lockRoom(Long roomId) {
    <span class="k">try</span> { <span class="k">return</span> roomRepository.findByIdForUpdate(roomId); }
    <span class="k">catch</span> (PessimisticLockingFailureException | QueryTimeoutException ex) {
        <span class="k">throw</span> BusinessException.of(<span class="s">"err.roomBusy"</span>);
    }
}`, r: SVC + ':175' } });
    msg(X.s + 7, X.db - 4, 240, 'existsOverlappingBooking → false');
    msg(X.s + 7, X.db - 4, 276, 'INSERT booking (PENDING)');
    msg(X.c, X.s - 7, 312, 'createBooking(B) → phải CHỜ khóa', 'dash');
    msg(X.s + 7, X.db - 4, 350, 'COMMIT → nhả khóa 🔓');
    msg(X.s + 7, X.m - 4, 386, 'afterCommit: gửi email xác nhận A', 'async');
    msg(X.s - 7, X.c + 4, 422, 'booking A', 'ret');
    msg(X.c, X.a + 4, 452, 'redirect /bookings/{id}?token=… + QR cọc', 'ret');
    d.node('actB', { shape: 'bar', x: X.s + 10, y: 582, w: 14, h: 196 });
    msg(X.s + 17, X.db - 4, 496, 'B khóa được phòng (sau khi A xong)');
    msg(X.s + 17, X.db - 4, 532, 'existsOverlappingBooking → TRUE');
    d.node('nRC', { shape: 'note', x: 900, y: 584, w: 300, h: 50, t: 'READ_COMMITTED nên đọc được đơn A\nvừa commit — không bỏ sót', small: true });
    d.edge({ k: 'err', lc: 'msg', pts: [[X.s + 3, 640], [X.c + 4, 640]], lb: 'BusinessException → ROLLBACK, nhả khóa', lp: [(X.s + X.c) / 2, 630] });
    d.edge({ k: 'err ret', lc: 'msg', pts: [[X.c, 676], [X.b + 4, 676]], lb: 'form + “phòng vừa được đặt”, gợi ý ngày trống', lp: [(X.c + X.b) / 2 + 6, 666] });
    d.text(590, 722, 'Kết quả: phòng chỉ có đúng một đơn. B không cần tải lại trang — thông báo hiện ngay trên form xác nhận.');
    return d.mount();
}

/* ================= 3. VONG DOI DON DAT PHONG ================= */
function bookingState(svg = $('dg-bstate'), opts = P) {
    if (!svg) return;
    const d = Sketch(svg, { w: 1180, h: 590, ...opts, seed: 5 });
    const st = (id, x, y, t, s, info, cls) => d.node(id, { shape: 'pill', x, y, w: 196, h: 66, t, s, info, cls });
    d.node('s1', { shape: 'start', x: 150, y: 92 });
    d.edge({ from: 's1', to: 'P', pts: [[150, 104], [150, 217]], lb: 'createBooking()\nkhách đặt online', lp: [160, 160, 'start'] });
    st('P', 150, 250, 'CHỜ XÁC NHẬN', 'PENDING', { tag: 'BookingStatus', t: 'PENDING', d: 'Trạng thái khởi đầu của đơn đặt online. Nếu homestay bật đặt cọc, đơn kèm <b>tiền cọc + hạn chuyển cọc</b> và mã VietQR.', c: `<span class="c">// han coc = luc dat + so gio cai dat, nhung khong muon hon 6h truoc gio nhan</span>
LocalDateTime deadline = now().plusHours(settings.getDepositDeadlineHours());
LocalDateTime latest = LocalDateTime.of(checkInDate, checkInTime).minusHours(6);
<span class="k">return</span> deadline.isAfter(latest) ? latest : deadline;`, r: SVC + ':229' }, 'warm');
    d.node('s2', { shape: 'start', x: 450, y: 92 });
    d.edge({ from: 's2', to: 'C', pts: [[450, 104], [450, 217]], lb: 'createWalkInBooking()\nlễ tân đặt tại quầy', lp: [460, 160, 'start'] });
    d.edge({ from: 'P', to: 'C', lb: 'confirmBooking()\nhoặc confirmDeposit()\n[không trùng đơn đã xác nhận]', lp: [300, 302] });
    st('C', 450, 250, 'ĐÃ XÁC NHẬN', 'CONFIRMED', { tag: 'BookingStatus', t: 'CONFIRMED', d: 'Vào được bằng 3 đường: lễ tân bấm <b>Xác nhận</b>, bấm <b>Đã nhận cọc</b> (ghi <code>depositPaidAt</code>), hoặc đơn <b>đặt tại quầy</b> được xác nhận ngay. Trước khi xác nhận, hệ thống khóa phòng và chặn nếu đã có đơn khác <i>đã xác nhận</i> trùng ngày.', c: `<span class="k">if</span> (booking.getStatus() != BookingStatus.PENDING)
    <span class="k">throw new</span> BusinessException(<span class="s">"Chỉ có thể xác nhận đơn đang Chờ xác nhận"</span>);
ensureNoConfirmedConflict(booking);   <span class="c">// lockRoom + kiem tra trung</span>
booking.setStatus(BookingStatus.CONFIRMED);`, r: SVC + ':498' });
    d.edge({ from: 'C', to: 'I', lb: 'checkIn()\n[đã khai báo ≥ 1 khách]', lp: [600, 208] });
    st('I', 750, 250, 'ĐÃ NHẬN PHÒNG', 'CHECKED_IN', { tag: 'BookingStatus', t: 'CHECKED_IN', d: '<b>BR-04</b>: chỉ đơn CONFIRMED mới check-in được, và phải khai báo lưu trú ít nhất một khách. Phòng chuyển <b>OCCUPIED</b>.', c: `<span class="k">if</span> (booking.getStatus() != BookingStatus.CONFIRMED) <span class="k">throw</span> ...;
<span class="k">if</span> (guestRepository.countByBookingId(bookingId) == 0)
    <span class="k">throw new</span> BusinessException(<span class="s">"Vui lòng khai báo lưu trú ... trước khi check-in"</span>);
booking.setStatus(BookingStatus.CHECKED_IN);
room.setStatus(RoomStatus.OCCUPIED);`, r: SVC + ':534' }, 'sys');
    d.edge({ from: 'I', to: 'O', lb: 'checkOutWithPayment()\n[đã thu đủ tiền]', lp: [895, 208] });
    st('O', 1040, 250, 'ĐÃ TRẢ PHÒNG', 'CHECKED_OUT', { tag: 'BookingStatus', t: 'CHECKED_OUT', d: '<b>BR-05</b>: chỉ đơn CHECKED_IN. Tiền mặt ghi nhận ngay; chuyển khoản phải được xác nhận đã nhận tiền trước. Phòng chuyển <b>NOT_READY</b> (chờ dọn) và khách nhận <b>hóa đơn qua email</b>.', c: `<span class="k">if</span> (!isPaid(bookingId)) {
    <span class="k">switch</span> (method) {
        <span class="k">case</span> CASH -> markPaid(booking, PaymentMethod.CASH);
        <span class="k">case</span> BANK_TRANSFER -> <span class="k">throw new</span> BusinessException(<span class="s">"Chưa nhận được tiền chuyển khoản..."</span>);
        <span class="k">default</span> -> <span class="k">throw new</span> BusinessException(<span class="s">"... thẻ hiện chưa được hỗ trợ"</span>);
    }
}
bookingService.checkOut(bookingId);`, r: PAY + ':191' }, 'gone');
    d.edge({ from: 'O', to: 'e1', pts: [[1040, 283], [1040, 425]] });
    d.node('e1', { shape: 'end', x: 1040, y: 440 });

    d.edge({ from: 'P', to: 'X', pts: [[150, 283], [150, 470], [222, 470]], lb: 'khách / lễ tân hủy\nhoặc Scheduler tự hủy:\nquá hạn cọc, < 6 giờ', lp: [160, 375, 'start'] });
    d.edge({ from: 'C', to: 'X', pts: [[450, 283], [450, 470], [418, 470]], lb: 'khách / lễ tân hủy', lp: [460, 375, 'start'] });
    st('X', 320, 470, 'ĐÃ HỦY', 'CANCELLED', { tag: 'BookingStatus', t: 'CANCELLED', d: 'Chỉ hủy được từ <b>PENDING</b> hoặc <b>CONFIRMED</b>. Khách tự hủy trong trang đơn của mình; lễ tân hủy thay khách; bộ hẹn giờ tự hủy đơn PENDING quá hạn. Đơn đã hủy không còn giữ chỗ và bị loại khỏi doanh thu.', c: `<span class="c">// Theo dung state flow: chi PENDING hoac CONFIRMED moi duoc huy</span>
<span class="k">if</span> (booking.getStatus() != BookingStatus.PENDING
        && booking.getStatus() != BookingStatus.CONFIRMED)
    <span class="k">throw</span> BusinessException.of(<span class="s">"err.cancelState"</span>, ...);`, r: SVC + ':457' }, 'err');
    d.edge({ from: 'X', to: 'e2', pts: [[320, 503], [320, 540]] });
    d.node('e2', { shape: 'end', x: 320, y: 555 });
    d.node('mod', { shape: 'note', x: 800, y: 455, w: 420, h: 78, t: 'Khi PENDING hoặc CONFIRMED và còn ≥ 6 giờ\ntới giờ nhận phòng: khách được đổi giờ, đổi combo', s: 'canModify() · updateTimes() · updateCombo()',
        info: { t: 'Sửa đơn trước 6 giờ', d: 'Đổi combo thì <b>giữ nguyên tiền phòng đã chốt</b> lúc đặt, tính lại giảm giá; nếu chưa chuyển cọc thì tính lại tiền cọc theo tổng mới.', c: `<span class="k">public boolean</span> canModify(Booking booking) {
    <span class="k">if</span> (status != PENDING && status != CONFIRMED) <span class="k">return false</span>;
    <span class="k">return</span> now().isBefore(checkInDateTime.minusHours(EDIT_CUTOFF_HOURS));
}`, r: SVC + ':383' } });
    return d.mount();
}

/* ================= 4. TRANG THAI PHONG ================= */
function roomState(svg = $('dg-rstate'), opts = P) {
    if (!svg) return;
    const d = Sketch(svg, { w: 1000, h: 500, ...opts, seed: 9 });
    const st = (id, x, y, t, s, info, cls) => d.node(id, { shape: 'pill', x, y, w: 210, h: 66, t, s, info, cls });
    d.node('s', { shape: 'start', x: 330, y: 50 });
    d.edge({ from: 's', to: 'A', pts: [[330, 62], [330, 127]], lb: 'RoomService.create()', lp: [342, 96, 'start'] });
    st('A', 330, 160, 'CÒN TRỐNG', 'AVAILABLE', { tag: 'RoomStatus', t: 'AVAILABLE', d: 'Trạng thái phòng là <b>tình trạng vật lý</b>. Phòng có trống trong một khoảng ngày hay không được tính riêng từ các đơn (BR-01), không dựa vào trạng thái này.', r: 'service/RoomService.java:132' }, 'sys');
    d.edge({ from: 'A', to: 'O', lb: 'checkIn() của đơn', lp: [580, 150] });
    st('O', 830, 160, 'ĐANG SỬ DỤNG', 'OCCUPIED', { tag: 'RoomStatus', t: 'OCCUPIED', d: 'Đặt tự động khi lễ tân check-in một đơn của phòng.', c: `booking.setStatus(BookingStatus.CHECKED_IN);
Room room = booking.getRoom();
room.setStatus(RoomStatus.OCCUPIED);`, r: SVC + ':545' }, 'warm');
    d.edge({ from: 'O', to: 'N', pts: [[830, 193], [830, 327]], lb: 'checkOut()', lp: [842, 262, 'start'] });
    st('N', 830, 360, 'CHƯA SẴN SÀNG', 'NOT_READY · chờ dọn', { tag: 'RoomStatus', t: 'NOT_READY', d: 'Sau check-out phòng chưa được nhận khách ngay — nhân viên dọn xong phải bấm <b>“Đã dọn xong”</b>.', c: `<span class="c">// NOT_READY -> AVAILABLE</span>
<span class="k">public void</span> markReady(Long id) {
    <span class="k">if</span> (room.getStatus() != RoomStatus.NOT_READY)
        <span class="k">throw new</span> BusinessException(<span class="s">"Phòng này hiện không ở trạng thái chờ dọn dẹp"</span>);
    room.setStatus(RoomStatus.AVAILABLE);
}`, r: 'service/RoomService.java:213' }, 'gone');
    d.edge({ from: 'N', to: 'A', pts: [[725, 360], [390, 360], [390, 193]], lb: 'markReady()\n“Đã dọn xong”', lp: [560, 345] });
    d.edge({ from: 'A', to: 'M', pts: [[270, 193], [270, 327]], lb: 'đặt bảo trì', lp: [262, 262, 'end'] });
    st('M', 200, 360, 'ĐANG BẢO TRÌ', 'MAINTENANCE', { tag: 'RoomStatus', t: 'MAINTENANCE', d: 'Nhân viên chuyển tay (<code>changeStatus</code>). Phòng bảo trì <b>bị loại khỏi kết quả tìm phòng</b> và bị chặn ngay trong bước đặt (BR-03), không tính vào số phòng có thể bán khi tính công suất.', c: `<span class="c">-- RoomRepository.findAvailableRooms</span>
WHERE r.status &lt;&gt; com.hotel.entity.RoomStatus.MAINTENANCE
<span class="c">// BookingService.buildBooking</span>
<span class="k">if</span> (room.getStatus() == RoomStatus.MAINTENANCE) <span class="k">throw</span> ...;`, r: 'repository/RoomRepository.java:37' }, 'err');
    d.edge({ from: 'M', to: 'A', pts: [[130, 327], [130, 160], [225, 160]], lb: 'mở lại phòng', lp: [122, 250, 'end'] });
    d.text(500, 465, 'Không có phòng nào bị “đặt trùng” vì trạng thái phòng: lịch trống luôn tính từ các đơn PENDING / CONFIRMED / CHECKED_IN.');
    return d.mount();
}

/* ================= 5. NHAN PHONG — TRA PHONG — DON PHONG ================= */
function checkinFlow(svg = $('dg-ops'), opts = P) {
    if (!svg) return;
    const d = Sketch(svg, { w: 1060, h: 1240, ...opts, seed: 3, number: true });
    d.lane(0, 470, 'Lễ tân / quản trị');
    d.lane(470, 590, 'Hệ thống', { alt: true, last: true });
    const L = 235, R = 765;
    d.node('s0', { shape: 'start', x: L, y: 92 });
    d.edge({ from: 's0', to: 'o1' });
    d.node('o1', { shape: 'round', x: L, y: 160, w: 300, h: 56, t: 'Mở đơn /admin/bookings/{id}', s: 'đơn mới được đánh dấu “đã xem”',
        info: { t: 'Mở chi tiết đơn', d: 'Danh sách đơn có chấm đỏ cho đơn mới; mở chi tiết thì tự tắt cờ <code>newBooking</code>. Trang hiện thông tin cọc, QR, danh sách khách khai báo.', c: `Booking booking = bookingService.findByIdAndMarkSeenByStaff(id);
model.addAttribute(<span class="s">"guests"</span>, guestRegistrationService.findByBooking(id));`, r: 'controller/AdminBookingController.java:60' } });
    d.edge({ from: 'o1', to: 'o2' });
    d.node('o2', { shape: 'round', x: L, y: 252, w: 300, h: 56, t: 'Bấm “Xác nhận” / “Đã nhận cọc”', s: 'confirmBooking() · confirmDeposit()',
        info: { t: 'Xác nhận đơn PENDING', d: 'Đơn có đặt cọc: lễ tân kiểm tra tài khoản ngân hàng rồi bấm <b>Đã nhận cọc</b> — vừa ghi nhận cọc vừa xác nhận. Đơn không cọc: bấm <b>Xác nhận</b>.', c: `booking.setDepositPaidAt(LocalDateTime.now());
booking.setStatus(BookingStatus.CONFIRMED);`, r: SVC + ':512' } });
    d.edge({ from: 'o2', to: 'q1' });
    d.node('q1', { shape: 'diamond', x: R, y: 252, w: 200, h: 84, t: 'Trùng đơn đã\nxác nhận?', info: { t: 'ensureNoConfirmedConflict()', d: 'Khóa dòng phòng rồi kiểm tra lại: nếu đã có đơn <b>khác</b> (không phải PENDING) trùng ngày thì không cho xác nhận — tránh hai đơn cùng “chắc chắn” một phòng.', c: `lockRoom(booking.getRoom().getId());
checkAvailability(room, in, out, booking.getId()).conflicts().stream()
    .filter(b -> b.getStatus() != BookingStatus.PENDING)
    .findFirst().ifPresent(other -> { <span class="k">throw</span> ... });`, r: SVC + ':184' } });
    d.edge({ from: 'q1', to: 'x0', k: 'err', pts: [[R, 210], [R, 178]], lb: 'có', lp: [R + 10, 196, 'start'] });
    d.node('x0', { shape: 'round', x: R, y: 150, w: 290, h: 50, t: 'Báo lỗi, đơn giữ PENDING', cls: 'err' });
    d.edge({ from: 'q1', to: 'x1', lb: 'không', lp: [R + 10, 311, 'start'] });
    d.node('x1', { shape: 'round', x: R, y: 350, w: 330, h: 56, t: 'PENDING → CONFIRMED', s: 'gửi email cho khách (sau commit)', cls: 'sys' });
    d.edge({ from: 'x1', to: 'o3', pts: [[R, 378], [R, 400], [L, 400], [L, 418]] });
    d.node('o3', { shape: 'round', x: L, y: 446, w: 320, h: 56, t: 'Khai báo lưu trú', s: 'họ tên · ngày sinh · giấy tờ · quốc tịch',
        info: { t: 'Khai báo lưu trú', d: 'Chỉ khai báo cho đơn <b>đã xác nhận hoặc đang ở</b>. Danh sách khách xuất được ra file Excel.', c: `<span class="k">if</span> (!canEdit(booking))
    <span class="k">throw new</span> BusinessException(<span class="s">"Chỉ khai báo khách lưu trú cho đơn đã xác nhận hoặc đang ở"</span>);`, r: 'service/GuestRegistrationService.java:50' } });
    d.edge({ from: 'o3', to: 'o4' });
    d.node('o4', { shape: 'round', x: L, y: 540, w: 240, h: 50, t: 'Bấm “Check-in”' });
    d.edge({ from: 'o4', to: 'q2' });
    d.node('q2', { shape: 'diamond', x: R, y: 540, w: 200, h: 90, t: 'CONFIRMED và\n≥ 1 khách khai báo?', info: { t: 'BR-04', d: 'Hai điều kiện bắt buộc trước khi nhận phòng.', c: `<span class="k">if</span> (booking.getStatus() != BookingStatus.CONFIRMED) <span class="k">throw</span> ...;
<span class="k">if</span> (guestRepository.countByBookingId(bookingId) == 0) <span class="k">throw</span> ...;`, r: SVC + ':534' } });
    d.edge({ from: 'q2', to: 'x2e', k: 'err', lb: 'không', lp: [888, 527] });
    d.node('x2e', { shape: 'round', x: 975, y: 540, w: 130, h: 56, t: 'Báo lỗi', s: 'khai báo trước', cls: 'err', small: true });
    d.edge({ from: 'x2e', to: 'o3', k: 'err', pts: [[975, 512], [975, 470], [395, 470]] });
    d.edge({ from: 'q2', to: 'x2', lb: 'có', lp: [R + 10, 604, 'start'] });
    d.node('x2', { shape: 'round', x: R, y: 640, w: 330, h: 56, t: 'CONFIRMED → CHECKED_IN', s: 'Phòng → OCCUPIED · gửi email', cls: 'sys' });
    d.edge({ from: 'x2', to: 'o5', pts: [[R, 668], [R, 690], [L, 690], [L, 708]] });
    d.node('o5', { shape: 'round', x: L, y: 736, w: 320, h: 56, t: 'Ngày trả: mở trang Check-out', s: 'phải thu = tiền đơn + phụ phí − cọc',
        info: { t: 'Trang check-out', d: 'Hiện tóm tắt tiền, mã QR thanh toán phần còn lại và danh sách phụ phí.', c: `<span class="c">// Con phai thu = tong gia tri don - tien coc da nhan</span>
<span class="k">public</span> BigDecimal amountDue(Booking booking) {
    <span class="k">return</span> grandTotal(booking).subtract(booking.getDepositPaidAmount()).max(BigDecimal.ZERO);
}`, r: PAY + ':127' } });
    d.edge({ from: 'o5', to: 'o6' });
    d.node('o6', { shape: 'round', x: L, y: 826, w: 340, h: 56, t: 'Thêm phụ phí (nếu có)', s: 'addCharge(): minibar, giặt ủi, hư hỏng, trả muộn…',
        info: { t: 'Phụ phí', d: 'Mỗi phụ phí là một dòng <code>booking_charges</code> (loại, mô tả, số tiền), cộng vào tổng phải thu và in trên hóa đơn.', r: PAY + ':132' } });
    d.edge({ from: 'o6', to: 'q3' });
    d.node('q3', { shape: 'diamond', x: L, y: 926, w: 190, h: 84, t: 'Khách trả\nbằng gì?' });
    d.edge({ from: 'q3', to: 'x3', lb: 'chuyển khoản', lp: [465, 916] });
    d.node('x3', { shape: 'round', x: R, y: 926, w: 330, h: 56, t: 'Lễ tân thấy tiền vào → xác nhận', s: 'confirmBankTransfer(): Payment PAID', cls: 'sys',
        info: { t: 'Ghi nhận chuyển khoản', d: 'Chỉ cho đơn đang <b>CHECKED_IN</b>. Phải ghi nhận đã nhận tiền thì mới check-out bằng chuyển khoản được.', r: PAY + ':178' } });
    d.edge({ from: 'q3', to: 'o7', lb: 'tiền mặt', lp: [L + 10, 984, 'start'] });
    d.edge({ from: 'x3', to: 'o7', pts: [[R, 954], [R, 990], [330, 990], [330, 1010]] });
    d.node('o7', { shape: 'round', x: L, y: 1036, w: 320, h: 52, t: 'Bấm “Check-out”', s: 'checkOutWithPayment(phương thức)' });
    d.edge({ from: 'o7', to: 'x4' });
    d.node('x4', { shape: 'round', x: R, y: 1036, w: 360, h: 70, t: 'Chốt thanh toán & check-out', s: 'tiền mặt → PAID ngay · CHECKED_IN → CHECKED_OUT\nPhòng → NOT_READY (chờ dọn)', cls: 'sys',
        info: { t: 'checkOutWithPayment()', d: 'Thẻ chưa được hỗ trợ; chuyển khoản chưa xác nhận thì báo lỗi. Thành công thì gọi <code>checkOut()</code> rồi gửi hóa đơn.', r: PAY + ':191' } });
    d.edge({ from: 'x4', to: 'x5', pts: [[860, 1071], [860, 1112]] });
    d.node('x5', { shape: 'round', x: 860, y: 1138, w: 250, h: 52, t: 'Gửi hóa đơn qua email', s: 'sendInvoice() · có số hóa đơn', cls: 'sys' });
    d.edge({ from: 'x5', to: 'e1', pts: [[985, 1138], [1017, 1138]] });
    d.node('e1', { shape: 'end', x: 1032, y: 1138 });
    d.edge({ from: 'x4', to: 'o8', pts: [[660, 1071], [660, 1090], [L, 1090], [L, 1112]] });
    d.node('o8', { shape: 'round', x: L, y: 1138, w: 300, h: 52, t: 'Dọn phòng xong', s: 'bấm “Đã dọn xong” → markReady()' });
    d.edge({ from: 'o8', to: 'x6', pts: [[L, 1164], [L, 1200], [600, 1200]] });
    d.node('x6', { shape: 'round', x: R, y: 1200, w: 330, h: 50, t: 'Phòng NOT_READY → AVAILABLE', cls: 'sys' });
    d.edge({ from: 'x6', to: 'e2', pts: [[930, 1200], [1017, 1200]] });
    d.node('e2', { shape: 'end', x: 1032, y: 1200 });
    return d.mount();
}

/* ================= 6. ERD — 15 BANG (tu cac @Entity) ================= */
function erd(svg = $('dg-erd'), opts = P) {
    if (!svg) return;
    const d = Sketch(svg, { w: 1200, h: 820, ...opts, seed: 13 });
    const T = (id, x0, y0, w, rows, info) => {
        const h = 26 + rows.length * 16 + 10;
        return d.node(id, { shape: 'table', x: x0 + w / 2, y: y0 + h / 2, w, h, t: id, rows, info });
    };
    const ent = (cls, more) => Object.assign({ tag: '@Entity', r: `entity/${cls}.java` }, more);
    T('users', 20, 52, 210, ['PK id', 'full_name, email (UQ)', 'phone_number, password', 'role: CUSTOMER/STAFF/ADMIN', 'customer_type: NEW/REGULAR/VIP', 'locked, reset_token', 'created_at'],
        ent('User', { t: 'users', d: 'Một bảng cho cả khách, lễ tân và quản trị (phân biệt bằng <code>role</code>). <code>customer_type</code> dùng để áp mã giảm giá đúng đối tượng. Khách vãng lai được tự tạo tài khoản theo email khi đặt.' }));
    T('combos', 255, 52, 200, ['PK id', 'name, name_en', 'description, description_en', 'price, max_guests', 'image_url, active'], ent('Combo', { t: 'combos', d: 'Gói dịch vụ đi kèm (BBQ, lẩu…), song ngữ. Ẩn bằng <code>active = false</code> thay vì xóa để đơn cũ vẫn đúng.' }));
    T('discount_codes', 475, 52, 220, ['PK id', 'code (UQ)', 'discount_type, discount_value', 'applicable_customer_type', 'description(_en), active'], ent('DiscountCode', { t: 'discount_codes', d: 'Giảm theo <b>%</b> hoặc <b>số tiền cố định</b> (không vượt tạm tính), có thể giới hạn theo loại khách. Mã luôn chuẩn hóa chữ hoa trước khi so sánh; mỗi khách dùng một mã một lần.' }));
    T('pricing_settings', 965, 52, 215, ['PK id (= 1)', 'weekend_surcharge_percent', 'deposit_percent', 'deposit_deadline_hours'], ent('PricingSettings', { t: 'pricing_settings', d: 'Bảng một dòng: phụ thu cuối tuần, tỷ lệ đặt cọc (0% = không cọc), số giờ hạn chuyển cọc. Chỉ ADMIN sửa.' }));

    T('room_types', 20, 272, 210, ['PK id', 'name, name_en', 'base_price, max_guests, area', 'description, description_en', 'amenities, amenities_en'], ent('RoomType', { t: 'room_types' }));
    T('bookings', 470, 252, 290, ['PK id', 'FK customer_id → users', 'FK room_id → rooms', 'FK combo_id → combos', 'FK discount_code_id', 'check_in/out_date, check_in/out_time', 'number_of_guests, guest_name/phone/email', 'room_amount, discount_amount, total_amount', 'deposit_amount, deposit_deadline', 'deposit_paid_at, status', 'access_token, new_booking', 'created_at'],
        ent('Booking', { t: 'bookings', d: 'Bảng trung tâm. Lưu cả <b>thông tin người nhận phòng</b> (có thể khác chủ tài khoản), <b>tiền phòng đã chốt</b> lúc đặt (giá cuối tuần / lễ đổi sau không ảnh hưởng), tiền cọc và hạn cọc, <code>access_token</code> để khách vãng lai xem lại đơn qua link.' }));
    T('reviews', 850, 252, 190, ['PK id', 'FK booking_id (UQ)', 'FK customer_id → users', 'rating (1–5), comment', 'hidden, created_at'], ent('Review', { t: 'reviews', d: 'Một đơn đã trả phòng được đánh giá đúng một lần (<code>booking_id</code> unique). Lễ tân có thể ẩn đánh giá.' }));
    T('special_rates', 1056, 252, 134, ['PK id', 'name, name_en', 'start_date', 'end_date', 'surcharge_%'], ent('SpecialRate', { t: 'special_rates', d: 'Giai đoạn lễ, Tết có phụ thu riêng. Khi tính tiền từng đêm: đêm rơi vào giai đoạn lễ thì dùng phụ thu của giai đoạn (lấy mức cao nhất nếu chồng nhau), <b>ưu tiên hơn</b> phụ thu cuối tuần.' }));
    T('review_media', 850, 420, 190, ['PK id', 'FK review_id', 'url, media_type', 'sort_order'], ent('ReviewMedia', { t: 'review_media', d: 'Ảnh / video đính kèm đánh giá, có thứ tự hiển thị.' }));

    T('rooms', 20, 440, 210, ['PK id', 'room_number (UQ)', 'FK room_type_id', 'price, status', 'description, description_en'], ent('Room', { t: 'rooms', d: 'Dòng của bảng này là thứ được <b>khóa</b> bằng <code>SELECT … FOR UPDATE</code> khi đặt phòng.' }));
    T('room_images', 20, 620, 210, ['PK id', 'FK room_id', 'image_url'], ent('RoomImage', { t: 'room_images' }));
    T('booking_guests', 290, 620, 210, ['PK id', 'FK booking_id', 'full_name, date_of_birth', 'gender, id_type, id_number', 'nationality, address'], ent('BookingGuest', { t: 'booking_guests', d: 'Khai báo lưu trú — điều kiện bắt buộc để check-in.' }));
    T('booking_charges', 520, 620, 200, ['PK id', 'FK booking_id', 'type, description', 'amount, created_at'], ent('BookingCharge', { t: 'booking_charges', d: 'Phụ phí lúc check-out: minibar, giặt ủi, hư hỏng, trả phòng muộn…' }));
    T('payments', 740, 620, 205, ['PK id', 'FK booking_id (UQ)', 'amount, payment_method', 'status, payment_date'], ent('Payment', { t: 'payments', d: 'Thanh toán khi trả phòng (tiền mặt / chuyển khoản), một đơn một dòng. Số hóa đơn dạng <code>HD{yyyyMMdd}-{mã đơn}</code>.' }));
    T('audit_logs', 965, 620, 215, ['PK id, created_at', 'actor_id, actor_email', 'actor_role, action', 'entity_type, entity_id', 'changes, ip_address'], ent('AuditLog', { t: 'audit_logs', d: 'Ghi tự động bởi <code>AuditEntityListener</code> sau mỗi INSERT / UPDATE / DELETE. Có index theo <code>created_at</code> và <code>(entity_type, entity_id)</code>.' }));

    const rel = (pts, sl, el) => d.edge({ k: 'rel', pts, sl, el });
    rel([[230, 172], [244, 172], [244, 300], [470, 300]], '1', 'n');
    rel([[125, 52], [125, 32], [945, 32], [945, 252]], '1', 'n');
    rel([[355, 168], [355, 222], [530, 222], [530, 252]], '1', 'n');
    rel([[585, 168], [585, 252]], '1', 'n');
    rel([[125, 388], [125, 440]], '1', 'n');
    rel([[230, 470], [470, 470]], '1', 'n');
    rel([[125, 556], [125, 620]], '1', 'n');
    rel([[760, 300], [850, 300]], '1', '0..1');
    rel([[945, 368], [945, 420]], '1', 'n');
    rel([[500, 490], [500, 590], [395, 590], [395, 620]], '1', 'n');
    rel([[620, 490], [620, 620]], '1', 'n');
    rel([[730, 490], [730, 590], [842, 590], [842, 620]], '1', '1');
    d.text(600, 790, 'pricing_settings, special_rates và audit_logs độc lập: hai bảng giá được đọc khi tính tiền từng đêm; audit_logs ghi tự động.');
    return d.mount();
}

// Trang khac (so-do/) dung lai cac so do nay qua window.HMD
window.HMD = { architecture, sequence, bookingState, roomState, checkinFlow, erd };
if (!window.HMD_NO_AUTO) { architecture(); sequence(); bookingState(); roomState(); checkinFlow(); erd(); }
})();
