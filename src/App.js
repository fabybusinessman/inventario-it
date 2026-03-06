import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';

function App() {
  const [inventario, setInventario] = useState([]);
  const [view, setView] = useState('dashboard');
  const [guardando, setGuardando] = useState(false);
  const [editId, setEditId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroTiendaListado, setFiltroTiendaListado] = useState("");

  const initialFormState = {
    // DATOS PERSONALES
    nombre: '', seccion: '', area: '', tiendaOficina: '', cargo: '', correo: '',
    fechaEntrega: '', nombreUsuario: '', cuentaAdmin: '',
    // DATOS EQUIPO
    status: 'En Bodega', estadoAV: 'Activo', serie: '', hostName: '', macAddress: '',
    marca: '', modelo: '', procesador: '', memoriaRAM: '', modeloSSD: '', 
    capacidadSSD: '', sistemaOperativo: '', color: '', caracteristicas: '', 
    accesorios: '', observaciones: '', historial: []
  };

  const [form, setForm] = useState(initialFormState);

  const tiendas = [
    "Antofagasta", "Cantagallo", "Chillán", "Concepcion", "Curicó", "Huerfanos",
    "La Serena", "Las Condes 2", "Mall Arauco Maipu 2", "Mall Cenco Costanera",
    "Mall El Trebol (Talcahuano)", "Mall Florida Center", "Mall Open Kennedy",
    "Mall Plaza Egaña", "Mall Plaza Norte 2", "Mall Plaza Oeste", "Mall Plaza Vespucio",
    "Mall Puerto Montt", "Manuel Montt", "Osorno", "San Carlos De Apoquindo",
    "Talca", "Temuco 2", "Viña Del Mar", "Vitacura"
  ];

  const areas = [
    "Gerencia Comercial", "Gerencia de Compras", "Gerencia de Personas y Sustentabilidad",
    "Gerencia General", "Gerencia de Marketing y SAC", "Gerencia TI",
    "Gerencia Operaciones Tienda", "Gerencia Supply Chain", "Gerencia Ventas Empresas",
    "Gerencia de Canales", "Gerencia de Negocios", "Gerencia de Logística",
    "Gerencia de Administracion Y Finanzas"
  ];

  const assetStatuses = ["En Uso", "En Bodega", "De Baja", "En Reparación", "Reservado", "En Tránsito", "Perdido / Robado", "Para Despiece"];
  const avStatuses = ["Activo", "Pendiente", "No activado"];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "inventario"), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventario(docs);
    });
    return () => unsubscribe();
  }, []);

  const prepararEdicion = (item) => {
    setForm(item);
    setEditId(item.id);
    setView('dashboard');
    window.scrollTo(0, 0);
  };

  const agregarEquipo = async () => {
    if (guardando) return;
    if (!form.serie || !form.nombre) return alert("Mínimo requiere Nombre y Serie.");
    setGuardando(true);
    try {
      if (editId) {
        const itemAnterior = inventario.find(i => i.id === editId);
        let nuevoHistorial = [...(itemAnterior.historial || [])];
        if (itemAnterior.nombre !== form.nombre) {
          nuevoHistorial.push({
            fecha: new Date().toLocaleDateString('es-CL'),
            detalle: `Cambio de usuario: ${form.nombre} (Anterior: ${itemAnterior.nombre || 'Nadie'})`
          });
        }
        await updateDoc(doc(db, "inventario", editId), { ...form, historial: nuevoHistorial });
        alert("Actualizado con éxito");
      } else {
        await addDoc(collection(db, "inventario"), {
          ...form,
          historial: [{ fecha: new Date().toLocaleDateString('es-CL'), detalle: "Ingreso inicial" }]
        });
        alert("Registrado con éxito");
      }
      setForm(initialFormState);
      setEditId(null);
    } catch (e) { alert("Error al guardar"); }
    finally { setGuardando(false); }
  };

  const generarActa = (item) => {
    const vent = window.open('', '', 'width=800,height=900');
    vent.document.write(`
      <html>
        <body style="font-family: sans-serif; padding: 40px; line-height: 1.6;">
          <h1 style="color: #1e3a8a; text-align: center;">Acta de Entrega IT</h1>
          <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-CL')}</p>
          <hr/>
          <h3>1. Datos del Responsable</h3>
          <p><strong>Nombre:</strong> ${item.nombre} | <strong>Cargo:</strong> ${item.cargo}</p>
          <p><strong>Área:</strong> ${item.area} | <strong>Ubicación:</strong> ${item.tiendaOficina}</p>
          <hr/>
          <h3>2. Especificaciones del Equipo</h3>
          <p><strong>Equipo:</strong> ${item.marca} ${item.modelo} | <strong>Serial:</strong> ${item.serie}</p>
          <p><strong>Procesador:</strong> ${item.procesador} | <strong>RAM:</strong> ${item.memoriaRAM}</p>
          <p><strong>SSD:</strong> ${item.modeloSSD} (${item.capacidadSSD})</p>
          <p><strong>Hostname:</strong> ${item.hostName} | <strong>S.O:</strong> ${item.sistemaOperativo}</p>
          <br/><br/><br/>
          <div style="display: flex; justify-content: space-around; text-align: center;">
            <div>________________________<br/>Firma Soporte TI</div>
            <div>________________________<br/>Firma Colaborador</div>
          </div>
        </body>
      </html>
    `);
    vent.document.close();
    vent.print();
  };

  const filtrados = inventario.filter(i => {
    const term = busqueda.toLowerCase();
    const matchBusqueda = (i.nombre || "").toLowerCase().includes(term) || (i.serie || "").toLowerCase().includes(term);
    const matchEstado = filtroEstado === "" || i.status === filtroEstado;
    const matchTienda = filtroTiendaListado === "" || i.tiendaOficina === filtroTiendaListado;
    return matchBusqueda && matchEstado && matchTienda;
  });

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      <header className="bg-blue-900 text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div><h1 className="text-2xl font-black">INVENTARIO TI PRO</h1></div>
          <div className="flex bg-blue-800 p-1 rounded-2xl">
            <button onClick={() => setView('dashboard')} className={`px-6 py-2 rounded-xl text-xs font-black ${view === 'dashboard' ? 'bg-white text-blue-900' : ''}`}>REGISTRO</button>
            <button onClick={() => setView('listado')} className={`px-6 py-2 rounded-xl text-xs font-black ${view === 'listado' ? 'bg-white text-blue-900' : ''}`}>LISTADO</button>
          </div>
        </div>
      </header>

      {view === 'dashboard' ? (
        <main className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
            <h2 className="text-xl font-black mb-8 text-slate-700">{editId ? '📝 MODIFICAR' : '🆕 NUEVO REGISTRO'}</h2>
            <div className="space-y-8">
              {/* SECCION 1: DATOS PERSONALES */}
              <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-4 border-l-4 border-blue-600 pl-3"><h3 className="text-xs font-black text-blue-600 uppercase">1. Datos Personales</h3></div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Nombre Responsable</label>
                  <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Gerencia / Área</label>
                  <select value={form.area} onChange={e => setForm({...form, area: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                    <option value="">Seleccionar Gerencia...</option>
                    {areas.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Tienda / Oficina</label>
                  <select value={form.tiendaOficina} onChange={e => setForm({...form, tiendaOficina: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                    <option value="">Seleccionar Ubicación...</option>
                    <option value="Bicentenario">Bicentenario</option>
                    <option value="Bodenor">Bodenor</option>
                    <optgroup label="Tiendas">
                      {tiendas.map(t => <option key={t} value={t}>{t}</option>)}
                    </optgroup>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Cargo</label>
                    <input value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Correo</label>
                    <input value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Fecha Entrega</label>
                    <input type="date" value={form.fechaEntrega} onChange={e => setForm({...form, fechaEntrega: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Usuario Red</label>
                    <input value={form.nombreUsuario} onChange={e => setForm({...form, nombreUsuario: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Cuenta Admin</label>
                    <input value={form.cuentaAdmin} onChange={e => setForm({...form, cuentaAdmin: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
              </section>

              {/* SECCION 2: DATOS EQUIPO */}
              <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-4 border-l-4 border-indigo-600 pl-3"><h3 className="text-xs font-black text-indigo-600 uppercase">2. Datos del Equipo</h3></div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Serie (S/N)</label>
                  <input value={form.serie} onChange={e => setForm({...form, serie: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Hostname</label>
                  <input value={form.hostName} onChange={e => setForm({...form, hostName: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Marca</label>
                  <input value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Modelo</label>
                  <input value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Procesador</label>
                  <input value={form.procesador} onChange={e => setForm({...form, procesador: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">RAM</label>
                  <input value={form.memoriaRAM} onChange={e => setForm({...form, memoriaRAM: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Modelo SSD</label>
                  <input value={form.modeloSSD} onChange={e => setForm({...form, modeloSSD: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Capacidad SSD</label>
                  <input value={form.capacidadSSD} onChange={e => setForm({...form, capacidadSSD: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Sistema Operativo</label>
                  <input value={form.sistemaOperativo} onChange={e => setForm({...form, sistemaOperativo: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">MAC Address</label>
                  <input value={form.macAddress} onChange={e => setForm({...form, macAddress: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Estado Equipo</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                    {assetStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Antivirus</label>
                  <select value={form.estadoAV} onChange={e => setForm({...form, estadoAV: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    {avStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </section>

              <button onClick={agregarEquipo} disabled={guardando} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 disabled:bg-slate-300 uppercase tracking-widest transition-all">
                {guardando ? 'Sincronizando...' : (editId ? 'Guardar Cambios' : 'Registrar Equipo')}
              </button>
            </div>
          </div>
        </main>
      ) : (
        <main className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input className="flex-1 p-4 rounded-2xl shadow-md border-none outline-none focus:ring-2 ring-blue-500" placeholder="🔍 Buscar por nombre o serie..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            <select className="p-4 rounded-2xl bg-white shadow-md border-none font-bold text-xs" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="">Filtro: Estado</option>
              {assetStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="p-4 rounded-2xl bg-white shadow-md border-none font-bold text-xs" value={filtroTiendaListado} onChange={e => setFiltroTiendaListado(e.target.value)}>
              <option value="">Filtro: Tienda/Oficina</option>
              {tiendas.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-800 text-white font-black text-[10px] uppercase">
                  <th className="p-4">Acciones</th>
                  <th className="p-4">Estado / AV</th>
                  <th className="p-4">Usuario</th>
                  <th className="p-4">S/N - Modelo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map(item => (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                    <td className="p-4 flex gap-2">
                      <button onClick={() => prepararEdicion(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onClick={() => generarActa(item)} className="p-2 bg-green-50 text-green-600 rounded-lg">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                      </button>
                      <button onClick={async () => { if(window.confirm("¿Eliminar?")) await deleteDoc(doc(db, "inventario", item.id)) }} className="p-2 bg-red-50 text-red-600 rounded-lg">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                    <td className="p-4">
                      <p className={`text-[9px] font-black uppercase ${item.status === 'En Uso' ? 'text-blue-600' : 'text-green-600'}`}>{item.status}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">AV: {item.estadoAV}</p>
                    </td>
                    <td className="p-4"><p className="font-black text-slate-700 text-xs uppercase">{item.nombre}</p></td>
                    <td className="p-4"><p className="font-mono text-blue-600 text-xs font-bold">{item.serie}</p></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;