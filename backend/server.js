const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());

// CORS: cho phép Vercel frontend gọi API
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5174',
  /\.vercel\.app$/, // tất cả subdomain của vercel
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // server-to-server (PLC simulator)
    const allowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    callback(null, allowed);
  },
  credentials: true
}));

// Health check cho Render
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Initialize Postgres Pool
// Khi deploy lên Render, DATABASE_URL sẽ tự động được inject vào môi trường
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/rpm_db',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false // Render requires SSL for remote db connections
});

// Kiểm tra DB Connection
pool.connect()
  .then(() => console.log("Connected to PostgreSQL successfully!"))
  .catch(err => console.error("PostgreSQL connection error:", err));

let sseClients = [];

// In-memory state: Tank data aggregated from all PLCs
let tankState = {};
let dashboardState = {};

// PLC Configuration stored in memory (in production, use DB)
let plcConfigs = [
  { id: 1, name: 'PLC-01', tank: 'Bể 1', ip: '192.168.1.101', port: 502, product: 'SP-01', status: 'connected' },
  { id: 2, name: 'PLC-02', tank: 'Bể 2', ip: '192.168.1.102', port: 502, product: 'SP-02', status: 'connected' },
  { id: 3, name: 'PLC-03', tank: 'Bể 3', ip: '192.168.1.103', port: 502, product: 'SP-10', status: 'connected' },
  { id: 4, name: 'PLC-04', tank: 'Bể 4', ip: '192.168.1.104', port: 502, product: 'SP-04', status: 'connected' },
  { id: 5, name: 'PLC-05', tank: 'Bể 5', ip: '192.168.1.105', port: 502, product: 'SS-07', status: 'connected' },
  { id: 6, name: 'PLC-06', tank: 'Bể 6', ip: '192.168.1.106', port: 502, product: 'SP-05', status: 'connected' },
];

// ==========================================
// ROUTES: REAL-TIME PLC DATA (SSE)
// ==========================================

// Nhận data từ từng PLC đơn lẻ
app.post('/api/plc-data-single', (req, res) => {
  const { plcId, tank, dashboard } = req.body;
  const cfg = plcConfigs.find(p => p.id === plcId);
  // Chỉ xử lý nếu PLC đang ở trạng thái connected
  if (!cfg || cfg.status !== 'connected') {
    return res.json({ success: false, message: 'PLC disconnected or not found' });
  }
  tankState[plcId] = tank;
  dashboardState[plcId] = dashboard;

  // Broadcast to all SSE clients
  const payload = JSON.stringify({
    tanks: Object.values(tankState),
    dashboard: Object.values(dashboardState),
  });
  sseClients.forEach(client => client.res.write(`data: ${payload}\n\n`));
  res.json({ success: true });
});

// [Cũ] endpoint batch (giữ lại để tương thích ngược)
app.post('/api/plc-data', (req, res) => {
  const { tanks, dashboard } = req.body;
  const payload = JSON.stringify({ tanks, dashboard });
  sseClients.forEach(client => client.res.write(`data: ${payload}\n\n`));
  res.json({ success: true });
});

// SSE endpoint cho Web client - cố định HTTP/2 proxy của Render
app.get('/api/stream', (req, res) => {
  // Bắt buộc HTTP/1.1 chunked - fix ERR_HTTP2_PROTOCOL_ERROR trên Render
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');        // tắt nginx buffering
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
  res.status(200);
  res.flushHeaders();

  // Gửi comment đầu tiên để mở kết nối ngay
  res.write(': connected\n\n');

  const clientId = Date.now();
  sseClients.push({ id: clientId, res });

  // Ping mỗi 25 giây để giữ kết nối sống (Render timeout 30s)
  const heartbeat = setInterval(() => {
    try { res.write(': ping\n\n'); } catch(e) { clearInterval(heartbeat); }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// ==========================================
// ROUTES: PLC CONFIG MANAGEMENT
// ==========================================

// Lấy danh sách cấu hình PLC
app.get('/api/plc/configs', (req, res) => {
  res.json({ success: true, data: plcConfigs });
});

// Cập nhật cấu hình 1 PLC (ip, port, product)
app.put('/api/plc/configs/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { ip, port, product, name } = req.body;
  plcConfigs = plcConfigs.map(p => p.id === id ? { ...p, ip: ip||p.ip, port: port||p.port, product: product||p.product, name: name||p.name } : p);
  res.json({ success: true, data: plcConfigs.find(p => p.id === id) });
});

// Bật/Tắt kết nối 1 PLC
app.post('/api/plc/configs/:id/toggle', (req, res) => {
  const id = parseInt(req.params.id);
  plcConfigs = plcConfigs.map(p => {
    if (p.id === id) {
      const newStatus = p.status === 'connected' ? 'disconnected' : 'connected';
      if (newStatus === 'disconnected') {
        // Xóa dữ liệu của PLC đó khỏi state
        delete tankState[id];
        delete dashboardState[id];
      }
      return { ...p, status: newStatus };
    }
    return p;
  });
  const cfg = plcConfigs.find(p => p.id === id);
  // Broadcast lại state mới sau khi ngắt
  const payload = JSON.stringify({ tanks: Object.values(tankState), dashboard: Object.values(dashboardState), plcConfigs });
  sseClients.forEach(client => client.res.write(`data: ${payload}\n\n`));
  res.json({ success: true, data: cfg });
});

// ==========================================
// ROUTES: BỂ MẠ (TANKS) & LỊCH SỬ (LOGS)
// ==========================================

// 1. Xem danh sách Bể Mạ cùng trạng thái
app.get('/api/tanks', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.id, t.tank_name, t.status, p.product_name AS current_product
      FROM tanks t
      LEFT JOIN products p ON t.current_product_id = p.id
      ORDER BY t.id ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Thêm mới một bể mạ
app.post('/api/tanks', async (req, res) => {
  const { tank_name, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tanks (tank_name, status) VALUES ($1, $2) RETURNING *',
      [tank_name, status || 'OFF']
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Cập nhật Trạng thái (Bật/Tắt) của bể & Ghi log
app.put('/api/tanks/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, conditions } = req.body; 
  // status: 'ON', 'OFF', 'ERROR'
  // conditions: { temp: 50, ph: 4.5 }

  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Start Transaction
    
    // Đổi trạng thái bể
    const updateResult = await client.query(
      'UPDATE tanks SET status = $1, setting_conditions = $2 WHERE id = $3 RETURNING *',
      [status, conditions ? JSON.stringify(conditions) : null, id]
    );

    if (updateResult.rows.length === 0) throw new Error("Tank not found!");

    // Gán Log sự kiện
    const eventType = status === 'ON' ? 'TURN_ON' : (status === 'OFF' ? 'TURN_OFF' : 'ERROR_REPORTED');
    await client.query(
      'INSERT INTO tank_logs (tank_id, event_type, actual_conditions) VALUES ($1, $2, $3)',
      [id, eventType, conditions ? JSON.stringify(conditions) : null]
    );

    // Nếu ERROR thì bắn thêm vào bảng incidents
    if (status === 'ERROR') {
         await client.query(
            'INSERT INTO incidents (tank_id, issue_type, description) VALUES ($1, $2, $3)',
            [id, 'UNKNOWN_ERROR', 'Sự cố thiết bị khi đang vận hành']
         );
    }

    await client.query('COMMIT'); // Commit Transaction
    res.json({ success: true, message: `Bể ${id} đã đổi sang ${status}` });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});


// Health Check
app.get('/', (req, res) => {
  res.send('PES Pro (RPM) Backend is running with PostgreSQL!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server API đang chạy trên port: ${PORT}`);

  // ==========================================
  // INLINE PLC SIMULATOR (cho Render deploy)
  // Trên Render free plan chỉ có 1 web service,
  // nên nhúng PLC giả lập chạy ngay trong server
  // ==========================================
  if (process.env.ENABLE_PLC_SIM === 'true' || process.env.NODE_ENV === 'production') {
    console.log('\n🛠️  KHỞI ĐỘNG GIẢ LẬP PLC NỘI TUYẾN (INLINE)...');

    const tankSettings = {
      1: { revA: 150, revV: 12, revT: 120, fwd1A: 220, fwd1V: 12, fwd1T: 45, fwd2A: 280, fwd2V: 12, fwd2T: 120, temp: 52 },
      2: { revA: 120, revV: 10, revT: 110, fwd1A: 200, fwd1V: 10, fwd1T: 45, fwd2A: 200, fwd2V: 12, fwd2T: 120, temp: 55 },
      3: { revA: 150, revV: 12, revT: 450, fwd1A: 220, fwd1V: 12, fwd1T: 60, fwd2A: 280, fwd2V: 12, fwd2T: 90,  temp: 48 },
      4: { revA: 180, revV: 14, revT: 200, fwd1A: 250, fwd1V: 13, fwd1T: 60, fwd2A: 300, fwd2V: 13, fwd2T: 150, temp: 50 },
      5: { revA: 130, revV: 11, revT: 130, fwd1A: 210, fwd1V: 11, fwd1T: 50, fwd2A: 260, fwd2V: 11, fwd2T: 110, temp: 53 },
      6: { revA: 100, revV: 9,  revT: 100, fwd1A: 180, fwd1V: 9,  fwd1T: 40, fwd2A: 220, fwd2V: 10, fwd2T: 100, temp: 46 },
    };

    const simPlcs = [
      { id: 1, tank: 'Bể 1', product: 'SP-01', target: 2500, actual: 2300 },
      { id: 2, tank: 'Bể 2', product: 'SP-02', target: 1500, actual: 1000 },
      { id: 3, tank: 'Bể 3', product: 'SP-10', target: 1800, actual: 1100 },
      { id: 4, tank: 'Bể 4', product: 'SP-04', target: 2200, actual: 700  },
      { id: 5, tank: 'Bể 5', product: 'SS-07', target: 2300, actual: 1800 },
      { id: 6, tank: 'Bể 6', product: 'SP-05', target: 1200, actual: 800  },
    ];

    function fluctuate(base, delta) {
      return parseFloat((base + (Math.random() * delta * 2 - delta)).toFixed(2));
    }

    simPlcs.forEach(plc => {
      console.log(`  ✅ PLC-0${plc.id} | ${plc.tank} | ${plc.product}`);
    });
    console.log(`  Tốc độ: 1 tín hiệu/giây × ${simPlcs.length} PLC\n`);

    // Mỗi giây, inject trực tiếp data vào in-memory state (không qua HTTP)
    setInterval(() => {
      simPlcs.forEach(plc => {
        if (plc.actual < plc.target) {
          plc.actual += Math.floor(Math.random() * 3) + 1;
        }
        const s = tankSettings[plc.id];
        const cfg = plcConfigs.find(p => p.id === plc.id);
        if (!cfg || cfg.status !== 'connected') return;

        tankState[plc.id] = {
          id: plc.id, name: plc.tank, status: 'ON', product: plc.product,
          actual: {
            revA: fluctuate(s.revA, 3), revV: fluctuate(s.revV, 0.5), revT: '',
            fwd1A: fluctuate(s.fwd1A, 4), fwd1V: fluctuate(s.fwd1V, 0.4), fwd1T: '',
            fwd2A: fluctuate(s.fwd2A, 5), fwd2V: fluctuate(s.fwd2V, 0.5), fwd2T: '',
            temp: fluctuate(s.temp, 1),
          },
          setting: s,
        };
        dashboardState[plc.id] = {
          id: plc.id, product: plc.product, tank: plc.tank,
          target: plc.target, actual: plc.actual,
          progress: Math.min(100, Math.floor((plc.actual / plc.target) * 100)),
          status: 'ĐANG HOẠT ĐỘNG', timeIn: '17:05', timeEst: '',
        };
      });

      // Broadcast SSE
      const payload = JSON.stringify({
        tanks: Object.values(tankState),
        dashboard: Object.values(dashboardState),
      });
      sseClients.forEach(client => {
        try { client.res.write(`data: ${payload}\n\n`); } catch(e) {}
      });
    }, 1000);
  }
});
