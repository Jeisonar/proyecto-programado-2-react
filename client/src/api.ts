export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  existencias: number;
  descripcion: string;
  actualizadoUtc: string;
}
export type DatosProducto = Pick<
  Producto,
  "nombre" | "categoria" | "precio" | "existencias" | "descripcion"
>;
export interface Sesion {
  token: string;
  correo: string;
  vence: number;
}
const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
export class ApiError extends Error {
  constructor(
    message: string,
    public status = 0,
  ) {
    super(message);
  }
}
export async function request<T>(
  path: string,
  options: { method?: string; data?: unknown; token?: string } = {},
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(`${base}${path}`, {
      method: options.method ?? "GET",
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(options.data !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      ...(options.data !== undefined
        ? { body: JSON.stringify(options.data) }
        : {}),
    });
    const raw = await response.text();
    let body: any = null;
    try {
      body = raw ? JSON.parse(raw) : null;
    } catch {
      /* Some hosts return HTML error pages. */
    }
    if (!response.ok) {
      const validations = body?.errors
        ? Object.values(body.errors).flat().join(" ")
        : "";
      const message =
        response.status === 401
          ? path.includes("/login")
            ? "El correo o la contraseña son incorrectos."
            : "Tu sesión venció. Inicia sesión nuevamente."
          : response.status === 429
            ? "Demasiados intentos. Espera un minuto antes de volver a intentar."
            : validations ||
              body?.mensaje ||
              body?.title ||
              `La API respondió con un error (${response.status}). Intenta nuevamente.`;
      throw new ApiError(message, response.status);
    }
    if (response.status !== 204 && body === null)
      throw new ApiError(
        "La API no devolvió una respuesta JSON válida. Verifica su dirección.",
      );
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      controller.signal.aborted
        ? "La conexión tardó demasiado. Comprueba el listado antes de repetir una modificación."
        : "No se pudo conectar con la API. Revisa tu conexión e intenta nuevamente.",
    );
  } finally {
    clearTimeout(timer);
  }
}
export function leerSesion(): Sesion | null {
  try {
    const value = JSON.parse(sessionStorage.getItem("pp2-sesion") ?? "null");
    return value &&
      typeof value.token === "string" &&
      typeof value.correo === "string" &&
      value.vence > Date.now()
      ? value
      : null;
  } catch {
    return null;
  }
}
export function guardarSesion(sesion: Sesion | null) {
  try {
    if (sesion) sessionStorage.setItem("pp2-sesion", JSON.stringify(sesion));
    else sessionStorage.removeItem("pp2-sesion");
  } catch {
    /* In-memory session still works when browser storage is blocked. */
  }
}
