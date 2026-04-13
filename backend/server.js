const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

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

// SSE endpoint cho Web client đăng ký nhận real-time
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();
  const clientId = Date.now();
  sseClients.push({ id: clientId, res });
  req.on('close', () => { sseClients = sseClients.filter(c => c.id !== clientId); });
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
app.listen(PORT, () => console.log(`Server API đang chạy trên port: ${PORT}`));
