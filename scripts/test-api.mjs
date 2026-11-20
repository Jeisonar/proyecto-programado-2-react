import assert from "node:assert/strict";
const base = (process.env.PP2_URL ?? "http://localhost:5082").replace(
  /\/$/,
  "",
);
const correo = process.env.PP2_CORREO,
  contrasena = process.env.PP2_CONTRASENA;
if (!correo || !contrasena)
  throw new Error("Defina PP2_CORREO y PP2_CONTRASENA.");
let token, creado;
async function call(path, { method = "GET", data, auth = true } = {}) {
  const response = await fetch(base + path, {
    method,
    signal: AbortSignal.timeout(30000),
    headers: {
      Accept: "application/json",
      ...(data === undefined ? {} : { "Content-Type": "application/json" }),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  const raw = await response.text();
  let body;
  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    throw new Error(`Respuesta no JSON de ${path} (${response.status}).`);
  }
  return { status: response.status, body };
}
function ok(label) {
  console.log(`OK · ${label}`);
}
try {
  assert.equal((await call("/api/productos", { auth: false })).status, 401);
  ok("El listado requiere autenticación");
  assert.equal(
    (
      await call("/api/auth/login", {
        method: "POST",
        data: { correo, contrasena: "incorrecta" },
        auth: false,
      })
    ).status,
    401,
  );
  ok("Credenciales incorrectas rechazadas");
  const login = await call("/api/auth/login", {
    method: "POST",
    data: { correo, contrasena },
    auth: false,
  });
  assert.equal(login.status, 200);
  assert.ok(login.body.accessToken);
  token = login.body.accessToken;
  ok("Inicio de sesión real");
  const listado = await call("/api/productos");
  assert.equal(listado.status, 200);
  assert.ok(Array.isArray(listado.body));
  ok("Listado desde SQL Server");
  const datos = {
    nombre: `Prueba de integración ${Date.now()}`,
    categoria: "Pruebas",
    precio: 1250.5,
    existencias: 3,
    descripcion: "Registro temporal del verificador de API.",
  };
  for (const data of [
    { ...datos, nombre: "   " },
    { ...datos, precio: -1 },
    { ...datos, precio: 1.234 },
    { ...datos, existencias: -1 },
    { ...datos, existencias: 1.2 },
    { nombre: "Incompleto" },
  ])
    assert.equal(
      (await call("/api/productos", { method: "POST", data })).status,
      400,
    );
  ok("Validación de campos obligatorios, enteros y precio con dos decimales");
  const alta = await call("/api/productos", { method: "POST", data: datos });
  assert.equal(alta.status, 201);
  creado = alta.body.id;
  assert.ok(creado > 0);
  ok("Creación de producto");
  const consulta = await call(`/api/productos/${creado}`);
  assert.equal(consulta.status, 200);
  assert.equal(consulta.body.nombre, datos.nombre);
  ok("Consulta por identificador");
  assert.ok((await call("/api/productos")).body.some((p) => p.id === creado));
  ok("Persistencia en una nueva consulta del listado");
  const cambios = {
    ...datos,
    nombre: datos.nombre + " editado",
    precio: 1999.99,
    existencias: 7,
  };
  assert.equal(
    (await call(`/api/productos/${creado}`, { method: "PUT", data: cambios }))
      .status,
    200,
  );
  const actualizado = (await call(`/api/productos/${creado}`)).body;
  assert.equal(actualizado.existencias, 7);
  assert.equal(actualizado.precio, 1999.99);
  assert.equal(actualizado.nombre, cambios.nombre);
  ok("Actualización persistida");
  assert.equal(
    (await call(`/api/productos/${creado}`, { method: "DELETE", auth: false }))
      .status,
    401,
  );
  ok("Eliminación sin token rechazada");
  assert.equal(
    (await call(`/api/productos/${creado}`, { method: "DELETE" })).status,
    204,
  );
  assert.equal((await call(`/api/productos/${creado}`)).status, 404);
  assert.ok(!(await call("/api/productos")).body.some((p) => p.id === creado));
  creado = undefined;
  ok("Eliminación persistida y consulta devuelve 404");
  console.log(
    "Todas las verificaciones de API aprobaron. Registro temporal eliminado.",
  );
} finally {
  if (creado && token) {
    const limpieza = await call(`/api/productos/${creado}`, {
      method: "DELETE",
    });
    if (![204, 404].includes(limpieza.status))
      throw new Error(`No se pudo limpiar el registro temporal #${creado}.`);
  }
}
