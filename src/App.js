import React, { useState, useEffect, useCallback } from 'react';
import { db } from './firebase'; // Importamos la instancia de la DB
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore'; // Funciones de Firestore

function App() {
  const [inventario, setInventario] = useState([]);

  const initialFormState = {
    nombre: '',
    seccion: '',
    area: '',
    tiendaOficina: '',
    cargo: '',
    correo: '',
    fechaEntrega: '',
    cuentaAdmin: '',
    nombreUsuario: '',
    hostName: '',
    macAddress: '',
    status: 'En Bodega',
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
    historial: []
  };

  const fieldLabels = {
    nombre: 'Usuario Responsable',
    area: 'Área',
    tiendaOficina: 'Ubicación Exacta',
    status: 'Estado del Activo',
    marca: 'Marca',
    modelo: 'Modelo',
    serie: 'S/N (Serie)',
    hostName: 'Hostname',
    macAddress: 'MAC'
  };

  const laptopBrands = [
    "Acer", "Alienware", "Apple", "Asus", "Dell", "HP", "Huawei", "Lenovo", "MSI", "Samsung"
  ];

  const tiendas = [
    "Antofagasta", "Cantagallo", "Chillán", "Concepcion", "Curicó", "Huerfanos",
    "La Serena", "Las Condes 2", "Mall Cenco Costanera", "Mall Plaza Egaña", "Viña Del Mar"
  ];

  const areas = [
    "Gerencia Comercial", "Gerencia de Compras", "Gerencia TI", "Gerencia Supply Chain", "Gerencia de Logística"
  ];

  const assetStatuses = [
    "En Uso", "En Bodega", "De Baja", "En Reparación", "Reservado",
    "En Tránsito", "Perdido / Robado", "Para Despiece"
  ];

  const [form, setForm] = useState(initialFormState);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTienda, setFiltroTienda] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [editId, setEditId] = useState(null);
  const [view, setView] = useState('dashboard');

  // Sincronización en tiempo real con Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "inventario"), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventario(docs);
    });
    return () => unsubscribe();
  }, []);

  const agregarEquipo = async () => {
    if (guardando) return;
    if (!form.serie || !form.nombre) return alert("Completa al menos Nombre y Serie.");

    setGuardando(true);
    try {
      if (editId) {
        await updateDoc(doc(db, "inventario", editId), form);
        alert("Equipo actualizado");
        setEditId(null);
      } else {
        await addDoc(collection(db, "inventario"), form);
        alert("Equipo registrado");
      }
      setForm(initialFormState);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar en Firebase");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarEquipo = async (id) => {
    if (window.confirm("¿Eliminar este activo permanentemente?")) {
      await deleteDoc(doc(db, "inventario", id));
    }
  };

  const prepararEdicion = (item) => {
    setForm(item);
    setEditId(item.id);
    setView('dashboard');
  };

  const filtrados = inventario.filter(item => {
    const termino = busqueda.toLowerCase();
    return (
      (item.nombre || "").toLowerCase().includes(termino) ||
      (item.serie || "").toLowerCase().includes(termino) ||
      (item.hostName || "").toLowerCase().includes(termino)
    ) && (filtroTienda === "" || item.tiendaOficina === filtroTienda);
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      {/* HEADER DINÁMICO */}
      <header className="max-w-6xl mx-auto mb-8 bg-blue-900 p-6 rounded-2xl shadow-2xl text-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">📦 INVENTARIO TI</h1>
            <p className="text-blue-200 text-sm">Panel de Gestión de Activos Tecnológicos</p>
          </div>
          <div className="flex bg-blue-800 p-1 rounded-xl">
            <button onClick={() => setView('dashboard')} className={`px-6 py-2 rounded-lg font-bold text-sm transition ${view === 'dashboard' ? 'bg-white text-blue-900 shadow' : 'text-white hover:bg-blue-700'}`}>
              REGISTRO
            </button>
            <button onClick={() => setView('listado')} className={`px-6 py-2 rounded-lg font-bold text-sm transition ${view === 'listado' ? 'bg-white text-blue-900 shadow' : 'text-white hover:bg-blue-700'}`}>
              BODEGA / LISTADO
            </button>
          </div>
        </div>
      </header>

      {view === 'dashboard' && (
        <main className="max-w-5xl mx-auto">
          <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-200">
            <h2 className="text-2xl font-black text-slate-800 mb-8 border-b pb-4">
              {editId ? '📝 Editando Ficha de Activo' : '✨ Alta de Nuevo Notebook'}
            </h2>
            
            <div className="space-y-10">
              {/* SECCIÓN A: DATOS PERSONALES */}
              <section>
                <h3 className="text-blue-600 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="bg-blue-100 p-1 rounded">01</span> DATOS DEL USUARIO RESPONSABLE
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Nombre Completo</label>
                    <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Ej: Juan Pérez" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Correo Electrónico</label>
                    <input value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="usuario@empresa.cl" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Área / Gerencia</label>
                    <select value={form.area} onChange={e => setForm({...form, area: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                      <option value="">Seleccionar...</option>
                      {areas.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              {/* SECCIÓN B: DATOS DEL EQUIPO */}
              <section>
                <h3 className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="bg-indigo-100 p-1 rounded">02</span> ESPECIFICACIONES TÉCNICAS DEL EQUIPO
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Número de Serie (S/N)</label>
                    <input value={form.serie} onChange={e => setForm({...form, serie: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm" placeholder="Obligatorio" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Marca</label>
                    <select value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <option value="">Marca...</option>
                      {laptopBrands.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Estado Operativo</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className={`p-3 border rounded-xl font-bold ${form.status === 'En Bodega' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                      {assetStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <input placeholder="Procesador" value={form.procesador} onChange={e => setForm({...form, procesador: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  <input placeholder="RAM (GB)" value={form.memoriaRAM} onChange={e => setForm({...form, memoriaRAM: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  <input placeholder="SSD (GB)" value={form.memoriaSSD} onChange={e => setForm({...form, memoriaSSD: e.target.value})} className="p-3 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </section>

              <div className="flex gap-4 pt-6">
                <button onClick={agregarEquipo} disabled={guardando} className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 uppercase tracking-widest disabled:bg-slate-300">
                  {guardando ? 'Procesando...' : (editId ? 'Actualizar Registro' : 'Guardar en Base de Datos')}
                </button>
                {editId && (
                   <button onClick={() => {setEditId(null); setForm(initialFormState);}} className="px-8 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition">
                     Cancelar
                   </button>
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {view === 'listado' && (
        <main className="max-w-full mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-500 text-xs font-bold uppercase">En Uso</p>
              <p className="text-2xl font-black text-blue-600">{inventario.filter(i => i.status === 'En Uso').length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-500 text-xs font-bold uppercase">En Bodega</p>
              <p className="text-2xl font-black text-green-600">{inventario.filter(i => i.status === 'En Bodega').length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-500 text-xs font-bold uppercase">Reparación</p>
              <p className="text-2xl font-black text-orange-600">{inventario.filter(i => i.status === 'En Reparación').length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-500 text-xs font-bold uppercase">Total Activos</p>
              <p className="text-2xl font-black text-slate-800">{inventario.length}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input className="flex-1 p-4 rounded-2xl shadow-inner bg-slate-200 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="🔍 Buscar por nombre, serie o hostname..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            <select className="p-4 rounded-2xl bg-white border border-slate-200 font-bold" value={filtroTienda} onChange={e => setFiltroTienda(e.target.value)}>
              <option value="">Todas las Tiendas</option>
              {tiendas.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="p-4 font-bold uppercase text-xs tracking-widest">Acciones</th>
                  <th className="p-4 font-bold uppercase text-xs tracking-widest">Estado</th>
                  <th className="p-4 font-bold uppercase text-xs tracking-widest">Usuario</th>
                  <th className="p-4 font-bold uppercase text-xs tracking-widest">Serie</th>
                  <th className="p-4 font-bold uppercase text-xs tracking-widest">Marca/Modelo</th>
                  <th className="p-4 font-bold uppercase text-xs tracking-widest">Ubicación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map(item => (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors group">
                    <td className="p-4 flex gap-2">
                      <button onClick={() => prepararEdicion(item)} className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition">Edit</button>
                      <button onClick={() => eliminarEquipo(item.id)} className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-600 hover:text-white transition">Del</button>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.status === 'En Uso' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-700">{item.nombre}</td>
                    <td className="p-4 font-mono text-xs text-slate-500">{item.serie}</td>
                    <td className="p-4">{item.marca} {item.modelo}</td>
                    <td className="p-4 text-slate-500">{item.tiendaOficina || item.seccion}</td>
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