import React, { useState } from 'react';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('tanks'); // Default to tanks to show the changes immediately

  const [tanks, setTanks] = useState([
    { id: 1, name: 'Bể 1', status: 'ON', product: 'SP-01', 
      actual: { revA: 150.86, revV: 11.64, revT: '', fwd1A: 220.17, fwd1V: 11.17, fwd1T: '', fwd2A: 279.68, fwd2V: 11.1, fwd2T: '', temp: 52 }, 
      setting: { revA: 150, revV: 12, revT: 120, fwd1A: 220, fwd1V: 12, fwd1T: 45, fwd2A: 280, fwd2V: 12, fwd2T: 120, temp: 52 } 
    },
    { id: 2, name: 'Bể 2', status: 'ON', product: 'SP-02', 
      actual: { revA: 119.27, revV: 9.44, revT: '', fwd1A: 200.55, fwd1V: 9.78, fwd1T: '', fwd2A: 199.41, fwd2V: 12.38, fwd2T: '', temp: 55 }, 
      setting: { revA: 120, revV: 10, revT: 110, fwd1A: 200, fwd1V: 10, fwd1T: 45, fwd2A: 200, fwd2V: 12, fwd2T: 120, temp: 55 } 
    },
    { id: 3, name: 'Bể 3', status: 'ON', product: 'SP-10', 
      actual: { revA: 150.77, revV: 12.89, revT: '', fwd1A: 219.18, fwd1V: 12.84, fwd1T: '', fwd2A: 280.09, fwd2V: 12.47, fwd2T: '', temp: 48 }, 
      setting: { revA: 150, revV: 12, revT: 450, fwd1A: 220, fwd1V: 12, fwd1T: 60, fwd2A: 280, fwd2V: 12, fwd2T: 90, temp: 48 } 
    },
    { id: 7, name: 'Bể 7', status: 'OFF', product: '', 
      actual: { revA: '', revV: '', revT: '', fwd1A: '', fwd1V: '', fwd1T: '', fwd2A: '', fwd2V: '', fwd2T: '', temp: '' }, 
      setting: { revA: '', revV: '', revT: '', fwd1A: '', fwd1V: '', fwd1T: '', fwd2A: '', fwd2V: '', fwd2T: '', temp: '' } 
    }
  ]);

  const [productsList] = useState(['SP-01', 'SP-02', 'SP-03', 'SP-04', 'SP-05', 'AB-06', 'SS-07', 'PP-08', 'SP-09', 'SP-10', 'PROD-11', 'PROD-12']);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTank, setEditingTank] = useState(null);

  // Other Existing States
  const [production] = useState({ plan: 5000, actual: 3250, product: 'SP-01' });
  const [plans] = useState([
    { id: 1, product: 'SP-01', target: 5000, actual: 3250, start: '07:00 13/04', end: '16:00 13/04', status: 'RUNNING' }
  ]);
  const [incidents] = useState([
    { id: 1, tank: 'Bể 3', type: 'LOW_LIQUID', desc: 'Mực dung dịch kẽm thấp', time: '10:45 13/04', status: 'UNRESOLVED' }
  ]);

  // Actions
  const handleOpenEdit = (tank) => {
    setEditingTank({ ...tank });
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingTank({
      id: null, name: `Bể ${tanks.length + 1}`, status: 'OFF', product: '',
      actual: { revA: '', revV: '', revT: '', fwd1A: '', fwd1V: '', fwd1T: '', fwd2A: '', fwd2V: '', fwd2T: '', temp: '' },
      setting: { revA: '', revV: '', revT: '', fwd1A: '', fwd1V: '', fwd1T: '', fwd2A: '', fwd2V: '', fwd2T: '', temp: '' }
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if(window.confirm("Bạn có chắc chắn muốn xóa bể mạ này?")) {
      setTanks(tanks.filter(t => t.id !== id));
    }
  };

  const handleSaveModal = () => {
    // Validate
    if(!editingTank.name) return alert("Vui lòng nhập tên bể!");
    
    if (editingTank.id) {
       // Update
       setTanks(tanks.map(t => t.id === editingTank.id ? editingTank : t));
    } else {
       // Create
       const newId = Math.max(...tanks.map(t=>t.id), 0) + 1;
       setTanks([...tanks, { ...editingTank, id: newId }]);
    }
    setIsModalOpen(false);
  };

  // Render Functions
  const renderOverview = () => (
    <div className="tab-content">
      {/* Retained from previous code for overview tab */}
      <section className="widgets-grid">
         {/* Omitting full redundant JSX, rendering simple overview */}
         <div className="widget-card stats-card">
          <h3>Tiến độ Sản xuất Hiện tại</h3>
          <div className="progress-details">
            <div><p className="label">Mã hàng chạy</p><p className="value highlight">{production.product}</p></div>
            <div className="divider"></div>
            <div><p className="label">Kế hoạch</p><p className="value">{production.plan}</p></div>
            <div className="divider"></div>
            <div><p className="label">Đã sản xuất</p><p className="value highlight-green">{production.actual}</p></div>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${(production.actual / production.plan) * 100}%` }}></div>
          </div>
          <p className="progress-text">65.0% Hoàn thành</p>
        </div>
      </section>
    </div>
  );

  const renderTanks = () => (
    <div className="tab-content full-width">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
         <h2 className="section-title">Giám Sát Thông Số Yêu Cầu Thiết Bị</h2>
         <button className="btn-primary" onClick={handleOpenAdd}>+ Thêm Bể Mới</button>
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
              <th rowSpan="2" style={{width: '140px'}}>THAO TÁC</th>
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
                  <td rowSpan="2" className="tank-name">{tank.name}</td>
                  <td rowSpan="2" className="tank-status"><span className={tank.status === 'ON' ? 'text-success' : 'text-muted'}>{tank.status}</span></td>
                  <td rowSpan="2" className="tank-product">{tank.product}</td>
                  <td className="row-label">Thực tế</td>
                  
                  <td>{tank.actual.revA}</td><td>{tank.actual.revV}</td><td>{tank.actual.revT}</td>
                  <td>{tank.actual.fwd1A}</td><td>{tank.actual.fwd1V}</td><td>{tank.actual.fwd1T}</td>
                  <td>{tank.actual.fwd2A}</td><td>{tank.actual.fwd2V}</td><td>{tank.actual.fwd2T}</td>
                  
                  <td>{tank.actual.temp}</td>
                  <td rowSpan="2" className="actions-cell">
                    <button className="btn-sm btn-edit" onClick={() => handleOpenEdit(tank)}>Sửa</button>
                    <button className="btn-sm btn-del" onClick={() => handleDelete(tank.id)}>Xóa</button>
                  </td>
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

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'tanks': return renderTanks();
      case 'plans': 
      case 'incidents': 
        return <div className="tab-content"><h2 className="section-title">Chức năng đang phát triển</h2></div>;
      default: return renderOverview();
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo"><h2>PES <span>Pro</span></h2></div>
        <nav className="nav-menu">
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Tổng quan</button>
          <button className={`nav-item ${activeTab === 'tanks' ? 'active' : ''}`} onClick={() => setActiveTab('tanks')}>💧 Bể Mạ (Live)</button>
          <button className={`nav-item ${activeTab === 'plans' ? 'active' : ''}`} onClick={() => setActiveTab('plans')}>📋 Kế hoạch</button>
          <button className={`nav-item ${activeTab === 'incidents' ? 'active' : ''}`} onClick={() => setActiveTab('incidents')}>⚙️ Sự cố</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{padding: '24px'}}>
        <header className="top-header" style={{marginBottom: 0}}>
          <div>
            <h1>{activeTab === 'tanks' ? 'GIÁM SÁT THÔNG SỐ BỂ MẠ' : 'DASHBOARD CÔNG NGHIỆP'}</h1>
          </div>
          <div className="user-profile">
            <span style={{marginRight: '8px', color: 'black'}}>Tiếng Việt ▽</span>
            <div className="avatar">AD</div>
            <span style={{color:'black'}}>Admin</span>
          </div>
        </header>

        {renderContent()}

      </main>

      {/* UPDATE MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>{editingTank.id ? 'Cập nhật mã sản phẩm' : 'Thêm Bể Mạ'}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>BỂ MẠ</label>
                  <input type="text" 
                         value={editingTank.name} 
                         onChange={(e) => setEditingTank({...editingTank, name: e.target.value})} 
                         className="form-input" />
                </div>
                <div className="form-group">
                  <label>MÃ SP</label>
                  <select 
                    value={editingTank.product} 
                    onChange={(e) => setEditingTank({...editingTank, product: e.target.value})}
                    className="form-input select-input"
                  >
                    <option value="">Chọn mã sản phẩm</option>
                    {productsList.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>CHỈNH LƯU (Trạng thái)</label>
                  <select 
                    value={editingTank.status} 
                    onChange={(e) => setEditingTank({...editingTank, status: e.target.value})}
                    className="form-input select-input"
                  >
                    <option value="ON">ON (Bật)</option>
                    <option value="OFF">OFF (Tắt)</option>
                  </select>
                </div>
              </div>
              
              {/* Expand advanced settings section if they want to edit the params later, UI keeps it simple for now */}
              <p className="form-hint">Lưu ý: Các thông số Tiêu chuẩn Nhiệt độ và Dòng Điện thay đổi tự động theo Mã Sản Phẩm.</p>

            </div>
            <div className="modal-footer">
              <button className="btn-modal-save" onClick={handleSaveModal}>💾 LƯU THÔNG TIN</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
