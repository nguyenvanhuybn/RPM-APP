import React, { useState } from 'react';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  const [tanks] = useState([
    { id: 1, name: 'Bể Mạ Niken 01', status: 'ON', current_product: 'Ốc M8', temp: '50°C', ph: '4.5' },
    { id: 2, name: 'Bể Mạ Đồng 02', status: 'OFF', current_product: 'N/A', temp: '25°C', ph: '7.0' },
    { id: 3, name: 'Bể Mạ Kẽm 03', status: 'ERROR', current_product: 'Trục Động Cơ', temp: '80°C', ph: '2.1' },
    { id: 4, name: 'Bể Rửa Nước 04', status: 'ON', current_product: 'Ốc M8', temp: '30°C', ph: '6.8' }
  ]);

  const [production] = useState({ plan: 5000, actual: 3250, product: 'Ốc M8' });

  const [plans] = useState([
    { id: 1, product: 'Ốc M8', target: 5000, actual: 3250, start: '07:00 13/04', end: '16:00 13/04', status: 'RUNNING' },
    { id: 2, product: 'Trục Động Cơ', target: 1200, actual: 0, start: '13:00 13/04', end: '18:00 13/04', status: 'PENDING' },
    { id: 3, product: 'Bulong Liền Cốt', target: 3000, actual: 3000, start: '07:00 12/04', end: '16:00 12/04', status: 'COMPLETED' }
  ]);

  const [incidents] = useState([
    { id: 1, tank: 'Bể Mạ Kẽm 03', type: 'LOW_LIQUID', desc: 'Mực dung dịch kẽm dưới mức tiêu chuẩn 20%', time: '10:45 13/04', status: 'UNRESOLVED' },
    { id: 2, tank: 'Bể Mạ Niken 01', type: 'ELECTRICAL', desc: 'Mất điện áp tạm thời', time: '08:12 13/04', status: 'RESOLVED' }
  ]);

  const renderOverview = () => (
    <div className="tab-content">
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
      <h2 className="section-title" style={{marginTop: '32px'}}>Trạng Thái Bể Mạ & Thiết Bị (Live)</h2>
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
          </div>
        ))}
      </section>
    </div>
  );

  const renderTanks = () => (
    <div className="tab-content">
      <h2 className="section-title">Danh Sách Bể Mạ Chi Tiết</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Tên Bể</th>
            <th>Trạng Thái</th>
            <th>Mã Hàng Đang Chạy</th>
            <th>Nhiệt Độ (Thực tế vs Chuẩn)</th>
            <th>Nồng Độ pH (Thực tế vs Chuẩn)</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {tanks.map(tank => (
            <tr key={tank.id}>
              <td style={{fontWeight: 600}}>{tank.name}</td>
              <td><span className={`status-badge ${tank.status}`}>{tank.status}</span></td>
              <td>{tank.current_product}</td>
              <td>{tank.temp} / <span style={{color: 'var(--text-secondary)'}}>50°C</span></td>
              <td>{tank.ph} / <span style={{color: 'var(--text-secondary)'}}>4.5</span></td>
              <td><button className="btn-sm">Cấu Hình</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPlans = () => (
    <div className="tab-content">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
         <h2 className="section-title">Kế Hoạch Sản Xuất Từ YDKV</h2>
         <button className="btn-primary">+ Thêm Kế Hoạch Ca Mới</button>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Mã Hàng</th>
            <th>Mục Tiêu YDKV</th>
            <th>Thực Tế JIG Đã Đạt</th>
            <th>Thời Gian Bắt Đầu</th>
            <th>Thời Gian Dự Kiến Kết Thúc</th>
            <th>Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          {plans.map(p => (
            <tr key={p.id}>
              <td style={{fontWeight: 600, color: 'var(--accent-color)'}}>{p.product}</td>
              <td>{p.target}</td>
              <td style={{fontWeight: 700}} className={p.actual >= p.target ? 'highlight-green' : ''}>{p.actual}</td>
              <td>{p.start}</td>
              <td>{p.end}</td>
              <td><span className={`status-badge ${p.status === 'RUNNING' ? 'ON' : p.status === 'COMPLETED' ? 'ON' : 'OFF'}`}>{p.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderIncidents = () => (
    <div className="tab-content">
      <h2 className="section-title">Nhật Ký Cảnh Báo Sự Cố Trên Dây Chuyền</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Thời Gian Báo Lỗi</th>
            <th>Vị Trí (Bể/Máy)</th>
            <th>Dạng Lỗi</th>
            <th>Mô Tả Lỗi</th>
            <th>Trạng Thái Xử Lý</th>
            <th>Chốt Xử Lý</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map(inc => (
            <tr key={inc.id}>
              <td>{inc.time}</td>
              <td style={{fontWeight: 600}}>{inc.tank}</td>
              <td><span className="badge-warning">{inc.type}</span></td>
              <td>{inc.desc}</td>
              <td><span className={`status-badge ${inc.status === 'UNRESOLVED' ? 'ERROR' : 'ON'}`}>{inc.status === 'UNRESOLVED' ? 'CHƯA SỬA' : 'ĐÃ KHẮC PHỤC'}</span></td>
              <td>
                {inc.status === 'UNRESOLVED' && <button className="btn-sm btn-resolve">Đã Sửa Xong</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'tanks': return renderTanks();
      case 'plans': return renderPlans();
      case 'incidents': return renderIncidents();
      default: return renderOverview();
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <h2>PES <span>Pro</span></h2>
        </div>
        <nav className="nav-menu">
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <span className="icon">📊</span> Tổng quan
          </button>
          <button className={`nav-item ${activeTab === 'tanks' ? 'active' : ''}`} onClick={() => setActiveTab('tanks')}>
            <span className="icon">🏭</span> Giám sát Bể & Thiết bị
          </button>
          <button className={`nav-item ${activeTab === 'plans' ? 'active' : ''}`} onClick={() => setActiveTab('plans')}>
            <span className="icon">📋</span> Kế hoạch (YDKV)
          </button>
          <button className={`nav-item ${activeTab === 'incidents' ? 'active' : ''}`} onClick={() => setActiveTab('incidents')}>
            <span className="icon">⚙️</span> Lịch sử Sự cố
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div>
            <h1>{activeTab === 'overview' ? 'Dashboard Giám Sát Thời Gian Thực' : activeTab === 'tanks' ? 'Hồ Sơ Cụm Bể Mạ' : activeTab === 'plans' ? 'Điều Phối Kế Hoạch Sản Xuất' : 'Ghi Nhận Bảo Trì'}</h1>
            <p className="subtitle">Hệ thống Điều hành Mạ công nghiệp (RPM)</p>
          </div>
          <div className="user-profile">
            <div className="avatar">AD</div>
            <span>Admin</span>
          </div>
        </header>

        {renderContent()}

      </main>
    </div>
  );
}

export default App;
