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

// Database initialization
const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        product_code VARCHAR(50) UNIQUE NOT NULL,
        product_name VARCHAR(100) NOT NULL,
        actual_quantity INT DEFAULT 0,
        target_quantity INT DEFAULT 0,
        standard_conditions JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add column if table already existed without it
    await client.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS standard_conditions JSONB
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id SERIAL PRIMARY KEY,
        tank_name VARCHAR(50),
        product_code VARCHAR(50),
        event_type VARCHAR(50),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Seed default products
    const res = await client.query('SELECT count(*) FROM products');
    if (res.rows[0].count == 0) {
      await client.query(`
        INSERT INTO products (product_code, product_name, actual_quantity, target_quantity, standard_conditions) VALUES
        ('SP-01', 'Sản phẩm 1', 2300, 2500, '{"revA": 150, "revV": 12, "revT": 120, "fwd1A": 220, "fwd1V": 12, "fwd1T": 45, "fwd2A": 280, "fwd2V": 12, "fwd2T": 120, "temp": 52}'),
        ('SP-02', 'Sản phẩm 2', 1000, 1500, '{"revA": 120, "revV": 10, "revT": 110, "fwd1A": 200, "fwd1V": 10, "fwd1T": 45, "fwd2A": 200, "fwd2V": 12, "fwd2T": 120, "temp": 55}'),
        ('SP-10', 'Sản phẩm 10', 1100, 1800, '{"revA": 150, "revV": 12, "revT": 450, "fwd1A": 220, "fwd1V": 12, "fwd1T": 60, "fwd2A": 280, "fwd2V": 12, "fwd2T": 90, "temp": 48}'),
        ('SP-04', 'Sản phẩm 4', 700, 2200, '{"revA": 180, "revV": 14, "revT": 200, "fwd1A": 250, "fwd1V": 13, "fwd1T": 60, "fwd2A": 300, "fwd2V": 13, "fwd2T": 150, "temp": 50}'),
        ('SS-07', 'Sản phẩm 7', 1800, 2300, '{"revA": 130, "revV": 11, "revT": 130, "fwd1A": 210, "fwd1V": 11, "fwd1T": 50, "fwd2A": 260, "fwd2V": 11, "fwd2T": 110, "temp": 53}'),
        ('SP-05', 'Sản phẩm 5', 800, 1200, '{"revA": 100, "revV": 9, "revT": 100, "fwd1A": 180, "fwd1V": 9, "fwd1T": 40, "fwd2A": 220, "fwd2V": 10, "fwd2T": 100, "temp": 46}')
      `);
    } else {
        // Migration for existing rows
        await client.query(`
          UPDATE products SET standard_conditions = '{"revA": 150, "revV": 12, "revT": 120, "fwd1A": 220, "fwd1V": 12, "fwd1T": 45, "fwd2A": 280, "fwd2V": 12, "fwd2T": 120, "temp": 52}' WHERE product_code = 'SP-01' AND standard_conditions IS NULL;
          UPDATE products SET standard_conditions = '{"revA": 120, "revV": 10, "revT": 110, "fwd1A": 200, "fwd1V": 10, "fwd1T": 45, "fwd2A": 200, "fwd2V": 12, "fwd2T": 120, "temp": 55}' WHERE product_code = 'SP-02' AND standard_conditions IS NULL;
          UPDATE products SET standard_conditions = '{"revA": 150, "revV": 12, "revT": 450, "fwd1A": 220, "fwd1V": 12, "fwd1T": 60, "fwd2A": 280, "fwd2V": 12, "fwd2T": 90, "temp": 48}' WHERE product_code = 'SP-10' AND standard_conditions IS NULL;
          UPDATE products SET standard_conditions = '{"revA": 180, "revV": 14, "revT": 200, "fwd1A": 250, "fwd1V": 13, "fwd1T": 60, "fwd2A": 300, "fwd2V": 13, "fwd2T": 150, "temp": 50}' WHERE product_code = 'SP-04' AND standard_conditions IS NULL;
          UPDATE products SET standard_conditions = '{"revA": 130, "revV": 11, "revT": 130, "fwd1A": 210, "fwd1V": 11, "fwd1T": 50, "fwd2A": 260, "fwd2V": 11, "fwd2T": 110, "temp": 53}' WHERE product_code = 'SS-07' AND standard_conditions IS NULL;
          UPDATE products SET standard_conditions = '{"revA": 100, "revV": 9, "revT": 100, "fwd1A": 180, "fwd1V": 9, "fwd1T": 40, "fwd2A": 220, "fwd2V": 10, "fwd2T": 100, "temp": 46}' WHERE product_code = 'SP-05' AND standard_conditions IS NULL;
        `);
    }
  } catch (err) {
    console.log("DB init error", err.message);
  } finally {
    client.release();
  }
};
initDB();

let simPlcs = [
  { id: 1, tank: 'Bể 1', product: 'SP-01', target: 2500, actual: 2300, cycleProgress: 0 },
  { id: 2, tank: 'Bể 2', product: 'SP-02', target: 1500, actual: 1000,  cycleProgress: 0 },
  { id: 3, tank: 'Bể 3', product: 'SP-10', target: 1800, actual: 1100,  cycleProgress: 0 },
  { id: 4, tank: 'Bể 4', product: 'SP-04', target: 2200, actual: 700,   cycleProgress: 0 },
  { id: 5, tank: 'Bể 5', product: 'SS-07', target: 2300, actual: 1800,  cycleProgress: 0 },
  { id: 6, tank: 'Bể 6', product: 'SP-05', target: 1200, actual: 800,   cycleProgress: 0 },
];

const tankSettings = {
  1: { revA: 150, revV: 12, revT: 120, fwd1A: 220, fwd1V: 12, fwd1T: 45, fwd2A: 280, fwd2V: 12, fwd2T: 120, temp: 52 },
  2: { revA: 120, revV: 10, revT: 110, fwd1A: 200, fwd1V: 10, fwd1T: 45, fwd2A: 200, fwd2V: 12, fwd2T: 120, temp: 55 },
  3: { revA: 150, revV: 12, revT: 450, fwd1A: 220, fwd1V: 12, fwd1T: 60, fwd2A: 280, fwd2V: 12, fwd2T: 90,  temp: 48 },
  4: { revA: 180, revV: 14, revT: 200, fwd1A: 250, fwd1V: 13, fwd1T: 60, fwd2A: 300, fwd2V: 13, fwd2T: 150, temp: 50 },
  5: { revA: 130, revV: 11, revT: 130, fwd1A: 210, fwd1V: 11, fwd1T: 50, fwd2A: 260, fwd2V: 11, fwd2T: 110, temp: 53 },
  6: { revA: 100, revV: 9,  revT: 100, fwd1A: 180, fwd1V: 9,  fwd1T: 40, fwd2A: 220, fwd2V: 10, fwd2T: 100, temp: 46 },
};

function fluctuate(base, delta) {
  return parseFloat((parseFloat(base || 0) + (Math.random() * delta * 2 - delta)).toFixed(2));
}

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
  const oldCfg = plcConfigs.find(p => p.id === id);
  const isProductChanged = oldCfg && product && oldCfg.product !== product;

  plcConfigs = plcConfigs.map(p => p.id === id ? { ...p, ip: ip||p.ip, port: port||p.port, product: product||p.product, name: name||p.name } : p);

  if (isProductChanged) {
     const cfg = plcConfigs.find(p => p.id === id);
     const sPlc = simPlcs.find(s => s.id === id);
     if (sPlc) {
        sPlc.product = product;
        sPlc.cycleProgress = 0;
        pool.query('SELECT actual_quantity, target_quantity, standard_conditions FROM products WHERE product_code = $1', [product])
        .then(r => {
            if (r.rows.length > 0) {
                sPlc.actual = r.rows[0].actual_quantity;
                sPlc.target = r.rows[0].target_quantity;
                if (r.rows[0].standard_conditions) {
                   tankSettings[id] = r.rows[0].standard_conditions;
                }
            }
        }).catch(()=>{});
     }
     pool.query(
        'INSERT INTO system_logs (tank_name, product_code, event_type, message) VALUES ($1, $2, $3, $4)',
        [cfg.tank, product, 'CHANGE_PRODUCT', `Bể ${cfg.tank} đổi sang sản xuất mã: ${product}`]
     ).catch(()=>{});
  }

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
// ROUTES: BỂ MẠ (TANKS), SẢN PHẨM & LỊCH SỬ (LOGS)
// ==========================================

// Lấy danh sách Sản Phẩm
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Lấy danh sách Logs thay đổi
app.get('/api/logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 50');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Thêm mới Sản Phẩm
app.post('/api/products', async (req, res) => {
  const { product_code, product_name, target_quantity, standard_conditions } = req.body;
  if (!product_code) return res.status(400).json({ success: false, error: 'Thiếu mã sản phẩm' });
  try {
    const result = await pool.query(
      'INSERT INTO products (product_code, product_name, target_quantity, actual_quantity, standard_conditions) VALUES ($1, $2, $3, 0, $4) RETURNING *',
      [product_code, product_name || product_code, target_quantity || 0, standard_conditions ? JSON.stringify(standard_conditions) : null]
    );
    await pool.query(
      'INSERT INTO system_logs (tank_name, product_code, event_type, message) VALUES ($1, $2, $3, $4)',
      ['-', product_code, 'ADD_PRODUCT', `Thêm mới mã sản phẩm: ${product_code} - ${product_name}`]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cập nhật Sản Phẩm
app.put('/api/products/:code', async (req, res) => {
  const code = req.params.code;
  const { product_name, target_quantity, standard_conditions } = req.body;
  try {
    const result = await pool.query(
      'UPDATE products SET product_name = $1, target_quantity = $2, standard_conditions = $3 WHERE product_code = $4 RETURNING *',
      [product_name || code, target_quantity || 0, standard_conditions ? JSON.stringify(standard_conditions) : null, code]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Không tìm thấy sản phẩm' });
    await pool.query(
      'INSERT INTO system_logs (tank_name, product_code, event_type, message) VALUES ($1, $2, $3, $4)',
      ['-', code, 'UPDATE_PRODUCT', `Cập nhật thông số mã: ${code}`]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


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

    pool.query('SELECT * FROM products').then((res) => {
        const prodData = res.rows;
        simPlcs.forEach(p => {
             const prod = prodData.find(pd => pd.product_code === p.product);
             if (prod) {
                 p.actual = prod.actual_quantity;
                 p.target = prod.target_quantity;
                 if (prod.standard_conditions) tankSettings[p.id] = prod.standard_conditions;
             }
        });
    }).catch(()=>{});    simPlcs.forEach(plc => {
      console.log(`  ✅ PLC-0${plc.id} | ${plc.tank} | ${plc.product}`);
    });
    console.log(`  Tốc độ: 1 tín hiệu/giây × ${simPlcs.length} PLC\n`);

    // Mỗi giây, inject trực tiếp data vào in-memory state (không qua HTTP)
    setInterval(() => {
      simPlcs.forEach(plc => {
        const cfg = plcConfigs.find(p => p.id === plc.id);
        if (!cfg || cfg.status !== 'connected') return;

        if (plc.cycleProgress === undefined) plc.cycleProgress = 0;
        plc.cycleProgress += Math.floor(Math.random() * 6) + 5; // 5-10% per second

        let justFinished = false;
        if (plc.cycleProgress >= 100) {
            plc.cycleProgress = 0;
            plc.actual += 1;
            justFinished = true;
            pool.query('UPDATE products SET actual_quantity = actual_quantity + 1 WHERE product_code = $1', [plc.product]).catch(()=>{});
            pool.query('INSERT INTO system_logs (tank_name, product_code, event_type, message) VALUES ($1, $2, $3, $4)', [plc.tank, plc.product, 'CYCLE_COMPLETED', `Bể ${plc.tank} hoàn thành tiến độ mẻ mạ 100%. Sản lượng mã ${plc.product} tăng thêm 1.`]).catch(()=>{});
        }

        const s = tankSettings[plc.id];
        const cycleRatio = Math.min(1, (plc.cycleProgress || 0) / 100);
        
        tankState[plc.id] = {
          id: plc.id, name: plc.tank, status: 'ON', product: plc.product,
          actual: {
            revA: fluctuate(s.revA, 3), revV: fluctuate(s.revV, 0.5), revT: s.revT ? Math.floor(s.revT * cycleRatio) : '',
            fwd1A: fluctuate(s.fwd1A, 4), fwd1V: fluctuate(s.fwd1V, 0.4), fwd1T: s.fwd1T ? Math.floor(s.fwd1T * cycleRatio) : '',
            fwd2A: fluctuate(s.fwd2A, 5), fwd2V: fluctuate(s.fwd2V, 0.5), fwd2T: s.fwd2T ? Math.floor(s.fwd2T * cycleRatio) : '',
            temp: fluctuate(s.temp, 1),
          },
          setting: s,
        };
        dashboardState[plc.id] = {
          id: plc.id, product: plc.product, tank: plc.tank,
          target: plc.target, actual: plc.actual, cycleProgress: Math.min(100, plc.cycleProgress),
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
