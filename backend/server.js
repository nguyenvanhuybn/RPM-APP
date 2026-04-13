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
