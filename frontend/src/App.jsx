import React, { useState } from 'react';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('reports'); // Highlight default to see changes immediately

  // --- DASHBOARD DATA ---
  const [dashboardCards] = useState([
    { id: 1, product: 'SP-01', progress: 92, status: 'ĐANG HOẠT ĐỘNG', tank: 'Bể 1', actual: 2300, target: 2500, timeIn: '17:05', timeEst: '20h05 - 20h25' },
    { id: 2, product: 'SP-02', progress: 67, status: 'ĐANG HOẠT ĐỘNG', tank: 'Bể 2', actual: 1000, target: 1500, timeIn: '17:05', timeEst: '21h17 - 21h37' },
    { id: 3, product: 'SP-10', progress: 61, status: 'ĐANG HOẠT ĐỘNG', tank: 'Bể 3', actual: 1100, target: 1800, timeIn: '17:05', timeEst: '21h41 - 22h01' },
    { id: 4, product: 'SP-04', progress: 32, status: 'ĐANG HOẠT ĐỘNG', tank: 'Bể 4', actual: 700, target: 2200, timeIn: '17:05', timeEst: '02h04 - 02h24' },
    { id: 5, product: 'SS-07', progress: 78, status: 'ĐANG HOẠT ĐỘNG', tank: 'Bể 5', actual: 1800, target: 2300, timeIn: '17:05', timeEst: '20h38 - 20h58' },
    { id: 6, product: 'SP-05', progress: 67, status: 'ĐANG HOẠT ĐỘNG', tank: 'Bể 6', actual: 800, target: 1200, timeIn: '17:05', timeEst: '21h17 - 21h37' },
  ]);

  // --- TANKS & PRODUCTS DATA ---
  const [tanks, setTanks] = useState([
    { id: 1, name: 'Bể 1', status: 'ON', product: 'SP-01', actual: { revA: 150.86, revV: 11.64, revT: '', fwd1A: 220.17, fwd1V: 11.17, fwd1T: '', fwd2A: 279.68, fwd2V: 11.1, fwd2T: '', temp: 52 }, setting: { revA: 150, revV: 12, revT: 120, fwd1A: 220, fwd1V: 12, fwd1T: 45, fwd2A: 280, fwd2V: 12, fwd2T: 120, temp: 52 } },
    { id: 2, name: 'Bể 2', status: 'ON', product: 'SP-02', actual: { revA: 119.27, revV: 9.44, revT: '', fwd1A: 200.55, fwd1V: 9.78, fwd1T: '', fwd2A: 199.41, fwd2V: 12.38, fwd2T: '', temp: 55 }, setting: { revA: 120, revV: 10, revT: 110, fwd1A: 200, fwd1V: 10, fwd1T: 45, fwd2A: 200, fwd2V: 12, fwd2T: 120, temp: 55 } },
    { id: 3, name: 'Bể 3', status: 'ON', product: 'SP-10', actual: { revA: 150.77, revV: 12.89, revT: '', fwd1A: 219.18, fwd1V: 12.84, fwd1T: '', fwd2A: 280.09, fwd2V: 12.47, fwd2T: '', temp: 48 }, setting: { revA: 150, revV: 12, revT: 450, fwd1A: 220, fwd1V: 12, fwd1T: 60, fwd2A: 280, fwd2V: 12, fwd2T: 90, temp: 48 } },
  ]);

  const [products, setProducts] = useState([
    { id: 'SP-01', code: 'SP-01', volume: 2500, temp: 52, revA: 150, revV: 12, revT: 120, fwd1A: 220, fwd1V: 12, fwd1T: 45, fwd2A: 280, fwd2V: 12, fwd2T: 120, updated: '16h00, 11/04/2026' }
  ]);
  const productsList = ['SP-01', 'SP-02', 'SP-03', 'SP-04', 'SP-05', 'AB-06', 'SS-07', 'PP-08', 'SP-09', 'SP-10'];

  // --- REPORT DATA ---
  const [reportTab, setReportTab] = useState('performance');
  
  const [performanceReport] = useState([
    { tank: 'Bể 1', totalTime: 24, runTime: 21.5, currentProduct: 'SP-01', volume: '2300 / 2500' },
    { tank: 'Bể 2', totalTime: 24, runTime: 18.0, currentProduct: 'SP-02', volume: '1000 / 1500' },
    { tank: 'Bể 3', totalTime: 24, runTime: 22.0, currentProduct: 'SP-10', volume: '1100 / 1800' },
    { tank: 'Bể 4', totalTime: 24, runTime: 8.5,  currentProduct: 'SP-04', volume: '700 / 2200' },
    { tank: 'Bể 5', totalTime: 24, runTime: 23.1, currentProduct: 'SS-07', volume: '1800 / 2300' }
  ]);

  const [activityLogs] = useState([
    { id: 101, time: '17:05 13/04', tank: 'Bể 1', product: 'SP-01', action: 'BẬT MÁY (ON)', detail: 'Bắt đầu ca sản xuất tối' },
    { id: 102, time: '17:15 13/04', tank: 'Bể 1', product: 'SP-01', action: 'HÀNG VÀO (IN)', detail: 'Đưa lô hàng mã SP-01 vào bể mạ' },
    { id: 103, time: '20:05 13/04', tank: 'Bể 1', product: 'SP-01', action: 'HÀNG RA (OUT)', detail: 'Hoàn thành mạ. Bắt đầu nghiệm thu.' },
    { id: 104, time: '21:30 13/04', tank: 'Bể 2', product: '-', action: 'TẮT MÁY (OFF)', detail: 'Bảo trì thay dung dịch hóa chất' }
  ]);

  const [incidentLogs] = useState([
    { id: 1, time: '14:20 13/04', tank: 'Bể 3', type: 'CẢNH BÁO', title: 'Sụt Áp Đột Ngột', desc: 'Dòng điện ngược thay đổi <10V ngoài chuẩn.', fixTime: '15 phút', status: 'ĐÃ XỬ LÝ' },
    { id: 2, time: '09:10 13/04', tank: 'Bể 2', type: 'NGUY HIỂM', title: 'Quá Nhiệt Nồng Độ', desc: 'Nhiệt độ bể vọt mức >60°C.', fixTime: '45 phút', status: 'ĐÃ XỬ LÝ' },
    { id: 3, time: '16:00 13/04', tank: 'Bể 5', type: 'LỖI THIẾT BỊ', title: 'Bơm Nước Chết', desc: 'Áp lực bơm không duy trì cường độ.', fixTime: '-', status: 'ĐANG CHỜ SỬA' }
  ]);

  // Modals
  const [modalType, setModalType] = useState('NONE'); 
  const [editingTank, setEditingTank] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const getProgressColor = (pct) => {
    if (pct >= 70) return 'success';
    if (pct >= 35) return 'info';
    return 'warning';
  };

  const renderOverview = () => (
    <div className="tab-content" style={{position: 'relative'}}>
      <div className="dashboard-cards-grid">
        {dashboardCards.map(card => {
          const colorType = getProgressColor(card.progress);
          return (
            <div className="dash-card premium-hover" key={card.id}>
              <div className="dash-card-header">
                <div>
                  <h3>{card.product}</h3>
                  <span className={`status-pill pill-${colorType}`}>{card.status}</span>
                </div>
                <div className="progress-indicator">
                  <span className="lbl">Tiến độ</span>
                  <span className={`pct text-${colorType}`}>{card.progress}%</span>
                </div>
              </div>
              <div className="dash-card-body">
                <p className="tank-lbl">TÊN BỂ</p>
                <p className="tank-val">{card.tank}</p>
                <div className="volume-row">
                  <span>Sản lượng</span>
                  <span className="vol-val">{card.actual} / {card.target}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className={`progress-bar-fill bg-${colorType}`} style={{width: `${(card.actual/card.target)*100}%`}}></div>
                </div>
              </div>
              <div className="dash-card-footer">
                <div className="time-block">
                  <span className="icon">➡️</span>
                  <div className="time-text">
                    <p>GIỜ VÀO</p><b>{card.timeIn}</b>
                  </div>
                </div>
                <div className="time-block">
                  <span className="icon">⏱️</span>
                  <div className="time-text">
                    <p>DỰ KIẾN</p><b>{card.timeEst}</b>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="legend-box">
        <h4>CHÚ THÍCH</h4>
        <ul>
          <li><span className="dot bg-warning"></span>Tiến độ: 0-35%</li>
          <li><span className="dot bg-info"></span>Tiến độ: 35-70%</li>
          <li><span className="dot bg-success"></span>Tiến độ: 70-100%</li>
        </ul>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="tab-content full-width">
       <div className="report-tabs-nav">
          <button className={`btn-report ${reportTab === 'performance' ? 'active' : ''}`} onClick={()=>setReportTab('performance')}>⚡ Hiệu Suất Thiết Bị</button>
          <button className={`btn-report ${reportTab === 'activity' ? 'active' : ''}`} onClick={()=>setReportTab('activity')}>⏱ Lịch Sử Vào Ra (Log)</button>
          <button className={`btn-report ${reportTab === 'incident' ? 'active' : ''}`} onClick={()=>setReportTab('incident')}>⚠️ Sổ Ghi Nhận Sự Cố</button>
       </div>

       {reportTab === 'performance' && (
         <div className="premium-card" style={{padding: '24px'}}>
           <h3 style={{marginBottom: '20px', color: 'var(--accent-color)'}}>ĐÁNH GIÁ TRẠNG THÁI HIỆU SUẤT HOẠT ĐỘNG THỂ TÍCH MÁY</h3>
           <div className="complex-table-wrapper premium-shadow">
             <table className="complex-table">
               <thead>
                 <tr>
                   <th>TÊN BỂ / MÁY MẠ</th>
                   <th>THỜI GIAN HOẠT ĐỘNG / TỔNG NGÀY (H)</th>
                   <th>HIỆU SUẤT (OEE - THỜI GIAN)</th>
                   <th>SẢN PHẨM KHỚP ĐANG XẢY RA</th>
                   <th>KHỐI LƯỢNG MỤC TIÊU</th>
                 </tr>
               </thead>
               <tbody>
                 {performanceReport.map((r, i) => {
                   const eff = ((r.runTime / r.totalTime) * 100).toFixed(1);
                   const colorType = getProgressColor(eff);
                   return(
                   <tr key={i} className="premium-tr">
                     <td className="tank-name">{r.tank}</td>
                     <td><strong>{r.runTime}</strong> / {r.totalTime} giờ</td>
                     <td><span className={`text-${colorType}`} style={{fontWeight: 800, fontSize: '18px'}}>{eff}%</span></td>
                     <td style={{fontWeight: 700, color: 'var(--info)'}}>{r.currentProduct}</td>
                     <td style={{fontWeight: 700}}>{r.volume}</td>
                   </tr>
                 )})}
               </tbody>
             </table>
           </div>
         </div>
       )}

       {reportTab === 'activity' && (
         <div className="premium-card" style={{padding: '24px'}}>
           <h3 style={{marginBottom: '20px', color: 'var(--accent-color)'}}>NHẬT KÝ THAO TÁC THEO THỜI GIAN THỰC</h3>
           <div className="complex-table-wrapper premium-shadow">
             <table className="complex-table">
               <thead>
                 <tr>
                   <th>THỜI GIAN NHẬN KHỚP</th>
                   <th>THIẾT BỊ GHI NHẬN</th>
                   <th>LỆNH GIAO TIẾP</th>
                   <th>MÃ HÀNG TƯƠNG TÁC</th>
                   <th>CHI TIẾT MÔ TẢ GIAO DIỆN HỘP MÁY</th>
                 </tr>
               </thead>
               <tbody>
                 {activityLogs.map((log) => (
                   <tr key={log.id} className="premium-tr">
                     <td style={{color: 'var(--text-secondary)', fontWeight: 600}}>{log.time}</td>
                     <td className="tank-name">{log.tank}</td>
                     <td>
                        <span className={`status-pill ${log.action.includes('ON')||log.action.includes('IN') ? 'pill-success' : 'pill-warning'}`}>
                          {log.action}
                        </span>
                     </td>
                     <td style={{fontWeight: 700}}>{log.product}</td>
                     <td style={{textAlign: 'left'}}>{log.detail}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
       )}

       {reportTab === 'incident' && (
         <div className="premium-card" style={{padding: '24px'}}>
           <h3 style={{marginBottom: '20px', color: 'var(--accent-color)'}}>TRUY VẾT & QUẢN LÝ LỖI SỰ CỐ DÂY CHUYỀN</h3>
           <div className="complex-table-wrapper premium-shadow">
             <table className="complex-table">
               <thead>
                 <tr>
                   <th>THỜI GIAN NGẮT LỖI</th>
                   <th>VỊ TRÍ BỂ</th>
                   <th>LOẠI SỰ CỐ</th>
                   <th>VẤN ĐỀ GẶP PHẢI</th>
                   <th>THỜI GIAN KHẮC PHỤC</th>
                   <th>TRẠNG THÁI CUỐI</th>
                 </tr>
               </thead>
               <tbody>
                 {incidentLogs.map((inc) => (
                   <tr key={inc.id} className="premium-tr">
                     <td style={{color: 'var(--text-secondary)', fontWeight: 600}}>{inc.time}</td>
                     <td className="tank-name">{inc.tank}</td>
                     <td><span className={`status-pill ${inc.type==='NGUY HIỂM'?'pill-warning':'pill-info'}`} style={{background: inc.type==='NGUY HIỂM'?'#fef2f2':'#fef3c7', color: inc.type==='NGUY HIỂM'?'#dc2626':'#d97706'}}>{inc.type}</span></td>
                     <td style={{textAlign: 'left'}}><strong>{inc.title}</strong>: {inc.desc}</td>
                     <td style={{fontWeight: 600}}>{inc.fixTime}</td>
                     <td><span className="status-pill" style={{background: inc.status==='ĐÃ XỬ LÝ'?'#d1fae5':'#fef2f2', color: inc.status==='ĐÃ XỬ LÝ'?'#059669':'#dc2626'}}>{inc.status}</span></td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
       )}
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div>
          <div className="logo"><h2>TÊN CÔNG TY</h2></div>
          <nav className="nav-menu">
            <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <span className="icon-wrapper">⚏</span> BẢNG TIN
            </button>
            <button className={`nav-item ${activeTab === 'tanks' ? 'active' : ''}`} onClick={() => setActiveTab('tanks')}>
              <span className="icon-wrapper">💧</span> BỂ MẠ
            </button>
            <button className={`nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
              <span className="icon-wrapper">⚙️</span> MÃ SẢN PHẨM
            </button>
            <button className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
              <span className="icon-wrapper">📋</span> BÁO CÁO
            </button>
          </nav>
        </div>
        
        <div className="sidebar-footer">
           <button className="nav-item"><span className="icon-wrapper">👤</span> DÂY CHUYỀN - 01</button>
           <button className="nav-item"><span className="icon-wrapper">❓</span> HỖ TRỢ</button>
           <button className="nav-item logout-btn"><span className="icon-wrapper">🚪</span> ĐĂNG XUẤT</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="top-header">
          <div></div>
          <div className="user-profile">
            <span className="lang-selector">Tiếng Việt ▽</span>
            <div className="avatar">AD</div>
            <span className="user-name">Admin</span>
          </div>
        </header>

        <div className="content-scrollable">
           {activeTab === 'overview' && renderOverview()}
           {activeTab === 'tanks' && <div className="tab-content"><h2>Vui lòng xem mã gốc của Bể Mạ (được bảo lưu)</h2></div>}
           {activeTab === 'products' && <div className="tab-content"><h2>Vui lòng xem mã gốc của Mã SP (được bảo lưu)</h2></div>}
           {activeTab === 'reports' && renderReports()}
        </div>
      </main>
    </div>
  );
}

export default App;
