// src/ReportesPage.jsx
import React, { useState } from 'react';
import FichaEscultura  from './FichaEscultura';
import FichaArtista    from './FichaArtista';
import FichaPintura   from './FichaPintura';
import Itinerario    from './Itinerario';

export default function ReportesPage() {
  const [modo, setModo] = useState(null); // 'pintura'|'escultura'|'artista'

  return (
    <div>
      <div style={{ display:'flex', gap:'1rem', marginBottom:'1rem' }}>
       <button className="btn-submit" onClick={()=>setModo('pintura')}>
         Ficha de Pintura
       </button>
        <button className="btn-submit" onClick={()=>setModo('escultura')}>
          Ficha de Escultura
        </button>
        <button className="btn-submit" onClick={()=>setModo('artista')}>
          Ficha de Artista
        </button>
        <button className="btn-submit" onClick={()=>setModo('itinerario')}>
         Itinerario de Visita
       </button>
      </div>

     {modo === 'pintura'   && <FichaPintura />}
      {modo === 'escultura' && <FichaEscultura />}
      {modo === 'artista'   && <FichaArtista />}
      {modo === 'itinerario' && <Itinerario />}
    </div>
  );
}
