const http = require('http');

console.log("🛠️ KHỞI ĐỘNG HỆ THỐNG GIẢ LẬP PLC (PES PRO) 🛠️");
console.log("PLC Simulator đang chạy và gởi tín hiệu thời gian thực mỗi 2 giây...\n");

// Initial mock state to keep track of memory
let plcTanks = [
    { id: 1, name: 'Bể 1', status: 'ON', product: 'SP-01', actual: { revA: 150.86, revV: 11.64, revT: '', fwd1A: 220.17, fwd1V: 11.17, fwd1T: '', fwd2A: 279.68, fwd2V: 11.1, fwd2T: '', temp: 52 }, setting: { revA: 150, revV: 12, revT: 120, fwd1A: 220, fwd1V: 12, fwd1T: 45, fwd2A: 280, fwd2V: 12, fwd2T: 120, temp: 52 } },
    { id: 2, name: 'Bể 2', status: 'ON', product: 'SP-02', actual: { revA: 119.27, revV: 9.44, revT: '', fwd1A: 200.55, fwd1V: 9.78, fwd1T: '', fwd2A: 199.41, fwd2V: 12.38, fwd2T: '', temp: 55 }, setting: { revA: 120, revV: 10, revT: 110, fwd1A: 200, fwd1V: 10, fwd1T: 45, fwd2A: 200, fwd2V: 12, fwd2T: 120, temp: 55 } },
    { id: 3, name: 'Bể 3', status: 'ON', product: 'SP-10', actual: { revA: 150.77, revV: 12.89, revT: '', fwd1A: 219.18, fwd1V: 12.84, fwd1T: '', fwd2A: 280.09, fwd2V: 12.47, fwd2T: '', temp: 48 }, setting: { revA: 150, revV: 12, revT: 450, fwd1A: 220, fwd1V: 12, fwd1T: 60, fwd2A: 280, fwd2V: 12, fwd2T: 90, temp: 48 } },
];

let plcDashboard = [
    { id: 1, product: 'SP-01', progress: 92, status: 'ĐANG HOẠT ĐỘNG', tank: 'Bể 1', actual: 2300, target: 2500, timeIn: '17:05', timeEst: '20h05 - 20h25' },
    { id: 2, product: 'SP-02', progress: 67, status: 'ĐANG HOẠT ĐỘNG', tank: 'Bể 2', actual: 1000, target: 1500, timeIn: '17:05', timeEst: '21h17 - 21h37' },
    { id: 3, product: 'SP-10', progress: 61, status: 'ĐANG HOẠT ĐỘNG', tank: 'Bể 3', actual: 1100, target: 1800, timeIn: '17:05', timeEst: '21h41 - 22h01' },
    { id: 4, product: 'SP-04', progress: 32, status: 'ĐANG TRỜ HÀNG', tank: 'Bể 4', actual: 700, target: 2200, timeIn: '17:05', timeEst: '02h04 - 02h24' },
    { id: 5, product: 'SS-07', progress: 78, status: 'ĐANG HOẠT ĐỘNG', tank: 'Bể 5', actual: 1800, target: 2300, timeIn: '17:05', timeEst: '20h38 - 20h58' },
    { id: 6, product: 'SP-05', progress: 67, status: 'BẢO TRÌ BỂ', tank: 'Bể 6', actual: 800, target: 1200, timeIn: '17:05', timeEst: '21h17 - 21h37' },
];

setInterval(() => {
    // 1. Randomly fluctuate sensor readings in tanks
    plcTanks = plcTanks.map(tank => {
        if (tank.status === 'ON') {
            tank.actual.revA = (tank.setting.revA + (Math.random() * 4 - 2)).toFixed(2);
            tank.actual.revV = (tank.setting.revV + (Math.random() * 0.4 - 0.2)).toFixed(2);
            tank.actual.fwd1A = (tank.setting.fwd1A + (Math.random() * 6 - 3)).toFixed(2);
            tank.actual.temp = (tank.setting.temp + (Math.random() * 2 - 1)).toFixed(1);
        }
        return tank;
    });

    // 2. Increment volume metrics in dashboard cards
    plcDashboard = plcDashboard.map(card => {
        if (card.status === 'ĐANG HOẠT ĐỘNG' && card.actual < card.target) {
             if(Math.random() > 0.4) card.actual += Math.floor(Math.random() * 4); // Simulate 0~3 units produced
             card.progress = Math.min(100, Math.floor((card.actual / card.target) * 100));
        }
        return card;
    });

    const payload = JSON.stringify({ tanks: plcTanks, dashboard: plcDashboard });

    // Send HTTP POST to Node.js backend
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/plc-data',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    };

    const req = http.request(options, (res) => {
        // Suppress successful logs so it doesn't flood the terminal
    });

    req.on('error', (e) => {
        console.error(`[PLC ERROR] Lỗi kết nối đến Backend: ${e.message}`);
    });

    req.write(payload);
    req.end();

}, 2000); // Pulse every 2 seconds
