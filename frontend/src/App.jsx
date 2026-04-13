import React, { useState } from 'react';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  // --- DASHBOARD DATA ---
  const [dashboardCards] = useState([
    { id: 1, product: 'SP-01', progress: 92, status: 'ĐANG HOẠT ĐỘNG', tank: 'Bể 1', actual: 2300, target: 2500, timeIn: '17:05', timeEst: '20h05 - 20h25' },
    { id: 2, product: 'SP-02', progress: 67, status: 'ĐANG HOẠT ĐỘNG', tank: 'Bể 2', actual: 1000, target: 1500, timeIn: '17:05', timeEst: '21h17 - 21h37' },
    { id: 3, product: 'SP-10', progress: 61, status: 'ĐANG HOẠT ĐỘNG', tank: 'Bể 3', actual: 1100, target: 1800, timeIn: '17:05', timeEst: '21h41 - 22h01' },
    { id: 4, product: 'SP-04', progress: 32, status: 'ĐANG HOẠT ĐỘNG', tank: 'Bể 4', actual: 700, target: 2200, timeIn: '17:05', timeEst: '02h04 - 02h24' },
    { id: 5, product: 'SS-07', progress: 78, status: 'ĐANG HOẠT ĐỘNG', tank: 'Bể 5', actual: 1800, target: 2300, timeIn: '17:05', timeEst: '20h38 - 20h58' },
    { id: 6, product: 'SP-05', progress: 67, status: 'ĐANG HOẠT ĐỘNG', tank: 'Bể 6', actual: 800, target: 1200, timeIn: '17:05', timeEst: '21h17 - 21h37' },
  ]);

  // --- TANKS DATA ---
  const [tanks, setTanks] = useState([
    { id: 1, name: 'Bể 1', status: 'ON', product: 'SP-01', actual: { revA: 150.86, revV: 11.64, revT: '', fwd1A: 220.17, fwd1V: 11.17, fwd1T: '', fwd2A: 279.68, fwd2V: 11.1, fwd2T: '', temp: 52 }, setting: { revA: 150, revV: 12, revT: 120, fwd1A: 220, fwd1V: 12, fwd1T: 45, fwd2A: 280, fwd2V: 12, fwd2T: 120, temp: 52 } },
    { id: 2, name: 'Bể 2', status: 'ON', product: 'SP-02', actual: { revA: 119.27, revV: 9.44, revT: '', fwd1A: 200.55, fwd1V: 9.78, fwd1T: '', fwd2A: 199.41, fwd2V: 12.38, fwd2T: '', temp: 55 }, setting: { revA: 120, revV: 10, revT: 110, fwd1A: 200, fwd1V: 10, fwd1T: 45, fwd2A: 200, fwd2V: 12, fwd2T: 120, temp: 55 } },
    { id: 3, name: 'Bể 3', status: 'ON', product: 'SP-10', actual: { revA: 150.77, revV: 12.89, revT: '', fwd1A: 219.18, fwd1V: 12.84, fwd1T: '', fwd2A: 280.09, fwd2V: 12.47, fwd2T: '', temp: 48 }, setting: { revA: 150, revV: 12, revT: 450, fwd1A: 220, fwd1V: 12, fwd1T: 60, fwd2A: 280, fwd2V: 12, fwd2T: 90, temp: 48 } },
    { id: 7, name: 'Bể 7', status: 'OFF', product: '', actual: { revA: '', revV: '', revT: '', fwd1A: '', fwd1V: '', fwd1T: '', fwd2A: '', fwd2V: '', fwd2T: '', temp: '' }, setting: { revA: '', revV: '', revT: '', fwd1A: '', fwd1V: '', fwd1T: '', fwd2A: '', fwd2V: '', fwd2T: '', temp: '' } }
  ]);

  // --- PRODUCTS DATA ---
  const [products, setProducts] = useState([
    { id: 'SP-01', code: 'SP-01', volume: 2500, temp: 52, revA: 150, revV: 12, revT: 120, fwd1A: 220, fwd1V: 12, fwd1T: 45, fwd2A: 280, fwd2V: 12, fwd2T: 120, updated: '16h00, 11/04/2026' },
    { id: 'SP-02', code: 'SP-02', volume: 1500, temp: 55, revA: 120, revV: 10, revT: 110, fwd1A: 200, fwd1V: 10, fwd1T: 45, fwd2A: 200, fwd2V: 12, fwd2T: 120, updated: '16h00, 11/04/2026' }
  ]);

  const [modalType, setModalType] = useState('NONE'); 
  const [editingTank, setEditingTank] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const productsList = ['SP-01', 'SP-02', 'SP-03', 'SP-04', 'SP-05', 'AB-06', 'SS-07', 'PP-08', 'SP-09', 'SP-10'];

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
                    <p>GIỜ VÀO</p>
                    <b>{card.timeIn}</b>
                  </div>
                </div>
                <div className="time-block">
                  <span className="icon">⏱️</span>
                  <div className="time-text">
                    <p>DỰ KIẾN</p>
                    <b>{card.timeEst}</b>
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

  const renderProducts = () => (
    <div className="tab-content full-width">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
         <div className="search-bar">
             <span style={{color: '#9ca3af', marginRight: '8px'}}>🔍</span>
             <input type="text" placeholder="Tìm kiếm theo mã sp" className="search-input" />
         </div>
         <button className="btn-primary premium-hover" onClick={() => {
           setEditingProduct({ id: null, code: '', volume: '', temp: '', revA: '', revV: '', revT: '', fwd1A: '', fwd1V: '', fwd1T: '', fwd2A: '', fwd2V: '', fwd2T: '' });
           setModalType('PRODUCT');
         }}>+ THÊM MỚI</button>
      </div>

      <div className="complex-table-wrapper premium-shadow">
        <table className="complex-table" style={{minWidth: '1200px'}}>
          <thead>
            <tr>
              <th rowSpan="2" style={{width: '90px'}}>MÃ SP</th>
              <th rowSpan="2" style={{width: '90px'}}>SẢN LƯỢNG</th>
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
                <td style={{fontWeight: 600}}>{p.volume}</td>
                <td>{p.revA}</td><td>{p.revV}</td><td>{p.revT}</td>
                <td>{p.fwd1A}</td><td>{p.fwd1V}</td><td>{p.fwd1T}</td>
                <td>{p.fwd2A}</td><td>{p.fwd2V}</td><td>{p.fwd2T}</td>
                <td style={{fontWeight: 600, color: '#f59e0b'}}>{p.temp}</td>
                <td style={{fontSize: '12px', color: 'var(--text-secondary)'}}>{p.updated}</td>
                <td>
                  <button className="icon-btn-edit" onClick={() => {
                    setEditingProduct({...p}); setModalType('PRODUCT');
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
                  <td rowSpan="2" className="tank-name">{tank.name}</td>
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
           {activeTab === 'tanks' && renderTanks()}
           {activeTab === 'products' && renderProducts()}
           {activeTab === 'reports' && <div className="tab-content"><h2>Báo cáo đang phát triển</h2></div>}
        </div>
      </main>

      {modalType === 'PRODUCT' && (
        <div className="modal-overlay">
          <div className="modal-container" style={{width: '740px'}}>
            <div className="modal-header">
              <h3>{editingProduct.id ? 'CHỈNH SỬA SẢN PHẨM' : 'THÊM MỚI SẢN PHẨM'}</h3>
              <button className="close-btn" onClick={() => setModalType('NONE')}>×</button>
            </div>
            <div className="modal-body" style={{padding: '24px 32px'}}>
               {/* Same robust inputs here for form row */}
               <div className="form-row-3" style={{marginBottom: '24px'}}>
                <div className="form-group">
                  <label>MÃ SP</label>
                  <input type="text" value={editingProduct.code} onChange={e=>setEditingProduct({...editingProduct, code: e.target.value})} placeholder="VD: SP-001" className="form-input" />
                </div>
                <div className="form-group">
                  <label>SẢN LƯỢNG</label>
                  <input type="number" value={editingProduct.volume} onChange={e=>setEditingProduct({...editingProduct, volume: e.target.value})} placeholder="0" className="form-input" />
                </div>
                <div className="form-group">
                  <label>NHIỆT ĐỘ (°C)</label>
                  <input type="number" value={editingProduct.temp} onChange={e=>setEditingProduct({...editingProduct, temp: e.target.value})} placeholder="0" className="form-input" />
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
              <button className="btn-modal-save premium-hover" onClick={() => setModalType('NONE')}>💾 LƯU THÔNG TIN</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
