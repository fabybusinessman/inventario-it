import React, { useState, useEffect, useCallback } from 'react';
import { db } from './firebase'; // Importamos la instancia de la DB
import { collection, getDocs, addDoc } from 'firebase/firestore'; // Funciones de Firestore

function App() {
  const [inventario, setInventario] = useState([]);

  const initialFormState = {
    nombre: '',
    area: '',
    tiendaOficina: '',
    cargo: '',
    correo: '',
    fechaEntrega: '',
    cuentaAdmin: '',
    nombreUsuario: '',
    hostName: '',
    macAddress: '',
    estadoAV: 'Activo',
    marca: '',
    modelo: '',
    serie: '',
    caracteristicas: '',
    accesorios: '',
    observaciones: '',
    color: ''
  };

  const fieldLabels = {
    nombre: 'Nombre',
    area: 'Área',
    tiendaOficina: 'Tienda / Oficina',
    cargo: 'Cargo',
    correo: 'Correo',
    fechaEntrega: 'Fecha de Entrega',
    cuentaAdmin: 'Cuenta Admin',
    nombreUsuario: 'Nombre de usuario',
    hostName: 'Host Name',
    macAddress: 'Mac Address',
    estadoAV: 'Estado AV',
    marca: 'Marca',
    modelo: 'Modelo',
    serie: 'Serie',
    caracteristicas: 'Características',
    accesorios: 'Accesorios',
    observaciones: 'Observaciones',
    color: 'Color'
  };

  const [form, setForm] = useState(initialFormState);
  const [busqueda, setBusqueda] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [view, setView] = useState('dashboard');

  // Usamos useCallback para memorizar la función y evitar que se recree en cada render
  const fetchInventario = useCallback(async () => {
    const querySnapshot = await getDocs(collection(db, "inventario"));
    const inventarioData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log("📦 Datos descargados de Firebase:", inventarioData);
    setInventario(inventarioData);
  }, []);

  // useEffect para cargar los datos de Firebase al iniciar el componente
  useEffect(() => {
    fetchInventario();
  }, [fetchInventario]);

  const agregarEquipo = async () => {
    if (guardando) return; // Evitar doble click
    if (!form.serie || !form.nombre) {
      return alert("Completa al menos Nombre y Serie del equipo.");
    }

    setGuardando(true);
    try {
      // Guardamos el objeto completo en Firestore
      await addDoc(collection(db, "inventario"), form);

      fetchInventario(); // Recargamos la lista

      // Limpiamos el formulario
      setForm(initialFormState);

    } catch (error) {
      console.error("Error al guardar el equipo:", error);
      alert("Hubo un error al guardar el equipo. Revisa la consola (F12) para más detalles.");
    } finally {
      setGuardando(false);
    }
  };

  const filtrados = inventario.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-8 bg-blue-900 p-6 rounded-2xl shadow-xl text-white">
        <div>
          <h1 className="text-3xl font-bold">📦 Sistema de Inventario IT</h1>
          <p className="opacity-80">Gestión Interna de Equipamiento</p>
        </div>
        <div className="mt-4 border-t border-blue-800 pt-4 flex space-x-2">
          <button onClick={() => setView('dashboard')} className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${view === 'dashboard' ? 'bg-white text-blue-900' : 'bg-blue-800 text-white hover:bg-blue-700'}`}>
            Dashboard
          </button>
          <button onClick={() => setView('listado')} className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${view === 'listado' ? 'bg-white text-blue-900' : 'bg-blue-800 text-white hover:bg-blue-700'}`}>
            Listado Completo
          </button>
        </div>
      </header>

      {view === 'dashboard' && (
        <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-blue-900 border-b pb-2">Registrar Equipo</h2>
            <div className="space-y-4">
            <input placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" />
            <input placeholder="Área" value={form.area} onChange={e => setForm({...form, area: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" />
            <input placeholder="Tienda / Oficina" value={form.tiendaOficina} onChange={e => setForm({...form, tiendaOficina: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" />
            <input placeholder="Cargo" value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" />
            <input placeholder="Correo" type="email" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" />
            <input placeholder="Fecha de Entrega" type="date" value={form.fechaEntrega} onChange={e => setForm({...form, fechaEntrega: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" />
            <input placeholder="Cuenta Admin" value={form.cuentaAdmin} onChange={e => setForm({...form, cuentaAdmin: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" />
            <input placeholder="Nombre de usuario" value={form.nombreUsuario} onChange={e => setForm({...form, nombreUsuario: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" />
            <input placeholder="Host Name" value={form.hostName} onChange={e => setForm({...form, hostName: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" />
            <input placeholder="Mac Address" value={form.macAddress} onChange={e => setForm({...form, macAddress: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" />
            <select value={form.estadoAV} onChange={e => setForm({...form, estadoAV: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg">
              <option>Activo</option>
              <option>Inactivo</option>
              <option>Pendiente</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Marca" value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} className="p-2 bg-gray-50 border rounded-lg" />
              <input placeholder="Modelo" value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} className="p-2 bg-gray-50 border rounded-lg" />
            </div>
            <input placeholder="Serie" value={form.serie} onChange={e => setForm({...form, serie: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" />
            <input placeholder="Características" value={form.caracteristicas} onChange={e => setForm({...form, caracteristicas: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" />
            <input placeholder="Accesorios" value={form.accesorios} onChange={e => setForm({...form, accesorios: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" />
            <input placeholder="Observaciones" value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" />
            <input placeholder="Color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" />
            <button onClick={agregarEquipo} disabled={guardando} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed">
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <input type="text" className="w-full p-4 rounded-xl shadow-sm border-none" placeholder="🔍 Buscar en todo el inventario..." onChange={(e) => setBusqueda(e.target.value)} />
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b text-blue-900 text-xs font-bold uppercase">
                  <tr>
                    <th className="p-4">Nombre</th>
                    <th className="p-4">Serie</th>
                    <th className="p-4">Marca</th>
                    <th className="p-4">Modelo</th>
                    <th className="p-4">Tienda / Oficina</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtrados.map(item => (
                    <tr key={item.id} className="hover:bg-blue-50">
                      <td className="p-4 font-medium">{item.nombre}</td>
                      <td className="p-4 font-mono text-blue-700 font-bold">{item.serie}</td>
                      <td className="p-4 text-sm">{item.marca}</td>
                      <td className="p-4 text-sm">{item.modelo}</td>
                      <td className="p-4">{item.tiendaOficina}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {view === 'listado' && (
        <main className="max-w-full mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-blue-900">Listado Completo de Inventario</h2>
          <input type="text" className="w-full p-4 rounded-xl shadow-sm border-none" placeholder="🔍 Buscar en todo el inventario..." onChange={(e) => setBusqueda(e.target.value)} />
          <div className="mt-4 bg-white rounded-xl shadow-lg overflow-x-auto border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b text-blue-900 text-xs font-bold uppercase">
                <tr>
                  {Object.keys(initialFormState).map(key => (
                    <th key={key} className="p-3 whitespace-nowrap">{fieldLabels[key] || key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtrados.map(item => (
                  <tr key={item.id} className="hover:bg-blue-50">
                    {Object.keys(initialFormState).map(key => (
                      <td key={key} className="p-3 whitespace-nowrap">{item[key] || '-'}</td>
                    ))}
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