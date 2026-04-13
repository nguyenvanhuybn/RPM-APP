import React, { useState } from 'react';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('products');

  // --- TANKS DATA ---
  const [tanks, setTanks] = useState([
    { id: 1, name: 'Bể 1', status: 'ON', product: 'SP-01', 
      actual: { revA: 150.86, revV: 11.64, revT: '', fwd1A: 220.17, fwd1V: 11.17, fwd1T: '', fwd2A: 279.68, fwd2V: 11.1, fwd2T: '', temp: 52 }, 
      setting: { revA: 150, revV: 12, revT: 120, fwd1A: 220, fwd1V: 12, fwd1T: 45, fwd2A: 280, fwd2V: 12, fwd2T: 120, temp: 52 } },
    { id: 2, name: 'Bể 2', status: 'ON', product: 'SP-02', 
      actual: { revA: 119.27, revV: 9.44, revT: '', fwd1A: 200.55, fwd1V: 9.78, fwd1T: '', fwd2A: 199.41, fwd2V: 12.38, fwd2T: '', temp: 55 }, 
      setting: { revA: 120, revV: 10, revT: 110, fwd1A: 200, fwd1V: 10, fwd1T: 45, fwd2A: 200, fwd2V: 12, fwd2T: 120, temp: 55 } },
    { id: 3, name: 'Bể 3', status: 'ON', product: 'SP-10', 
      actual: { revA: 150.77, revV: 12.89, revT: '', fwd1A: 219.18, fwd1V: 12.84, fwd1T: '', fwd2A: 280.09, fwd2V: 12.47, fwd2T: '', temp: 48 }, 
      setting: { revA: 150, revV: 12, revT: 450, fwd1A: 220, fwd1V: 12, fwd1T: 60, fwd2A: 280, fwd2V: 12, fwd2T: 90, temp: 48 } },
    { id: 7, name: 'Bể 7', status: 'OFF', product: '', 
      actual: { revA: '', revV: '', revT: '', fwd1A: '', fwd1V: '', fwd1T: '', fwd2A: '', fwd2V: '', fwd2T: '', temp: '' }, 
      setting: { revA: '', revV: '', revT: '', fwd1A: '', fwd1V: '', fwd1T: '', fwd2A: '', fwd2V: '', fwd2T: '', temp: '' } }
  ]);

  // --- PRODUCTS DATA ---
  const [products, setProducts] = useState([
    { id: 'SP-01', code: 'SP-01', volume: 2500, temp: 52, revA: 150, revV: 12, revT: 120, fwd1A: 220, fwd1V: 12, fwd1T: 45, fwd2A: 280, fwd2V: 12, fwd2T: 120, updated: '16h00, 11/04/2026' },
    { id: 'SP-02', code: 'SP-02', volume: 1500, temp: 55, revA: 120, revV: 10, revT: 110, fwd1A: 200, fwd1V: 10, fwd1T: 45, fwd2A: 200, fwd2V: 12, fwd2T: 120, updated: '16h00, 11/04/2026' },
    { id: 'SP-03', code: 'SP-03', volume: 2200, temp: 50, revA: 150, revV: 10, revT: 120, fwd1A: 220, fwd1V: 12, fwd1T: 60, fwd2A: 280, fwd2V: 12, fwd2T: 80, updated: '16h00, 11/04/2026' },
    { id: 'SP-04', code: 'SP-04', volume: 2200, temp: 50, revA: 140, revV: 10, revT: 120, fwd1A: 220, fwd1V: 12, fwd1T: 55, fwd2A: 250, fwd2V: 12, fwd2T: 60, updated: '16h00, 11/04/2026' },
    { id: 'SP-05', code: 'SP-05', volume: 1200, temp: 52, revA: 150, revV: 12, revT: 120, fwd1A: 220, fwd1V: 12, fwd1T: 60, fwd2A: 280, fwd2V: 12, fwd2T: 120, updated: '16h00, 11/04/2026' }
  ]);

  // MODAL STATES
  const [modalType, setModalType] = useState('NONE'); // NONE, TANK, PRODUCT
  const [editingTank, setEditingTank] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const productsList = products.map(p => p.code);

  // --- ACTIONS: TANKS ---
  const handleOpenTankEdit = (tank) => { setEditingTank({ ...tank }); setModalType('TANK'); };
  const handleDeleteTank = (id) => { if(window.confirm("Xác nhận xóa bể mạ?")) setTanks(tanks.filter(t => t.id !== id)); };
  const handleSaveTank = () => {
    if(!editingTank.name) return;
    setTanks(tanks.map(t => t.id === editingTank.id ? editingTank : t));
    setModalType('NONE');
  };

  // --- ACTIONS: PRODUCTS ---
  const handleOpenProductAdd = () => {
    setEditingProduct({ id: null, code: '', volume: '', temp: '', revA: '', revV: '', revT: '', fwd1A: '', fwd1V: '', fwd1T: '', fwd2A: '', fwd2V: '', fwd2T: '' });
    setModalType('PRODUCT');
  };
  const handleOpenProductEdit = (product) => {
    setEditingProduct({ ...product });
    setModalType('PRODUCT');
  };
  const handleSaveProduct = () => {
    if(!editingProduct.code) return alert("Vui lòng nhập Mã SP");
    const nowStr = '16h00, 13/04/2026';
    
    if (editingProduct.id) {
       setProducts(products.map(p => p.id === editingProduct.id ? {...editingProduct, updated: nowStr} : p));
    } else {
       setProducts([...products, { ...editingProduct, id: editingProduct.code, updated: nowStr }]);
    }
    setModalType('NONE');
  };


  // --- RENDERERS ---
  const renderProducts = () => (
    <div className="tab-content full-width">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
         <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
           <div className="search-bar">
             <span style={{color: '#9ca3af', marginRight: '8px'}}>🔍</span>
             <input type="text" placeholder="Tìm kiếm theo mã sp" className="search-input" />
           </div>
         </div>
         <button className="btn-primary" onClick={handleOpenProductAdd}>+ THÊM MỚI</button>
      </div>

      <div className="complex-table-wrapper">
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
              <tr key={p.id} className="actual-row">
                <td className="tank-name" style={{color: 'var(--accent-color)'}}>{p.code}</td>
                <td>{p.volume}</td>
                <td>{p.revA}</td><td>{p.revV}</td><td>{p.revT}</td>
                <td>{p.fwd1A}</td><td>{p.fwd1V}</td><td>{p.fwd1T}</td>
                <td>{p.fwd2A}</td><td>{p.fwd2V}</td><td>{p.fwd2T}</td>
                <td>{p.temp}</td>
                <td style={{fontSize: '12px', color: 'var(--text-secondary)'}}>{p.updated}</td>
                <td>
                  <button className="icon-btn-edit" onClick={() => handleOpenProductEdit(p)}>
                    📝
                  </button>
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
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
         <div className="search-bar">
             <span style={{color: '#9ca3af', marginRight: '8px'}}>🔍</span>
             <input type="text" placeholder="Tìm kiếm theo mã sp" className="search-input" />
         </div>
      </div>
      <div className="complex-table-wrapper">
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
                <tr className="actual-row">
                  <td rowSpan="2" className="tank-name" onClick={() => handleOpenTankEdit(tank)} style={{cursor: 'pointer', textDecoration: 'underline'}}>{tank.name}</td>
                  <td rowSpan="2" className="tank-status"><span className={tank.status === 'ON' ? 'text-success' : 'text-muted'}>{tank.status}</span></td>
                  <td rowSpan="2" className="tank-product">{tank.product}</td>
                  <td className="row-label">Thực tế</td>
                  <td>{tank.actual.revA}</td><td>{tank.actual.revV}</td><td>{tank.actual.revT}</td>
                  <td>{tank.actual.fwd1A}</td><td>{tank.actual.fwd1V}</td><td>{tank.actual.fwd1T}</td>
                  <td>{tank.actual.fwd2A}</td><td>{tank.actual.fwd2V}</td><td>{tank.actual.fwd2T}</td>
                  <td>{tank.actual.temp}</td>
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
        <div className="logo"><h2>TÊN CÔNG TY</h2></div>
        <nav className="nav-menu">
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <span style={{fontSize:'18px'}}>⚏</span> BẢNG TIN
          </button>
          <button className={`nav-item ${activeTab === 'tanks' ? 'active' : ''}`} onClick={() => setActiveTab('tanks')}>
            <span style={{fontSize:'18px'}}>💧</span> BỂ MẠ
          </button>
          <button className={`nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            <span style={{fontSize:'18px'}}>⚙️</span> MÃ SẢN PHẨM
          </button>
          <button className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <span style={{fontSize:'18px'}}>📋</span> BÁO CÁO
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="top-header">
          <div></div>
          <div className="user-profile">
            <span style={{color: '#374151', fontSize: '13px', fontWeight: 500}}>Tiếng Việt ▽</span>
            <div className="avatar">AD</div>
            <span style={{color: '#374151', fontSize: '13px', fontWeight: 600}}>Admin</span>
          </div>
        </header>

        {activeTab === 'tanks' && renderTanks()}
        {activeTab === 'products' && renderProducts()}
        {['overview', 'reports'].includes(activeTab) && <div className="tab-content"><h2>Đang phát triển</h2></div>}

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
              <button className="btn-modal-save" onClick={handleSaveTank}>💾 LƯU THÔNG TIN</button>
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
            <div className="modal-body" style={{padding: '24px 32px'}}>
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

              <div className="form-group-section">
                <div className="form-group-title"><span className="dot"></span> THÔNG SỐ MẠ NGƯỢC</div>
                <div className="form-row-3">
                  <div className="form-group"><label>DÒNG ĐIỆN</label><input type="number" value={editingProduct.revA} onChange={e=>setEditingProduct({...editingProduct, revA: e.target.value})} className="form-input" /></div>
                  <div className="form-group"><label>ĐIỆN ÁP</label><input type="number" value={editingProduct.revV} onChange={e=>setEditingProduct({...editingProduct, revV: e.target.value})} className="form-input" /></div>
                  <div className="form-group"><label>THỜI GIAN</label><input type="number" value={editingProduct.revT} onChange={e=>setEditingProduct({...editingProduct, revT: e.target.value})} className="form-input" /></div>
                </div>
              </div>

              <div className="form-group-section">
                <div className="form-group-title"><span className="dot"></span> THÔNG SỐ MẠ THUẬN 1</div>
                <div className="form-row-3">
                  <div className="form-group"><label>DÒNG ĐIỆN</label><input type="number" value={editingProduct.fwd1A} onChange={e=>setEditingProduct({...editingProduct, fwd1A: e.target.value})} className="form-input" /></div>
                  <div className="form-group"><label>ĐIỆN ÁP</label><input type="number" value={editingProduct.fwd1V} onChange={e=>setEditingProduct({...editingProduct, fwd1V: e.target.value})} className="form-input" /></div>
                  <div className="form-group"><label>THỜI GIAN</label><input type="number" value={editingProduct.fwd1T} onChange={e=>setEditingProduct({...editingProduct, fwd1T: e.target.value})} className="form-input" /></div>
                </div>
              </div>

              <div className="form-group-section">
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
              <button className="btn-modal-save" onClick={handleSaveProduct}>💾 LƯU THÔNG TIN</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
