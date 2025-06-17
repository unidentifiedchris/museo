// src/App.jsx
import React, { useState } from 'react';
import EmpleadoForm from './EmpleadoForm';
import EmpleadoList from './EmpleadoList';
import PinturaForm from './PinturaForm';
import PinturaList from './PinturaList';
import EsculturaForm from './EsculturaForm';
import EsculturaList from './EsculturaList';
import FichaPintura from './FichaPintura';
import FichaEscultura from './FichaEscultura';
import FichaArtista from './FichaArtista';
import Itinerario from './Itinerario';
import ResumenHistorico from './ResumenHistorico';
import './App.css';

export default function App() {
  // vistas principales
  const [view, setView] = useState('menu');
  // subtipo de reporte (para la pestaña reportes)
  const [reportType, setReportType] = useState('');

  return (
    <div className="app">
      <header className="header">
        <h1>Museo Admin</h1>
      </header>

      <div className="container">
        {/* MENÚ PRINCIPAL */}
        {view === 'menu' && (
          <main className="menu-screen">
            <div className="menu-grid">
              <div className="menu-card" onClick={() => setView('empleado')}>
                <h2>Expediente de<br/>Empleado</h2>
              </div>
              <div className="menu-card" onClick={() => setView('pintura')}>
                <h2>Registro de<br/>Pintura</h2>
              </div>
              <div className="menu-card" onClick={() => setView('escultura')}>
                <h2>Registro de<br/>Escultura</h2>
              </div>
              <div className="menu-card" onClick={() => setView('reportes')}>
                <h2>Reportes<br/>PDF</h2>
              </div>
              <div className="menu-card" onClick={() => setView('historico')}>
                <h2>Resumen<br/>Histórico</h2>
              </div>
            </div>
          </main>
        )}

        {/* EXPEDIENTE EMPLEADO */}
        {view === 'empleado' && (
          <main className="form-screen">
            <button className="back-btn" onClick={() => setView('menu')}>
              ← Volver al Menú
            </button>
            <div className="form-list-wrapper">
              <div className="form-panel"><EmpleadoForm /></div>
              <div className="list-panel"><EmpleadoList /></div>
            </div>
          </main>
        )}

        {/* REGISTRO PINTURA */}
        {view === 'pintura' && (
          <main className="form-screen">
            <button className="back-btn" onClick={() => setView('menu')}>
              ← Volver al Menú
            </button>
            <div className="form-list-wrapper">
              <div className="form-panel"><PinturaForm /></div>
              <div className="list-panel"><PinturaList /></div>
            </div>
          </main>
        )}

        {/* REGISTRO ESCULTURA */}
        {view === 'escultura' && (
          <main className="form-screen">
            <button className="back-btn" onClick={() => setView('menu')}>
              ← Volver al Menú
            </button>
            <div className="form-list-wrapper">
              <div className="form-panel"><EsculturaForm /></div>
              <div className="list-panel"><EsculturaList /></div>
            </div>
          </main>
        )}

        {/* REPORTES */}
        {view === 'reportes' && (
          <main className="form-screen">
            <button className="back-btn" onClick={() => setView('menu')}>
              ← Volver al Menú
            </button>
            <div className="form-panel" style={{ maxWidth: 400 }}>
              <h2>Selecciona Reporte:</h2>
              <button onClick={() => setReportType('pintura')} className="btn-submit">
                Ficha Pintura
              </button>
              <button onClick={() => setReportType('escultura')} className="btn-submit">
                Ficha Escultura
              </button>
              <button onClick={() => setReportType('artista')} className="btn-submit">
                Ficha Artista
              </button>
              <button onClick={() => setReportType('itinerario')} className="btn-submit">
                Itinerario Visita
              </button>
            </div>
            <div className="list-panel">
              {reportType === 'pintura' && <FichaPintura />}
              {reportType === 'escultura' && <FichaEscultura />}
              {reportType === 'artista' && <FichaArtista />}
              {reportType === 'itinerario' && <Itinerario />}
            </div>
          </main>
        )}

        {/* RESUMEN HISTÓRICO */}
        {view === 'historico' && (
          <main className="form-screen">
            <button className="back-btn" onClick={() => setView('menu')}>
              ← Volver al Menú
            </button>
            <div className="form-panel">
              <h2>Resumen Histórico del Museo</h2>
              <ResumenHistorico />
            </div>
          </main>
        )}
      </div>

      <footer className="footer">
        &copy; 2025 Museo SBD
      </footer>
    </div>
  );
}
