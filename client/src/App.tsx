import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Boxes,
  Package,
  Search,
  Plus,
  RefreshCw,
  LogOut,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Layers3,
  CircleDollarSign,
  PackageOpen,
  SlidersHorizontal,
  LockKeyhole,
  Mail,
  ExternalLink,
} from "lucide-react";
import {
  ApiError,
  guardarSesion,
  leerSesion,
  request,
  type DatosProducto,
  type Producto,
  type Sesion,
} from "./api";

const moneda = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
  maximumFractionDigits: 2,
});
type Aviso = { tipo: "exito" | "error"; texto: string };
type Modal =
  | { tipo: "crear" }
  | { tipo: "editar" | "ver" | "eliminar"; producto: Producto };
const categorias = ["Papelería", "Tecnología", "Hogar", "Accesorios", "Otros"];
function Marca({ clara = false }: { clara?: boolean }) {
  return (
    <div className={`marca ${clara ? "clara" : ""}`}>
      <span className="marca-icono">
        <Boxes size={25} strokeWidth={1.7} />
      </span>
      <span>
        estante<span className="marca-punto">.</span>
      </span>
    </div>
  );
}
function Mensaje({ aviso, cerrar }: { aviso: Aviso; cerrar: () => void }) {
  return (
    <div
      className={`aviso ${aviso.tipo}`}
      role={aviso.tipo === "error" ? "alert" : "status"}
    >
      {aviso.tipo === "exito" ? (
        <CheckCircle2 size={20} />
      ) : (
        <AlertCircle size={20} />
      )}
      <span>{aviso.texto}</span>
      <button className="icono" onClick={cerrar} aria-label="Cerrar mensaje">
        <X size={18} />
      </button>
    </div>
  );
}
function Dialogo({
  children,
  titulo,
  cerrar,
  ocupado,
  ancho = "",
}: {
  children: ReactNode;
  titulo: string;
  cerrar: () => void;
  ocupado: boolean;
  ancho?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className={ancho}
      aria-labelledby="dialogo-titulo"
      onCancel={(e) => {
        e.preventDefault();
        if (!ocupado) cerrar();
      }}
    >
      <div className="dialogo-cabecera">
        <h2 id="dialogo-titulo">{titulo}</h2>
        <button
          autoFocus
          className="icono"
          onClick={cerrar}
          disabled={ocupado}
          aria-label="Cerrar ventana"
        >
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function Login({
  ingresar,
  aviso,
  cerrarAviso,
}: {
  ingresar: (correo: string, contrasena: string) => Promise<void>;
  aviso: Aviso | null;
  cerrarAviso: () => void;
}) {
  const [ocupado, setOcupado] = useState(false),
    [visible, setVisible] = useState(false);
  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    setOcupado(true);
    try {
      await ingresar(
        String(datos.get("correo")).trim(),
        String(datos.get("contrasena")),
      );
    } finally {
      setOcupado(false);
    }
  }
  return (
    <main className="login">
      <section className="login-presentacion">
        <Marca clara />
        <div className="login-historia">
          <span className="etiqueta-clara">TU INVENTARIO, EN ORDEN</span>
          <h1>
            Un lugar para
            <br />
            cada producto.
          </h1>
          <p>
            Administra tu catálogo, actualiza las existencias y mantén todo bajo
            control.
          </p>
          <div className="ilustracion" aria-hidden="true">
            <div className="caja caja-1">
              <Package size={50} strokeWidth={1} />
            </div>
            <div className="caja caja-2">
              <Layers3 size={35} strokeWidth={1.2} />
            </div>
            <div className="caja caja-3">
              <Boxes size={68} strokeWidth={1} />
            </div>
            <div className="linea-estante" />
            <span className="ilustracion-nota">
              Menos desorden. Más claridad.
            </span>
          </div>
        </div>
        <p className="login-pie">
          PROYECTO PROGRAMADO 2 <span>React + ASP.NET Core + SQL Server</span>
        </p>
      </section>
      <section className="login-formulario">
        <div className="acceso">
          <span className="icono-acceso">
            <LockKeyhole size={25} />
          </span>
          <p className="sobretitulo">BIENVENIDO A ESTANTE</p>
          <h2>Inicia sesión</h2>
          <p className="texto-secundario">
            Ingresa tus credenciales para administrar el inventario.
          </p>
          {aviso && <Mensaje aviso={aviso} cerrar={cerrarAviso} />}
          <form onSubmit={enviar}>
            <label htmlFor="correo">Correo electrónico</label>
            <div className="campo-icono">
              <Mail size={18} />
              <input
                id="correo"
                name="correo"
                type="email"
                autoComplete="username"
                maxLength={254}
                placeholder="tu@correo.com"
                required
                disabled={ocupado}
              />
            </div>
            <label htmlFor="contrasena">Contraseña</label>
            <div className="campo-icono">
              <LockKeyhole size={18} />
              <input
                id="contrasena"
                name="contrasena"
                type={visible ? "text" : "password"}
                maxLength={128}
                autoComplete="current-password"
                placeholder="Tu contraseña"
                required
                disabled={ocupado}
              />
              <button
                type="button"
                className="icono"
                onClick={() => setVisible(!visible)}
                aria-label={
                  visible ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button className="boton primario ancho" disabled={ocupado}>
              {ocupado ? "Validando credenciales…" : "Ingresar al inventario"}
            </button>
          </form>
          <p className="nota-seguridad">
            <ShieldCheck size={16} />
            Acceso validado por la API de productos.
          </p>
        </div>
        <p className="login-formulario-pie">
          Un inventario organizado empieza aquí.
        </p>
      </section>
    </main>
  );
}

function FormularioProducto({
  producto,
  guardar,
  cancelar,
  ocupado,
  error,
}: {
  producto?: Producto;
  guardar: (datos: DatosProducto) => void;
  cancelar: () => void;
  ocupado: boolean;
  error: string;
}) {
  const [errores, setErrores] = useState<Record<string, string>>({});
  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    const nombre = String(datos.get("nombre")).trim(),
      categoria = String(datos.get("categoria")).trim();
    const precioTexto = String(datos.get("precio")),
      existenciasTexto = String(datos.get("existencias"));
    const precio = Number(precioTexto),
      existencias = Number(existenciasTexto);
    const fallos: Record<string, string> = {};
    if (!nombre) fallos.nombre = "Escribe el nombre del producto.";
    if (!categoria) fallos.categoria = "Escribe o selecciona una categoría.";
    if (
      !precioTexto ||
      !Number.isFinite(precio) ||
      precio < 0.01 ||
      precio > 999999999.99 ||
      !/^\d+(\.\d{1,2})?$/.test(precioTexto)
    )
      fallos.precio =
        "Usa un precio entre 0,01 y 999 999 999,99, con hasta dos decimales.";
    if (
      !existenciasTexto ||
      !Number.isInteger(existencias) ||
      existencias < 0 ||
      existencias > 1000000
    )
      fallos.existencias = "Usa un número entero entre 0 y 1 000 000.";
    setErrores(fallos);
    if (Object.keys(fallos).length) return;
    guardar({
      nombre,
      categoria,
      precio,
      existencias,
      descripcion: String(datos.get("descripcion")).trim(),
    });
  }
  return (
    <form onSubmit={enviar} className="producto-formulario">
      <p className="texto-secundario">
        Los campos marcados con * son obligatorios.
      </p>
      {error && (
        <div className="error-formulario" role="alert">
          <AlertCircle size={18} />
          {error}
        </div>
      )}
      <fieldset disabled={ocupado}>
        <label htmlFor="nombre">Nombre del producto *</label>
        <input
          id="nombre"
          name="nombre"
          defaultValue={producto?.nombre}
          placeholder="Ej. Cuaderno de puntos A5"
          required
          maxLength={120}
          aria-invalid={!!errores.nombre}
          aria-describedby={errores.nombre ? "error-nombre" : undefined}
        />
        {errores.nombre && (
          <small id="error-nombre" className="campo-error">
            {errores.nombre}
          </small>
        )}
        <label htmlFor="categoria">Categoría *</label>
        <input
          id="categoria"
          name="categoria"
          list="categorias"
          defaultValue={producto?.categoria}
          maxLength={60}
          required
          placeholder="Selecciona o escribe una categoría"
          aria-invalid={!!errores.categoria}
        />
        <datalist id="categorias">
          {categorias.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        {errores.categoria && (
          <small className="campo-error">{errores.categoria}</small>
        )}
        <div className="dos-columnas">
          <div>
            <label htmlFor="precio">Precio unitario (₡) *</label>
            <input
              id="precio"
              name="precio"
              type="number"
              inputMode="decimal"
              min="0.01"
              max="999999999.99"
              step="0.01"
              required
              defaultValue={producto?.precio}
              placeholder="0,00"
              aria-invalid={!!errores.precio}
            />
            {errores.precio && (
              <small className="campo-error">{errores.precio}</small>
            )}
          </div>
          <div>
            <label htmlFor="existencias">Existencias *</label>
            <input
              id="existencias"
              name="existencias"
              type="number"
              inputMode="numeric"
              min="0"
              max="1000000"
              step="1"
              required
              defaultValue={producto?.existencias ?? 0}
              aria-invalid={!!errores.existencias}
            />
            {errores.existencias && (
              <small className="campo-error">{errores.existencias}</small>
            )}
          </div>
        </div>
        <label htmlFor="descripcion">
          Descripción <span className="opcional">(opcional)</span>
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          defaultValue={producto?.descripcion}
          maxLength={500}
          rows={3}
          placeholder="Detalles que ayuden a identificar el producto"
        />
      </fieldset>
      <div className="dialogo-acciones">
        <button
          type="button"
          className="boton secundario"
          onClick={cancelar}
          disabled={ocupado}
        >
          Cancelar
        </button>
        <button className="boton primario" disabled={ocupado}>
          {ocupado
            ? "Guardando…"
            : producto
              ? "Guardar cambios"
              : "Agregar producto"}
        </button>
      </div>
    </form>
  );
}

export default function App() {
  const [sesion, setSesion] = useState<Sesion | null>(leerSesion);
  const [productos, setProductos] = useState<Producto[]>([]),
    [cargando, setCargando] = useState(false);
  const [cargado, setCargado] = useState(false),
    [aviso, setAviso] = useState<Aviso | null>(null);
  const [busqueda, setBusqueda] = useState(""),
    [categoria, setCategoria] = useState("");
  const [id, setId] = useState(""),
    [consulta, setConsulta] = useState<Producto | null>(null);
  const [modal, setModal] = useState<Modal | null>(null),
    [ocupado, setOcupado] = useState(false),
    [errorModal, setErrorModal] = useState("");
  const consultaNumero = useRef(0);
  const tokenActual = useRef(sesion?.token);
  tokenActual.current = sesion?.token;
  function cambiarSesion(s: Sesion | null) {
    guardarSesion(s);
    setSesion(s);
  }
  function salir(texto = "Sesión cerrada correctamente.") {
    tokenActual.current = undefined;
    consultaNumero.current++;
    cambiarSesion(null);
    setProductos([]);
    setCargado(false);
    setConsulta(null);
    setModal(null);
    setAviso({ tipo: "exito", texto });
    setBusqueda("");
    setCategoria("");
    setId("");
  }
  function fallo(error: unknown, enModal = false) {
    const texto =
      error instanceof Error ? error.message : "Ocurrió un error inesperado.";
    if (error instanceof ApiError && error.status === 401) {
      salir();
      setAviso({ tipo: "error", texto });
    } else if (enModal) setErrorModal(texto);
    else setAviso({ tipo: "error", texto });
  }
  async function ingresar(correo: string, contrasena: string) {
    try {
      const datos = await request<{ accessToken: string; expiresIn: number }>(
        "/api/auth/login",
        { method: "POST", data: { correo, contrasena } },
      );
      if (!datos.accessToken || !Number.isFinite(datos.expiresIn))
        throw new ApiError("La API no devolvió una sesión válida.");
      cambiarSesion({
        token: datos.accessToken,
        correo,
        vence: Date.now() + datos.expiresIn * 1000,
      });
      setAviso({
        tipo: "exito",
        texto: "Sesión iniciada. Bienvenido a tu inventario.",
      });
    } catch (e) {
      fallo(e);
    }
  }
  async function listar(mostrarExito = false) {
    if (!sesion) return;
    const numero = ++consultaNumero.current,
      token = sesion.token;
    setCargando(true);
    try {
      const datos = await request<Producto[]>("/api/productos", { token });
      if (numero !== consultaNumero.current || tokenActual.current !== token)
        return;
      if (!Array.isArray(datos))
        throw new ApiError("La API no devolvió un listado válido.");
      setProductos(datos);
      setCargado(true);
      if (mostrarExito) {
        setConsulta(null);
        setAviso({ tipo: "exito", texto: "Listado actualizado desde la API." });
      }
    } catch (e) {
      if (numero === consultaNumero.current && tokenActual.current === token)
        fallo(e);
    } finally {
      if (numero === consultaNumero.current) setCargando(false);
    }
  }
  useEffect(() => {
    if (sesion) {
      void listar();
      const timer = setTimeout(
        () => {
          salir();
          setAviso({
            tipo: "error",
            texto: "Tu sesión venció. Inicia sesión nuevamente.",
          });
        },
        Math.max(0, sesion.vence - Date.now()),
      );
      return () => clearTimeout(timer);
    }
  }, [sesion]);
  function abrir(m: Modal) {
    setErrorModal("");
    setModal(m);
  }
  async function consultar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!sesion) return;
    setOcupado(true);
    try {
      if (!/^\d+$/.test(id) || Number(id) < 1 || Number(id) > 2147483647)
        throw new ApiError(
          "Ingresa un identificador entero entre 1 y 2 147 483 647.",
        );
      const p = await request<Producto>(`/api/productos/${Number(id)}`, {
        token: sesion.token,
      });
      setConsulta(p);
      setBusqueda("");
      setCategoria("");
      setAviso({
        tipo: "exito",
        texto: `Producto #${p.id} consultado correctamente.`,
      });
    } catch (e) {
      setConsulta(null);
      fallo(e);
    } finally {
      setOcupado(false);
    }
  }
  async function obtener(p: Producto, tipo: "editar" | "ver") {
    if (!sesion) return;
    setOcupado(true);
    try {
      abrir({
        tipo,
        producto: await request<Producto>(`/api/productos/${p.id}`, {
          token: sesion.token,
        }),
      });
    } catch (e) {
      fallo(e);
    } finally {
      setOcupado(false);
    }
  }
  async function guardar(datos: DatosProducto) {
    if (
      !sesion ||
      !modal ||
      (modal.tipo !== "crear" && modal.tipo !== "editar")
    )
      return;
    setOcupado(true);
    setErrorModal("");
    const creando = modal.tipo === "crear";
    try {
      const p = await request<Producto>(
        creando ? "/api/productos" : `/api/productos/${modal.producto.id}`,
        { method: creando ? "POST" : "PUT", data: datos, token: sesion.token },
      );
      setProductos((actuales) =>
        creando
          ? [...actuales, p]
          : actuales.map((actual) => (actual.id === p.id ? p : actual)),
      );
      if (consulta?.id === p.id) setConsulta(p);
      if (creando) {
        setConsulta(null);
        setBusqueda("");
        setCategoria("");
      }
      setModal(null);
      setAviso({
        tipo: "exito",
        texto: `Producto #${p.id} ${creando ? "agregado" : "actualizado"} correctamente en la base de datos.`,
      });
      await listar();
    } catch (e) {
      fallo(e, true);
    } finally {
      setOcupado(false);
    }
  }
  async function eliminar() {
    if (!sesion || modal?.tipo !== "eliminar") return;
    setOcupado(true);
    setErrorModal("");
    try {
      await request(`/api/productos/${modal.producto.id}`, {
        method: "DELETE",
        token: sesion.token,
      });
      setProductos((actuales) =>
        actuales.filter((p) => p.id !== modal.producto.id),
      );
      if (consulta?.id === modal.producto.id) setConsulta(null);
      setModal(null);
      setAviso({
        tipo: "exito",
        texto: `Producto #${modal.producto.id} eliminado correctamente de la base de datos.`,
      });
      await listar();
    } catch (e) {
      fallo(e, true);
    } finally {
      setOcupado(false);
    }
  }
  if (!sesion)
    return (
      <Login
        ingresar={ingresar}
        aviso={aviso}
        cerrarAviso={() => setAviso(null)}
      />
    );
  const filtrados = (consulta ? [consulta] : productos).filter(
    (p) =>
      (!categoria || p.categoria === categoria) &&
      `${p.nombre} ${p.categoria} ${p.descripcion}`
        .toLocaleLowerCase("es")
        .includes(busqueda.toLocaleLowerCase("es")),
  );
  const unidades = productos.reduce((s, p) => s + p.existencias, 0),
    valor = productos.reduce((s, p) => s + p.precio * p.existencias, 0);
  const opciones = [...new Set(productos.map((p) => p.categoria))].sort(
    (a, b) => a.localeCompare(b, "es"),
  );
  return (
    <div className="aplicacion">
      <aside className="sidebar">
        <Marca />
        <div className="sidebar-menu">
          <span className="seccion-menu">ESPACIO DE TRABAJO</span>
          <div className="menu-activo">
            <Package size={20} />
            Productos<span>{cargado ? productos.length : "—"}</span>
          </div>
        </div>
        <div className="sidebar-nota">
          <span className="nota-icono">
            <Layers3 size={23} />
          </span>
          <strong>Todo en su lugar.</strong>
          <p>Un catálogo al día hace la diferencia.</p>
        </div>
        <div className="usuario">
          <span className="avatar">
            {sesion.correo.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <strong>Mi cuenta</strong>
            <span title={sesion.correo}>{sesion.correo}</span>
          </div>
          <button
            className="icono"
            onClick={() => salir()}
            disabled={ocupado}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <div className="contenido">
        <header className="barra-superior">
          <span>
            Mi espacio <span className="separador">/</span>{" "}
            <strong>Inventario</strong>
          </span>
          <div className="barra-derecha">
            <span className="proyecto-label">Proyecto programado 2</span>
            <button
              className="icono salir-movil"
              onClick={() => salir()}
              disabled={ocupado}
              aria-label="Cerrar sesión"
            >
              <LogOut size={19} />
            </button>
          </div>
        </header>
        <main className="principal">
          <div className="titulo-pagina">
            <div>
              <p className="sobretitulo">CATÁLOGO DE PRODUCTOS</p>
              <h1>
                Tu inventario, en orden<span>.</span>
              </h1>
              <p className="texto-secundario">
                Consulta y administra todos tus productos desde un solo lugar.
              </p>
            </div>
            <button
              className="boton primario"
              onClick={() => abrir({ tipo: "crear" })}
              disabled={ocupado}
            >
              <Plus size={19} />
              Agregar producto
            </button>
          </div>
          {aviso && <Mensaje aviso={aviso} cerrar={() => setAviso(null)} />}
          <section className="estadisticas" aria-label="Resumen del inventario">
            <article>
              <div>
                <span>Productos registrados</span>
                <strong>
                  {cargado ? productos.length.toLocaleString("es-CR") : "—"}
                </strong>
                <small>En tu catálogo</small>
              </div>
              <span className="estadistica-icono verde">
                <Package size={23} />
              </span>
            </article>
            <article>
              <div>
                <span>Unidades disponibles</span>
                <strong>
                  {cargado ? unidades.toLocaleString("es-CR") : "—"}
                </strong>
                <small>Existencias totales</small>
              </div>
              <span className="estadistica-icono azul">
                <Layers3 size={23} />
              </span>
            </article>
            <article>
              <div>
                <span>Valor del inventario</span>
                <strong className="valor-total">
                  {cargado ? moneda.format(valor) : "—"}
                </strong>
                <small>Precio × existencias</small>
              </div>
              <span className="estadistica-icono naranja">
                <CircleDollarSign size={23} />
              </span>
            </article>
          </section>
          <section
            className="panel-productos"
            aria-labelledby="titulo-productos"
          >
            <div className="panel-titulo">
              <div>
                <h2 id="titulo-productos">
                  Todos los productos{" "}
                  <span className="contador">
                    {cargado ? productos.length : "—"}
                  </span>
                </h2>
                <p>La información que necesitas, siempre a mano.</p>
              </div>
              <button
                className="boton secundario"
                onClick={() => void listar(true)}
                disabled={cargando || ocupado}
              >
                <RefreshCw size={16} className={cargando ? "girando" : ""} />
                {cargando ? "Cargando…" : "Actualizar"}
              </button>
            </div>
            <div className="filtros">
              <div className="campo-icono buscar">
                <Search size={18} />
                <input
                  aria-label="Buscar productos por nombre, categoría o descripción"
                  placeholder="Buscar en el listado…"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <div className="selector-categoria">
                <SlidersHorizontal size={17} />
                <select
                  aria-label="Filtrar por categoría"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  {opciones.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <form className="consulta-id" onSubmit={consultar}>
                <label htmlFor="buscar-id">Consultar ID</label>
                <input
                  id="buscar-id"
                  type="number"
                  min="1"
                  max="2147483647"
                  step="1"
                  required
                  placeholder="Ej. 1"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  disabled={ocupado}
                />
                <button
                  className="boton secundario"
                  aria-label="Consultar producto por ID"
                  disabled={ocupado}
                >
                  <Search size={17} />
                </button>
              </form>
            </div>
            {consulta && (
              <div className="resultado-consulta">
                Mostrando la consulta del producto #{consulta.id}
                <button
                  onClick={() => {
                    setConsulta(null);
                    setId("");
                  }}
                >
                  Ver todos los productos
                </button>
              </div>
            )}
            <div className="tabla-contenedor" aria-busy={cargando}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th className="numero">Precio unitario</th>
                    <th className="numero">Existencias</th>
                    <th>Estado</th>
                    <th className="acciones-titulo">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((p) => (
                    <tr key={p.id}>
                      <td className="id-producto">
                        #{String(p.id).padStart(3, "0")}
                      </td>
                      <td>
                        <div className="celda-producto">
                          <span
                            className={`producto-icono categoria-${opciones.indexOf(p.categoria) % 4}`}
                          >
                            <Package size={21} strokeWidth={1.6} />
                          </span>
                          <div>
                            <strong>{p.nombre}</strong>
                            <span>{p.descripcion || "Sin descripción"}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="categoria-badge">{p.categoria}</span>
                      </td>
                      <td className="numero precio">
                        {moneda.format(p.precio)}
                      </td>
                      <td className="numero">
                        {p.existencias.toLocaleString("es-CR")}
                        <span className="unidades"> uds.</span>
                      </td>
                      <td>
                        <span
                          className={`estado ${p.existencias === 0 ? "agotado" : p.existencias <= 5 ? "bajo" : "disponible"}`}
                        >
                          {p.existencias === 0
                            ? "Agotado"
                            : p.existencias <= 5
                              ? "Pocas unidades"
                              : "Disponible"}
                        </span>
                      </td>
                      <td>
                        <div className="acciones">
                          <button
                            className="icono"
                            title="Ver detalle"
                            aria-label={`Ver producto ${p.id}`}
                            onClick={() => void obtener(p, "ver")}
                            disabled={ocupado}
                          >
                            <Eye size={17} />
                          </button>
                          <button
                            className="icono"
                            title="Editar producto"
                            aria-label={`Editar producto ${p.id}`}
                            onClick={() => void obtener(p, "editar")}
                            disabled={ocupado}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="icono eliminar"
                            title="Eliminar producto"
                            aria-label={`Eliminar producto ${p.id}`}
                            onClick={() =>
                              abrir({ tipo: "eliminar", producto: p })
                            }
                            disabled={ocupado}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filtrados.length && (
                <div className="vacio">
                  <PackageOpen size={38} strokeWidth={1.3} />
                  <h3>
                    {cargando
                      ? "Consultando productos…"
                      : !cargado
                        ? "No se pudo cargar el inventario"
                        : productos.length === 0
                          ? "Tu catálogo empieza aquí"
                          : "No encontramos productos"}
                  </h3>
                  <p>
                    {!cargado
                      ? "Usa Actualizar para volver a consultar la API."
                      : productos.length === 0
                        ? "Agrega tu primer producto para empezar a organizarlo."
                        : "Prueba con otro nombre o categoría."}
                  </p>
                  {!cargando && (
                    <button
                      className="boton secundario"
                      onClick={() => {
                        if (!cargado) void listar(true);
                        else if (!productos.length) abrir({ tipo: "crear" });
                        else {
                          setBusqueda("");
                          setCategoria("");
                          setConsulta(null);
                        }
                      }}
                    >
                      {!cargado
                        ? "Reintentar"
                        : productos.length === 0
                          ? "Agregar producto"
                          : "Limpiar filtros"}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="tabla-pie">
              <span>
                {filtrados.length}{" "}
                {filtrados.length === 1 ? "producto" : "productos"} en esta
                vista
              </span>
              <span>Precios en colones costarricenses (CRC)</span>
            </div>
          </section>
          <footer className="pie-pagina">
            <span>Estante · Gestión de inventario</span>
            <a
              href={`${(import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "")}/swagger`}
              target="_blank"
              rel="noreferrer"
            >
              Documentación de la API <ExternalLink size={13} />
            </a>
          </footer>
        </main>
      </div>
      {modal && (
        <Dialogo
          titulo={
            modal.tipo === "crear"
              ? "Agregar producto"
              : modal.tipo === "editar"
                ? `Editar producto #${modal.producto.id}`
                : modal.tipo === "ver"
                  ? "Detalle del producto"
                  : "Eliminar producto"
          }
          cerrar={() => setModal(null)}
          ocupado={ocupado}
        >
          {(modal.tipo === "crear" || modal.tipo === "editar") && (
            <FormularioProducto
              producto={modal.tipo === "editar" ? modal.producto : undefined}
              guardar={(datos) => void guardar(datos)}
              cancelar={() => setModal(null)}
              ocupado={ocupado}
              error={errorModal}
            />
          )}
          {modal.tipo === "ver" && (
            <div className="detalle">
              <span className="detalle-icono">
                <Package size={33} />
              </span>
              <span className="sobretitulo">PRODUCTO #{modal.producto.id}</span>
              <h3>{modal.producto.nombre}</h3>
              <span className="categoria-badge">
                {modal.producto.categoria}
              </span>
              <dl>
                <div>
                  <dt>Precio unitario</dt>
                  <dd>{moneda.format(modal.producto.precio)}</dd>
                </div>
                <div>
                  <dt>Existencias</dt>
                  <dd>{modal.producto.existencias} unidades</dd>
                </div>
                <div>
                  <dt>Descripción</dt>
                  <dd>{modal.producto.descripcion || "Sin descripción"}</dd>
                </div>
                <div>
                  <dt>Última actualización</dt>
                  <dd>
                    {new Date(modal.producto.actualizadoUtc).toLocaleString(
                      "es-CR",
                    )}
                  </dd>
                </div>
              </dl>
              <div className="dialogo-acciones">
                <button
                  className="boton secundario"
                  onClick={() => setModal(null)}
                >
                  Cerrar
                </button>
                <button
                  className="boton primario"
                  onClick={() =>
                    abrir({ tipo: "editar", producto: modal.producto })
                  }
                >
                  <Pencil size={16} />
                  Editar producto
                </button>
              </div>
            </div>
          )}
          {modal.tipo === "eliminar" && (
            <div className="confirmacion">
              <span className="confirmacion-icono">
                <Trash2 size={27} />
              </span>
              <h3>¿Eliminar este producto?</h3>
              <p>
                Vas a eliminar <strong>{modal.producto.nombre}</strong> (#
                {modal.producto.id}) de la base de datos. Esta acción no se
                puede deshacer.
              </p>
              {errorModal && (
                <div className="error-formulario" role="alert">
                  {errorModal}
                </div>
              )}
              <div className="dialogo-acciones">
                <button
                  className="boton secundario"
                  onClick={() => setModal(null)}
                  disabled={ocupado}
                >
                  Cancelar
                </button>
                <button
                  className="boton peligro"
                  onClick={() => void eliminar()}
                  disabled={ocupado}
                >
                  {ocupado ? "Eliminando…" : "Sí, eliminar producto"}
                </button>
              </div>
            </div>
          )}
        </Dialogo>
      )}
    </div>
  );
}
