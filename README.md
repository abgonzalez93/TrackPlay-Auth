# 🔐 TrackPlay – Auth Service

Este microservicio se encarga de gestionar la autenticación y autorización de usuarios dentro del ecosistema TrackPlay.
Ofrece endpoints para emisión y renovación de tokens JWT, y está preparado para la integración futura con proveedores externos como Steam, Sony o Nintendo.

---

## ⚙️ Funcionalidad

- 🔑 Registro e inicio de sesión con email y contraseña.
- 🪪 Emisión de JWT de acceso y refresh (access_token, refresh_token).
- 🔁 Endpoint de rotación de tokens (/refresh).
- 🔐 Hash y validación segura de credenciales (bcrypt).
- 🧪 Validación con Zod de entrada y salida.
- 🔧 Preparado para OAuth (Steam, Nintendo, etc).

---

## 🔐 Seguridad: RS256 y separación de claves

TrackPlay usa el algoritmo RS256 (asimétrico) para firmar y verificar tokens:

| Clave         | Usada por    | Propósito        | Montaje en contenedor         |
| ------------- | ------------ | ---------------- | ----------------------------- |
| `private.key` | Auth Service | Firmar tokens    | `/.files/jwt/key/private.key` |
| `public.key`  | Backend API  | Verificar tokens | `/.files/jwt/key/public.key`  |

---

## 🔐 Por qué RS256

- Solo auth puede firmar tokens.
- Backend puede verificarlos, pero no puede firmar (ni falsificar) tokens.
- Permite escalar hacia microservicios independientes sin compartir secretos.
- Seguridad sólida frente a ataques por fuga de claves.

---

## 🔄 Flujo de uso típico

- El Frontend envía credenciales al Backend (/auth).
- El Backend reenvía al Auth Service (/login).
- El Auth genera y firma los tokens JWT con private.key.
- El Backend responde al Frontend con los tokens o establece una sesión.
- En cada request autenticada, el Backend verifica el JWT con public.key.

---

## 🛡️ Buenas prácticas implementadas

- ⏱️ JWTs de acceso con expiración corta (15min).
- 🍪 Refresh tokens preparados para uso con cookies HttpOnly.
- 🔐 Contraseñas cifradas con bcrypt y sal aleatoria.
- ✅ Validación exhaustiva con Zod.
- 🧨 Gestión centralizada de errores con TrackPlayError.
- 📝 Logging uniforme con Winston (via @trackplay/core/logger).
