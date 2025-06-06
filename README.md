# 🔑 TrackPlay - Servicio de Autenticación

Este microservicio se encarga de gestionar la autenticación y autorización de usuarios dentro del ecosistema TrackPlay.
Ofrece endpoints para login, registro, emisión y renovación de tokens JWT, y está preparado para la integración futura con proveedores externos como Steam, Sony o Nintendo.

---

## 📌 Funcionalidad

- Registro y login de usuarios mediante email y contraseña.
- Emisión de tokens JWT de acceso y renovación.
- Validación de credenciales y control de sesiones.
- Preparado para autenticación OAuth con plataformas externas.
- Validación de entrada y salida con Zod.

---

## 🔄 Flujo de desarrollo

- El frontend realiza una petición al backend con las credenciales del usuario.
- El backend reenvía dicha petición al microservicio de autenticación.
- El servicio valida los datos, genera los tokens y los devuelve al backend.
- El backend responde al frontend con los tokens necesarios.
- El backend también consulta al servicio de autenticación para validar tokens o refrescarlos.

---

## 🛡️ Buenas prácticas

- Los tokens JWT tienen tiempos de expiración cortos y seguros.
- El token de renovación puede almacenarse como cookie `HttpOnly`.
- Las contraseñas se almacenan con hash bcrypt.
- Toda entrada de usuario se valida con Zod antes de ser procesada.
- Todos los errores pasan por `ApiError` y están centralizados.
- El sistema de logs sigue el formato de Winston compartido en `@trackplay/core`.
