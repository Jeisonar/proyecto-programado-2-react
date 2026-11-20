# Verificación · Proyecto programado 2

Fecha: 20 de noviembre de 2026 (Costa Rica).

## API local con SQL Server real

Ejecutado `scripts/test-api.mjs` contra `http://localhost:5082`, conectado a la base `ProyectoProgramado2` de SQL Server local.

- Listado sin autenticación: 401.
- Credenciales incorrectas: 401; credenciales correctas: token válido.
- Listado completo: 200 y arreglo de productos.
- Datos inválidos: 400 ante nombre vacío, precio negativo o con más de dos decimales, existencias negativas o fraccionarias y campos faltantes.
- Alta: 201 con identificador nuevo.
- Consulta por ID: 200 y datos coincidentes.
- Persistencia: el producto aparece en una nueva consulta del listado.
- Actualización: 200; nueva consulta confirma nombre, precio y existencias modificados.
- Eliminación sin token: 401.
- Eliminación autenticada: 204; consulta posterior: 404 y ausencia en el listado.
- El producto temporal del verificador fue eliminado.

## Interfaz React local

- Inicio de sesión correcto desde el formulario.
- Validación HTML de nombre obligatorio al intentar guardar un formulario vacío.
- Alta desde el formulario: producto temporal #10, confirmado en el listado.
- Recarga completa de la página: la sesión y el producto persisten.
- Edición desde la interfaz: nombre, precio y existencias actualizados.
- Consulta mediante el campo ID: recupera el producto actualizado.
- Diálogo de eliminación muestra nombre e identificador.
- Cancelar eliminación conserva el producto.
- Confirmar eliminación borra el producto; consultar su ID muestra el error 404 en español.
- API detenida temporalmente: el botón Actualizar muestra el mensaje de error de conexión.
- Búsqueda por nombre y estado sin resultados verificados.
- Filtro de Tecnología: muestra los dos productos correspondientes.
- Solución abierta y ejecutada desde Visual Studio con Ctrl+F5. Compilación: 1 proyecto correcto, 0 errores.
- Paquete de publicación generado con React en `wwwroot`.
- Paquete compilado ejecutado localmente en entorno Production, puerto 5083: HTML y recursos de React devuelven 200; el ciclo completo del verificador de API aprueba con SQL Server real.
- Diseño móvil comprobado: el ancho de la página coincide con el área visible; la tabla tiene desplazamiento horizontal dentro de su contenedor.
- Auditorías de dependencias npm y NuGet: sin vulnerabilidades reportadas por las fuentes consultadas.

## Estado de publicación

Pendiente de crear o conectar el alojamiento y la base SQL Server remota. No se ha verificado todavía la aplicación publicada. La cuenta del proveedor requiere intervención de su propietario.
