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

  const initialFormState = {
    // DATOS PERSONALES / RESPONSABILIDAD
    nombre: '',
    seccion: '', // Bicentenario, Bodenor, Tiendas
    area: '',
    tiendaOficina: '',
    cargo: '',
    correo: '',
    fechaEntrega: '',
    nombreUsuario: '', // Cuenta de red
    
    // DATOS DEL EQUIPO
    status: 'En Bodega',
    hostName: '',
    macAddress: '',
    estadoAV: 'Actualizado',
    marca: '',
    modelo: '',
    procesador: '',
    memoriaRAM: '',
    memoriaSSD: '',
    sistemaOperativo: '',
    serie: '',
    caracteristicas: '',
    accesorios: '',
    observaciones: '',
    color: '',
    cuentaAdmin: '',
    historial: []
  };

  const [form, setForm] = useState(initialFormState);

  // LISTAS COMPLETAS RESTAURADAS
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

  const laptopBrands = ["Acer", "Apple", "Asus", "Dell", "HP", "Huawei", "Lenovo", "MSI", "Samsung", "Sony"];
  
  const assetStatuses = [
    "En Uso", "En Bodega", "De Baja", "En Reparación", "Reservado",
    "En Tránsito", "Perdido / Robado", "Para Despiece"
  ];

  // SUSCRIPCIÓN EN TIEMPO REAL
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "inventario"), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventario(docs);
    });
    return () => unsubscribe();
  }, []);

  const agregarEquipo = async () => {
    if (guardando) return;
    if (!form.serie || !form.status) return alert("Mínimo requiere Serie y Estado.");

    setGuardando(true);
    try {
      const dataToSave = { ...form };
      
      if (editId) {
        // Lógica de Historial al editar
        const itemAnterior = inventario.find(i => i.id === editId);
        if (itemAnterior.nombre !== form.nombre && form.nombre !== "") {
          const nuevoHito = {
            fecha: new Date().toLocaleDateString('es-CL'),
            detalle: `Asignado a: ${form.nombre} (Anterior: ${itemAnterior.nombre || 'Nadie'})`
          };
          dataToSave.historial = [...(itemAnterior.historial || []), nuevoHito];
        }
        await updateDoc(doc(db, "inventario", editId), dataToSave);
        alert("Ficha actualizada");
      } else {
        await addDoc(collection(db, "inventario"), dataToSave);
        alert("Equipo registrado en nube");
      }
      setForm(initialFormState);
      setEditId(null);
    } catch (e) { alert("Error al conectar con Firebase"); }
    finally { setGuardando(false); }
  };

  const prepararEdicion = (item) => {
    setForm(item);
    setEditId(item.id);
    setView('dashboard');
  };

  const filtrados = inventario.filter(i => {
    const term = busqueda.toLowerCase();
    const matchBusqueda = (i.nombre || "").toLowerCase().includes(term) || (i.serie || "").toLowerCase().includes(term) || (i.hostName || "").toLowerCase().includes(term);
    const matchEstado = filtroEstado === "" || i.status === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      {/* HEADER TIPO DASHBOARD */}
      <header className="bg-blue-900 text-white shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tighter">IT ASSET MANAGEMENT</h1>
            <p className="text-blue-300 text-xs font-bold uppercase tracking-widest">Soporte TI Interno</p>
          </div>
          <div className="flex bg-blue-800 p-1 rounded-2xl border border-blue-700">
            <button onClick={() => setView('dashboard')} className={`px-6 py-2 rounded-xl text-xs font-black transition ${view === 'dashboard' ? 'bg-white text-blue-900 shadow-lg' : 'hover:bg-blue-700'}`}>REGISTRO / FICHA</button>
            <button onClick={() => setView('listado')} className={`px-6 py-2 rounded-xl text-xs font-black transition ${view === 'listado' ? 'bg-white text-blue-900 shadow-lg' : 'hover:bg-blue-700'}`}>LISTADO / STOCK</button>
          </div>
        </div>
      </header>

      {view === 'dashboard' && (
        <main className="max-w-5xl mx-auto p-6">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-50 border-b px-8 py-4 flex justify-between items-center">
              <h2 className="font-black text-slate-700 uppercase tracking-tight">{editId ? '📝 Editando Dispositivo' : '🆕 Nuevo Registro de Activo'}</h2>
              {editId && <button onClick={() => {setEditId(null); setForm(initialFormState);}} className="text-red-500 font-bold text-xs hover:underline">CANCELAR EDICIÓN</button>}
            </div>

            <div className="p-8 space-y-10">
              {/* BLOQUE 1: DATOS PERSONALES */}
              <section>
                <h3 className="text-blue-600 text-xs font-black mb-6 flex items-center gap-2"><span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center">1</span> DATOS DEL USUARIO Y RESPONSABILIDAD</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nombre del Responsable</label>
                    <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-blue-500 outline-none" placeholder="Nombre Apellido" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Gerencia / Área</label>
                    <select value={form.area} onChange={e => setForm({...form, area: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                      <option value="">Seleccionar Gerencia...</option>
                      {areas.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tienda / Oficina</label>
                    <select value={form.tiendaOficina} onChange={e => setForm({...form, tiendaOficina: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                      <option value="">Seleccionar Ubicación...</option>
                      <option value="Bicentenario">Edificio Bicentenario</option>
                      <option value="Bodenor">Bodega Bodenor</option>
                      <optgroup label="Tiendas">
                        {tiendas.map(t => <option key={t} value={t}>{t}</option>)}
                      </optgroup>
                    </select>
                  </div>
                  <input placeholder="Cargo" value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})} className="p-3 bg-slate-50 border rounded-xl" />
                  <input placeholder="Correo Corporativo" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} className="p-3 bg-slate-50 border rounded-xl" />
                  <input type="date" value={form.fechaEntrega} onChange={e => setForm({...form, fechaEntrega: e.target.value})} className="p-3 bg-slate-50 border rounded-xl text-slate-400" />
                  <input placeholder="Nombre de Usuario (Red)" value={form.nombreUsuario} onChange={e => setForm({...form, nombreUsuario: e.target.value})} className="p-3 bg-slate-50 border rounded-xl" />
                </div>
              </section>

              {/* BLOQUE 2: DATOS DEL EQUIPO */}
              <section>
                <h3 className="text-indigo-600 text-xs font-black mb-6 flex items-center gap-2"><span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center">2</span> ESPECIFICACIONES TÉCNICAS DEL EQUIPO</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Estado de Gestión TI</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className={`w-full p-3 border-2 rounded-xl font-black text-sm outline-none transition ${form.status === 'En Uso' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
                      {assetStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Número de Serie (S/N)</label>
                    <input value={form.serie} onChange={e => setForm({...form, serie: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono" placeholder="Obligatorio" />
                  </div>
                  <select value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} className="p-3 bg-slate-50 border rounded-xl outline-none">
                    <option value="">Marca...</option>
                    {laptopBrands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <input placeholder="Modelo" value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} className="p-3 bg-slate-50 border rounded-xl" />
                  <input placeholder="Procesador" value={form.procesador} onChange={e => setForm({...form, procesador: e.target.value})} className="p-3 bg-slate-50 border rounded-xl" />
                  <input placeholder="RAM (GB)" value={form.memoriaRAM} onChange={e => setForm({...form, memoriaRAM: e.target.value})} className="p-3 bg-slate-50 border rounded-xl" />
                  <input placeholder="Almacenamiento (SSD/HDD)" value={form.memoriaSSD} onChange={e => setForm({...form, memoriaSSD: e.target.value})} className="p-3 bg-slate-50 border rounded-xl" />
                  <input placeholder="Sistema Operativo" value={form.sistemaOperativo} onChange={e => setForm({...form, sistemaOperativo: e.target.value})} className="p-3 bg-slate-50 border rounded-xl" />
                  <input placeholder="Host Name" value={form.hostName} onChange={e => setForm({...form, hostName: e.target.value})} className="p-3 bg-slate-50 border rounded-xl" />
                  <input placeholder="MAC Address" value={form.macAddress} onChange={e => setForm({...form, macAddress: e.target.value})} className="p-3 bg-slate-50 border rounded-xl" />
                  <input placeholder="Color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} className="p-3 bg-slate-50 border rounded-xl" />
                  <input placeholder="Cuenta Admin Local" value={form.cuentaAdmin} onChange={e => setForm({...form, cuentaAdmin: e.target.value})} className="p-3 bg-slate-50 border rounded-xl" />
                </div>
              </section>

              {/* BLOQUE 3: EXTRAS */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <textarea placeholder="Accesorios (Cargador, Mouse, Mochila...)" value={form.accesorios} onChange={e => setForm({...form, accesorios: e.target.value})} className="p-4 bg-slate-50 border rounded-2xl h-24 outline-none focus:ring-2 ring-blue-500" />
                <textarea placeholder="Observaciones de Soporte TI..." value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})} className="p-4 bg-slate-50 border rounded-2xl h-24 outline-none focus:ring-2 ring-blue-500" />
              </section>

              <button onClick={agregarEquipo} disabled={guardando} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition transform active:scale-95 disabled:bg-slate-300 uppercase tracking-widest">
                {guardando ? 'Sincronizando...' : (editId ? 'Confirmar Cambios en Ficha' : 'Guardar en Inventario Nube')}
              </button>
            </div>
          </div>
        </main>
      )}

      {view === 'listado' && (
        <main className="max-w-7xl mx-auto p-6 space-y-6">
          {/* MINI DASHBOARD */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {["En Uso", "En Bodega", "De Baja", "En Reparación", "Total"].map(label => (
              <div key={label} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase">{label}</p>
                <p className="text-2xl font-black text-blue-900">
                  {label === "Total" ? inventario.length : inventario.filter(i => i.status === label).length}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <input className="flex-1 p-4 rounded-2xl shadow-md border-none outline-none focus:ring-2 ring-blue-500" placeholder="🔍 Buscar por nombre, serie, hostname..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            <select className="p-4 rounded-2xl bg-white shadow-md border-none font-bold text-xs" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="">Todos los Estados</option>
              {assetStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="p-4 text-[10px] font-black uppercase">Acciones</th>
                  <th className="p-4 text-[10px] font-black uppercase">Estado</th>
                  <th className="p-4 text-[10px] font-black uppercase">Usuario / Área</th>
                  <th className="p-4 text-[10px] font-black uppercase">Equipo / Serie</th>
                  <th className="p-4 text-[10px] font-black uppercase">Ubicación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map(item => (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                    <td className="p-4 flex gap-2">
                      <button onClick={() => prepararEdicion(item)} className="bg-blue-100 text-blue-600 p-2 rounded-lg font-bold text-[10px] hover:bg-blue-600 hover:text-white transition">EDIT</button>
                      <button onClick={async () => { if(window.confirm("¿Borrar?")) await deleteDoc(doc(db, "inventario", item.id)) }} className="bg-red-100 text-red-600 p-2 rounded-lg font-bold text-[10px] hover:bg-red-600 hover:text-white transition">DEL</button>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.status === 'En Uso' ? 'bg-blue-100 text-blue-700' : item.status === 'En Bodega' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-black text-slate-700">{item.nombre || 'SIN ASIGNAR'}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{item.area}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-600">{item.marca} {item.modelo}</p>
                      <p className="text-[10px] font-mono text-blue-500">{item.serie}</p>
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-500">{item.tiendaOficina}</td>
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