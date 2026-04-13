import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [tanks, setTanks] = useState([
    { id: 1, name: 'Bể Mạ Niken 01', status: 'ON', current_product: 'Ốc M8', temp: '50°C', ph: '4.5' },
    { id: 2, name: 'Bể Mạ Đồng 02', status: 'OFF', current_product: 'N/A', temp: '25°C', ph: '7.0' },
    { id: 3, name: 'Bể Mạ Kẽm 03', status: 'ERROR', current_product: 'Trục Động Cơ', temp: '80°C', ph: '2.1' },
    { id: 4, name: 'Bể Rửa Nước 04', status: 'ON', current_product: 'Ốc M8', temp: '30°C', ph: '6.8' }
  ]);

  const [production, setProduction] = useState({
    plan: 5000,
    actual: 3250,
    product: 'Ốc M8'
  });

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <h2>PES <span>Pro</span></h2>
        </div>
        <nav className="nav-menu">
          <a href="#" className="nav-item active">
            <span className="icon">📊</span> Tổng quan
          </a>
          <a href="#" className="nav-item">
            <span className="icon">🏭</span> Giám sát Bể
          </a>
          <a href="#" className="nav-item">
            <span className="icon">📋</span> Kế hoạch (YDKV)
          </a>
          <a href="#" className="nav-item">
            <span className="icon">⚙️</span> Lịch sử Sự cố
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div>
            <h1>Dashboard Giám Sát Thời Gian Thực</h1>
            <p className="subtitle">Hệ thống Điều hành Mạ công nghiệp (RPM)</p>
          </div>
          <div className="user-profile">
            <div className="avatar">AD</div>
            <span>Admin</span>
          </div>
        </header>

        {/* Top Widgets */}
        <section className="widgets-grid">
          <div className="widget-card stats-card">
            <h3>Tiến độ Sản xuất Hiện tại</h3>
            <div className="progress-details">
              <div>
                <p className="label">Mã hàng chạy chính</p>
                <p className="value highlight">{production.product}</p>
              </div>
              <div className="divider"></div>
              <div>
                <p className="label">Kế hoạch</p>
                <p className="value">{production.plan}</p>
              </div>
              <div className="divider"></div>
              <div>
                <p className="label">Đã sản xuất (Thực tế)</p>
                <p className="value highlight-green">{production.actual}</p>
              </div>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${(production.actual / production.plan) * 100}%` }}
              ></div>
            </div>
            <p className="progress-text">{((production.actual / production.plan) * 100).toFixed(1)}% Hoàn thành</p>
          </div>

          <div className="widget-card OEE-card">
            <h3>Hiệu suất Tổng thể (OEE)</h3>
            <div className="oee-circle">
              <div className="inner-circle">
                <span className="oee-val">87%</span>
              </div>
            </div>
            <div className="oee-labels">
               <span><strong>A:</strong> 95%</span>
               <span><strong>P:</strong> 92%</span>
               <span><strong>Q:</strong> 99%</span>
            </div>
          </div>
        </section>

        {/* Tanks Grid */}
        <h2 className="section-title">Trạng Thái Bể Mạ & Thiết Bị</h2>
        <section className="tanks-grid">
          {tanks.map(tank => (
            <div key={tank.id} className={`tank-card status-${tank.status}`}>
              <div className="tank-header">
                <h3>{tank.name}</h3>
                <span className={`status-badge ${tank.status}`}>{tank.status}</span>
              </div>
              <div className="tank-body">
                <div className="data-row">
                  <span className="data-lbl">Mã hàng:</span>
                  <span className="data-val">{tank.current_product}</span>
                </div>
                <div className="data-row">
                  <span className="data-lbl">Nhiệt độ:</span>
                  <span className="data-val temp">{tank.temp}</span>
                </div>
                <div className="data-row">
                  <span className="data-lbl">Nồng độ pH:</span>
                  <span className="data-val ph">{tank.ph}</span>
                </div>
              </div>
              <div className="tank-footer">
                <button className="btn-details">Xem chi tiết mẻ</button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default App;
