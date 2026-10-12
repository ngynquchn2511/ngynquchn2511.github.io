/* =====================================================================
   Cac so do luong nghiep vu dung tu MA NGUON THAT:
     - Homestay May  : D:\CongNgheJava\hotel-booking (Spring Boot)
     - Sweet Cake    : D:\Sweet_Cake\sales_cake_sweet-main (Laravel 12 + Inertia React)
   Moi ham nhan (svg, opts) va tra ve doi tuong Sketch.
   ===================================================================== */
(function () {
'use strict';

const HM = 'hotel-booking/src/main/java/com/hotel/';
const SC = 'sales_cake_sweet-main/';
const k = s => `<span class="k">${s}</span>`;
const s_ = s => `<span class="s">${s}</span>`;
const c_ = s => `<span class="c">${s}</span>`;

// Thanh lan boi + cac ham nho cho so do hoat dong
function lanes(d, list) {
    let x = 0;
    list.forEach(([w, t], i) => { d.lane(x, w, t, { alt: i % 2 === 1, last: i === list.length - 1 }); x += w; });
}
// So do tuan tu: dat cac ben tham gia, tra ve ham ve thong diep
function seqKit(d, parts, H) {
    const X = {};
    parts.forEach(p => {
        X[p.id] = p.x;
        d.node('h_' + p.id, { shape: 'head', x: p.x, y: 46, w: p.w || 150, h: 54, t: p.t, info: p.info, cls: p.cls });
    });
    parts.forEach(p => d.edge({ k: 'life', pts: [[p.x, 74], [p.x, H - 30]] }));
    const msg = (a, b, y, lb, kind = 'flow', below) => {
        const x1 = X[a] + (X[b] > X[a] ? 0 : 0), x2 = X[b] + (X[b] > X[a] ? -4 : 4);
        d.edge({ k: kind, lc: 'msg', pts: [[x1, y], [x2, y]], lb, lp: [(x1 + x2) / 2, below ? y + 12 : y - 10] });
    };
    return { X, msg };
}

/* ================================================================
   HOMESTAY MAY
   ================================================================ */

// Kiem tra ma giam gia bang AJAX (chua tao don)
function hmDiscount(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 1080, h: 900, seed: 21, number: true }, opts));
    lanes(d, [[300, 'Khách hàng'], [340, 'CustomerBookingController'], [440, 'DiscountCodeService']]);
    d.node('s', { shape: 'start', x: 150, y: 92 });
    d.edge({ from: 's', to: 'k1' });
    d.node('k1', { shape: 'round', x: 150, y: 165, w: 250, h: 56, t: 'Gõ mã, bấm “Kiểm tra mã”', s: 'fetch …/check-discount?code=',
        info: { t: 'Kiểm tra trước, không tải lại trang', d: 'Nút trên trang xác nhận gọi JSON để khách thấy ngay số tiền được giảm. <b>Không tạo đơn</b>.', r: HM + 'controller/CustomerBookingController.java · checkDiscountCode()' } });
    d.edge({ from: 'k1', to: 'c1' });
    d.node('c1', { shape: 'round', x: 470, y: 165, w: 290, h: 56, t: 'Tính tạm tính', s: 'giá từng đêm + combo (nếu có)',
        info: { t: 'Tạm tính', d: 'Dùng đúng hàm tính tiền như lúc đặt thật.', c: `BigDecimal subtotal = pricingService.roomAmount(room.getPrice(), checkIn, checkOut);
${k('if')} (comboId != ${k('null')}) subtotal = subtotal.add(comboService.findById(comboId).getPrice());` } });
    d.edge({ from: 'c1', to: 'c2' });
    d.node('c2', { shape: 'round', x: 470, y: 262, w: 300, h: 56, t: 'Xác định loại khách', s: 'chưa đăng nhập → coi là NEW',
        info: { t: 'Loại khách', d: 'Mã giảm giá có thể chỉ dành cho một loại khách (NEW / REGULAR / VIP). Khách vãng lai chưa biết là ai nên tạm coi là khách mới.', c: `CustomerType customerType = (userDetails != ${k('null')})
        ? userDetails.getUser().getCustomerType()
        : CustomerType.NEW;` } });
    d.edge({ pts: [[470, 290], [470, 310], [860, 310], [860, 313]] });
    d.node('q1', { shape: 'diamond', x: 860, y: 355, w: 210, h: 84, t: 'Mã tồn tại\n& đang bật?',
        info: { t: 'Chuẩn hóa mã', d: 'Mã luôn được <b>trim + viết hoa</b> trước khi tìm — sửa lỗi “sale10” bị báo sai ở nút kiểm tra nhưng vẫn được giảm khi đặt.', c: `String normalizedCode = code == ${k('null')} ? ${s_('""')} : code.trim().toUpperCase();
discountCodeRepository.findByCodeAndActiveTrue(normalizedCode)`, r: HM + 'service/DiscountCodeService.java:83' } });
    d.edge({ from: 'q1', to: 'q2', lb: 'có', lp: [870, 413, 'start'] });
    d.node('q2', { shape: 'diamond', x: 860, y: 465, w: 210, h: 84, t: 'Đúng loại\nkhách?' });
    d.edge({ from: 'q2', to: 'c3', lb: 'có', lp: [870, 523, 'start'] });
    d.node('c3', { shape: 'round', x: 860, y: 575, w: 330, h: 56, t: 'Tính số tiền giảm', s: '% của tạm tính · hoặc cố định (≤ tạm tính)', cls: 'sys' });
    d.edge({ pts: [[860, 603], [860, 622], [470, 622], [470, 635]] });
    d.node('q3', { shape: 'diamond', x: 470, y: 680, w: 230, h: 90, t: 'Đã đăng nhập và\nđã dùng mã này?',
        info: { t: 'Mỗi khách dùng một mã một lần', d: 'Chỉ kiểm tra được khi đã đăng nhập. Khách vãng lai sẽ bị kiểm tra theo email ngay lúc bấm Xác nhận đặt phòng.', c: `${k('if')} (userDetails != ${k('null')} && bookingService.hasUsedDiscountCode(userId, code))
    ${k('throw')} BusinessException.of(${s_('"err.discountUsed"')});` } });
    d.edge({ pts: [[470, 725], [470, 752], [150, 752], [150, 762]], lb: 'không', lp: [480, 740, 'start'] });
    d.node('k2', { shape: 'round', x: 150, y: 790, w: 250, h: 56, t: 'Hiện “Giảm … đ”', s: 'valid: true · discountAmount', cls: 'sys' });
    d.edge({ from: 'k2', to: 'e', pts: [[150, 818], [150, 845]] });
    d.node('e', { shape: 'end', x: 150, y: 860 });
    // Nhanh loi: gom ve o thong bao
    d.edge({ k: 'err', pts: [[755, 355], [322, 355], [322, 575], [275, 575]], lb: 'không', lp: [740, 346, 'end'] });
    d.edge({ k: 'err', pts: [[755, 465], [322, 465], [322, 575], [275, 575]], lb: 'không', lp: [740, 456, 'end'] });
    d.edge({ k: 'err', pts: [[355, 680], [322, 680], [322, 592], [275, 592]], lb: 'có', lp: [346, 670, 'end'] });
    d.node('err', { shape: 'round', x: 150, y: 583, w: 250, h: 66, t: 'Hiện lỗi dưới ô mã', s: 'valid: false + thông báo song ngữ', cls: 'err' });
    d.node('note', { shape: 'note', x: 860, y: 790, w: 380, h: 70, t: 'Chỉ là xem trước — bấm “Xác nhận đặt phòng”\nthì createBooking() kiểm tra lại toàn bộ', small: true });
    return d.mount();
}

// Khach doi gio / doi combo / huy don
function hmModify(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 1080, h: 830, seed: 22 }, opts));
    d.node('s', { shape: 'start', x: 540, y: 60 });
    d.edge({ from: 's', to: 'a1' });
    d.node('a1', { shape: 'round', x: 540, y: 130, w: 400, h: 56, t: 'Khách mở trang đơn của mình', s: 'findByIdForCustomer(): chỉ chủ đơn mới xem / sửa được',
        info: { t: 'Chỉ đơn của chính mình', d: 'Mọi thao tác sửa / hủy đều tìm đơn theo <b>id + customerId</b>, đổi id trên URL không đụng được đơn người khác.', r: HM + 'service/BookingService.java:351' } });
    d.edge({ pts: [[540, 158], [540, 200]] });
    d.node('fk', { shape: 'fork', x: 540, y: 206, w: 760, h: 8 });
    const col = (x, id, t, s, info) => {
        d.edge({ pts: [[x, 210], [x, 262]] });
        d.node(id, { shape: 'round', x, y: 290, w: 290, h: 56, t, s, info });
    };
    // Cot 1: doi gio
    col(190, 'b1', 'Đổi giờ nhận / trả', 'POST /{id}/edit-time');
    d.edge({ from: 'b1', to: 'd1' });
    d.node('d1', { shape: 'diamond', x: 190, y: 405, w: 190, h: 84, t: 'canModify()?', s: 'còn ≥ 6 giờ',
        info: { t: 'canModify()', d: 'Chỉ đơn <b>PENDING / CONFIRMED</b> và còn ít nhất 6 giờ trước giờ nhận phòng.', c: `${k('if')} (status != PENDING && status != CONFIRMED) ${k('return false')};
${k('return')} now().isBefore(checkInDateTime.minusHours(EDIT_CUTOFF_HOURS));`, r: HM + 'service/BookingService.java:383' } });
    d.edge({ from: 'd1', to: 'd1b', lb: 'có', lp: [200, 460, 'start'] });
    d.node('d1b', { shape: 'diamond', x: 190, y: 520, w: 190, h: 84, t: 'Vướng giờ\nkhách khác?', info: { t: 'checkTurnoverTimes()', d: 'Cùng ngày có khách trả phòng trước / nhận phòng sau thì giờ mới không được lấn sang.', r: HM + 'service/BookingService.java:160' } });
    d.edge({ from: 'd1b', to: 'r1', lb: 'không', lp: [200, 575, 'start'] });
    d.node('r1', { shape: 'round', x: 190, y: 640, w: 290, h: 64, t: 'Lưu giờ mới', s: 'checkInTimeChanged = true\n→ lễ tân thấy cảnh báo đổi giờ', cls: 'sys' });
    // Cot 2: doi combo
    col(540, 'b2', 'Đổi / bỏ combo', 'POST /{id}/edit-combo');
    d.edge({ from: 'b2', to: 'd2' });
    d.node('d2', { shape: 'diamond', x: 540, y: 405, w: 190, h: 84, t: 'canModify()?', s: 'còn ≥ 6 giờ' });
    d.edge({ from: 'd2', to: 'r2', lb: 'có', lp: [550, 460, 'start'] });
    d.node('r2', { shape: 'round', x: 540, y: 520, w: 290, h: 64, t: 'Giữ tiền phòng đã chốt', s: 'combo mới + tính lại giảm giá', cls: 'sys',
        info: { t: 'Không tính lại giá phòng', d: 'Giá cuối tuần / ngày lễ có thể đã đổi sau lúc đặt, nên tiền phòng giữ nguyên số đã chốt; chỉ tính lại combo và giảm giá.', c: `BigDecimal roomAmount = booking.getEffectiveRoomAmount();
BigDecimal subtotal = roomAmount.add(comboAmount);`, r: HM + 'service/BookingService.java:410' } });
    d.edge({ from: 'r2', to: 'r2b' });
    d.node('r2b', { shape: 'round', x: 540, y: 640, w: 290, h: 64, t: 'Chưa cọc → tính lại tiền cọc', s: 'đã cọc thì giữ nguyên', cls: 'sys',
        info: { t: 'Tiền cọc', c: `${k('if')} (booking.isDepositRequired() && !booking.isDepositPaid())
    booking.setDepositAmount(pricingService.depositFor(totalAmount));` } });
    // Cot 3: huy
    col(890, 'b3', 'Hủy đơn', 'POST /{id}/cancel');
    d.edge({ from: 'b3', to: 'd3' });
    d.node('d3', { shape: 'diamond', x: 890, y: 405, w: 200, h: 90, t: 'PENDING hoặc\nCONFIRMED?',
        info: { t: 'Hủy chỉ xét trạng thái', d: 'Khác với đổi giờ / combo: hủy <b>không</b> cần còn 6 giờ.', c: `${k('if')} (status != PENDING && status != CONFIRMED)
    ${k('throw')} BusinessException.of(${s_('"err.cancelState"')}, ...);
booking.setStatus(BookingStatus.CANCELLED);
emailService.sendBookingConfirmation(cancelledBooking);`, r: HM + 'service/BookingService.java:457' } });
    d.edge({ from: 'd3', to: 'r3', lb: 'có', lp: [900, 463, 'start'] });
    d.node('r3', { shape: 'round', x: 890, y: 520, w: 290, h: 64, t: '→ CANCELLED', s: 'gửi email báo hủy · nhả chỗ', cls: 'sys' });
    // Loi gom ve mot o
    d.edge({ k: 'err', pts: [[285, 405], [332, 405], [332, 760], [395, 760]], lb: 'không', lp: [300, 396, 'start'] });
    d.edge({ k: 'err', pts: [[285, 520], [332, 520]], lb: 'có', lp: [300, 511, 'start'] });
    d.edge({ k: 'err', pts: [[635, 405], [690, 405], [690, 760], [685, 760]], lb: 'không', lp: [650, 396, 'start'] });
    d.edge({ k: 'err', pts: [[790, 405], [722, 405], [722, 780], [685, 780]], lb: 'không', lp: [775, 396, 'end'] });
    d.node('err', { shape: 'round', x: 540, y: 770, w: 290, h: 64, t: 'Báo lỗi trên trang đơn', s: 'err.editTimesClosed · err.turnover.*\nerr.cancelState', cls: 'err' });
    return d.mount();
}

// Bo hen gio tu huy don qua han
function hmScheduler(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 1000, h: 740, seed: 23, number: true }, opts));
    d.node('s', { shape: 'start', x: 500, y: 60 });
    d.edge({ from: 's', to: 'a1', lb: '@Scheduled · mỗi 5 phút', lp: [512, 84, 'start'] });
    d.node('a1', { shape: 'round', x: 500, y: 140, w: 340, h: 56, t: 'Lấy mọi đơn PENDING', s: 'findByStatusOrderByCreatedAtDesc(PENDING)', cls: 'soft',
        info: { t: 'BookingExpirationScheduler', c: `${k('@Scheduled')}(fixedRate = 5 * 60 * 1000)
${k('@Transactional')}
${k('public void')} expireUnconfirmedBookings() { ... }`, r: HM + 'config/BookingExpirationScheduler.java:34' } });
    d.edge({ from: 'a1', to: 'a2' });
    d.node('a2', { shape: 'round', x: 500, y: 235, w: 300, h: 56, t: 'Xét từng đơn', s: 'now = LocalDateTime.now()' });
    d.edge({ from: 'a2', to: 'q1' });
    d.node('q1', { shape: 'diamond', x: 500, y: 350, w: 250, h: 96, t: 'Quá hạn cọc?', s: 'đang chờ cọc & now > hạn cọc',
        info: { t: 'Quá hạn chuyển cọc', c: `${c_('// isAwaitingDeposit: can coc, chua coc, dang PENDING')}
${k('boolean')} depositOverdue = booking.isAwaitingDeposit()
        && booking.getDepositDeadline() != ${k('null')} && now.isAfter(booking.getDepositDeadline());` } });
    d.edge({ from: 'q1', to: 'x1', lb: 'có', lp: [640, 341] });
    d.node('x1', { shape: 'round', x: 820, y: 350, w: 300, h: 64, t: '→ CANCELLED', s: 'email báo hủy vì chưa chuyển cọc\n(khách có thể đặt lại)', cls: 'err' });
    d.edge({ from: 'q1', to: 'q2', lb: 'không', lp: [512, 412, 'start'] });
    d.node('q2', { shape: 'diamond', x: 500, y: 480, w: 250, h: 96, t: 'Còn < 6 giờ tới\ngiờ nhận phòng?', s: 'mà vẫn chưa được xác nhận',
        info: { t: 'Hạn xác nhận', c: `LocalDateTime confirmDeadline = checkInDateTime.minusHours(CONFIRM_DEADLINE_HOURS); ${c_('// 6')}
${k('if')} (now.isAfter(confirmDeadline) || depositOverdue) booking.setStatus(BookingStatus.CANCELLED);` } });
    d.edge({ from: 'q2', to: 'x2', lb: 'có', lp: [640, 471] });
    d.node('x2', { shape: 'round', x: 820, y: 480, w: 300, h: 56, t: '→ CANCELLED', s: 'giải phóng phòng cho khách khác', cls: 'err' });
    d.edge({ from: 'q2', to: 'a3', lb: 'không', lp: [512, 542, 'start'] });
    d.node('a3', { shape: 'round', x: 500, y: 600, w: 300, h: 56, t: 'Đơn tiếp theo', s: 'giữ nguyên đơn này, lần chạy sau xét lại' });
    d.edge({ pts: [[970, 350], [986, 350], [986, 600], [650, 600]] });
    d.edge({ pts: [[820, 508], [820, 600], [650, 600]] });
    d.edge({ k: 'dash', pts: [[350, 600], [200, 600], [200, 235], [350, 235]], lb: 'còn đơn', lp: [192, 420, 'end'] });
    d.edge({ from: 'a3', to: 'e', pts: [[500, 628], [500, 690]], lb: 'hết danh sách', lp: [512, 660, 'start'] });
    d.node('e', { shape: 'end', x: 500, y: 705 });
    return d.mount();
}

// Dang nhap hai cong
function hmLogin(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 1100, h: 860, seed: 24 }, opts));
    d.node('s', { shape: 'start', x: 550, y: 60 });
    d.edge({ from: 's', to: 'a0' });
    d.node('a0', { shape: 'round', x: 550, y: 135, w: 330, h: 56, t: 'Gửi form đăng nhập', s: 'email + mật khẩu (băm BCrypt)' });
    d.edge({ from: 'a0', to: 'q0' });
    d.node('q0', { shape: 'diamond', x: 550, y: 245, w: 230, h: 90, t: 'URL thuộc\n/admin/** ?', info: { t: 'securityMatcher', d: 'Chuỗi @Order(1) chỉ khớp <code>/admin</code>, <code>/admin/**</code>, <code>/staff/**</code> và được xét trước; mọi URL khác rơi vào chuỗi @Order(2).', r: HM + 'config/SecurityConfig.java:75' } });
    d.edge({ pts: [[435, 245], [320, 245], [320, 312]], lb: 'có', lp: [420, 236, 'end'] });
    d.edge({ pts: [[665, 245], [780, 245], [780, 312]], lb: 'không', lp: [680, 236, 'start'] });
    const chain = (x, id, t, sub) => d.node(id, { shape: 'round', x, y: 340, w: 320, h: 56, t, s: sub, cls: 'soft' });
    chain(320, 'c1', 'adminFilterChain · @Order(1)', 'form login /admin');
    chain(780, 'c2', 'customerFilterChain · @Order(2)', 'form login /login');
    d.edge({ from: 'c1', to: 'q1' });
    d.edge({ from: 'c2', to: 'q2' });
    const failInfo = { t: 'Sai mật khẩu / tài khoản bị khóa', d: 'Hai lỗi được báo riêng để người dùng biết vì sao.', c: `(request, response, exception) -> response.sendRedirect(loginPage
        + (exception ${k('instanceof')} LockedException ? ${s_('"?locked=true"')} : ${s_('"?error=true"')}));`, r: HM + 'config/SecurityConfig.java:66' };
    d.node('q1', { shape: 'diamond', x: 320, y: 460, w: 200, h: 90, t: 'Sai mật khẩu\nhoặc bị khóa?', info: failInfo });
    d.node('q2', { shape: 'diamond', x: 780, y: 460, w: 200, h: 90, t: 'Sai mật khẩu\nhoặc bị khóa?', info: failInfo });
    d.edge({ from: 'q1', to: 'e1', k: 'err', lb: 'có', lp: [200, 451] });
    d.edge({ from: 'q2', to: 'e2', k: 'err', lb: 'có', lp: [900, 451] });
    d.node('e1', { shape: 'round', x: 95, y: 460, w: 170, h: 64, t: '/admin?error\n?locked=true', cls: 'err', small: true });
    d.node('e2', { shape: 'round', x: 1005, y: 460, w: 170, h: 64, t: '/login?error\n?locked=true', cls: 'err', small: true });
    d.edge({ from: 'q1', to: 'r1', lb: 'không', lp: [330, 518, 'start'] });
    d.edge({ from: 'q2', to: 'r2', lb: 'không', lp: [790, 518, 'start'] });
    d.node('r1', { shape: 'diamond', x: 320, y: 590, w: 200, h: 90, t: 'Vai trò ADMIN\nhoặc STAFF?', info: { t: 'AdminPortalSuccessHandler', d: 'Đăng nhập đúng mật khẩu nhưng sai cổng thì <b>đăng xuất ngay</b> — nhân viên không vô tình thao tác bằng giao diện khách.', c: `${k('if')} (role != UserRole.ADMIN && role != UserRole.STAFF) {
    ${k('new')} SecurityContextLogoutHandler().logout(request, response, authentication);
    response.sendRedirect(${s_('"/admin?error=wrong_portal"')});
    ${k('return')};
}
getRedirectStrategy().sendRedirect(request, response, ${s_('"/admin/dashboard"')});`, r: HM + 'security/AdminPortalSuccessHandler.java:18' } });
    d.node('r2', { shape: 'diamond', x: 780, y: 590, w: 200, h: 90, t: 'Vai trò\nCUSTOMER?', info: { t: 'CustomerPortalSuccessHandler', c: `${k('if')} (role != UserRole.CUSTOMER) {
    ${k('new')} SecurityContextLogoutHandler().logout(...);
    response.sendRedirect(${s_('"/login?error=wrong_portal"')});
    ${k('return')};
}
getRedirectStrategy().sendRedirect(request, response, ${s_('"/customer/rooms"')});`, r: HM + 'security/CustomerPortalSuccessHandler.java' } });
    d.edge({ from: 'r1', to: 'w1', k: 'err', lb: 'không', lp: [200, 581] });
    d.edge({ from: 'r2', to: 'w2', k: 'err', lb: 'không', lp: [900, 581] });
    d.node('w1', { shape: 'round', x: 95, y: 590, w: 170, h: 64, t: 'Đăng xuất\n?error=wrong_portal', cls: 'err', small: true });
    d.node('w2', { shape: 'round', x: 1005, y: 590, w: 170, h: 64, t: 'Đăng xuất\n?error=wrong_portal', cls: 'err', small: true });
    d.edge({ from: 'r1', to: 'o1', lb: 'có', lp: [330, 648, 'start'] });
    d.edge({ from: 'r2', to: 'o2', lb: 'có', lp: [790, 648, 'start'] });
    d.node('o1', { shape: 'round', x: 320, y: 705, w: 260, h: 50, t: '→ /admin/dashboard', cls: 'sys' });
    d.node('o2', { shape: 'round', x: 780, y: 705, w: 260, h: 50, t: '→ /customer/rooms', cls: 'sys' });
    d.node('n', { shape: 'note', x: 550, y: 805, w: 640, h: 56, t: 'Sau khi đăng nhập, mỗi URL còn được kiểm hasRole(...):\n/admin/pricing, /admin/staff-accounts chỉ ADMIN · /customer/** chỉ CUSTOMER', small: true });
    return d.mount();
}

/* ================================================================
   SWEET CAKE (Laravel 12 · Inertia React · MySQL)
   ================================================================ */

// Them vao gio hang
function scAddCart(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 1060, h: 1030, seed: 31, number: true }, opts));
    lanes(d, [[300, 'Khách hàng'], [460, 'CartController@addToCart'], [300, 'MySQL']]);
    d.node('s', { shape: 'start', x: 150, y: 92 });
    d.edge({ from: 's', to: 'k1' });
    d.node('k1', { shape: 'round', x: 150, y: 165, w: 250, h: 56, t: 'Bấm “Thêm vào giỏ”', s: 'POST /cart/add · số lượng',
        info: { t: 'Cần đăng nhập', d: 'Route nằm trong nhóm middleware <code>auth</code> + <code>verified</code>: phải đăng nhập và xác minh email.', r: SC + 'routes/web.php' } });
    d.edge({ from: 'k1', to: 'c1' });
    d.node('c1', { shape: 'round', x: 530, y: 165, w: 320, h: 56, t: 'Validate', s: 'product_id tồn tại · quantity ≥ 1',
        c: '', info: { t: 'Validate request', c: `$request->validate([
    ${s_("'product_id'")} => ${s_("'required|exists:products,id'")},
    ${s_("'quantity'")} => ${s_("'required|integer|min:1'")},
]);`, r: SC + 'app/Http/Controllers/CartController.php · addToCart()' } });
    d.edge({ from: 'c1', to: 'q1' });
    d.node('q1', { shape: 'diamond', x: 530, y: 275, w: 200, h: 84, t: 'Sản phẩm\nđang bán?', s: 'status = active' });
    d.edge({ from: 'q1', to: 'e1', k: 'err', lb: 'không', lp: [405, 266] });
    d.node('e1', { shape: 'round', x: 150, y: 275, w: 250, h: 56, t: '“Sản phẩm không khả dụng”', cls: 'err', small: true });
    d.edge({ from: 'q1', to: 'c2', lb: 'có', lp: [540, 333, 'start'] });
    d.node('c2', { shape: 'round', x: 530, y: 385, w: 320, h: 56, t: 'Lấy hoặc tạo giỏ', s: 'Cart::firstOrCreate([user_id])' });
    d.edge({ from: 'c2', to: 'db1', k: 'dash' });
    d.node('db1', { shape: 'cyl', x: 910, y: 385, w: 220, h: 64, t: 'carts', s: 'mỗi user một giỏ' });
    d.edge({ from: 'c2', to: 'c3' });
    d.node('c3', { shape: 'round', x: 530, y: 480, w: 320, h: 56, t: 'Lấy giá hiện tại', s: 'discount_price ?? price' });
    d.edge({ from: 'c3', to: 'q2' });
    d.node('q2', { shape: 'diamond', x: 530, y: 595, w: 240, h: 96, t: 'Tồn kho ≥\nsố trong giỏ + thêm?',
        info: { t: 'Cộng dồn trước khi kiểm', d: 'Tồn kho được so với <b>tổng</b> số lượng sau khi cộng thêm, không chỉ số vừa bấm — tránh thêm nhiều lần vượt kho.', c: `$newQuantity = $cartItem ? $cartItem->quantity + $request->quantity : $request->quantity;
${k('if')} ($product->stock < $newQuantity) {
    ${k('return')} redirect()->back()->with(${s_("'error'")}, ${s_('"Số lượng sản phẩm không đủ. Còn lại: {$product->stock}"')});
}` } });
    d.edge({ from: 'q2', to: 'e2', k: 'err', lb: 'không', lp: [395, 586] });
    d.node('e2', { shape: 'round', x: 150, y: 595, w: 250, h: 64, t: '“Số lượng không đủ.\nCòn lại: N”', cls: 'err', small: true });
    d.edge({ from: 'q2', to: 'q3', lb: 'đủ', lp: [540, 655, 'start'] });
    d.node('q3', { shape: 'diamond', x: 530, y: 715, w: 200, h: 84, t: 'Đã có\ntrong giỏ?' });
    d.edge({ from: 'q3', to: 'u1', lb: 'có', lp: [645, 706] });
    d.node('u1', { shape: 'round', x: 910, y: 715, w: 250, h: 64, t: 'Tăng số lượng', s: 'increment + cập nhật giá mới', cls: 'sys' });
    d.edge({ pts: [[530, 757], [530, 825], [785, 825]], lb: 'không', lp: [540, 785, 'start'] });
    d.node('u2', { shape: 'round', x: 910, y: 825, w: 250, h: 56, t: 'Tạo cart_item mới', s: 'kèm giá tại thời điểm thêm', cls: 'sys' });
    d.edge({ pts: [[1035, 715], [1050, 715], [1050, 895], [150, 895], [150, 908]] });
    d.edge({ pts: [[910, 853], [910, 895]] });
    d.node('k2', { shape: 'round', x: 150, y: 935, w: 250, h: 52, t: '“Đã thêm vào giỏ hàng!”', s: 'redirect back (Inertia)', cls: 'sys' });
    d.edge({ from: 'k2', to: 'e', pts: [[150, 961], [150, 985]] });
    d.node('e', { shape: 'end', x: 150, y: 1000 });
    return d.mount();
}

// Mo gio hang: dong bo gia & ton kho
function scCartSync(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 1000, h: 940, seed: 32, number: true }, opts));
    d.node('s', { shape: 'start', x: 460, y: 60 });
    d.edge({ from: 's', to: 'a1' });
    d.node('a1', { shape: 'round', x: 460, y: 132, w: 300, h: 56, t: 'Mở trang /cart', s: 'CartController@index' });
    d.edge({ from: 'a1', to: 'q0' });
    d.node('q0', { shape: 'diamond', x: 460, y: 240, w: 190, h: 84, t: 'Đã có giỏ?' });
    d.edge({ from: 'q0', to: 'x0', lb: 'chưa', lp: [610, 231] });
    d.node('x0', { shape: 'round', x: 815, y: 240, w: 290, h: 56, t: 'Giỏ trống', s: 'cartItems = [] · tạm tính 0' });
    d.edge({ from: 'q0', to: 'a2', lb: 'có', lp: [470, 298, 'start'] });
    d.node('a2', { shape: 'round', x: 460, y: 350, w: 320, h: 56, t: 'Duyệt từng món trong giỏ', s: 'Cart::syncWithProducts()', cls: 'soft',
        info: { t: 'Vì sao cần đồng bộ?', d: 'Giá và tồn kho trong giỏ là số liệu <b>tại lúc thêm vào</b>. Quản trị viên có thể đã đổi giá, giảm tồn kho hoặc ngừng bán sản phẩm, nên giỏ hàng được cập nhật lại trước khi hiển thị.', r: SC + 'app/Models/Cart.php:78' } });
    d.edge({ from: 'a2', to: 'q1' });
    d.node('q1', { shape: 'diamond', x: 460, y: 465, w: 220, h: 90, t: 'Ngừng bán\nhoặc hết hàng?' });
    d.edge({ from: 'q1', to: 'x1', lb: 'có', lp: [610, 456] });
    d.node('x1', { shape: 'round', x: 815, y: 465, w: 290, h: 56, t: 'Xóa khỏi giỏ', s: 'đưa vào danh sách removed', cls: 'err',
        info: { c: `${k('if')} (!$product || $product->status !== ${s_("'active'")} || (int) $product->stock <= 0) {
    $removed[] = $item->toArray();
    $item->delete();
    ${k('continue')};
}` } });
    d.edge({ from: 'q1', to: 'q2', lb: 'không', lp: [470, 525, 'start'] });
    d.node('q2', { shape: 'diamond', x: 460, y: 585, w: 220, h: 90, t: 'Số lượng\n> tồn kho?' });
    d.edge({ from: 'q2', to: 'x2', lb: 'có', lp: [610, 576] });
    d.node('x2', { shape: 'round', x: 815, y: 585, w: 290, h: 56, t: 'Hạ số lượng = tồn kho', cls: 'warm' });
    d.edge({ from: 'q2', to: 'q3', lb: 'không', lp: [470, 645, 'start'] });
    d.edge({ pts: [[815, 613], [815, 640], [460, 640]] });
    d.node('q3', { shape: 'diamond', x: 460, y: 705, w: 220, h: 90, t: 'Giá đã đổi?', s: 'so với getFinalPrice()' });
    d.edge({ from: 'q3', to: 'x3', lb: 'có', lp: [610, 696] });
    d.node('x3', { shape: 'round', x: 815, y: 705, w: 290, h: 56, t: 'Cập nhật giá mới', s: 'discount_price ?? price', cls: 'warm' });
    d.edge({ from: 'q3', to: 'a3', lb: 'không', lp: [470, 765, 'start'] });
    d.edge({ pts: [[815, 733], [815, 778], [460, 778], [460, 792]] });
    d.edge({ k: 'dash', pts: [[960, 465], [978, 465], [978, 350], [620, 350]], lb: 'món tiếp theo', lp: [970, 405, 'end'] });
    d.node('a3', { shape: 'round', x: 460, y: 822, w: 400, h: 60, t: 'Hiển thị giỏ + tạm tính', s: 'có thay đổi → “Giỏ hàng đã được cập nhật theo giá và tồn kho mới nhất.”', cls: 'sys' });
    d.edge({ from: 'a3', to: 'e', pts: [[460, 852], [460, 893]] });
    d.node('e', { shape: 'end', x: 460, y: 908 });
    return d.mount();
}

// Dat hang COD qua OrderPlacementService
function scOrder(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 1180, h: 1240, seed: 33, number: true }, opts));
    lanes(d, [[250, 'Khách hàng'], [270, 'CartController'], [410, 'OrderPlacementService'], [250, 'MySQL']]);
    const S = 'app/Services/OrderPlacementService.php';
    d.node('s', { shape: 'start', x: 125, y: 92 });
    d.edge({ from: 's', to: 'k1' });
    d.node('k1', { shape: 'round', x: 125, y: 170, w: 210, h: 64, t: 'Chọn địa chỉ,\nnhập mã KM', s: 'bấm “Đặt hàng” (COD)' });
    d.edge({ from: 'k1', to: 'c1' });
    d.node('c1', { shape: 'round', x: 385, y: 170, w: 220, h: 64, t: 'POST /checkout/cod', s: 'validate mã KM,\nshipping_address_id',
        info: { t: 'Một service cho mọi kênh đặt hàng', d: 'COD trên web, <code>OrderController::store</code> (web + API) và thanh toán MoMo đều gọi chung <code>placeFromCart()</code> — cùng một bộ quy tắc nghiệp vụ, không lặp code.', r: SC + 'app/Http/Controllers/CartController.php · storeCOD()' } });
    d.edge({ from: 'c1', to: 'q1' });
    d.node('q1', { shape: 'diamond', x: 725, y: 170, w: 190, h: 80, t: 'Giỏ có hàng?' });
    d.edge({ from: 'q1', to: 'q2', lb: 'có', lp: [735, 222, 'start'] });
    d.node('q2', { shape: 'diamond', x: 725, y: 285, w: 210, h: 88, t: 'Có địa chỉ\ngiao hàng?', s: 'đã chọn hoặc mặc định',
        info: { t: 'Địa chỉ mặc định', c: `$shippingAddress = $shippingAddressId
    ? ShippingAddress::where(${s_("'user_id'")}, $userId)->find($shippingAddressId)
    : ShippingAddress::where(${s_("'user_id'")}, $userId)->orderByDesc(${s_("'is_default'")})->orderBy(${s_("'id'")})->first();`, r: SC + S } });
    d.edge({ from: 'q2', to: 't1', lb: 'có', lp: [735, 341, 'start'] });
    d.node('t1', { shape: 'round', x: 725, y: 390, w: 330, h: 52, t: 'DB::transaction bắt đầu', cls: 'soft' });
    d.edge({ from: 't1', to: 't2' });
    d.node('t2', { shape: 'round', x: 725, y: 480, w: 330, h: 56, t: 'Khóa dòng các sản phẩm', s: 'Product::whereIn(...)->lockForUpdate()', cls: 'warm',
        info: { t: 'Chống bán vượt kho', d: 'Khóa dòng sản phẩm ngay ở bước chốt đơn: nếu admin vừa hạ tồn kho / ngừng bán, hoặc hai khách cùng mua món cuối, chỉ một giao dịch đi tiếp, giao dịch sau đọc tồn kho đã trừ.', c: `$products = Product::whereIn(${s_("'id'")}, $cart->cartItems->pluck(${s_("'product_id'")}))
    ->lockForUpdate()
    ->get()
    ->keyBy(${s_("'id'")});`, r: SC + S } });
    d.edge({ from: 't2', to: 'db1', k: 'dash' });
    d.node('db1', { shape: 'cyl', x: 1055, y: 480, w: 210, h: 64, t: 'SELECT … FOR UPDATE', s: 'products' });
    d.edge({ from: 't2', to: 'q3' });
    d.node('q3', { shape: 'diamond', x: 725, y: 595, w: 220, h: 92, t: 'Còn bán và\nđủ tồn kho?',
        info: { c: `${k('if')} (!$product || $product->status !== ${s_("'active'")})
    ${k('throw')} ValidationException::withMessages([${s_("'cart'")} => ${s_('\'Sản phẩm "..." đã ngừng bán...\'')}]);
${k('if')} ((int) $product->stock < (int) $item->quantity)
    ${k('throw')} ValidationException::withMessages([${s_("'cart'")} => ${s_('"... chỉ còn {$product->stock} chiếc..."')}]);` } });
    d.edge({ from: 'q3', to: 'q4', lb: 'có', lp: [735, 655, 'start'] });
    d.node('q4', { shape: 'diamond', x: 725, y: 715, w: 210, h: 88, t: 'Mã KM\nhợp lệ?', s: 'nếu có nhập' });
    d.edge({ from: 'q4', to: 't3', lb: 'có', lp: [735, 771, 'start'] });
    d.node('t3', { shape: 'round', x: 725, y: 822, w: 360, h: 60, t: 'Tạo order: pending · unpaid', s: 'ORD-XXXXXXXXXX · phí ship 30.000đ\ntổng = tạm tính + ship − giảm', cls: 'sys',
        info: { c: `Order::create([
    ${s_("'order_code'")} => ${s_("'ORD-'")} . strtoupper(Str::random(10)),
    ${s_("'shipping_fee'")} => self::SHIPPING_FEE,     ${c_('// 30000')}
    ${s_("'total_amount'")} => $subtotal + self::SHIPPING_FEE - $discountAmount,
    ${s_("'payment_status'")} => ${s_("'unpaid'")}, ${s_("'order_status'")} => ${s_("'pending'")},
]);
$promotion?->increment(${s_("'used_count'")});`, r: SC + S } });
    d.edge({ from: 't3', to: 'db2', k: 'dash' });
    d.node('db2', { shape: 'cyl', x: 1055, y: 822, w: 210, h: 64, t: 'INSERT orders', s: '+ used_count mã KM' });
    d.edge({ from: 't3', to: 't4' });
    d.node('t4', { shape: 'round', x: 725, y: 925, w: 360, h: 56, t: 'Tạo order_items · trừ tồn kho', s: 'lưu tên + giá tại thời điểm mua', cls: 'sys' });
    d.edge({ from: 't4', to: 'db3', k: 'dash' });
    d.node('db3', { shape: 'cyl', x: 1055, y: 925, w: 210, h: 64, t: 'UPDATE products', s: 'stock − số lượng' });
    d.edge({ from: 't4', to: 't5' });
    d.node('t5', { shape: 'round', x: 725, y: 1020, w: 330, h: 52, t: 'Xóa giỏ hàng · COMMIT', cls: 'soft' });
    d.edge({ pts: [[725, 1046], [725, 1085], [125, 1085], [125, 1100]] });
    d.node('k2', { shape: 'round', x: 125, y: 1128, w: 210, h: 56, t: '“Đặt hàng thành công!”', s: 'redirect /dashboard', cls: 'sys' });
    d.edge({ from: 'k2', to: 'e', pts: [[125, 1156], [125, 1192]] });
    d.node('e', { shape: 'end', x: 125, y: 1207 });
    // Loi -> rollback, quay lai trang thanh toan
    const bus = (x0, y, lb) => d.edge({ k: 'err', pts: [[x0, y], [507, y], [507, 640], [230, 640]], lb, lp: [x0 - 12, y - 9, 'end'] });
    bus(630, 170, 'không'); bus(620, 285, 'không'); bus(615, 595, 'không'); bus(620, 715, 'sai');
    d.node('err', { shape: 'round', x: 125, y: 640, w: 210, h: 72, t: 'Quay lại trang\nthanh toán', s: 'hiện lỗi · ROLLBACK\nkhông trừ kho', cls: 'err' });
    return d.mount();
}

// Thanh toan MoMo (so do tuan tu)
function scMomo(svg, opts) {
    const H = 900;
    const d = Sketch(svg, Object.assign({ w: 1180, h: H, seed: 34 }, opts));
    const P = 'app/Http/Controllers/PaymentController.php';
    const { msg } = seqKit(d, [
        { id: 'u', x: 90, w: 140, t: 'Khách\n(trình duyệt)' },
        { id: 'p', x: 350, w: 190, t: 'PaymentController', info: { t: 'PaymentController', d: 'Tạo đơn thật <b>trước</b> khi chuyển sang MoMo để khi MoMo gọi lại thì tra đúng đơn theo <code>order_code</code>.', r: SC + P } },
        { id: 'o', x: 590, w: 200, t: 'OrderPlacement\nService' },
        { id: 'm', x: 840, w: 170, t: 'MoMo\n(test-payment)', cls: 'warm' },
        { id: 'db', x: 1080, w: 130, t: 'MySQL' },
    ], H);
    let y = 112;
    const n = (dy = 36) => (y += dy);
    msg('u', 'p', y, 'POST /momo-payment (axios) + mã KM');
    msg('p', 'o', n(), "placeFromCart(user, 'momo', mã)");
    msg('o', 'db', n(), 'khóa SP · tạo order unpaid · trừ kho · xóa giỏ');
    msg('o', 'p', n(), 'order (ORD-…)', 'ret');
    n(20);
    d.node('sig', { shape: 'note', x: 360, y: n(28), w: 360, h: 50, t: 'Ký HMAC-SHA256: amount, orderId = order_code,\nredirectUrl, ipnUrl, requestId … bằng secretKey', small: true,
        info: { t: 'Chữ ký gửi đi', c: `$rawHash = ${s_('"accessKey="')} . $accessKey . ${s_('"&amount="')} . $amount . ... . ${s_('"&requestType="')} . $requestType;
$signature = hash_hmac(${s_('"sha256"')}, $rawHash, $secretKey);`, r: SC + P } });
    msg('p', 'm', n(48), 'POST /v2/gateway/api/create + signature');
    msg('m', 'p', n(), 'payUrl', 'ret');
    msg('p', 'u', n(), 'JSON { payUrl } → chuyển trang', 'ret');
    msg('u', 'm', n(44), 'Quét mã / xác nhận trên MoMo');
    msg('m', 'p', n(44), 'IPN POST /api/momo-ipn (server → server)', 'async');
    d.node('chk', { shape: 'note', x: 360, y: n(40), w: 340, h: 50, t: 'Tính lại chữ ký, so bằng hash_equals()\nsai → 400, không đánh dấu đã trả', small: true, cls: 'err',
        info: { t: 'Chống giả mạo “đã thanh toán”', d: 'Ai cũng có thể gọi <code>/api/momo-ipn</code> hay <code>/momo-return</code>; chỉ khi chữ ký tính lại khớp mới tin kết quả. So sánh bằng <code>hash_equals</code> để tránh tấn công dò theo thời gian.', c: `$expectedSignature = hash_hmac(${s_('"sha256"')}, $rawHash, (string) env(${s_("'MOMO_SECRET_KEY'")}));
${k('return')} hash_equals($expectedSignature, (string) $request->signature);`, r: SC + P } });
    msg('p', 'db', n(44), 'resultCode = 0 → paid + processing');
    msg('m', 'u', n(44), 'chuyển hướng về redirectUrl', 'ret');
    msg('u', 'p', n(), 'GET /momo-return?…&signature');
    msg('p', 'db', n(), 'chữ ký đúng mà IPN chưa tới (localhost) → đánh dấu paid');
    msg('p', 'u', n(), 'Trang kết quả thanh toán', 'ret');
    d.text(590, H - 18, 'markOrderPaid() chỉ đổi khi đơn chưa “paid” — IPN và redirect đến hai lần cũng không cập nhật trùng.');
    return d.mount();
}

// Kiem tra ma khuyen mai
function scPromotion(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 1000, h: 1180, seed: 35, number: true }, opts));
    const M = 'app/Models/Promotion.php';
    d.node('s', { shape: 'start', x: 380, y: 60 });
    d.edge({ from: 's', to: 'a1' });
    d.node('a1', { shape: 'round', x: 380, y: 130, w: 340, h: 56, t: 'POST /checkout/check-promotion', s: 'tạm tính = tổng giỏ hiện tại' });
    d.edge({ from: 'a1', to: 'a2' });
    d.node('a2', { shape: 'round', x: 380, y: 222, w: 300, h: 52, t: 'Tìm mã đã viết hoa', s: 'strtoupper($code)' });
    const chk = (id, y, t, s, err, info) => {
        d.node(id, { shape: 'diamond', x: 380, y, w: 230, h: 90, t, s, info });
        d.edge({ from: id, to: id + 'e', k: 'err', lb: 'không', lp: [520, y - 9] });
        d.node(id + 'e', { shape: 'round', x: 790, y, w: 300, h: 52, t: err, cls: 'err', small: true });
    };
    d.edge({ from: 'a2', to: 'q1' });
    chk('q1', 330, 'Mã tồn tại?', '', '“Mã khuyến mãi không tồn tại!”');
    d.edge({ from: 'q1', to: 'q2', lb: 'có', lp: [390, 388, 'start'] });
    chk('q2', 440, 'Đang bật?', "status = 'active'", '“Mã khuyến mãi không còn hiệu lực!”');
    d.edge({ from: 'q2', to: 'q3', lb: 'có', lp: [390, 498, 'start'] });
    chk('q3', 550, 'Trong thời gian\náp dụng?', '', '“Chưa bắt đầu” / “Đã hết hạn!”');
    d.edge({ from: 'q3', to: 'q4', lb: 'có', lp: [390, 608, 'start'] });
    chk('q4', 660, 'Còn lượt dùng?', 'used_count < usage_limit', '“Mã đã hết lượt sử dụng!”', { t: 'Giới hạn lượt dùng', d: '<code>used_count</code> được tăng trong cùng giao dịch tạo đơn (<code>$promotion?->increment(\'used_count\')</code>).' });
    d.edge({ from: 'q4', to: 'q5', lb: 'có', lp: [390, 718, 'start'] });
    chk('q5', 770, 'Đạt giá trị\nđơn tối thiểu?', '', '“Đơn hàng tối thiểu …đ để dùng mã!”');
    d.edge({ from: 'q5', to: 'q6', lb: 'có', lp: [390, 828, 'start'] });
    d.node('q6', { shape: 'diamond', x: 380, y: 880, w: 200, h: 84, t: 'Loại giảm?' });
    d.edge({ pts: [[280, 880], [180, 880], [180, 948]], lb: 'phần trăm', lp: [230, 871] });
    d.edge({ pts: [[480, 880], [580, 880], [580, 948]], lb: 'số tiền', lp: [530, 871] });
    d.node('c1', { shape: 'round', x: 180, y: 978, w: 280, h: 60, t: 'tạm tính × %', s: 'không vượt max_discount', cls: 'sys' });
    d.node('c2', { shape: 'round', x: 580, y: 978, w: 280, h: 60, t: 'giảm cố định', s: 'discount_value', cls: 'sys' });
    d.edge({ pts: [[180, 1008], [180, 1040], [380, 1040], [380, 1052]] });
    d.edge({ pts: [[580, 1008], [580, 1040], [380, 1040]] });
    d.node('c3', { shape: 'round', x: 380, y: 1080, w: 360, h: 56, t: 'giảm = min(giảm, tạm tính)', s: 'JSON success:true + discount_amount', cls: 'sys',
        info: { c: `${k('if')} ($promotion->discount_type === ${s_("'percent'")}) {
    $discount = ($orderAmount * $promotion->discount_value) / 100;
    ${k('if')} ($promotion->max_discount && $discount > $promotion->max_discount)
        $discount = $promotion->max_discount;
} ${k('else')} $discount = (float) $promotion->discount_value;
$discount = min($discount, $orderAmount);`, r: SC + M + ':60' } });
    d.edge({ from: 'c3', to: 'e', pts: [[380, 1108], [380, 1135]] });
    d.node('e', { shape: 'end', x: 380, y: 1150 });
    d.node('n', { shape: 'note', x: 790, y: 1060, w: 300, h: 80, t: 'Khi đặt hàng thật, placeFromCart()\ngọi lại đúng hàm này trong giao dịch\n— không tin số từ trình duyệt', small: true });
    return d.mount();
}

// Huy don & hoan kho
function scCancel(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 1000, h: 920, seed: 36, number: true }, opts));
    lanes(d, [[300, 'Khách hàng'], [420, 'OrderController@cancel'], [280, 'MySQL']]);
    d.node('s', { shape: 'start', x: 150, y: 92 });
    d.edge({ from: 's', to: 'k1' });
    d.node('k1', { shape: 'round', x: 150, y: 165, w: 250, h: 56, t: 'Bấm “Hủy đơn”, nhập lý do', s: 'POST /orders/{id}/cancel' });
    d.edge({ from: 'k1', to: 'c1' });
    d.node('c1', { shape: 'round', x: 510, y: 165, w: 320, h: 56, t: 'Validate lý do', s: 'bắt buộc · tối đa 500 ký tự' });
    d.edge({ from: 'c1', to: 'c2' });
    d.node('c2', { shape: 'round', x: 510, y: 262, w: 320, h: 56, t: 'Tìm đơn của chính mình', s: "where user_id = Auth::id() → không có thì 404",
        info: { c: `$order = Order::where(${s_("'user_id'")}, Auth::id())->findOrFail($id);`, r: SC + 'app/Http/Controllers/OrderController.php:124' } });
    d.edge({ from: 'c2', to: 'q1' });
    d.node('q1', { shape: 'diamond', x: 510, y: 375, w: 220, h: 90, t: 'canCancel()?', s: 'pending hoặc confirmed',
        info: { t: 'Chỉ hủy khi chưa làm bánh', c: `${k('public function')} canCancel(): bool {
    ${k('return')} in_array($this->order_status, [${s_("'pending'")}, ${s_("'confirmed'")}], ${k('true')});
}`, r: SC + 'app/Models/Order.php:75' } });
    d.edge({ from: 'q1', to: 'e1', k: 'err', lb: 'không', lp: [362, 366] });
    d.node('e1', { shape: 'round', x: 150, y: 375, w: 250, h: 56, t: '“Không thể hủy\nđơn hàng này”', cls: 'err', small: true });
    d.edge({ from: 'q1', to: 't1', lb: 'được', lp: [520, 433, 'start'] });
    d.node('t1', { shape: 'round', x: 510, y: 485, w: 320, h: 52, t: 'DB::transaction', cls: 'soft' });
    d.edge({ from: 't1', to: 't2' });
    d.node('t2', { shape: 'round', x: 510, y: 580, w: 320, h: 56, t: 'Hoàn lại tồn kho', s: 'increment stock theo từng order_item', cls: 'sys',
        info: { c: `${k('foreach')} ($order->orderItems ${k('as')} $item) {
    ${k('if')} ($item->product_id)
        Product::where(${s_("'id'")}, $item->product_id)->increment(${s_("'stock'")}, $item->quantity);
}` } });
    d.edge({ from: 't2', to: 'db1', k: 'dash' });
    d.node('db1', { shape: 'cyl', x: 860, y: 580, w: 220, h: 64, t: 'UPDATE products', s: 'stock + số lượng' });
    d.edge({ from: 't2', to: 't3' });
    d.node('t3', { shape: 'round', x: 510, y: 680, w: 320, h: 56, t: 'order_status = cancelled', s: 'lưu cancelled_reason', cls: 'sys' });
    d.edge({ from: 't3', to: 'db2', k: 'dash' });
    d.node('db2', { shape: 'cyl', x: 860, y: 680, w: 220, h: 64, t: 'UPDATE orders' });
    d.edge({ pts: [[510, 708], [510, 745], [150, 745], [150, 762]] });
    d.node('k2', { shape: 'round', x: 150, y: 790, w: 250, h: 56, t: '“Đã hủy đơn hàng\nthành công”', cls: 'sys' });
    d.edge({ from: 'k2', to: 'e', pts: [[150, 818], [150, 865]] });
    d.node('e', { shape: 'end', x: 150, y: 880 });
    return d.mount();
}

// Vong doi don hang Sweet Cake
function scOrderState(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 1180, h: 640, seed: 37 }, opts));
    const st = (id, x, y, t, s, cls, info, w = 186) => d.node(id, { shape: 'pill', x, y, w, h: 62, t, s, cls, info });
    d.node('s', { shape: 'start', x: 120, y: 70 });
    d.edge({ from: 's', to: 'P', pts: [[120, 82], [120, 169]], lb: 'placeFromCart()', lp: [132, 125, 'start'] });
    st('P', 120, 200, 'CHỜ XỬ LÝ', 'pending', 'warm', { t: 'pending', d: 'Đơn mới tạo (COD hoặc MoMo trước khi trả tiền). Đếm vào badge đỏ “đơn mới” của admin cùng với processing.' });
    d.edge({ from: 'P', to: 'C', lb: 'admin', lp: [245, 191] });
    st('C', 370, 200, 'ĐÃ XÁC NHẬN', 'confirmed');
    d.edge({ from: 'C', to: 'R', lb: 'admin', lp: [495, 191] });
    st('R', 620, 200, 'ĐANG LÀM', 'processing', 'sys');
    d.edge({ from: 'R', to: 'S', lb: 'admin', lp: [745, 191] });
    st('S', 870, 200, 'ĐANG GIAO', 'shipping');
    d.edge({ from: 'S', to: 'D', pts: [[963, 200], [985, 200]] });
    st('D', 1080, 200, 'HOÀN TẤT', 'completed', 'sys', null, 180);
    d.edge({ pts: [[160, 231], [160, 290], [620, 290], [620, 231]], lb: 'MoMo trả tiền thành công (chữ ký đúng)\n→ tự chuyển processing', lp: [390, 320] });
    d.edge({ pts: [[80, 231], [80, 430], [160, 430]], lb: 'khách hủy', lp: [90, 360, 'start'] });
    d.edge({ pts: [[370, 231], [370, 400], [345, 400]], lb: 'khách hủy', lp: [380, 360, 'start'] });
    st('X', 255, 420, 'ĐÃ HỦY', 'cancelled · hoàn tồn kho', 'err', { t: 'cancelled', d: 'Khách chỉ tự hủy được ở <b>pending / confirmed</b> (<code>canCancel()</code>); khi hủy, tồn kho được cộng lại trong giao dịch.' });
    d.edge({ pts: [[1080, 231], [1080, 420], [973, 420]], lb: 'admin (thủ công)', lp: [1068, 330, 'end'] });
    st('F', 880, 420, 'HOÀN TIỀN', 'refunded', 'gone');
    d.node('pay', { shape: 'note', x: 555, y: 545, w: 500, h: 92, t: 'Thanh toán là cột riêng: unpaid → paid → refunded.\nĐơn “completed” KHÔNG tự thành “paid” — COD phải được admin\nxác nhận đã thu tiền để báo cáo doanh thu không sai.', small: true,
        info: { t: 'Tách trạng thái thanh toán', c: `${c_('// Admin/OrderController@updateStatus')}
${c_('// KHONG tu dong danh dau "da thanh toan" khi don chuyen "completed" nua.')}
${c_('// Voi don COD, xac nhan da thu tien la thao tac rieng qua updatePaymentStatus()')}
${c_('// de tranh sai lech bao cao doanh thu.')}`, r: SC + 'app/Http/Controllers/Admin/OrderController.php:86' } });
    d.node('rule', { shape: 'note', x: 1000, y: 545, w: 300, h: 92, t: 'Admin đổi trạng thái: code chỉ kiểm\ngiá trị nằm trong ORDER_STATUSES\nvà ghi lại vào admin_logs', small: true, cls: 'gone',
        info: { t: 'Ghi nhật ký mỗi lần đổi', c: `$validated = $request->validate([
    ${s_("'order_status'")} => [${s_("'required'")}, Rule::in(Order::ORDER_STATUSES)],
]);
AdminLog::create([${s_("'action'")} => ${s_("'update_status'")}, ${s_("'old_value'")} => ..., ${s_("'new_value'")} => ..., ${s_("'ip_address'")} => $request->ip()]);` } });
    return d.mount();
}

// Dang nhap quan tri Sweet Cake
function scAdminLogin(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 1000, h: 900, seed: 38, number: true }, opts));
    const A = 'app/Http/Controllers/Admin/AuthController.php';
    d.node('s', { shape: 'start', x: 380, y: 60 });
    d.edge({ from: 's', to: 'a1' });
    d.node('a1', { shape: 'round', x: 380, y: 130, w: 320, h: 56, t: 'POST /admin/login', s: 'validate email + mật khẩu', info: { r: SC + A + ':23' } });
    const chk = (id, y, t, err, lb = 'không') => {
        d.node(id, { shape: 'diamond', x: 380, y, w: 230, h: 90, t });
        d.edge({ from: id, to: id + 'e', k: 'err', lb, lp: [520, y - 9] });
        d.node(id + 'e', { shape: 'round', x: 790, y, w: 310, h: 56, t: err, cls: 'err', small: true });
    };
    d.edge({ from: 'a1', to: 'q1' });
    chk('q1', 240, 'Auth::attempt()\nđúng?', '“Email hoặc mật khẩu không đúng.”');
    d.edge({ from: 'q1', to: 'q2', lb: 'đúng', lp: [390, 298, 'start'] });
    chk('q2', 350, "role = 'admin'?", 'Đăng xuất · “Bạn không có quyền\ntruy cập vào trang quản trị.”');
    d.edge({ from: 'q2', to: 'q3', lb: 'có', lp: [390, 408, 'start'] });
    chk('q3', 460, 'Tài khoản\nbị khóa?', 'Đăng xuất · “Tài khoản của bạn\nđã bị khóa.”', 'có');
    d.edge({ from: 'q3', to: 'a2', lb: 'không', lp: [390, 518, 'start'] });
    d.node('a2', { shape: 'round', x: 380, y: 565, w: 340, h: 60, t: 'Cập nhật last_login', s: 'session()->regenerate() — chống session fixation', cls: 'sys',
        info: { c: `$user->update([${s_("'last_login'")} => now()]);
$request->session()->regenerate();
${k('return')} redirect()->intended(${s_("'/admin/dashboard'")});`, r: SC + A + ':51' } });
    d.edge({ from: 'a2', to: 'a3' });
    d.node('a3', { shape: 'round', x: 380, y: 660, w: 300, h: 50, t: '→ /admin/dashboard', cls: 'sys' });
    d.edge({ from: 'a3', to: 'mw' });
    d.node('mw', { shape: 'round', x: 380, y: 775, w: 560, h: 92, t: 'Mỗi request /admin/* đi qua AdminMiddleware', s: 'chưa đăng nhập → /admin/login (API: 401)\nbị khóa giữa chừng → đăng xuất ngay (API: 403)\nkhông phải admin → về trang chủ (API: 403)', cls: 'soft',
        info: { t: 'AdminMiddleware', d: 'Kiểm lại <b>mọi request</b>, nên admin bị khóa trong lúc đang đăng nhập cũng bị đẩy ra ngay. Trả JSON cho API, chuyển trang cho web.', r: SC + 'app/Http/Middleware/AdminMiddleware.php' } });
    return d.mount();
}

// Gui tin nhan hoi dap + admin tra loi
function scMessage(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 1080, h: 1020, seed: 39, number: true }, opts));
    lanes(d, [[330, 'Khách / khách vãng lai'], [400, 'MessageController'], [350, 'Admin']]);
    d.node('s', { shape: 'start', x: 165, y: 92 });
    d.edge({ from: 's', to: 'k1' });
    d.node('k1', { shape: 'round', x: 165, y: 165, w: 280, h: 56, t: 'Gửi câu hỏi', s: 'POST /api/messages · tiêu đề + nội dung' });
    d.edge({ pts: [[305, 165], [530, 165], [530, 215]] });
    d.node('q0', { shape: 'diamond', x: 530, y: 260, w: 230, h: 90, t: 'Quá 10 lần\n/phút / IP?',
        info: { t: 'Chống spam', d: 'API công khai (miễn CSRF để client ngoài gọi được) nên được giới hạn tần suất theo IP.', c: `RateLimiter::for(${s_("'message-form'")}, fn ($request) =>
    Limit::perMinute(10)->by(${s_("'message|'")} . $request->ip()));`, r: SC + 'app/Providers/AppServiceProvider.php:26' } });
    d.edge({ from: 'q0', to: 'e429', k: 'err', lb: 'có', lp: [395, 251] });
    d.node('e429', { shape: 'round', x: 165, y: 260, w: 240, h: 50, t: 'HTTP 429 · thử lại sau', cls: 'err', small: true });
    d.edge({ from: 'q0', to: 'c1', lb: 'không', lp: [540, 318, 'start'] });
    d.node('c1', { shape: 'round', x: 530, y: 385, w: 340, h: 70, t: 'Validate theo người gửi', s: 'vãng lai: bắt buộc tên + email\nđã đăng nhập: gắn user_id, bỏ trống guest_*',
        info: { c: `$isLoggedIn = auth()->check();
$request->validate([
    ${s_("'guest_name'")}  => [$isLoggedIn ? ${s_("'nullable'")} : ${s_("'required'")}, ...],
    ${s_("'guest_email'")} => [$isLoggedIn ? ${s_("'nullable'")} : ${s_("'required'")}, ${s_("'email'")}, ...],
    ${s_("'subject'")} => ${s_("'required|max:200'")}, ${s_("'content'")} => ${s_("'required|max:2000'")},
]);`, r: SC + 'app/Http/Controllers/MessageController.php' } });
    d.edge({ from: 'c1', to: 'c2' });
    d.node('c2', { shape: 'round', x: 530, y: 490, w: 340, h: 56, t: 'Message::create', s: '201 “Tin nhắn đã gửi thành công!”', cls: 'sys' });
    d.edge({ pts: [[700, 490], [905, 490], [905, 557]] });
    d.node('a1', { shape: 'round', x: 905, y: 585, w: 300, h: 56, t: 'Thấy tin chưa đọc', s: 'đánh dấu đã đọc / đọc tất cả' });
    d.edge({ from: 'a1', to: 'a2' });
    d.node('a2', { shape: 'round', x: 905, y: 685, w: 300, h: 56, t: 'Trả lời', s: 'POST /admin/messages/{id}/reply' });
    d.edge({ pts: [[905, 713], [905, 745], [530, 745], [530, 759]] });
    d.node('c3', { shape: 'round', x: 530, y: 790, w: 340, h: 62, t: 'Lưu admin_reply · status = replied', s: 'gửi MessageRepliedMail tới email\ncủa tài khoản hoặc guest_email', cls: 'sys',
        info: { c: `$message->update([${s_("'admin_reply'")} => $request->admin_reply, ${s_("'status'")} => ${s_("'replied'")}]);
$recipientEmail = $message->user?->email ?? $message->guest_email;
${k('if')} ($recipientEmail) Mail::to($recipientEmail)->send(${k('new')} MessageRepliedMail($message->fresh()));`, r: SC + 'app/Http/Controllers/Admin/MessageController.php:68' } });
    d.edge({ pts: [[530, 821], [530, 865], [165, 865], [165, 877]] });
    d.node('k2', { shape: 'round', x: 165, y: 907, w: 280, h: 60, t: 'Nhận email · xem lại', s: '/my-messages gộp cả lịch sử\nform “Liên hệ” theo email', cls: 'sys' });
    d.edge({ from: 'k2', to: 'e', pts: [[165, 937], [165, 970]] });
    d.node('e', { shape: 'end', x: 165, y: 985 });
    return d.mount();
}

// Chatbot tu van phong (Homestay May) (Activity)
function hmChatbot(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 1080, h: 800, seed: 41, number: true }, opts));
    lanes(d, [[300, 'Khách hàng'], [460, 'ChatbotService'], [320, 'Database']]);
    d.node('s', { shape: 'start', x: 150, y: 92 });
    d.edge({ from: 's', to: 'k1' });
    d.node('k1', { shape: 'round', x: 150, y: 165, w: 250, h: 56, t: 'Gõ câu hỏi', s: 'POST /api/chatbot/ask · công khai' });
    d.edge({ from: 'k1', to: 'th', pts: [[275, 165], [530, 165], [530, 196]] });
    d.node('th', { shape: 'diamond', x: 530, y: 248, w: 230, h: 88, t: 'Quá 10 lần\n/phút/IP?',
        info: { t: 'Giới hạn tần suất chatbot', d: 'API <code>/api/chatbot/ask</code> không cần đăng nhập nên bị throttle theo IP để chống spam.' } });
    d.edge({ from: 'th', to: 'e429', k: 'err', lb: 'có', lp: [400, 239] });
    d.node('e429', { shape: 'round', x: 150, y: 248, w: 240, h: 50, t: 'HTTP 429 · thử lại sau', cls: 'err', small: true });
    d.edge({ from: 'th', to: 'c1', lb: 'không', lp: [545, 305, 'start'] });
    d.node('c1', { shape: 'round', x: 530, y: 375, w: 320, h: 56, t: 'Phân tích từ khóa', s: 'phòng / giá / combo / chính sách / …',
        info: { t: 'Chatbot dựa từ khóa', d: 'Không dùng AI; từ khóa trong câu hỏi được đối chiếu với bảng keyword → nhóm câu trả lời tương ứng.' } });
    d.edge({ from: 'c1', to: 'gw' });
    d.node('gw', { shape: 'diamond', x: 530, y: 482, w: 240, h: 90, t: 'Loại câu hỏi?' });
    d.edge({ from: 'gw', to: 'qdb', lb: 'phòng / giá', lp: [666, 473] });
    d.node('qdb', { shape: 'round', x: 910, y: 482, w: 250, h: 56, t: 'SELECT rooms,\nprice_calendar', s: 'giá, ngày còn trống', cls: 'sys' });
    d.edge({ from: 'qdb', to: 'c2', pts: [[910, 510], [910, 648], [690, 648]] });
    d.edge({ from: 'gw', to: 'faq', lb: 'chính sách / khác', lp: [405, 473] });
    d.node('faq', { shape: 'round', x: 530, y: 582, w: 280, h: 52, t: 'Tra bảng FAQ tĩnh', s: 'từ khóa → câu trả lời mẫu', cls: 'soft' });
    d.edge({ from: 'faq', to: 'c2' });
    d.node('c2', { shape: 'round', x: 530, y: 670, w: 320, h: 56, t: 'Trả JSON · gợi ý bước tiếp', s: '{ message, suggestions: [ … ] }', cls: 'sys' });
    d.edge({ from: 'c2', to: 'k2', pts: [[530, 698], [530, 738], [150, 738], [150, 748]] });
    d.node('k2', { shape: 'round', x: 150, y: 776, w: 250, h: 50, t: 'Hiển thị phản hồi', s: 'gợi ý nút "Đặt phòng ngay"' });
    d.edge({ from: 'k2', to: 'e', pts: [[150, 801]] });
    d.node('e', { shape: 'end', x: 150, y: 812 });
    return d.mount();
}

// Viet & duyet danh gia san pham (Sweet Cake) (Activity)
function scDanhGia(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 1000, h: 840, seed: 42, number: true }, opts));
    const chk = (id, y, t, err) => {
        d.node(id, { shape: 'diamond', x: 400, y, w: 240, h: 88, t });
        d.edge({ from: id, to: id + 'e', k: 'err', lb: 'không', lp: [540, y - 9] });
        d.node(id + 'e', { shape: 'round', x: 790, y, w: 310, h: 52, t: err, cls: 'err', small: true });
    };
    d.node('s', { shape: 'start', x: 400, y: 60 });
    d.edge({ from: 's', to: 'a1' });
    d.node('a1', { shape: 'round', x: 400, y: 130, w: 340, h: 56, t: 'POST /reviews', s: 'đăng nhập bắt buộc · rating 1–5 · nội dung' });
    d.edge({ from: 'a1', to: 'q1' });
    chk('q1', 240, 'Đơn completed\nchứa sản phẩm này?', '"Bạn chưa mua sản phẩm này."',
        { t: 'Chỉ đánh giá hàng đã mua', d: 'Tìm order_items của chính user có product_id và order_status = completed.' });
    d.edge({ from: 'q1', to: 'q2', lb: 'có', lp: [410, 296, 'start'] });
    chk('q2', 350, 'Chưa có đánh giá\ncho sản phẩm này?', '"Bạn đã đánh giá sản phẩm này rồi."');
    d.edge({ from: 'q2', to: 'c1', lb: 'chưa', lp: [410, 406, 'start'] });
    d.node('c1', { shape: 'round', x: 400, y: 465, w: 340, h: 56, t: 'INSERT reviews · status = pending', s: 'rating, body, product_id, user_id', cls: 'sys',
        info: { t: 'Review chờ duyệt', d: 'Đánh giá mới luôn ở <b>pending</b> — không hiện lên trang sản phẩm cho đến khi admin duyệt.' } });
    d.edge({ from: 'c1', to: 'k2', pts: [[400, 493], [400, 540], [200, 540], [200, 548]] });
    d.node('k2', { shape: 'round', x: 200, y: 576, w: 280, h: 50, t: '"Cảm ơn! Đánh giá đang\nchờ duyệt."', cls: 'sys', small: true });
    d.edge({ from: 'c1', to: 'adm', pts: [[400, 493], [400, 610]] });
    d.node('adm', { shape: 'round', x: 400, y: 640, w: 340, h: 52, t: 'Admin xem danh sách pending', s: '/admin/reviews?status=pending', cls: 'warm' });
    d.edge({ from: 'adm', to: 'qa' });
    d.node('qa', { shape: 'diamond', x: 400, y: 745, w: 210, h: 84, t: 'Duyệt?' });
    d.edge({ from: 'qa', to: 'c2', lb: 'duyệt', lp: [410, 807, 'start'] });
    d.node('c2', { shape: 'round', x: 400, y: 800, w: 340, h: 52, t: 'status = approved · cập nhật avg_rating', s: '→ hiện sao trên trang sản phẩm', cls: 'sys', small: true });
    d.edge({ from: 'c2', to: 'e', pts: [[400, 826]] });
    d.edge({ from: 'qa', to: 'cr', k: 'err', lb: 'từ chối', lp: [295, 736] });
    d.node('cr', { shape: 'round', x: 100, y: 745, w: 200, h: 50, t: 'status = rejected', cls: 'err', small: true });
    d.edge({ from: 'cr', to: 'e', pts: [[100, 770], [100, 830], [390, 830]] });
    d.node('e', { shape: 'end', x: 400, y: 842 });
    return d.mount();
}

// Vong doi tien dat coc Homestay May (State)
function hmDepositState(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 1100, h: 500, seed: 43 }, opts));
    const st = (id, x, y, t, s, cls, info) => d.node(id, { shape: 'pill', x, y, w: 190, h: 62, t, s, cls, info });
    d.node('s', { shape: 'start', x: 60, y: 80 });
    d.edge({ from: 's', to: 'gw' });
    d.node('gw', { shape: 'diamond', x: 60, y: 175, w: 220, h: 82, t: 'Yêu cầu cọc?' });
    d.edge({ from: 'gw', to: 'NK', lb: 'không', lp: [73, 235, 'start'] });
    st('NK', 60, 330, 'KHÔNG CỌC', 'no_deposit', 'soft', { t: 'Không yêu cầu cọc', d: 'Lễ tân xác nhận trực tiếp; khách thanh toán đầy đủ khi nhận phòng.' });
    d.edge({ from: 'NK', to: 'e1', pts: [[60, 361], [60, 440]] });
    d.node('e1', { shape: 'end', x: 60, y: 458 });
    d.edge({ from: 'gw', to: 'W', lb: 'có', lp: [180, 166] });
    st('W', 330, 175, 'CHỜ CỌC', 'pending_deposit', 'warm', { t: 'Chờ chuyển cọc', d: 'Hệ thống gửi mã VietQR và hạn chuyển. Bộ hẹn giờ kiểm tra mỗi 5 phút.' });
    d.edge({ from: 'W', to: 'D', lb: 'lễ tân xác nhận đã nhận', lp: [426, 166] });
    st('D', 600, 175, 'ĐÃ CỌC', 'deposited', 'sys', { t: 'Đã nhận cọc', d: 'Tiền cọc đã vào tài khoản; lễ tân bấm "Đã nhận cọc"; đơn chuyển sang Đã xác nhận.' });
    d.edge({ from: 'D', to: 'P', lb: 'nhận & trả phòng', lp: [696, 166] });
    st('P', 870, 175, 'ĐÃ THANH TOÁN', 'paid_full', 'sys', null, 210);
    d.edge({ from: 'P', to: 'e2', pts: [[870, 206], [870, 440], [1050, 440]] });
    d.node('e2', { shape: 'end', x: 1060, y: 458 });
    d.edge({ from: 'W', to: 'EX', lb: 'quá hạn (timer 5 phút)', lp: [344, 235, 'start'] });
    st('EX', 330, 360, 'QUÁ HẠN · HỦY', 'expired', 'err', { t: 'Đơn tự hủy', d: '<code>@Scheduled</code> chạy 5 phút/lần; đơn CHỜ CỌC quá hạn bị hủy và gửi email cho khách.' });
    d.edge({ from: 'D', to: 'RF', lb: 'đơn bị hủy', lp: [612, 235, 'start'] });
    st('RF', 600, 360, 'HOÀN TIỀN', 'refunded', 'gone', { t: 'Hoàn tiền cọc', d: 'Admin hoàn tiền thủ công khi đơn đã cọc bị hủy.' });
    d.edge({ from: 'EX', to: 'e3', pts: [[330, 391], [330, 440], [780, 440]] });
    d.edge({ from: 'RF', to: 'e3', pts: [[600, 391], [600, 440], [780, 440]] });
    d.node('e3', { shape: 'end', x: 790, y: 458 });
    return d.mount();
}

// Vong doi danh gia Sweet Cake (State)
function scReviewState(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 920, h: 380, seed: 46 }, opts));
    const st = (id, x, y, t, s, cls, info) => d.node(id, { shape: 'pill', x, y, w: 190, h: 62, t, s, cls, info });
    d.node('s', { shape: 'start', x: 90, y: 90 });
    d.edge({ from: 's', to: 'P', lb: 'khách gửi đánh giá', lp: [105, 140, 'start'] });
    st('P', 90, 210, 'CHỜ DUYỆT', 'pending', 'warm', { t: 'pending', d: 'Đánh giá mới luôn ở pending. Không hiện lên trang sản phẩm.' });
    d.edge({ from: 'P', to: 'A', lb: 'admin duyệt', lp: [290, 201] });
    st('A', 390, 210, 'ĐÃ DUYỆT', 'approved', 'sys', { t: 'approved', d: 'Hiện lên trang sản phẩm, tính vào rating trung bình. Không thể sửa sau khi duyệt.' });
    d.edge({ from: 'P', to: 'R', pts: [[90, 241], [90, 320], [390, 320]], lb: 'admin từ chối', lp: [225, 309] });
    st('R', 390, 320, 'TỪ CHỐI', 'rejected', 'err', { t: 'rejected', d: 'Không hiện lên trang sản phẩm. Admin có thể xóa hoặc giữ lại trong hệ thống.' });
    d.edge({ from: 'A', to: 'e', pts: [[390, 241], [390, 360], [690, 360]] });
    d.edge({ from: 'R', to: 'e', pts: [[390, 351], [390, 360], [690, 360]] });
    d.node('e', { shape: 'end', x: 700, y: 360 });
    d.node('n', { shape: 'note', x: 640, y: 120, w: 260, h: 72, t: 'Chỉ tài khoản đã mua mới gửi được;\nmỗi tài khoản-sản phẩm chỉ 1 lần;\nrating tổng được tính lại sau khi duyệt', small: true });
    return d.mount();
}

// Check-in tai quay le tan (Homestay May) (Sequence)
function hmCheckinSeq(svg, opts) {
    const H = 720;
    const d = Sketch(svg, Object.assign({ w: 1060, h: H, seed: 47 }, opts));
    const { msg } = seqKit(d, [
        { id: 'lt',   x: 100, w: 140, t: 'Lễ tân',            cls: 'warm' },
        { id: 'ctrl', x: 340, w: 220, t: 'BookingController', cls: 'sys' },
        { id: 'svc',  x: 650, w: 230, t: 'BookingService',    cls: 'sys' },
        { id: 'db',   x: 960, w: 140, t: 'MySQL',             cls: 'soft' },
    ], H);
    let y = 112; const n = (dy = 36) => (y += dy);
    msg('lt', 'ctrl', y, 'POST /bookings/{id}/checkin');
    msg('ctrl', 'svc', n(), 'checkIn(bookingId)');
    msg('svc', 'db', n(), 'SELECT booking WHERE id=? FOR UPDATE');
    msg('db', 'svc', n(), 'booking (CONFIRMED)', 'ret');
    n(10);
    d.node('gk', { shape: 'note', x: 370, y: n(30), w: 420, h: 46, t: 'Điều kiện: status = CONFIRMED và\nhasGuestDeclaration = true', small: true,
        info: { t: 'Điều kiện nhận phòng', d: 'Phải đã xác nhận <b>và</b> đã khai báo lưu trú (theo Nghị định 145). Thiếu một trong hai trả 422.' } });
    n(10);
    d.edge({ k: 'err', pts: [[370, n(30)], [100, y]], lb: 'chưa khai báo lưu trú', lp: [245, y - 9] });
    d.node('er', { shape: 'round', x: 100, y, w: 180, h: 50, t: '422 "Chưa khai báo\nlưu trú"', cls: 'err', small: true });
    n(16);
    msg('svc', 'db', n(36), 'UPDATE rooms SET status=OCCUPIED');
    msg('svc', 'db', n(), 'UPDATE bookings SET status=CHECKED_IN,\ncheckin_at=now()');
    msg('db', 'svc', n(), 'OK', 'ret');
    msg('svc', 'ctrl', n(), 'booking (CHECKED_IN)', 'ret');
    msg('ctrl', 'lt', n(), '200 · tên khách · số phòng', 'ret');
    return d.mount();
}

// Dat hang COD: so do tuan tu Browser → Laravel (Sweet Cake) (Sequence)
function scOrderSeq(svg, opts) {
    const H = 740;
    const d = Sketch(svg, Object.assign({ w: 1080, h: H, seed: 48 }, opts));
    const { msg } = seqKit(d, [
        { id: 'br',   x:  90, w: 160, t: 'Trình duyệt\n(React / Inertia)' },
        { id: 'ctrl', x: 340, w: 230, t: 'CartController\n@storeCOD',     cls: 'sys' },
        { id: 'svc',  x: 660, w: 240, t: 'OrderPlacement\nService',       cls: 'sys' },
        { id: 'db',   x: 960, w: 140, t: 'MySQL',                         cls: 'soft' },
    ], H);
    let y = 112; const n = (dy = 36) => (y += dy);
    msg('br', 'ctrl', y, 'POST /checkout/cod · address_id, promo_code');
    msg('ctrl', 'svc', n(), "placeFromCart(user, 'cod', addressId, code)");
    msg('svc', 'db', n(), 'SELECT cart_items WHERE user_id=?');
    msg('db', 'svc', n(), 'cart_items', 'ret');
    msg('svc', 'db', n(), 'SELECT products … FOR UPDATE');
    n(10);
    d.node('vl', { shape: 'note', x: 450, y: n(30), w: 400, h: 58, t: 'Validate từng item: còn bán, stock ≥ qty;\ntính subtotal · áp mã KM trong giao dịch', small: true,
        info: { t: 'Validate trong DB::transaction', d: 'Khóa dòng sản phẩm trước khi validate: nếu stock vừa bị hạ bởi giao dịch khác, lỗi được phát hiện ngay trong cùng transaction.' } });
    msg('svc', 'db', n(52), 'INSERT order + order_items\nUPDATE products.stock\nDELETE cart_items');
    msg('db', 'svc', n(44), 'order (ORD-…)', 'ret');
    msg('svc', 'ctrl', n(), 'order', 'ret');
    n(10);
    d.node('em', { shape: 'note', x: 170, y: n(30), w: 340, h: 44, t: 'Dispatch OrderPlacedEvent\n→ email xác nhận (queue, async)', small: true });
    msg('ctrl', 'br', n(44), 'Inertia::redirect /dashboard\n"Đặt hàng thành công!"', 'ret');
    return d.mount();
}

// Dat phong walk-in tai quay le tan (Activity)
function hmWalkIn(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 1080, h: 920, seed: 53, number: true }, opts));
    lanes(d, [[290, 'Lễ tân'], [470, 'AdminWalkInController'], [320, 'MySQL']]);
    d.node('s', { shape: 'start', x: 145, y: 92 });
    d.edge({ from: 's', to: 'k1' });
    d.node('k1', { shape: 'round', x: 145, y: 165, w: 250, h: 56, t: 'Tìm phòng trống', s: 'chọn ngày nhận / trả phòng' });
    d.edge({ from: 'k1', to: 'c1', pts: [[270, 165], [525, 165], [525, 198]] });
    d.node('c1', { shape: 'round', x: 525, y: 255, w: 360, h: 56, t: 'Query phòng trống', s: 'không có đơn CONFIRMED/CHECKED_IN trùng ngày', cls: 'sys' });
    d.edge({ from: 'c1', to: 'db1', k: 'dash' });
    d.node('db1', { shape: 'cyl', x: 930, y: 255, w: 220, h: 60, t: 'SELECT available rooms' });
    d.edge({ from: 'c1', to: 'k2', pts: [[525, 283], [525, 330], [145, 330], [145, 342]] });
    d.node('k2', { shape: 'round', x: 145, y: 370, w: 250, h: 64, t: 'Chọn phòng + combo\nnhập thông tin khách', s: 'tên, SĐT, email, CCCD' });
    d.edge({ from: 'k2', to: 'c2', pts: [[270, 370], [525, 370], [525, 403]] });
    d.node('c2', { shape: 'round', x: 525, y: 460, w: 360, h: 56, t: 'createWalkInBooking()', cls: 'sys',
        info: { t: 'Walk-in: tạo thẳng CONFIRMED', d: 'Đơn walk-in bỏ qua PENDING và không yêu cầu cọc — lễ tân có mặt nên xác nhận trực tiếp.', r: HM + 'service/BookingService.java · createWalkInBooking()' } });
    d.edge({ from: 'c2', to: 'q1' });
    d.node('q1', { shape: 'diamond', x: 525, y: 568, w: 220, h: 88, t: 'Phòng còn\ntrống?' });
    d.edge({ from: 'q1', to: 'eq1', k: 'err', lb: 'vừa bị đặt', lp: [645, 559] });
    d.node('eq1', { shape: 'round', x: 850, y: 568, w: 220, h: 50, t: '409 Phòng vừa có khách', cls: 'err', small: true });
    d.edge({ from: 'q1', to: 'c3', lb: 'còn', lp: [535, 625, 'start'] });
    d.node('c3', { shape: 'round', x: 525, y: 678, w: 360, h: 60, t: 'INSERT booking CONFIRMED\n+ booking_guests (khai báo lưu trú)', cls: 'sys' });
    d.edge({ from: 'c3', to: 'db2', k: 'dash' });
    d.node('db2', { shape: 'cyl', x: 930, y: 678, w: 220, h: 60, t: 'INSERT bookings\nstatus = CONFIRMED' });
    d.edge({ from: 'c3', to: 'em' });
    d.node('em', { shape: 'round', x: 525, y: 790, w: 300, h: 52, t: 'Gửi email xác nhận (async)', s: 'EmailService.deliverAfterCommit()', cls: 'soft' });
    d.edge({ from: 'em', to: 'k3', pts: [[525, 816], [525, 850], [145, 850], [145, 860]] });
    d.node('k3', { shape: 'round', x: 145, y: 882, w: 250, h: 48, t: 'Hiển thị đơn đã xác nhận', cls: 'sys', small: true });
    d.edge({ from: 'k3', to: 'e', pts: [[145, 906]] });
    d.node('e', { shape: 'end', x: 145, y: 916 });
    return d.mount();
}

// Check-out & thanh toan phong (Activity)
function hmCheckout(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 1080, h: 920, seed: 54, number: true }, opts));
    lanes(d, [[290, 'Lễ tân'], [460, 'PaymentService'], [330, 'MySQL']]);
    d.node('s', { shape: 'start', x: 145, y: 92 });
    d.edge({ from: 's', to: 'k1' });
    d.node('k1', { shape: 'round', x: 145, y: 165, w: 250, h: 56, t: 'Mở đơn CHECKED_IN', s: 'xem amountDue = tổng − đã cọc' });
    d.edge({ from: 'k1', to: 'k2' });
    d.node('k2', { shape: 'round', x: 145, y: 265, w: 250, h: 56, t: '(Tuỳ chọn) Thêm phụ phí', s: 'BookingCharge: minibar, hư hại, trả muộn' });
    d.edge({ from: 'k2', to: 'c1', pts: [[270, 265], [520, 265], [520, 298]] });
    d.node('c1', { shape: 'round', x: 520, y: 355, w: 340, h: 56, t: 'Tính amountDue', s: 'grandTotal − depositPaidAmount', cls: 'sys',
        info: { t: 'amountDue', d: '<code>grandTotal</code> = giá phòng + combo + phụ phí. <code>amountDue = grandTotal − depositPaidAmount</code>. Có thể = 0 nếu cọc đủ.', r: HM + 'service/PaymentService.java' } });
    d.edge({ from: 'c1', to: 'gwp' });
    d.node('gwp', { shape: 'diamond', x: 520, y: 462, w: 230, h: 90, t: 'Phương thức\nthanh toán?' });
    d.edge({ from: 'gwp', to: 'ca', lb: 'tiền mặt', lp: [400, 453] });
    d.node('ca', { shape: 'round', x: 145, y: 462, w: 230, h: 56, t: 'Thu tiền · xác nhận\namountDue đã thu' });
    d.edge({ from: 'ca', to: 'cp', pts: [[145, 490], [145, 558], [390, 558]] });
    d.edge({ from: 'gwp', to: 'bt', lb: 'chuyển khoản', lp: [641, 453] });
    d.node('bt', { shape: 'round', x: 820, y: 462, w: 210, h: 56, t: 'Chờ tiền vào tài khoản', s: 'lễ tân bấm "Đã nhận"', cls: 'warm' });
    d.edge({ from: 'bt', to: 'cp', pts: [[820, 490], [820, 558], [650, 558]] });
    d.node('cp', { shape: 'round', x: 520, y: 590, w: 340, h: 56, t: 'recordPayment() · PaymentStatus = PAID', cls: 'sys' });
    d.edge({ from: 'cp', to: 'db1', k: 'dash' });
    d.node('db1', { shape: 'cyl', x: 920, y: 590, w: 200, h: 60, t: 'UPDATE payments\nstatus = PAID' });
    d.edge({ from: 'cp', to: 'co' });
    d.node('co', { shape: 'round', x: 520, y: 695, w: 340, h: 56, t: 'checkOut() · BookingStatus = CHECKED_OUT', cls: 'sys' });
    d.edge({ from: 'co', to: 'db2', k: 'dash' });
    d.node('db2', { shape: 'cyl', x: 920, y: 695, w: 200, h: 60, t: 'UPDATE bookings\nstatus = CHECKED_OUT' });
    d.edge({ from: 'co', to: 'em' });
    d.node('em', { shape: 'round', x: 520, y: 800, w: 300, h: 52, t: 'Gửi hóa đơn email (async)', s: 'EmailService.deliverAfterCommit()', cls: 'soft' });
    d.edge({ from: 'em', to: 'k3', pts: [[520, 826], [520, 862], [145, 862], [145, 870]] });
    d.node('k3', { shape: 'round', x: 145, y: 890, w: 250, h: 44, t: 'Hiển thị hóa đơn đã thanh toán', cls: 'sys', small: true });
    d.edge({ from: 'k3', to: 'e', pts: [[145, 912]] });
    d.node('e', { shape: 'end', x: 145, y: 920 });
    return d.mount();
}

// Quen mat khau / Dat lai mat khau (Homestay May) (Activity)
function hmForgotPassword(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 1000, h: 900, seed: 55, number: true }, opts));
    d.node('s', { shape: 'start', x: 420, y: 60 });
    d.edge({ from: 's', to: 'a1' });
    d.node('a1', { shape: 'round', x: 420, y: 130, w: 340, h: 56, t: 'POST /forgot-password', s: 'nhập địa chỉ email' });
    d.edge({ from: 'a1', to: 'q1' });
    d.node('q1', { shape: 'diamond', x: 420, y: 240, w: 230, h: 88, t: 'Email tồn tại\ntrong hệ thống?' });
    d.edge({ from: 'q1', to: 'ok1', lb: 'không', lp: [545, 231], k: 'err' });
    d.node('ok1', { shape: 'round', x: 790, y: 240, w: 280, h: 50, t: 'Vẫn trả 200 (không lộ email)', cls: 'soft', small: true,
        info: { t: 'Không lộ thông tin có tài khoản không', d: 'Dù email không tồn tại, hệ thống trả HTTP 200 để tránh enumeration attack.' } });
    d.edge({ from: 'q1', to: 'a2', lb: 'có', lp: [430, 296, 'start'] });
    d.node('a2', { shape: 'round', x: 420, y: 365, w: 380, h: 60, t: 'createPasswordResetToken()', s: 'SecureRandom 32 byte → URLEncoder · hạn 30 phút', cls: 'sys',
        info: { c: `String token = URLEncoder.encode(
    Base64.getUrlEncoder().encodeToString(bytes), UTF_8);
user.setPasswordResetToken(token);
user.setPasswordResetExpiry(now().plusMinutes(30));`, r: HM + 'controller/AuthController.java' } });
    d.edge({ from: 'a2', to: 'a3' });
    d.node('a3', { shape: 'round', x: 420, y: 475, w: 340, h: 56, t: 'sendPasswordReset() — gửi đồng bộ', s: 'link chứa token · hạn 30 phút', cls: 'soft' });
    d.edge({ from: 'a3', to: 'k1', pts: [[420, 503], [420, 545], [200, 545], [200, 555]] });
    d.node('k1', { shape: 'round', x: 200, y: 575, w: 280, h: 50, t: '"Nếu email tồn tại,\nbạn sẽ nhận được thư."', cls: 'sys', small: true });
    d.edge({ from: 'a3', to: 'a4', pts: [[420, 503], [420, 615]] });
    d.node('a4', { shape: 'round', x: 420, y: 645, w: 340, h: 56, t: 'Người dùng nhấn link\nGET /reset-password?token=…' });
    d.edge({ from: 'a4', to: 'q2' });
    d.node('q2', { shape: 'diamond', x: 420, y: 754, w: 230, h: 88, t: 'Token hợp lệ\nvà chưa hết hạn?' });
    d.edge({ from: 'q2', to: 'exp', lb: 'hết hạn / sai', lp: [545, 745], k: 'err' });
    d.node('exp', { shape: 'round', x: 790, y: 754, w: 250, h: 50, t: 'Trang "Link đã hết hạn"', cls: 'err', small: true });
    d.edge({ from: 'q2', to: 'a5', lb: 'hợp lệ', lp: [430, 810, 'start'] });
    d.node('a5', { shape: 'round', x: 420, y: 840, w: 360, h: 52, t: 'resetPassword() · token = null · redirect /login', cls: 'sys', small: true });
    d.edge({ from: 'a5', to: 'e', pts: [[420, 866]] });
    d.node('e', { shape: 'end', x: 420, y: 878 });
    return d.mount();
}

// Vong doi PaymentStatus (Homestay May) (State)
function hmPaymentState(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 1020, h: 380, seed: 56 }, opts));
    const st = (id, x, y, t, s, cls, info) => d.node(id, { shape: 'pill', x, y, w: 200, h: 62, t, s, cls, info });
    d.node('s', { shape: 'start', x: 70, y: 80 });
    d.edge({ from: 's', to: 'U', lb: 'tạo đơn', lp: [85, 150, 'start'] });
    st('U', 70, 200, 'CHƯA THANH TOÁN', 'UNPAID', 'warm',
        { t: 'UNPAID', d: 'Trạng thái ban đầu khi đơn được tạo. Đơn chưa thu đủ tiền, kể cả đã đặt cọc.' });
    d.edge({ from: 'U', to: 'P', lb: 'check-out · thu đủ tiền', lp: [276, 191] });
    st('P', 370, 200, 'ĐÃ THANH TOÁN', 'PAID', 'sys',
        { t: 'PAID', d: 'Toàn bộ amountDue đã thu. Kích hoạt gửi hóa đơn email sau commit.' });
    d.edge({ from: 'P', to: 'R', lb: 'đơn bị hủy sau khi đã thanh toán', lp: [576, 191] });
    st('R', 670, 200, 'ĐÃ HOÀN TIỀN', 'REFUNDED', 'gone',
        { t: 'REFUNDED', d: 'Admin xử lý hoàn tiền thủ công khi đơn hủy sau khi đã thanh toán hoặc đặt cọc.' });
    d.edge({ from: 'R', to: 'e', pts: [[670, 231], [670, 308], [900, 308]] });
    d.node('e', { shape: 'end', x: 910, y: 322 });
    d.edge({ from: 'U', to: 'e', pts: [[70, 231], [70, 318], [900, 318]], lb: 'đơn hủy trước khi thanh toán', lp: [400, 327] });
    d.node('n', { shape: 'note', x: 520, y: 80, w: 300, h: 64, t: 'PaymentStatus là cột riêng;\nkhông tự thay đổi khi BookingStatus\nthay đổi — phải cập nhật riêng.', small: true });
    return d.mount();
}

// Gui email bat dong bo sau commit (Homestay May) (Sequence)
function hmAsyncEmail(svg, opts) {
    const H = 680;
    const d = Sketch(svg, Object.assign({ w: 1060, h: H, seed: 57 }, opts));
    const { msg } = seqKit(d, [
        { id: 'caller', x:  90, w: 160, t: 'Service\n(caller)' },
        { id: 'email',  x: 350, w: 230, t: 'EmailService',        cls: 'sys' },
        { id: 'sync',   x: 660, w: 250, t: 'TransactionSync\n(afterCommit)', cls: 'warm' },
        { id: 'exec',   x: 960, w: 150, t: 'MailExecutor\n(thread pool)',    cls: 'soft' },
    ], H);
    let y = 112; const n = (dy = 36) => (y += dy);
    msg('caller', 'email', y, 'deliverAfterCommit(mail)');
    n(10);
    d.node('gw', { shape: 'note', x: 180, y: n(28), w: 360, h: 44, t: 'Có đang trong giao dịch (transaction) không?', small: true });
    n(10);
    d.edge({ k: 'dash', pts: [[240, n(28)], [660, y]], lb: 'có → registerSynchronization', lp: [450, y - 10] });
    msg('sync', 'exec', n(48), 'submit(sendTask) — sau COMMIT', 'async');
    n(10);
    d.node('gw2', { shape: 'note', x: 180, y: n(28), w: 360, h: 44, t: 'Không trong giao dịch:', small: true,
        info: { t: 'Gửi ngay nếu không có transaction', d: 'Kiểm tra <code>TransactionSynchronizationManager.isActualTransactionActive()</code>; false → gửi vào executor ngay.' } });
    d.edge({ k: 'dash', pts: [[240, n(30)], [960, y]], lb: 'không → submit ngay', lp: [600, y - 10] });
    n(20);
    d.node('em', { shape: 'note', x: 660, y: n(28), w: 370, h: 50, t: 'JavaMailSender.send() trong luồng riêng\n— không chặn luồng HTTP chính', small: true });
    msg('exec', 'caller', n(52), 'email đã gửi (hoặc lỗi → ghi log)', 'async');
    d.node('note', { shape: 'note', x: 80, y: n(30), w: 740, h: 44, t: 'Tách luồng gửi email đảm bảo transaction commit xong mới gửi — không gửi email khi đơn chưa được lưu.', small: true });
    return d.mount();
}

// Xac nhan don + nhan coc (Homestay May) (Sequence)
function hmConfirmDeposit(svg, opts) {
    const H = 700;
    const d = Sketch(svg, Object.assign({ w: 1060, h: H, seed: 58 }, opts));
    const { msg } = seqKit(d, [
        { id: 'lt',   x:  90, w: 140, t: 'Lễ tân',                cls: 'warm' },
        { id: 'ctrl', x: 330, w: 250, t: 'AdminBookingController', cls: 'sys' },
        { id: 'svc',  x: 640, w: 230, t: 'BookingService',         cls: 'sys' },
        { id: 'db',   x: 950, w: 140, t: 'MySQL',                  cls: 'soft' },
    ], H);
    let y = 112; const n = (dy = 36) => (y += dy);
    msg('lt', 'ctrl', y, 'PUT /admin/bookings/{id}/confirm');
    msg('ctrl', 'svc', n(), 'confirmBooking(bookingId)');
    msg('svc', 'db', n(), 'SELECT room WHERE id=? FOR UPDATE');
    msg('db', 'svc', n(), 'room (locked)', 'ret');
    msg('svc', 'db', n(), 'SELECT bookings WHERE room overlaps · FOR UPDATE');
    msg('db', 'svc', n(), 'bookings đang CONFIRMED / CHECKED_IN', 'ret');
    n(10);
    d.node('ck', { shape: 'note', x: 370, y: n(28), w: 420, h: 46, t: 'ensureNoConfirmedConflict(): nếu có đơn khác\ntrùng ngày → rollback + ném ConflictException', small: true,
        info: { t: 'Chống xác nhận phòng đã có khách', d: 'Khóa dòng phòng trước khi kiểm tra chồng lịch, đảm bảo hai giao dịch đồng thời không thể cùng xác nhận một phòng cùng ngày.' } });
    d.edge({ k: 'err', pts: [[370, n(42)], [90, y]], lb: 'trùng lịch → 409', lp: [230, y - 9] });
    d.node('er', { shape: 'round', x: 90, y, w: 160, h: 50, t: '409 Trùng lịch', cls: 'err', small: true });
    n(14);
    msg('svc', 'db', n(40), 'UPDATE bookings SET status=CONFIRMED,\ndepositReceived=true');
    msg('db', 'svc', n(), 'OK', 'ret');
    msg('svc', 'ctrl', n(), 'booking (CONFIRMED)', 'ret');
    msg('ctrl', 'lt', n(), '200 · đơn đã xác nhận', 'ret');
    return d.mount();
}

// Dang ky tai khoan moi (Sweet Cake) (Activity)
function scDangKy(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 1000, h: 760, seed: 61, number: true }, opts));
    const A = SC + 'app/Http/Controllers/Auth/RegisteredUserController.php';
    d.node('s', { shape: 'start', x: 400, y: 60 });
    d.edge({ from: 's', to: 'a1' });
    d.node('a1', { shape: 'round', x: 400, y: 130, w: 360, h: 56, t: 'POST /register', s: 'name, email, password, password_confirmation' });
    d.edge({ from: 'a1', to: 'q1' });
    d.node('q1', { shape: 'diamond', x: 400, y: 240, w: 250, h: 90, t: 'Email chưa\ntồn tại?' });
    d.edge({ from: 'q1', to: 'eq1', k: 'err', lb: 'đã tồn tại', lp: [530, 231] });
    d.node('eq1', { shape: 'round', x: 800, y: 240, w: 280, h: 50, t: '"Email đã được sử dụng."', cls: 'err', small: true });
    d.edge({ from: 'q1', to: 'a2', lb: 'chưa', lp: [415, 300] });
    d.node('a2', { shape: 'round', x: 400, y: 370, w: 380, h: 60, t: 'Tự sinh username từ email', s: 'strtolower(prefix@) + counter cho đến khi unique',
        info: { t: 'Auto-generate username', d: 'Dùng phần trước dấu @ làm username gốc. Nếu đã tồn tại, thêm số đuôi (user1, user2 …) cho đến khi tìm được username chưa dùng.', r: A } });
    d.edge({ from: 'a2', to: 'a3' });
    d.node('a3', { shape: 'round', x: 400, y: 480, w: 360, h: 56, t: 'User::create()', s: "role='customer' · status='active' · Hash::make(password)", cls: 'sys',
        info: { c: `User::create([
    'name' => $request->name, 'email' => $request->email,
    'username' => $username,  'role' => 'customer',
    'status' => 'active', 'password' => Hash::make($request->password),
]);`, r: A } });
    d.edge({ from: 'a3', to: 'a4' });
    d.node('a4', { shape: 'round', x: 400, y: 580, w: 360, h: 56, t: 'event(Registered) · Auth::login()', s: 'session regenerate · không cần xác minh email', cls: 'sys' });
    d.edge({ from: 'a4', to: 'a5' });
    d.node('a5', { shape: 'round', x: 400, y: 678, w: 300, h: 52, t: 'Inertia::redirect /dashboard', cls: 'sys', small: true });
    d.edge({ from: 'a5', to: 'e' });
    d.node('e', { shape: 'end', x: 400, y: 716 });
    d.node('n', { shape: 'note', x: 790, y: 480, w: 270, h: 64, t: 'Không yêu cầu xác minh email\n— đăng nhập ngay sau khi đăng ký,\nkhác với nhiều ứng dụng thương mại.', small: true });
    return d.mount();
}

// Dat lai mat khau Sweet Cake (Sequence)
function scForgotPassword(svg, opts) {
    const H = 700;
    const d = Sketch(svg, Object.assign({ w: 1060, h: H, seed: 62 }, opts));
    const { msg } = seqKit(d, [
        { id: 'br',   x:  90, w: 160, t: 'Trình duyệt\n(React)' },
        { id: 'ctrl', x: 360, w: 290, t: 'PasswordReset\nController',  cls: 'sys' },
        { id: 'db',   x: 730, w: 170, t: 'password_reset\n_tokens', cls: 'soft' },
        { id: 'mail', x: 980, w: 130, t: 'SMTP', cls: 'warm' },
    ], H);
    let y = 112; const n = (dy = 36) => (y += dy);
    msg('br', 'ctrl', y, 'POST /forgot-password { email }');
    msg('ctrl', 'db', n(), 'DELETE token cũ · INSERT token mới (hashed)');
    msg('db', 'ctrl', n(), 'OK', 'ret');
    msg('ctrl', 'mail', n(), 'Mail::to($email)->send(ResetPasswordNotification)');
    msg('mail', 'ctrl', n(), '(email đã xếp hàng)', 'ret');
    msg('ctrl', 'br', n(), '200 "Liên kết đặt lại đã được gửi!"', 'ret');
    n(20);
    msg('br', 'ctrl', n(36), 'POST /reset-password { token, email, password }');
    msg('ctrl', 'db', n(), 'SELECT token WHERE email = ?');
    msg('db', 'ctrl', n(), 'hashed token', 'ret');
    n(10);
    d.node('ck', { shape: 'note', x: 200, y: n(28), w: 440, h: 46, t: 'Password::reset(): so hash_hmac token · kiểm tra hết hạn 60 phút', small: true });
    d.edge({ k: 'err', pts: [[200, n(42)], [90, y]], lb: 'sai / hết hạn', lp: [140, y - 9] });
    d.node('er', { shape: 'round', x: 90, y, w: 160, h: 50, t: '"Link hết hạn"', cls: 'err', small: true });
    n(14);
    msg('ctrl', 'db', n(38), 'UPDATE users SET password=Hash · DELETE token');
    msg('db', 'ctrl', n(), 'OK', 'ret');
    msg('ctrl', 'br', n(), 'redirect /login\n"Mật khẩu đã được đặt lại thành công."', 'ret');
    return d.mount();
}

// Quan ly dia chi giao hang Sweet Cake (Activity)
function scShippingAddr(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 1060, h: 680, seed: 63, number: true }, opts));
    const C = SC + 'app/Http/Controllers/ShippingAddressController.php';
    d.node('s', { shape: 'start', x: 400, y: 60 });
    d.edge({ from: 's', to: 'gw0' });
    d.node('gw0', { shape: 'diamond', x: 400, y: 135, w: 210, h: 84, t: 'Thao tác?' });
    d.edge({ from: 'gw0', to: 'ac', lb: 'thêm mới', lp: [298, 126] });
    d.node('ac', { shape: 'round', x: 145, y: 135, w: 230, h: 56, t: 'POST /shipping-addresses', s: 'validate name, phone, address, city' });
    d.edge({ from: 'ac', to: 'qd' });
    d.node('qd', { shape: 'diamond', x: 145, y: 248, w: 220, h: 84, t: 'is_default\n= true?' });
    d.edge({ from: 'qd', to: 'cd', lb: 'có', lp: [156, 310, 'start'] });
    d.node('cd', { shape: 'round', x: 145, y: 370, w: 290, h: 58, t: 'UPDATE SET is_default=false\ncho tất cả địa chỉ của user', cls: 'sys' });
    d.edge({ from: 'cd', to: 'cs' });
    d.edge({ from: 'qd', to: 'cs', lb: 'không', lp: [255, 239] });
    d.node('cs', { shape: 'round', x: 145, y: 480, w: 250, h: 56, t: 'ShippingAddress::create()', cls: 'sys' });
    d.edge({ from: 'cs', to: 'e', pts: [[145, 508], [145, 610], [390, 610]] });
    d.edge({ from: 'gw0', to: 'del', lb: 'xóa', lp: [505, 126] });
    d.node('del', { shape: 'round', x: 660, y: 135, w: 240, h: 56, t: 'DELETE /shipping-addresses/{id}' });
    d.edge({ from: 'del', to: 'qdef' });
    d.node('qdef', { shape: 'diamond', x: 660, y: 248, w: 240, h: 90, t: 'Là địa chỉ\nmặc định?' });
    d.edge({ from: 'qdef', to: 'edef', lb: 'có', k: 'err', lp: [800, 239] });
    d.node('edef', { shape: 'round', x: 950, y: 248, w: 260, h: 50, t: '"Đặt mặc định khác\ntrước khi xóa."', cls: 'err', small: true });
    d.edge({ from: 'qdef', to: 'ds', lb: 'không', lp: [670, 306, 'start'] });
    d.node('ds', { shape: 'round', x: 660, y: 380, w: 240, h: 56, t: 'ShippingAddress::delete()', cls: 'sys' });
    d.edge({ from: 'ds', to: 'e', pts: [[660, 408], [660, 610], [420, 610]] });
    d.edge({ from: 'gw0', to: 'upd', lb: 'cập nhật', lp: [410, 177, 'start'] });
    d.node('upd', { shape: 'round', x: 400, y: 290, w: 300, h: 56, t: 'PUT /shipping-addresses/{id}', s: 'cập nhật name, phone, address, city' });
    d.edge({ from: 'upd', to: 'qu' });
    d.node('qu', { shape: 'diamond', x: 400, y: 400, w: 240, h: 88, t: 'Đặt làm\nmặc định?' });
    d.edge({ from: 'qu', to: 'cu', lb: 'có', lp: [410, 456, 'start'] });
    d.node('cu', { shape: 'round', x: 400, y: 520, w: 350, h: 60, t: '1. save() địa chỉ này TRƯỚC\n2. reset is_default các địa chỉ khác', cls: 'sys',
        info: { t: 'Thứ tự quan trọng!', d: 'Phải UPDATE địa chỉ này trước, rồi mới reset các địa chỉ khác. Ngược lại Eloquent không nhận thấy <code>is_default</code> thay đổi và bỏ qua save.', r: C } });
    d.edge({ from: 'cu', to: 'e' });
    d.edge({ from: 'qu', to: 'e', lb: 'không', lp: [400, 392] });
    d.node('e', { shape: 'end', x: 400, y: 620 });
    return d.mount();
}

// Wishlist toggle (Sweet Cake) (Activity)
function scWishlist(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 900, h: 620, seed: 64, number: true }, opts));
    d.node('s', { shape: 'start', x: 380, y: 60 });
    d.edge({ from: 's', to: 'a1' });
    d.node('a1', { shape: 'round', x: 380, y: 130, w: 340, h: 56, t: 'POST /wishlist/toggle', s: 'đăng nhập bắt buộc · { product_id }' });
    d.edge({ from: 'a1', to: 'q1' });
    d.node('q1', { shape: 'diamond', x: 380, y: 245, w: 230, h: 88, t: 'Sản phẩm\nđang bán?' });
    d.edge({ from: 'q1', to: 'eq1', k: 'err', lb: 'không', lp: [510, 236] });
    d.node('eq1', { shape: 'round', x: 760, y: 245, w: 260, h: 50, t: '404 Sản phẩm không tìm thấy', cls: 'err', small: true });
    d.edge({ from: 'q1', to: 'q2', lb: 'có', lp: [390, 301, 'start'] });
    d.node('q2', { shape: 'diamond', x: 380, y: 375, w: 230, h: 88, t: 'Đã có trong\ndanh sách?' });
    d.edge({ from: 'q2', to: 'rm', lb: 'có', lp: [263, 366] });
    d.node('rm', { shape: 'round', x: 130, y: 375, w: 230, h: 56, t: 'Wishlist::delete()', s: 'xóa bản ghi', cls: 'err' });
    d.edge({ from: 'q2', to: 'add', lb: 'chưa', lp: [390, 431, 'start'] });
    d.node('add', { shape: 'round', x: 380, y: 504, w: 230, h: 56, t: 'Wishlist::create()', s: 'thêm bản ghi', cls: 'sys' });
    d.edge({ from: 'rm', to: 'res', pts: [[130, 403], [130, 572], [370, 572]] });
    d.edge({ from: 'add', to: 'res' });
    d.node('res', { shape: 'round', x: 380, y: 580, w: 310, h: 52, t: 'JSON { is_in_wishlist: bool }', cls: 'sys', small: true });
    d.edge({ from: 'res', to: 'e', pts: [[380, 606]] });
    d.node('e', { shape: 'end', x: 380, y: 618 });
    return d.mount();
}

// Vong doi PaymentStatus don hang (Sweet Cake) (State)
function scPaymentState(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 1020, h: 360, seed: 65 }, opts));
    const st = (id, x, y, t, s, cls, info) => d.node(id, { shape: 'pill', x, y, w: 200, h: 62, t, s, cls, info });
    d.node('s', { shape: 'start', x: 70, y: 80 });
    d.edge({ from: 's', to: 'U', lb: 'placeFromCart()', lp: [85, 150, 'start'] });
    st('U', 70, 200, 'CHƯA THANH TOÁN', 'unpaid', 'warm',
        { t: 'unpaid', d: 'Trạng thái ban đầu của mọi đơn, kể cả MoMo (trước khi IPN xác nhận).' });
    d.edge({ from: 'U', to: 'P', lb: 'admin xác nhận COD\n/ MoMo IPN hợp lệ', lp: [276, 191] });
    st('P', 370, 200, 'ĐÃ THANH TOÁN', 'paid', 'sys',
        { t: 'paid', d: 'Admin bấm "Đã thu tiền" (COD) hoặc IPN MoMo xác thực HMAC-SHA256 thành công. Mỗi lần đổi đều ghi admin_logs.' });
    d.edge({ from: 'P', to: 'R', lb: 'admin hoàn tiền', lp: [576, 191] });
    st('R', 670, 200, 'ĐÃ HOÀN TIỀN', 'refunded', 'gone',
        { t: 'refunded', d: 'Admin cập nhật thủ công khi hủy đơn đã thanh toán. Ghi admin_logs.' });
    d.edge({ from: 'R', to: 'e', pts: [[670, 231], [670, 305], [900, 305]] });
    d.node('e', { shape: 'end', x: 910, y: 320 });
    d.node('n', { shape: 'note', x: 530, y: 80, w: 340, h: 64, t: 'PaymentStatus độc lập với OrderStatus;\nCOD hoàn tất chưa phải "đã thu tiền" —\nadmin phải xác nhận riêng cho doanh thu đúng.', small: true });
    return d.mount();
}

// Admin cap nhat don hang + ghi admin_logs (Sweet Cake) (Sequence)
function scAdminUpdateOrder(svg, opts) {
    const H = 700;
    const d = Sketch(svg, Object.assign({ w: 1060, h: H, seed: 66 }, opts));
    const C = SC + 'app/Http/Controllers/Admin/OrderController.php';
    const { msg } = seqKit(d, [
        { id: 'adm',  x:  90, w: 150, t: 'Admin\n(trình duyệt)' },
        { id: 'ctrl', x: 360, w: 270, t: 'Admin/OrderController', cls: 'sys' },
        { id: 'db',   x: 720, w: 160, t: 'orders\n(MySQL)',       cls: 'soft' },
        { id: 'log',  x: 980, w: 140, t: 'admin_logs\n(MySQL)',   cls: 'warm' },
    ], H);
    let y = 112; const n = (dy = 36) => (y += dy);
    msg('adm', 'ctrl', y, "PATCH /admin/orders/{id}/status");
    n(10);
    d.node('vl', { shape: 'note', x: 190, y: n(28), w: 410, h: 46, t: "validate: order_status ∈ ORDER_STATUSES whitelist\n['pending','confirmed','processing','shipping','completed','cancelled']", small: true,
        info: { c: `$validated = $request->validate([
    'order_status' => ['required', Rule::in(Order::ORDER_STATUSES)],
]);`, r: C + ':86' } });
    msg('ctrl', 'db', n(44), 'UPDATE orders SET order_status=?');
    msg('db', 'ctrl', n(), 'OK', 'ret');
    msg('ctrl', 'log', n(), "AdminLog::create(action='update_status',\nold_value, new_value, ip, user_agent)");
    msg('log', 'ctrl', n(), 'OK', 'ret');
    msg('ctrl', 'adm', n(), '200 "Trạng thái đơn đã cập nhật"', 'ret');
    n(24);
    msg('adm', 'ctrl', n(30), "PATCH /admin/orders/{id}/payment-status");
    msg('ctrl', 'db', n(), 'UPDATE orders SET payment_status=?');
    msg('ctrl', 'log', n(), "AdminLog::create(action='update_payment_status', …)");
    msg('ctrl', 'adm', n(), '200 · hai hành động → hai dòng trong admin_logs', 'ret');
    d.node('note', { shape: 'note', x: 80, y: n(28), w: 760, h: 44, t: 'OrderStatus và PaymentStatus là hai endpoint riêng — mỗi thay đổi đều ghi admin_logs với IP và user_agent.', small: true });
    return d.mount();
}

// Tinh gia phong tung dem (Homestay May) (Activity)
function hmTinhGia(svg, opts) {
    const d = Sketch(svg, Object.assign({ w: 1000, h: 820, seed: 67, number: true }, opts));
    const S = HM + 'service/PricingService.java';
    d.node('s', { shape: 'start', x: 400, y: 60 });
    d.edge({ from: 's', to: 'a1' });
    d.node('a1', { shape: 'round', x: 400, y: 130, w: 360, h: 56, t: 'roomAmount(room, checkIn, checkOut)', s: 'total = BigDecimal.ZERO · d = checkIn', info: { r: S } });
    d.edge({ from: 'a1', to: 'ql' });
    d.node('ql', { shape: 'diamond', x: 400, y: 245, w: 230, h: 88, t: 'd < checkOut?' });
    d.edge({ from: 'ql', to: 'a2', lb: 'không', lp: [546, 236] });
    d.node('a2', { shape: 'round', x: 760, y: 245, w: 360, h: 60, t: 'depositAmount = min(\ntotal × depositPercent, depositMax)', cls: 'sys',
        info: { t: 'Tính tiền cọc', d: 'Cọc = total × phần trăm cọc (cấu hình trong DB), không vượt depositMax. Admin thay đổi qua trang cấu hình.', r: S } });
    d.edge({ from: 'a2', to: 'a3' });
    d.node('a3', { shape: 'round', x: 760, y: 358, w: 360, h: 60, t: 'depositDeadline = min(\nnow + depositHours, checkIn − 6h)', cls: 'sys',
        info: { t: 'Hạn chuyển cọc', d: 'Hạn cọc tính từ lúc đặt theo số giờ admin cấu hình, nhưng không muộn hơn 6 giờ trước giờ nhận phòng — để lễ tân còn kịp xác nhận.' } });
    d.edge({ from: 'a3', to: 'a4' });
    d.node('a4', { shape: 'round', x: 760, y: 465, w: 360, h: 52, t: 'return { total, depositAmount, depositDeadline }', cls: 'sys', small: true });
    d.edge({ from: 'a4', to: 'e', pts: [[760, 491], [760, 540]] });
    d.node('e', { shape: 'end', x: 760, y: 554 });
    d.edge({ from: 'ql', to: 'qsr', lb: 'có', lp: [410, 301, 'start'] });
    d.node('qsr', { shape: 'diamond', x: 400, y: 375, w: 280, h: 90, t: 'Có special_rate\ncho ngày d?',
        info: { t: 'Ngày đặc biệt', d: 'Quản trị viên cài giá theo từng ngày cụ thể (ngày lễ, sự kiện). Bất kỳ đêm nào trùng special_rate đều dùng giá đó thay vì giá thường.' } });
    d.edge({ from: 'qsr', to: 'sp', lb: 'có', lp: [410, 433, 'start'] });
    d.node('sp', { shape: 'round', x: 400, y: 510, w: 300, h: 52, t: 'nightPrice = special_rate.price', s: 'ưu tiên cao nhất — ghi đè cuối tuần', cls: 'warm' });
    d.edge({ from: 'qsr', to: 'qwk', lb: 'không', lp: [540, 366] });
    d.node('qwk', { shape: 'diamond', x: 720, y: 375, w: 230, h: 88, t: 'Cuối tuần\n(Sat / Sun)?' });
    d.edge({ from: 'qwk', to: 'wk', lb: 'có', lp: [730, 431, 'start'] });
    d.node('wk', { shape: 'round', x: 720, y: 505, w: 230, h: 50, t: 'nightPrice = weekendPrice', cls: 'soft', small: true });
    d.edge({ from: 'qwk', to: 'wd', lb: 'không', lp: [845, 366] });
    d.node('wd', { shape: 'round', x: 900, y: 375, w: 190, h: 50, t: 'nightPrice =\nweekdayPrice', cls: 'soft', small: true });
    d.edge({ from: 'sp', to: 'acc' });
    d.edge({ from: 'wk', to: 'acc', pts: [[720, 530], [720, 590], [540, 590]] });
    d.edge({ from: 'wd', to: 'acc', pts: [[900, 400], [900, 590], [540, 590]] });
    d.node('acc', { shape: 'round', x: 400, y: 620, w: 340, h: 56, t: 'total += nightPrice\nd = d.plusDays(1)', cls: 'sys' });
    d.edge({ pts: [[400, 648], [160, 648], [160, 245], [285, 245]], lb: '↑ đêm tiếp theo', lp: [165, 440, 'start'] });
    d.node('n', { shape: 'note', x: 635, y: 618, w: 310, h: 72, t: 'Cùng một đêm có thể trùng cả\nspecial_rate lẫn cuối tuần;\nspecial_rate luôn thắng.', small: true });
    return d.mount();
}

window.FLOWS = { hmDiscount, hmModify, hmScheduler, hmLogin, scAddCart, scCartSync, scOrder, scMomo, scPromotion, scCancel, scOrderState, scAdminLogin, scMessage, hmChatbot, scDanhGia, hmDepositState, scReviewState, hmCheckinSeq, scOrderSeq, hmWalkIn, hmCheckout, hmForgotPassword, hmPaymentState, hmAsyncEmail, hmConfirmDeposit, scDangKy, scForgotPassword, scShippingAddr, scWishlist, scPaymentState, scAdminUpdateOrder, hmTinhGia };
})();
