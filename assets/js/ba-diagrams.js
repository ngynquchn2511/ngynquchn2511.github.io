/* So do cho trang Tai lieu phan tich (Homestay May): Use Case va BPMN */
(function () {
'use strict';
const $ = id => document.getElementById(id);
const P = { panel: $('dock-body'), onSelect: () => $('dock').classList.add('open') };

function useCase(svg = $('ba-uc'), opts = P) {
    if (!svg) return;
    const d = Sketch(svg, Object.assign({ w: 1120, h: 800, seed: 51 }, opts));
    d.node('sys', { shape: 'box', x: 560, y: 405, w: 640, h: 740, t: 'Hệ thống đặt phòng Homestay Mây' });
    const actor = (id, x, y, t, info) => d.node(id, { shape: 'actor', x, y, t, info });
    actor('kvl', 100, 190, 'Khách vãng lai', { t: 'Khách vãng lai', d: 'Người dùng chưa có tài khoản. Vẫn tìm phòng và đặt phòng được; hệ thống tự tạo tài khoản theo email.' });
    actor('kh', 100, 540, 'Khách hàng', { t: 'Khách hàng', d: 'Kế thừa toàn bộ chức năng của khách vãng lai, thêm các chức năng cần đăng nhập.' });
    actor('lt', 1020, 210, 'Lễ tân', { t: 'Lễ tân', d: 'Xử lý đơn và vận hành tại quầy.' });
    actor('qt', 1020, 540, 'Quản trị viên', { t: 'Quản trị viên', d: 'Kế thừa toàn bộ chức năng của lễ tân, thêm cấu hình giá, nhân viên và nhật ký.' });
    actor('bh', 1020, 715, 'Bộ hẹn giờ', { t: 'Bộ hẹn giờ', d: 'Tác nhân hệ thống, chạy định kỳ 5 phút một lần.' });
    // Duong noi actor - use case (ve truoc de nam duoi)
    const L = [['kvl', 400, [90, 160, 230, 300, 370, 440]], ['kh', 400, [540, 610, 680]]];
    const R = [['lt', 720, [90, 160, 230, 300, 370, 440]], ['qt', 720, [540, 610]], ['bh', 720, [700]]];
    L.forEach(([a, x, ys]) => ys.forEach(y => d.edge({ k: 'line', pts: [[124, a === 'kvl' ? 190 : 540], [x - 125, y]] })));
    R.forEach(([a, x, ys]) => ys.forEach(y => d.edge({ k: 'line', pts: [[996, a === 'lt' ? 210 : a === 'qt' ? 540 : 715], [x + 125, y]] })));
    const U = (id, x, y, t, info) => d.node(id, { shape: 'ellipse', x, y, w: 250, h: 50, t, small: true, info });
    U('u1', 400, 90, 'UC-01 Tìm phòng trống');
    U('u2', 400, 160, 'UC-02 Xem giá từng đêm');
    U('u3', 400, 230, 'UC-03 Đặt phòng trực tuyến', { t: 'UC-03 · Đặt phòng trực tuyến', d: 'Use case được đặc tả chi tiết ở bảng bên dưới sơ đồ.' });
    U('u4', 400, 300, 'UC-04 Kiểm tra mã giảm giá');
    U('u5', 400, 370, 'UC-05 Chuyển cọc qua VietQR');
    U('u6', 400, 440, 'UC-06 Hỏi chatbot tư vấn');
    U('u7', 400, 540, 'UC-07 Xem lịch sử đặt phòng');
    U('u8', 400, 610, 'UC-08 Đổi giờ, đổi combo, hủy đơn');
    U('u9', 400, 680, 'UC-09 Đánh giá sau kỳ nghỉ');
    U('u10', 720, 90, 'UC-10 Xác nhận đơn, nhận cọc');
    U('u11', 720, 160, 'UC-11 Khai báo lưu trú');
    U('u12', 720, 230, 'UC-12 Nhận phòng, trả phòng');
    U('u13', 720, 300, 'UC-13 Đặt phòng tại quầy');
    U('u14', 720, 370, 'UC-14 Xem lịch phòng');
    U('u15', 720, 440, 'UC-15 Xem doanh thu, công suất');
    U('u16', 720, 540, 'UC-16 Cấu hình giá và đặt cọc');
    U('u17', 720, 610, 'UC-17 Quản lý nhân viên, nhật ký');
    U('u18', 720, 700, 'UC-18 Tự hủy đơn quá hạn');
    d.edge({ k: 'inherit', pts: [d.A('kh', 't'), d.A('kvl', 'b')] });
    d.edge({ k: 'inherit', pts: [d.A('qt', 't'), d.A('lt', 'b')] });
    return d.mount();
}

function bpmn(svg = $('ba-bpmn'), opts = P) {
    if (!svg) return;
    const d = Sketch(svg, Object.assign({ w: 1150, h: 980, seed: 52 }, opts));
    d.lane(0, 330, 'Khách hàng');
    d.lane(330, 350, 'Lễ tân', { alt: true });
    d.lane(680, 470, 'Hệ thống', { last: true });
    const K = 165, LT = 505, HT = 915;
    const T = (id, x, y, t, info, cls) => d.node(id, { shape: 'round', x, y, w: 250, h: 56, t, info, cls, small: true });
    d.node('s', { shape: 'evStart', x: K, y: 95, t: 'Khách cần phòng' });
    d.edge({ from: 's', to: 't1' });
    T('t1', K, 185, 'Chọn phòng và\nngày lưu trú');
    d.edge({ from: 't1', to: 't2' });
    T('t2', K, 280, 'Nhập thông tin,\nbấm Xác nhận');
    d.edge({ from: 't2', to: 't3' });
    T('t3', HT, 280, 'Khóa phòng, kiểm tra\ntrùng lịch', { t: 'Kiểm tra trùng lịch', d: 'Phòng được giữ riêng cho yêu cầu đang xử lý, nên hai khách đặt cùng lúc không thể cùng thành công.' }, 'sys');
    d.edge({ from: 't3', to: 'g1' });
    d.node('g1', { shape: 'gw', x: HT, y: 380, t: 'Còn trống?' });
    d.edge({ from: 'g1', to: 'e1', lb: 'không', lp: [860, 371, 'end'] });
    d.node('e1', { shape: 'evEnd', x: K, y: 380, t: 'Báo phòng đã có khách\nvà thời điểm trống lại' });
    d.edge({ from: 'g1', to: 't4', lb: 'có', lp: [HT + 10, 425, 'start'] });
    T('t4', HT, 470, 'Tạo đơn Chờ xác nhận,\ntính tiền và tiền cọc', null, 'sys');
    d.edge({ from: 't4', to: 'g2' });
    d.node('g2', { shape: 'gw', x: HT, y: 565, t: 'Cần đặt cọc?' });
    d.edge({ from: 'g2', to: 't7', lb: 'không', lp: [860, 556, 'end'] });
    T('t7', LT, 565, 'Xác nhận đơn', { t: 'Xác nhận khi không yêu cầu cọc', d: 'Lễ tân xác nhận đơn; hệ thống từ chối nếu đã có đơn khác được xác nhận trùng ngày.' });
    d.edge({ from: 'g2', to: 't5', lb: 'có', lp: [HT + 10, 610, 'start'] });
    T('t5', HT, 655, 'Gửi mã VietQR và\nhạn chuyển cọc', { t: 'Hạn chuyển cọc', d: 'Hạn cọc tính từ lúc đặt theo số giờ quản trị cấu hình, nhưng không muộn hơn 6 giờ trước giờ nhận phòng.' }, 'sys');
    d.edge({ from: 't5', to: 't6' });
    T('t6', K, 655, 'Quét mã QR,\nchuyển tiền cọc');
    d.edge({ pts: [[K, 683], [K, 745], [380, 745]] });
    T('t8', LT, 745, 'Thấy tiền vào,\nbấm Đã nhận cọc');
    d.edge({ from: 't5', to: 'tm' });
    d.node('tm', { shape: 'evTimer', x: HT, y: 750, t: 'Quá hạn cọc\n(kiểm tra mỗi 5 phút)' });
    d.edge({ from: 'tm', to: 't9', pts: [[HT, 767], [HT, 822]] });
    T('t9', HT, 850, 'Tự hủy đơn,\nemail báo khách', null, 'err');
    d.edge({ from: 't9', to: 'e2', pts: [[HT, 878], [HT, 922]] });
    d.node('e2', { shape: 'evEnd', x: HT, y: 938, t: '' });
    d.edge({ pts: [[630, 565], [650, 565], [650, 850], [532, 850]] });
    d.edge({ from: 't8', to: 'g3', pts: [[LT, 773], [LT, 823]] });
    d.node('g3', { shape: 'gw', x: LT, y: 850, t: '' });
    d.edge({ from: 'g3', to: 'e3', pts: [[LT, 877], [LT, 922]] });
    d.node('e3', { shape: 'evEnd', x: LT, y: 938, t: '' });
    d.text(LT + 70, 945, 'Đơn đã xác nhận,\nemail cho khách', 'sk-evl', 'start');
    d.text(HT + 26, 945, 'Đơn bị hủy', 'sk-evl', 'start');
    return d.mount();
}

window.BAD = { useCase, bpmn };
useCase(); bpmn();
})();
