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
    nombre: '', seccion: '', area: '', tiendaOficina: '', cargo: '', correo: '',
    fechaEntrega: '', nombreUsuario: '', status: 'En Bodega', hostName: '',
    macAddress: '', estadoAV: 'Activo', marca: '', modelo: '', procesador: '',
    memoriaRAM: '', modeloSSD: '', capacidadSSD: '', sistemaOperativo: '',
    serie: '', caracteristicas: '', accesorios: '', observaciones: '',
    color: '', cuentaAdmin: '', historial: []
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

  // --- FUNCIONES DE LÓGICA (DEBEN ESTAR AQUÍ DENTRO) ---

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
        <body style="font-family: sans-serif; padding: 40px;">
          <h1 style="color: #1e3a8a; text-align: center;">Acta de Entrega IT</h1>
          <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-CL')}</p>
          <hr/>
          <h3>Responsable: ${item.nombre}</h3>
          <p><strong>Equipo:</strong> ${item.marca} ${item.modelo} (${item.serie})</p>
          <p><strong>Especificaciones:</strong> ${item.procesador}, ${item.memoriaRAM} RAM, SSD ${item.capacidadSSD}</p>
          <p><strong>Hostname:</strong> ${item.hostName}</p>
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

  const InputField = ({ label, value, onChange, type = "text" }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">{label}</label>
      <input type={type} value={value} onChange={onChange} className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-blue-500 outline-none" />
    </div>
  );

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
              <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-4 border-l-4 border-blue-600 pl-3"><h3 className="text-xs font-black text-blue-600 uppercase">1. Usuario</h3></div>
                <InputField label="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Área</label>
                  <select value={form.area} onChange={e => setForm({...form, area: e.target.value})} className="p-3 bg-slate-50 border rounded-xl">
                    <option value="">Seleccionar...</option>
                    {areas.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Tienda</label>
                  <select value={form.tiendaOficina} onChange={e => setForm({...form, tiendaOficina: e.target.value})} className="p-3 bg-slate-50 border rounded-xl">
                    <option value="">Seleccionar...</option>
                    {tiendas.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <InputField label="Cargo" value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})} />
              </section>

              <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-4 border-l-4 border-indigo-600 pl-3"><h3 className="text-xs font-black text-indigo-600 uppercase">2. Equipo</h3></div>
                <InputField label="Serie (S/N)" value={form.serie} onChange={e => setForm({...form, serie: e.target.value})} />
                <InputField label="Hostname" value={form.hostName} onChange={e => setForm({...form, hostName: e.target.value})} />
                <InputField label="Modelo SSD" value={form.modeloSSD} onChange={e => setForm({...form, modeloSSD: e.target.value})} />
                <InputField label="Capacidad SSD" value={form.capacidadSSD} onChange={e => setForm({...form, capacidadSSD: e.target.value})} />
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Estado</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="p-3 bg-slate-50 border rounded-xl font-bold">
                    {assetStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Antivirus</label>
                  <select value={form.estadoAV} onChange={e => setForm({...form, estadoAV: e.target.value})} className="p-3 bg-slate-50 border rounded-xl">
                    {avStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </section>
              <button onClick={agregarEquipo} disabled={guardando} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 disabled:bg-slate-300 uppercase">
                {guardando ? 'Sincronizando...' : (editId ? 'Guardar Cambios' : 'Registrar Equipo')}
              </button>
            </div>
          </div>
        </main>
      ) : (
        <main className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input className="flex-1 p-4 rounded-2xl shadow-md border-none outline-none" placeholder="🔍 Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            <select className="p-4 rounded-2xl bg-white shadow-md border-none font-bold text-xs" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="">Estado</option>
              {assetStatuses.map(s => <option key={s} value={s}>{s}</option>)}
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
                    <td className="p-4"><p className="font-mono text-blue-600 text-xs">{item.serie}</p></td>
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