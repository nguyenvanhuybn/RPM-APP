/**
 * PLC SIMULATOR - 6 Bộ Giả Lập PLC Độc Lập
 * Mỗi PLC đại diện cho 1 bể mạ, gửi tín hiệu mỗi 1 giây
 */

const http = require('http');

const BACKEND_HOST = 'localhost';
const BACKEND_PORT = 5000;

// Cấu hình 6 PLC (tương ứng 6 bể)
const plcConfigs = [
  { id: 1, name: 'PLC-01', tank: 'Bể 1', ip: '192.168.1.101', port: 502, product: 'SP-01', target: 2500, actual: 2300 },
  { id: 2, name: 'PLC-02', tank: 'Bể 2', ip: '192.168.1.102', port: 502, product: 'SP-02', target: 1500, actual: 1000 },
  { id: 3, name: 'PLC-03', tank: 'Bể 3', ip: '192.168.1.103', port: 502, product: 'SP-10', target: 1800, actual: 1100 },
  { id: 4, name: 'PLC-04', tank: 'Bể 4', ip: '192.168.1.104', port: 502, product: 'SP-04', target: 2200, actual: 700  },
  { id: 5, name: 'PLC-05', tank: 'Bể 5', ip: '192.168.1.105', port: 502, product: 'SS-07', target: 2300, actual: 1800 },
  { id: 6, name: 'PLC-06', tank: 'Bể 6', ip: '192.168.1.106', port: 502, product: 'SP-05', target: 1200, actual: 800  },
];

// Thông số kỹ thuật của từng bể (mô phỏng thông tin từ DB sản phẩm)
const tankSettings = {
  1: { revA: 150, revV: 12, revT: 120, fwd1A: 220, fwd1V: 12, fwd1T: 45, fwd2A: 280, fwd2V: 12, fwd2T: 120, temp: 52 },
  2: { revA: 120, revV: 10, revT: 110, fwd1A: 200, fwd1V: 10, fwd1T: 45, fwd2A: 200, fwd2V: 12, fwd2T: 120, temp: 55 },
  3: { revA: 150, revV: 12, revT: 450, fwd1A: 220, fwd1V: 12, fwd1T: 60, fwd2A: 280, fwd2V: 12, fwd2T: 90,  temp: 48 },
  4: { revA: 180, revV: 14, revT: 200, fwd1A: 250, fwd1V: 13, fwd1T: 60, fwd2A: 300, fwd2V: 13, fwd2T: 150, temp: 50 },
  5: { revA: 130, revV: 11, revT: 130, fwd1A: 210, fwd1V: 11, fwd1T: 50, fwd2A: 260, fwd2V: 11, fwd2T: 110, temp: 53 },
  6: { revA: 100, revV: 9,  revT: 100, fwd1A: 180, fwd1V: 9,  fwd1T: 40, fwd2A: 220, fwd2V: 10, fwd2T: 100, temp: 46 },
};

// Random flutter ±delta từ giá trị cài đặt
function fluctuate(base, delta = 2) {
  return parseFloat((base + (Math.random() * delta * 2 - delta)).toFixed(2));
}

// Gửi dữ liệu của 1 PLC lên server
function sendPlcData(plc) {
  const s = tankSettings[plc.id];
  const payload = JSON.stringify({
    plcId: plc.id,
    tank: {
      id: plc.id,
      name: plc.tank,
      status: 'ON',
      product: plc.product,
      actual: {
        revA: fluctuate(s.revA, 3),
        revV: fluctuate(s.revV, 0.5),
        revT: '',
        fwd1A: fluctuate(s.fwd1A, 4),
        fwd1V: fluctuate(s.fwd1V, 0.4),
        fwd1T: '',
        fwd2A: fluctuate(s.fwd2A, 5),
        fwd2V: fluctuate(s.fwd2V, 0.5),
        fwd2T: '',
        temp: fluctuate(s.temp, 1),
      },
      setting: s,
    },
    dashboard: {
      id: plc.id,
      product: plc.product,
      tank: plc.tank,
      target: plc.target,
      actual: plc.actual,
      progress: Math.min(100, Math.floor((plc.actual / plc.target) * 100)),
      status: 'ĐANG HOẠT ĐỘNG',
      timeIn: '17:05',
      timeEst: calcEst(plc),
    }
  });

  const options = {
    hostname: BACKEND_HOST,
    port: BACKEND_PORT,
    path: '/api/plc-data-single',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    }
  };

  const req = http.request(options, () => {});
  req.on('error', () => {}); // Bỏ qua lỗi nếu server chưa kết nối
  req.write(payload);
  req.end();
}

function calcEst(plc) {
  const remaining = plc.target - plc.actual;
  const rate = 5; // giả sử ~5 cái/giây
  const secLeft = Math.floor(remaining / rate);
  const h = Math.floor(secLeft / 3600);
  const m = Math.floor((secLeft % 3600) / 60);
  return `${String(h).padStart(2,'0')}h${String(m).padStart(2,'0')} - ${String(h).padStart(2,'0')}h${String(m+20).padStart(2,'0')}`;
}

console.log("╔══════════════════════════════════════════════╗");
console.log("║   HỆ THỐNG GIẢ LẬP PLC - RPM-APP (PES PRO) ║");
console.log("╠══════════════════════════════════════════════╣");
plcConfigs.forEach(p => {
  console.log(`║  ✅ ${p.name} │ ${p.tank} │ ${p.ip}:${p.port}       ║`);
});
console.log("╠══════════════════════════════════════════════╣");
console.log("║  Tốc độ: 1 tín hiệu/giây × 6 PLC = 6 pulse/s ║");
console.log("╚══════════════════════════════════════════════╝\n");

// Khởi động 6 PLC timer độc lập, mỗi cái 1 giây
plcConfigs.forEach((plc) => {
  setInterval(() => {
    // Tăng sản lượng ngẫu nhiên
    if (plc.actual < plc.target) {
      plc.actual += Math.floor(Math.random() * 3) + 1;
    }
    sendPlcData(plc);
    console.log(`[${new Date().toLocaleTimeString()}] ${plc.name}(${plc.tank}) → Sản lượng: ${plc.actual}/${plc.target} | Tiến độ: ${Math.min(100,Math.floor(plc.actual/plc.target*100))}%`);
  }, 1000); // 1 giây
});
