import React, { useState } from 'react';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  // --- DASHBOARD DATA ---
  const [dashboardCards, setDashboardCards] = useState([
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

  const [products, setProducts] = useState([]);
  const [productsList, setProductsList] = useState(['SP-01', 'SP-02', 'SP-03', 'SP-04', 'SP-05', 'AB-06', 'SS-07', 'PP-08', 'SP-09', 'SP-10']);
  const [dbLogs, setDbLogs] = useState([]);

  const refreshProducts = () => {
    fetch(`${API_URL}/api/products`).then(r => r.json()).then(d => {
      if (d.success) {
        setProducts(d.data.map(p => ({
          id: p.product_code,
          code: p.product_code,
          name: p.product_name,
          volume: p.actual_quantity,
          target: p.target_quantity,
          updated: new Date(p.created_at).toLocaleString(),
          ...(p.standard_conditions || {})
        })));
        setProductsList(d.data.map(p => p.product_code));
      }
    }).catch(() => {});
  };

  React.useEffect(() => {
    refreshProducts();

    fetch(`${API_URL}/api/logs`).then(r => r.json()).then(d => {
      if (d.success) setDbLogs(d.data);
    }).catch(() => {});

    // Refresh logs every 5s
    const logInterval = setInterval(() => {
      fetch(`${API_URL}/api/logs`).then(r => r.json()).then(d => {
        if (d.success) setDbLogs(d.data);
      }).catch(() => {});
    }, 5000);
    return () => clearInterval(logInterval);
  }, []);

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
  const [editingPlc, setEditingPlc] = useState(null);

  // PLC Config state
  const [plcConfigs, setPlcConfigs] = useState([
    { id: 1, name: 'PLC-01', tank: 'Bể 1', ip: '192.168.1.101', port: 502, product: 'SP-01', status: 'connected' },
    { id: 2, name: 'PLC-02', tank: 'Bể 2', ip: '192.168.1.102', port: 502, product: 'SP-02', status: 'connected' },
    { id: 3, name: 'PLC-03', tank: 'Bể 3', ip: '192.168.1.103', port: 502, product: 'SP-10', status: 'connected' },
    { id: 4, name: 'PLC-04', tank: 'Bể 4', ip: '192.168.1.104', port: 502, product: 'SP-04', status: 'connected' },
    { id: 5, name: 'PLC-05', tank: 'Bể 5', ip: '192.168.1.105', port: 502, product: 'SS-07', status: 'connected' },
    { id: 6, name: 'PLC-06', tank: 'Bể 6', ip: '192.168.1.106', port: 502, product: 'SP-05', status: 'connected' },
  ]);
  const [lastPulse, setLastPulse] = useState({});

  const getProgressColor = (pct) => {
    if (pct >= 70) return 'success';
    if (pct >= 35) return 'info';
    return 'warning';
  };

  // --- LẮNG NGHE DỮ LIỆU TỪ PLC THEO THỜI GIAN THỰC ---
  React.useEffect(() => {
    const sse = new EventSource(`${API_URL}/api/stream`);
    
    sse.onmessage = (event) => {
       try {
          const data = JSON.parse(event.data);
          const { tanks, dashboard, plcConfigs: cfgs } = data;
          if (tanks && tanks.length > 0) setTanks(tanks);
          if (dashboard && dashboard.length > 0) {
              setDashboardCards(dashboard);
              setProducts(prev => {
                  if (prev.length === 0) return prev;
                  return prev.map(p => {
                      const activeDash = dashboard.find(d => d.product === p.code);
                      if (activeDash && activeDash.actual !== p.volume) {
                          return { ...p, volume: activeDash.actual, target: activeDash.target };
                      }
                      return p;
                  });
              });
          }
          if (cfgs) setPlcConfigs(cfgs);
          // Track last pulse time per plcId
          if (tanks) {
            const now = Date.now();
            const pulse = {};
            tanks.forEach(t => { pulse[t.id] = now; });
            setLastPulse(prev => ({ ...prev, ...pulse }));
          }
       } catch (err) {
          console.error("Lỗi đọc dữ liệu PLC:", err);
       }
    };

    sse.onerror = (err) => {
       // Kệ lỗi kết nối vì backend có thể chưa bật
    };

    return () => sse.close();
  }, []);

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
                  <div className={`progress-bar-fill bg-${colorType}`} style={{width: `${card.cycleProgress || 0}%`, transition: 'width 1s linear'}}></div>
                </div>
                <div style={{fontSize: '11px', textAlign: 'right', marginTop: '4px', fontWeight: 600, color: 'var(--text-secondary)'}}>Chu kỳ mẻ: {card.cycleProgress || 0}%</div>
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
                 {dbLogs.map((log) => (
                   <tr key={log.id} className="premium-tr">
                     <td style={{color: 'var(--text-secondary)', fontWeight: 600}}>{new Date(log.created_at).toLocaleString()}</td>
                     <td className="tank-name">{log.tank_name}</td>
                     <td>
                        <span className={`status-pill ${log.event_type.includes('COMPLETED') ? 'pill-success' : 'pill-warning'}`}>
                          {log.event_type === 'CYCLE_COMPLETED' ? 'HOÀN THÀNH 100%' : 'ĐỔI MÃ SP'}
                        </span>
                     </td>
                     <td style={{fontWeight: 700}}>{log.product_code}</td>
                     <td style={{textAlign: 'left'}}>{log.message}</td>
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

  const renderProducts = () => (
    <div className="tab-content full-width">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
         <div className="search-bar">
             <span style={{color: '#9ca3af', marginRight: '8px'}}>🔍</span>
             <input type="text" placeholder="Tìm kiếm theo mã sp" className="search-input" />
         </div>
         <button className="btn-primary premium-hover" onClick={() => {
           setEditingProduct({ id: null, code: '', name: '', target: '', volume: '', temp: '', revA: '', revV: '', revT: '', fwd1A: '', fwd1V: '', fwd1T: '', fwd2A: '', fwd2V: '', fwd2T: '' });
           setModalType('PRODUCT');
         }}>+ THÊM MỚI</button>
      </div>

      <div className="complex-table-wrapper premium-shadow">
        <table className="complex-table" style={{minWidth: '1200px'}}>
          <thead>
            <tr>
              <th rowSpan="2" style={{width: '90px'}}>MÃ SP</th>
              <th rowSpan="2" style={{width: '130px'}}>TÊN SẢN PHẨM</th>
              <th rowSpan="2" style={{width: '140px'}}>SẢN LƯỢNG (Thực/Mục tiêu)</th>
              <th colSpan="3">MẠ NGƯỢC</th>
              <th colSpan="3">MẠ THUẬN 1</th>
              <th colSpan="3">MẠ THUẬN 2</th>
              <th rowSpan="2" style={{width: '90px'}}>NHIỆT ĐỘ(°C)</th>
              <th rowSpan="2" style={{width: '140px'}}>THỜI GIAN CẬP NHẬT</th>
              <th rowSpan="2" style={{width: '100px'}}>CHỈNH SỬA</th>
            </tr>
            <tr>
              <th>Dòng điện(A)</th><th>Điện áp(V)</th><th>Thời gian(Phút)</th>
              <th>Dòng điện(A)</th><th>Điện áp(V)</th><th>Thời gian(Phút)</th>
              <th>Dòng điện(A)</th><th>Điện áp(V)</th><th>Thời gian(Phút)</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="actual-row premium-tr">
                <td className="tank-name" style={{color: 'var(--accent-color)'}}>{p.code}</td>
                <td style={{fontSize:'12px', color: 'var(--text-secondary)'}}>{p.name || '-'}</td>
                <td style={{fontWeight: 600}}>{p.volume} / {p.target}</td>
                <td>{p.revA}</td><td>{p.revV}</td><td>{p.revT}</td>
                <td>{p.fwd1A}</td><td>{p.fwd1V}</td><td>{p.fwd1T}</td>
                <td>{p.fwd2A}</td><td>{p.fwd2V}</td><td>{p.fwd2T}</td>
                <td style={{fontWeight: 600, color: '#f59e0b'}}>{p.temp}</td>
                <td style={{fontSize: '12px', color: 'var(--text-secondary)'}}>{p.updated}</td>
                <td>
                  <button className="icon-btn-edit" onClick={() => {
                    setEditingProduct({ ...p, ...p.standard_conditions });
                    setModalType('PRODUCT');
                  }}>📝</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTanks = () => (
    <div className="tab-content full-width">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
         <div className="search-bar">
             <span style={{color: '#9ca3af', marginRight: '8px'}}>🔍</span>
             <input type="text" placeholder="Tìm kiếm theo mã sp" className="search-input" />
         </div>
      </div>
      <div className="complex-table-wrapper premium-shadow">
        <table className="complex-table">
          <thead>
            <tr>
              <th rowSpan="2">BỂ MẠ</th>
              <th rowSpan="2">CHỈNH LƯU</th>
              <th rowSpan="2">MÃ SP</th>
              <th rowSpan="2" style={{width: '60px'}}></th> 
              <th colSpan="3">MẠ NGƯỢC</th>
              <th colSpan="3">MẠ THUẬN 1</th>
              <th colSpan="3">MẠ THUẬN 2</th>
              <th rowSpan="2">NHIỆT ĐỘ(°C)</th>
            </tr>
            <tr>
              <th>Dòng điện(A)</th><th>Điện áp(V)</th><th>Thời gian(Phút)</th>
              <th>Dòng điện(A)</th><th>Điện áp(V)</th><th>Thời gian(Phút)</th>
              <th>Dòng điện(A)</th><th>Điện áp(V)</th><th>Thời gian(Phút)</th>
            </tr>
          </thead>
          <tbody>
            {tanks.map(tank => (
              <React.Fragment key={tank.id}>
                <tr className="actual-row premium-tr">
                  <td rowSpan="2" className="tank-name" onClick={() => { setEditingTank({...tank}); setModalType('TANK'); }} style={{cursor:'pointer', color:'var(--accent-color)', textDecoration:'underline'}}>{tank.name}</td>
                  <td rowSpan="2" className="tank-status"><span className={tank.status === 'ON' ? 'text-success' : 'text-muted'}>{tank.status}</span></td>
                  <td rowSpan="2" className="tank-product">{tank.product}</td>
                  <td className="row-label">Thực tế</td>
                  <td>{tank.actual.revA}</td><td>{tank.actual.revV}</td><td>{tank.actual.revT}</td>
                  <td>{tank.actual.fwd1A}</td><td>{tank.actual.fwd1V}</td><td>{tank.actual.fwd1T}</td>
                  <td>{tank.actual.fwd2A}</td><td>{tank.actual.fwd2V}</td><td>{tank.actual.fwd2T}</td>
                  <td style={{fontWeight: 700}}>{tank.actual.temp}</td>
                </tr>
                <tr className="setting-row">
                  <td className="row-label">Cài đặt</td>
                  <td>{tank.setting.revA}</td><td>{tank.setting.revV}</td><td>{tank.setting.revT}</td>
                  <td>{tank.setting.fwd1A}</td><td>{tank.setting.fwd1V}</td><td>{tank.setting.fwd1T}</td>
                  <td>{tank.setting.fwd2A}</td><td>{tank.setting.fwd2V}</td><td>{tank.setting.fwd2T}</td>
                  <td>{tank.setting.temp}</td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const togglePlcConnection = (id) => {
    fetch(`${API_URL}/api/plc/configs/${id}/toggle`, { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (data.success) setPlcConfigs(prev => prev.map(p => p.id === id ? data.data : p));
      })
      .catch(() => {
        // Offline mode: toggle locally
        setPlcConfigs(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'connected' ? 'disconnected' : 'connected' } : p));
      });
  };

  const savePlcConfig = (plc) => {
    fetch(`${API_URL}/api/plc/configs/${plc.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plc)
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setPlcConfigs(prev => prev.map(p => p.id === plc.id ? data.data : p));
      })
      .catch(() => {
        setPlcConfigs(prev => prev.map(p => p.id === plc.id ? plc : p));
      })
      .finally(() => setModalType('NONE'));
  };

  const renderPLCConfig = () => {
    const connectedCount = plcConfigs.filter(p => p.status === 'connected').length;
    return (
      <div className="tab-content full-width">
        {/* Header Summary */}
        <div className="plc-summary-bar">
          <div className="plc-stat">
            <span className="plc-stat-num">{plcConfigs.length}</span>
            <span className="plc-stat-lbl">TỔNG PLC</span>
          </div>
          <div className="plc-stat">
            <span className="plc-stat-num text-success">{connectedCount}</span>
            <span className="plc-stat-lbl">KẾT NỐI</span>
          </div>
          <div className="plc-stat">
            <span className="plc-stat-num text-warning">{plcConfigs.length - connectedCount}</span>
            <span className="plc-stat-lbl">NGẮT KẾT NỐI</span>
          </div>
          <div className="plc-stat" style={{marginLeft: 'auto'}}>
            <span className="plc-stat-lbl" style={{fontSize: '12px', color: 'var(--text-secondary)'}}>TỐC ĐỘ TÍN HIỆU</span>
            <span className="plc-stat-num" style={{fontSize: '20px', color: 'var(--info)'}}>1 Hz</span>
          </div>
        </div>

        {/* 6 PLC Cards */}
        <div className="plc-grid">
          {plcConfigs.map(plc => {
            const isConn = plc.status === 'connected';
            const pulsedRecently = lastPulse[plc.id] && (Date.now() - lastPulse[plc.id]) < 3000;
            return (
              <div key={plc.id} className={`plc-card ${isConn ? 'plc-card-on' : 'plc-card-off'}`}>
                {/* Card Header */}
                <div className="plc-card-header">
                  <div className="plc-id-badge">{plc.name}</div>
                  <div className={`plc-signal-dot ${isConn && pulsedRecently ? 'pulsing' : ''}`}
                    style={{background: isConn ? 'var(--success)' : '#d1d5db'}}></div>
                </div>

                {/* Tank Info */}
                <div className="plc-tank-name">{plc.tank}</div>
                <div className="plc-product-badge">{plc.product}</div>

                {/* Connection Details */}
                <div className="plc-conn-info">
                  <div className="plc-conn-row">
                    <span className="plc-conn-lbl">IP ĐỊCH CHỈ</span>
                    <span className="plc-conn-val">{plc.ip}</span>
                  </div>
                  <div className="plc-conn-row">
                    <span className="plc-conn-lbl">MODBUS PORT</span>
                    <span className="plc-conn-val">{plc.port}</span>
                  </div>
                  <div className="plc-conn-row">
                    <span className="plc-conn-lbl">TRẠNG THÁI</span>
                    <span className={`plc-status-text ${isConn ? 'text-success' : 'text-muted'}`}>
                      {isConn ? '● KẾT NỐI' : '● NGẮT'}
                    </span>
                  </div>
                  {isConn && pulsedRecently && (
                    <div className="plc-conn-row">
                      <span className="plc-conn-lbl">TÍN HIỆU GẦN NHẤT</span>
                      <span className="plc-conn-val text-success">✅ Live</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="plc-actions">
                  <button
                    className={`plc-btn-toggle ${isConn ? 'btn-disconnect' : 'btn-connect'}`}
                    onClick={() => togglePlcConnection(plc.id)}
                  >
                    {isConn ? '⏹ NGẮT KẾT NỐI' : '▶ KẾT NỐI'}
                  </button>
                  <button className="plc-btn-edit" onClick={() => { setEditingPlc({...plc}); setModalType('PLC'); }}>
                    ⚙️ CẤU HÌNH
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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
            <button className={`nav-item ${activeTab === 'plc' ? 'active' : ''}`} onClick={() => setActiveTab('plc')}>
              <span className="icon-wrapper">⚡</span> CẤU HÌNH PLC
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
           {activeTab === 'tanks' && renderTanks()}
           {activeTab === 'products' && renderProducts()}
           {activeTab === 'reports' && renderReports()}
           {activeTab === 'plc' && renderPLCConfig()}
        </div>
      </main>

      {/* TANK UPDATE MODAL */}
      {modalType === 'TANK' && (
        <div className="modal-overlay">
          <div className="modal-container" style={{width: '400px'}}>
            <div className="modal-header">
              <h3>Cập nhật mã sản phẩm</h3>
              <button className="close-btn" onClick={() => setModalType('NONE')}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>BỂ MẠ</label>
                  <input type="text" readOnly value={editingTank.name} className="form-input" style={{backgroundColor: '#f3f4f6'}}/>
                </div>
                <div className="form-group">
                  <label>MÃ SP</label>
                  <select value={editingTank.product} onChange={(e) => setEditingTank({...editingTank, product: e.target.value})} className="form-input select-input">
                    <option value="">Chọn mã sản phẩm</option>
                    {productsList.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-save" onClick={async () => {
                if(!editingTank.name) return;
                try {
                  const res = await fetch(`${API_URL}/api/plc/configs/${editingTank.id}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ product: editingTank.product })
                  });
                  const d = await res.json();
                  if (!d.success) alert("Lỗi: " + d.error);
                } catch(e) { console.error(e); }
                setModalType('NONE');
              }}>💾 LƯU THÔNG TIN</button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT ADD/EDIT MODAL */}
      {modalType === 'PRODUCT' && (
        <div className="modal-overlay">
          <div className="modal-container" style={{width: '740px'}}>
            <div className="modal-header">
              <h3>{editingProduct.id ? 'CHỈNH SỬA SẢN PHẨM' : 'THÊM MỚI SẢN PHẨM'}</h3>
              <button className="close-btn" onClick={() => setModalType('NONE')}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row-3" style={{marginBottom: '24px'}}>
                <div className="form-group">
                  <label>MÃ SP</label>
                  <input type="text" value={editingProduct.code} onChange={e=>setEditingProduct({...editingProduct, code: e.target.value})} placeholder="VD: SP-001" className="form-input" disabled={!!editingProduct.id} />
                </div>
                <div className="form-group">
                  <label>TÊN SẢN PHẨM</label>
                  <input type="text" value={editingProduct.name || ''} onChange={e=>setEditingProduct({...editingProduct, name: e.target.value})} placeholder="VD: Sản phẩm A" className="form-input" />
                </div>
                <div className="form-group">
                  <label>MỤC TIÊU SẢN LƯỢNG</label>
                  <input type="number" value={editingProduct.target || ''} onChange={e=>setEditingProduct({...editingProduct, target: e.target.value})} placeholder="0" className="form-input" />
                </div>
                <div className="form-group">
                  <label>NHIỆT ĐỘ (°C)</label>
                  <input type="number" value={editingProduct.temp || ''} onChange={e=>setEditingProduct({...editingProduct, temp: e.target.value})} placeholder="0" className="form-input" />
                </div>
              </div>

              <div className="form-group-section premium-card">
                <div className="form-group-title"><span className="dot"></span> THÔNG SỐ MẠ NGƯỢC</div>
                <div className="form-row-3">
                  <div className="form-group"><label>DÒNG ĐIỆN</label><input type="number" value={editingProduct.revA} onChange={e=>setEditingProduct({...editingProduct, revA: e.target.value})} className="form-input" /></div>
                  <div className="form-group"><label>ĐIỆN ÁP</label><input type="number" value={editingProduct.revV} onChange={e=>setEditingProduct({...editingProduct, revV: e.target.value})} className="form-input" /></div>
                  <div className="form-group"><label>THỜI GIAN</label><input type="number" value={editingProduct.revT} onChange={e=>setEditingProduct({...editingProduct, revT: e.target.value})} className="form-input" /></div>
                </div>
              </div>

              <div className="form-group-section premium-card">
                <div className="form-group-title"><span className="dot"></span> THÔNG SỐ MẠ THUẬN 1</div>
                <div className="form-row-3">
                  <div className="form-group"><label>DÒNG ĐIỆN</label><input type="number" value={editingProduct.fwd1A} onChange={e=>setEditingProduct({...editingProduct, fwd1A: e.target.value})} className="form-input" /></div>
                  <div className="form-group"><label>ĐIỆN ÁP</label><input type="number" value={editingProduct.fwd1V} onChange={e=>setEditingProduct({...editingProduct, fwd1V: e.target.value})} className="form-input" /></div>
                  <div className="form-group"><label>THỜI GIAN</label><input type="number" value={editingProduct.fwd1T} onChange={e=>setEditingProduct({...editingProduct, fwd1T: e.target.value})} className="form-input" /></div>
                </div>
              </div>

              <div className="form-group-section premium-card">
                <div className="form-group-title"><span className="dot"></span> THÔNG SỐ MẠ THUẬN 2</div>
                <div className="form-row-3">
                  <div className="form-group"><label>DÒNG ĐIỆN</label><input type="number" value={editingProduct.fwd2A} onChange={e=>setEditingProduct({...editingProduct, fwd2A: e.target.value})} className="form-input" /></div>
                  <div className="form-group"><label>ĐIỆN ÁP</label><input type="number" value={editingProduct.fwd2V} onChange={e=>setEditingProduct({...editingProduct, fwd2V: e.target.value})} className="form-input" /></div>
                  <div className="form-group"><label>THỜI GIAN</label><input type="number" value={editingProduct.fwd2T} onChange={e=>setEditingProduct({...editingProduct, fwd2T: e.target.value})} className="form-input" /></div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => setModalType('NONE')}>HUỶ</button>
              <button className="btn-modal-save premium-hover" onClick={async () => {
                if (!editingProduct.code) return alert('Vui lòng nhập Mã SP');
                const body = {
                  product_code: editingProduct.code,
                  product_name: editingProduct.name || editingProduct.code,
                  target_quantity: parseInt(editingProduct.target || editingProduct.volume || 0),
                  standard_conditions: {
                    temp: editingProduct.temp,
                    revA: editingProduct.revA, revV: editingProduct.revV, revT: editingProduct.revT,
                    fwd1A: editingProduct.fwd1A, fwd1V: editingProduct.fwd1V, fwd1T: editingProduct.fwd1T,
                    fwd2A: editingProduct.fwd2A, fwd2V: editingProduct.fwd2V, fwd2T: editingProduct.fwd2T,
                  }
                };
                const isEdit = !!editingProduct.id;
                const url = isEdit ? `${API_URL}/api/products/${editingProduct.code}` : `${API_URL}/api/products`;
                const method = isEdit ? 'PUT' : 'POST';
                try {
                  const res = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
                  const data = await res.json();
                  if (!data.success) { alert(`Lỗi: ${data.error}`); return; }
                  refreshProducts();
                  setModalType('NONE');
                } catch(e) {
                  alert('Không thể kết nối API. Kiểm tra backend.');
                }
              }}>💾 LƯU THÔNG TIN</button>
            </div>
          </div>
        </div>
      )}

      {/* PLC CONFIG EDIT MODAL */}
      {modalType === 'PLC' && editingPlc && (
        <div className="modal-overlay">
          <div className="modal-container" style={{width: '480px'}}>
            <div className="modal-header">
              <h3>CẤU HÌNH {editingPlc.name}</h3>
              <button className="close-btn" onClick={() => setModalType('NONE')}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>TÊN PLC</label>
                  <input type="text" value={editingPlc.name} onChange={e => setEditingPlc({...editingPlc, name: e.target.value})} className="form-input" />
                </div>
                <div className="form-group">
                  <label>BỂ MẠ TƯƠNG ỨNG</label>
                  <input type="text" value={editingPlc.tank} readOnly className="form-input" style={{background:'#f3f4f6'}} />
                </div>
                <div className="form-group">
                  <label>MÃ SẢN PHẨM ĐANG CHẠY</label>
                  <select value={editingPlc.product} onChange={e => setEditingPlc({...editingPlc, product: e.target.value})} className="form-input select-input">
                    {productsList.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group-section premium-card" style={{marginTop: '16px'}}>
                <div className="form-group-title"><span className="dot"></span> KẾT NỐI MODBUS TCP/IP</div>
                <div className="form-row" style={{gap: '16px'}}>
                  <div className="form-group">
                    <label>IP ĐỊCH CHỈ</label>
                    <input type="text" value={editingPlc.ip} onChange={e => setEditingPlc({...editingPlc, ip: e.target.value})} className="form-input" placeholder="192.168.1.101" />
                  </div>
                  <div className="form-group">
                    <label>MODBUS PORT</label>
                    <input type="number" value={editingPlc.port} onChange={e => setEditingPlc({...editingPlc, port: parseInt(e.target.value)})} className="form-input" placeholder="502" />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => setModalType('NONE')}>HỤỸ</button>
              <button className="btn-modal-save premium-hover" onClick={() => savePlcConfig(editingPlc)}>💾 LƯU CẤU HÌNH</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
