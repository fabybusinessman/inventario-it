import React, { useState, useEffect, useCallback } from 'react';
import { db } from './firebase'; // Importamos la instancia de la DB
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'; // Funciones de Firestore

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
    status: 'En Bodega', // Estado del activo (En Uso, Bodega, etc.)
    estadoAV: 'Actualizado', // Estado del Antivirus
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
    historial: [] // Array para guardar el timeline
  };

  const fieldLabels = {
    nombre: 'Nombre',
    seccion: 'Sección',
    area: 'Área',
    tiendaOficina: 'Tienda / Oficina',
    cargo: 'Cargo',
    correo: 'Correo',
    fechaEntrega: 'Fecha de Entrega',
    cuentaAdmin: 'Cuenta Admin',
    nombreUsuario: 'Nombre de usuario',
    hostName: 'Host Name',
    macAddress: 'Mac Address',
    status: 'Estado Activo',
    estadoAV: 'Estado Antivirus',
    marca: 'Marca',
    modelo: 'Modelo',
    procesador: 'Procesador',
    memoriaRAM: 'Memoria RAM',
    memoriaSSD: 'Memoria SSD',
    sistemaOperativo: 'Sistema Operativo',
    serie: 'Serie',
    caracteristicas: 'Características',
    accesorios: 'Accesorios',
    observaciones: 'Observaciones',
    color: 'Color'
  };

  const laptopBrands = [
    "Acer", "Alienware", "Apple", "Asus", "Dell", "Gateway", "Gigabyte", "HP", "Huawei",
    "Lenovo", "LG", "Microsoft", "MSI", "Razer", "Samsung", "Sony", "Toshiba"
  ];

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

  const [form, setForm] = useState(initialFormState);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTienda, setFiltroTienda] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [editId, setEditId] = useState(null);
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
      if (editId) {
        await updateDoc(doc(db, "inventario", editId), form);
        alert("Equipo actualizado correctamente");
        setEditId(null);
      } else {
        await addDoc(collection(db, "inventario"), form);
        alert("Equipo registrado correctamente");
      }

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

  const eliminarEquipo = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este equipo?")) return;
    try {
      await deleteDoc(doc(db, "inventario", id));
      alert("Equipo eliminado correctamente");
      fetchInventario();
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar el equipo.");
    }
  };

  const prepararEdicion = (item) => {
    const { id, ...data } = item;
    setForm(data);
    setEditId(id);
    setView('dashboard');
  };

  const filtrados = inventario.filter(item =>
    (filtroTienda === "" || item.tiendaOficina === filtroTienda) &&
    (Object.values(item).some(value =>
      String(value).toLowerCase().includes(busqueda.toLowerCase())
    ))
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
        <main className="max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-blue-900 border-b pb-2">{editId ? 'Modificar Equipo' : 'Registrar Nuevo Equipo'}</h2>
            <div className="space-y-4">
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg></span><input placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full p-2 pl-10 bg-gray-50 border rounded-lg" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className={`relative ${form.seccion !== 'Tiendas' ? 'col-span-2' : ''}`}><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" clipRule="evenodd" /></svg></span>
                  <select value={form.seccion} onChange={e => {
                    const val = e.target.value;
                    setForm({ ...form, seccion: val, tiendaOficina: val === 'Tiendas' ? '' : val });
                  }} className="w-full p-2 pl-10 bg-gray-50 border rounded-lg appearance-none">
                    <option value="">Ubicación</option>
                    <option value="Bicentenario">Bicentenario</option>
                    <option value="Bodenor">Bodenor</option>
                    <option value="Tiendas">Tiendas</option>
                  </select>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></span>
                </div>
                {form.seccion === 'Tiendas' && (
                  <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg></span>
                      <select value={form.tiendaOficina} onChange={e => setForm({...form, tiendaOficina: e.target.value})} className="w-full p-2 pl-10 bg-gray-50 border rounded-lg appearance-none">
                        <option value="">Seleccione Tienda</option>
                        {tiendas.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></span>
                  </div>
                )}
              </div>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a2 2 0 00-2 2v1H6a2 2 0 00-2 2v7a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2V4a2 2 0 00-2-2zm-2 4V4h4v2h-4z" clipRule="evenodd" /></svg></span><input list="areas" placeholder="Área" value={form.area} onChange={e => setForm({...form, area: e.target.value})} className="w-full p-2 pl-10 bg-gray-50 border rounded-lg" /><datalist id="areas">{areas.map(a => <option key={a} value={a} />)}</datalist></div>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm10 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg></span><input placeholder="Cargo" value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})} className="w-full p-2 pl-10 bg-gray-50 border rounded-lg" /></div>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg></span><input placeholder="Correo" type="email" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} className="w-full p-2 pl-10 bg-gray-50 border rounded-lg" /></div>
              <div className="relative">
                <label className="absolute -top-2 left-8 bg-white px-1 text-xs text-gray-400">Fecha de Entrega</label>
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg></span>
                <input type="date" value={form.fechaEntrega} onChange={e => setForm({...form, fechaEntrega: e.target.value})} className="w-full p-2 pl-10 bg-gray-50 border rounded-lg" />
              </div>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg></span><input placeholder="Cuenta Admin" value={form.cuentaAdmin} onChange={e => setForm({...form, cuentaAdmin: e.target.value})} className="w-full p-2 pl-10 bg-gray-50 border rounded-lg" /></div>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" /></svg></span><input placeholder="Nombre de usuario" value={form.nombreUsuario} onChange={e => setForm({...form, nombreUsuario: e.target.value})} className="w-full p-2 pl-10 bg-gray-50 border rounded-lg" /></div>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.492a.75.75 0 01-.738.958H6.835a.75.75 0 01-.738-.958l.123-.492H3a2 2 0 01-2-2V5zm2-1a1 1 0 00-1 1v8a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5z" clipRule="evenodd" /></svg></span><input placeholder="Host Name" value={form.hostName} onChange={e => setForm({...form, hostName: e.target.value})} className="w-full p-2 pl-10 bg-gray-50 border rounded-lg" /></div>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg></span><input placeholder="Mac Address" value={form.macAddress} onChange={e => setForm({...form, macAddress: e.target.value})} className="w-full p-2 pl-10 bg-gray-50 border rounded-lg" /></div>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></span>
                <select value={form.estadoAV} onChange={e => setForm({...form, estadoAV: e.target.value})} className="w-full p-2 pl-10 bg-gray-50 border rounded-lg appearance-none">
                  <option>Activo</option>
                  <option>Inactivo</option>
                  <option>Pendiente</option>
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5a.997.997 0 01.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg></span>
                <input list="brands" placeholder="Marca" value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} className="w-full p-2 pl-10 bg-gray-50 border rounded-lg" />
                <datalist id="brands">{laptopBrands.map(brand => <option key={brand} value={brand} />)}</datalist>
              </div>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5a.997.997 0 01.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg></span><input placeholder="Modelo" value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} className="w-full p-2 pl-10 bg-gray-50 border rounded-lg" /></div>
             <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6 4.75A.75.75 0 016.75 4h1.5a.75.75 0 01.75.75v1h2v-1a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v1h.75a2.25 2.25 0 012.25 2.25v.75h1a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-1v2h1a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-1v.75A2.25 2.25 0 0114.75 16h-.75v1a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-1h-2v1a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-1h-.75A2.25 2.25 0 013 13.75v-.75h-1a.75.75 0 01-.75-.75v-1.5a.75.75 0 01.75-.75h1v-2h-1a.75.75 0 01-.75-.75v-1.5a.75.75 0 01.75-.75h1v-.75A2.25 2.25 0 015.25 6h.75v-1.25ZM6.5 7.5a.75.75 0 00-.75.75v3.5c0 .414.336.75.75.75h3.5a.75.75 0 00.75-.75v-3.5a.75.75 0 00-.75-.75h-3.5Z" /></svg></span><input placeholder="Procesador" value={form.procesador} onChange={e => setForm({...form, procesador: e.target.value})} className="w-full p-2 pl-10 bg-gray-50 border rounded-lg" /></div>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2z" /></svg></span><input placeholder="Memoria RAM" value={form.memoriaRAM} onChange={e => setForm({...form, memoriaRAM: e.target.value})} className="w-full p-2 pl-10 bg-gray-50 border rounded-lg" /></div>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" /></svg></span><input placeholder="Memoria SSD" value={form.memoriaSSD} onChange={e => setForm({...form, memoriaSSD: e.target.value})} className="w-full p-2 pl-10 bg-gray-50 border rounded-lg" /></div>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2v9h10V6H5z" /></svg></span><input placeholder="Sistema Operativo" value={form.sistemaOperativo} onChange={e => setForm({...form, sistemaOperativo: e.target.value})} className="w-full p-2 pl-10 bg-gray-50 border rounded-lg" /></div>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h2a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg></span><input placeholder="Serie" value={form.serie} onChange={e => setForm({...form, serie: e.target.value})} className="w-full p-2 pl-10 bg-gray-50 border rounded-lg" /></div>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg></span><input placeholder="Características" value={form.caracteristicas} onChange={e => setForm({...form, caracteristicas: e.target.value})} className="w-full p-2 pl-10 bg-gray-50 border rounded-lg" /></div>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg></span><input placeholder="Accesorios" value={form.accesorios} onChange={e => setForm({...form, accesorios: e.target.value})} className="w-full p-2 pl-10 bg-gray-50 border rounded-lg" /></div>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.08-3.242A8.995 8.995 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.707 14.293a1 1 0 01.293-.707l.001-.001L6 12.586l-2-2L2.586 12l-.001.001a1 1 0 01-.707-.293 1 1 0 010-1.414l2-2a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-2 2a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></span><input placeholder="Observaciones" value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})} className="w-full p-2 pl-10 bg-gray-50 border rounded-lg" /></div>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></span><input placeholder="Color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} className="w-full p-2 pl-10 bg-gray-50 border rounded-lg" /></div>
              <button onClick={agregarEquipo} disabled={guardando} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed">
                {guardando ? 'Guardando...' : (editId ? 'Actualizar Equipo' : 'Guardar')}
              </button>
            </div>
            </div>
        </main>
      )}

      {view === 'listado' && (
        <main className="max-w-full mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-blue-900">Listado Completo de Inventario</h2>
          <div className="flex gap-4 mb-4">
            <input type="text" className="flex-1 p-4 rounded-xl shadow-sm border-none" placeholder="🔍 Buscar en todo el inventario..." onChange={(e) => setBusqueda(e.target.value)} />
            <select className="p-4 rounded-xl shadow-sm border-none bg-white" value={filtroTienda} onChange={(e) => setFiltroTienda(e.target.value)}>
              <option value="">Todas las Tiendas/Oficinas</option>
              {[...new Set(inventario.map(i => i.tiendaOficina))].filter(Boolean).sort().map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="mt-4 bg-white rounded-xl shadow-lg overflow-x-auto border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b text-blue-900 text-xs font-bold uppercase">
                <tr>
                  <th className="p-3 whitespace-nowrap text-center">Acciones</th>
                  {Object.keys(initialFormState).map(key => (
                    key !== 'historial' && <th key={key} className="p-3 whitespace-nowrap">{fieldLabels[key] || key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtrados.map(item => {
                  // Alerta visual para AV desactualizado
                  const rowClass = item.estadoAV === 'Desactualizado' || item.estadoAV === 'Error' ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-blue-50';
                  
                  return (
                  <tr key={item.id} className={rowClass}>
                    <td className="p-3 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => prepararEdicion(item)} className="text-blue-600 hover:text-blue-800 p-1" title="Modificar">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                        </button>
                        <button onClick={() => generarActa(item)} className="text-green-600 hover:text-green-800 p-1" title="Generar Acta">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                        </button>
                        <button onClick={() => eliminarEquipo(item.id)} className="text-red-600 hover:text-red-800 p-1" title="Eliminar">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.108 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                        </button>
                      </div>
                    </td>
                    {Object.keys(initialFormState).map(key => (
                      key !== 'historial' && <td key={key} className="p-3 whitespace-nowrap">{item[key] || '-'}</td>
                    ))}
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;