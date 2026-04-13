-- 1. Bảng PRODUCTS (Quản lý các danh mục/mã Sản phẩm và tiêu chuẩn mạ)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    standard_conditions JSONB, -- Lưu bộ điều kiện chuẩn (Vd: {"temp": 50, "current": 200})
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng TANKS (Quản lý Bể mạ / Thiết bị trên Line)
CREATE TABLE tanks (
    id SERIAL PRIMARY KEY,
    tank_name VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'OFF', -- Trạng thái: ON, OFF, ERROR
    current_product_id INT REFERENCES products(id), -- Bể hiện tại đang mạ mã hàng nào
    setting_conditions JSONB, -- Điều kiện cài đặt hiện tại trên máy
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng PRODUCTION_PLANS (Kế hoạch sản xuất các ca được YDKV đề ra)
CREATE TABLE production_plans (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) NOT NULL,
    target_quantity INT NOT NULL, -- Mục tiêu sản xuất
    start_time TIMESTAMP, -- Định mức bắt đầu làm
    end_time TIMESTAMP,   -- Thời gian dự kiến hoàn thành
    status VARCHAR(20) DEFAULT 'PENDING' -- PENDING, RUNNING, COMPLETED
);

-- 4. Bảng JIG_BATCHES (Quản lý từng Mẻ hàng/JIG chạy qua bể mạ)
CREATE TABLE jig_batches (
    id SERIAL PRIMARY KEY,
    plan_id INT REFERENCES production_plans(id),
    tank_id INT REFERENCES tanks(id),
    quantity INT NOT NULL, -- Số lượng sản xuất của 1 JIG (1 Mẻ)
    time_in TIMESTAMP NOT NULL, -- Thời gian ra vào hàng (Vào)
    time_out TIMESTAMP, -- Thời gian ra vào hàng (Ra)
    status VARCHAR(20) DEFAULT 'IN_TANK' -- IN_TANK, COMPLETED
);

-- 5. Bảng TANK_LOGS (Ghi chép Lịch sử hoạt động máy: Bật/Tắt)
CREATE TABLE tank_logs (
    id SERIAL PRIMARY KEY,
    tank_id INT REFERENCES tanks(id) NOT NULL,
    event_type VARCHAR(20), -- TURN_ON, TURN_OFF, CHANGED_SETTINGS
    actual_conditions JSONB, -- Thông số thực tế ghi lại tại thời điểm Log (để check với Cài đặt)
    event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bảng INCIDENTS (Ghi chép báo cáo sự cố khẩn cấp)
CREATE TABLE incidents (
    id SERIAL PRIMARY KEY,
    tank_id INT REFERENCES tanks(id) NOT NULL,
    issue_type VARCHAR(50), -- LOW_LIQUID (Mực dung dịch thấp), ELECTRICAL (Sự cố điện)
    description TEXT,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP, -- Khi nào sự cố được khắc phục xong
    status VARCHAR(20) DEFAULT 'UNRESOLVED' -- UNRESOLVED (chưa sửa), RESOLVED (đã sửa)
);