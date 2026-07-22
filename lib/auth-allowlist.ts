/**
 * Acceso público: cualquier correo autenticado puede entrar.
 * Se mantiene el helper por compatibilidad; siempre permite.
 */
export const ALLOWED_EMAILS: string[] = [];

export function isEmailAllowed(_email: string | null | undefined): boolean {
  return true;
}
