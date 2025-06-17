// src/App.jsx
import React, { useState } from 'react';
import EmpleadoForm from './EmpleadoForm';
import EmpleadoList from './EmpleadoList';
import PinturaForm  from './PinturaForm';
import PinturaList  from './PinturaList';
import PinturaReportAll from './PinturaReportAll';
import EsculturaForm from './EsculturaForm';
import EsculturaList from './EsculturaList';
import EsculturaReportAll from './EsculturaReportAll';
import ReportesPage   from './ReportesPage';
import './App.css';

export default function App() {
  /*  vistas posibles: 'menu' | 'empleado' | 'pintura' */
  const [view, setView] = useState('menu');

  return (
    <div className="app">
      <header className="header">
        <h1>Museo Admin</h1>
      </header>

      <div className="container">
        {/* ─────────── MENÚ PRINCIPAL ─────────── */}
        {view === 'menu' && (
          <main className="menu-screen">
            <div className="menu-grid">
              <div
                className="menu-card"
                onClick={() => setView('empleado')}
              >
                <h2>Expediente de<br />Empleado</h2>
              </div>

              {/* botón ahora habilitado */}
              <div
                className="menu-card"
                onClick={() => setView('pintura')}
              >
                <h2>Registro de<br />Pintura</h2>
              </div>

              {/* los dos restantes siguen deshabilitados */}
              <div
              className="menu-card"
              onClick={() => setView('escultura')}
            >
              <h2>Registro de<br />Escultura</h2>
            </div>
              <div className="menu-card disabled">
                <h2>Resumen<br />Histórico</h2>
              </div>
              <div className="menu-card" onClick={()=>setView('reportes')}>
                 <h2>Reportes</h2>
            </div>
            </div>
          </main>
        )}

        {/* ─────────── EXPEDIENTE EMPLEADO ─────────── */}
        {view === 'empleado' && (
          <main className="form-screen">
            <button className="back-btn" onClick={() => setView('menu')}>
              ← Volver al Menú
            </button>

            <div className="form-list-wrapper">
              <div className="form-panel">
                <EmpleadoForm />
              </div>
              <div className="list-panel">
                <EmpleadoList />
              </div>
              
            </div>
          </main>
        )}

        {/* ─────────── REGISTRO PINTURA ─────────── */}
        {view === 'pintura' && (
          <main className="form-screen">
            <button className="back-btn" onClick={() => setView('menu')}>
              ← Volver al Menú
            </button>

            <div className="form-list-wrapper">
              <div className="form-panel">
                <PinturaForm />
              </div>
              <div className="list-panel">
                <PinturaList />
              </div>
             <div style={{ marginTop: '1rem', textAlign:'center' }}>
              <PinturaReportAl />l
            </div>
            </div> 
          </main>
        )}

        {view === 'escultura' && (
          <main className="form-screen">
            <button className="back-btn" onClick={() => setView('menu')}>
              ← Volver al Menú
            </button>
            <div className="form-list-wrapper">
              <div className="form-panel">
                <EsculturaForm />
              </div>
              <div className="list-panel">
                <EsculturaList />
                
              </div>
              <div style={{ marginTop: '1rem', textAlign:'center' }}>
               <EsculturaReportAll />
            </div>
            </div>
          </main>
        )}

{view === 'reportes' && (
         <main className="form-screen">
           <button className="back-btn" onClick={()=>setView('menu')}>
             ← Volver al Menú
           </button>
           <ReportesPage />
        </main>
       )}
      </div>

      <footer className="footer">
        &copy; 2025 Museo SBD
      </footer>
    </div>
  );
}
