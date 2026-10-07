# Tekaym Online — Reglas y estado maestro

## 1. Identidad del proyecto

- Nombre oficial: **Tekaym Online**
- Es un proyecto **completamente separado de NeonCore / DarkPixel Online**.
- No mezclar archivos, código, assets, bases de datos, manifests ni workflows con DarkPixel.
- Repositorio: `misael546/TekaymOnline`
- Versión actual del juego: **V1**
- Regla de versionado: **una sola versión oficial del juego**. No usar `serverVersion`, `clientVersion` separados para fines de actualización ni crear versiones independientes del backend.

## 2. Arquitectura objetivo

Arquitectura aprobada:

```
GitHub Pages
    ↓
Cliente 3D de Tekaym Online
    ↓
Cloudflare Workers + Durable Objects
    ↓
Servidor multiplayer / WebSocket

Firebase / Firestore
    ↓
Cuentas, identidad y persistencia permanente
```

### Belmo
- **ABANDONADO para Tekaym Online** porque requiere una suscripción.
- No volver a diseñar Tekaym dependiendo de Belmo.
- Deben eliminarse/reemplazarse los restos de configuración de Belmo que hayan quedado en archivos del prototipo.

### GitHub Pages
- Hospeda únicamente el cliente web del juego.
- No guardar secretos de Firebase en GitHub.

### Cloudflare
- Será el backend realtime gratuito objetivo.
- Durable Objects se usarán para salas/estado multiplayer y WebSockets.
- Mantener el servidor autoritativo: el cliente nunca debe poder decidir unilateralmente vida, daño, inventario, recompensas, progreso u otras variables sensibles.

### Firebase
- Proyecto de Firebase dedicado exclusivamente a Tekaym Online.
- No usar la base de DarkPixel.
- Firestore será la persistencia permanente del juego.
- Las credenciales administrativas deben permanecer como secretos de Cloudflare, nunca en el repositorio.

## 3. Concepto del juego

Tekaym Online es un juego web **3D en primera persona**, multijugador y de supervivencia/zombis.

### Inicio
- El jugador aparece dentro de una de las muchas celdas de una prisión.
- Las celdas están abiertas.
- El spawn se selecciona entre las celdas válidas.
- Los zombis **no pueden aparecer dentro de las celdas**.

### Prisión
La prisión debe sentirse grande, completa y explorable.

Áreas previstas:
- Bloques de celdas
- Pasillos
- Comedor
- Patio
- Gimnasio
- Enfermería
- Duchas
- Lavandería
- Control
- Taller
- Visitas
- Mantenimiento
- Almacenes
- Otras áreas que agreguemos al diseño final cuando sean necesarias

### Celdas
- Objetivo inicial: **4 áreas de celdas**.
- Cada área: **16 celdas**.
- Total de referencia actual: **64 celdas**.
- Las celdas deben mantenerse como zonas protegidas de spawn de zombis.

## 4. Supervivencia

Sistemas previstos desde la base:
- Vida
- Resistencia
- Hambre
- Sed
- Daño por falta de alimento/agua
- Combate cuerpo a cuerpo
- Loot
- Exploración
- Riesgo por ruido
- Eventos dinámicos
- Barricadas
- Herramientas
- Zonas bloqueadas
- Rutas de escape
- Sistemas de energía/generador
- Posibles apagones y alarmas

Estos sistemas no deben implementarse de forma aislada: primero deben integrarse con la arquitectura autoritativa.

## 5. Combate inicial

- El jugador comienza con **un cuchillo**.
- El juego debe ser de primera persona.
- El cuchillo se muestra como modelo 3D en primera persona.
- El daño debe validarse en servidor.
- No introducir armas de fuego a menos que una futura decisión de diseño lo autorice explícitamente.

## 6. Zombis

- Los zombis pueden aparecer por toda la prisión excepto dentro de las zonas protegidas de las celdas.
- Deben existir variantes cuando el sistema esté listo.
- El servidor controla sus posiciones, estado y daño.
- El sistema debe soportar posteriormente:
  - detección por visión
  - detección por ruido
  - persecución
  - pérdida de objetivo
  - patrullaje
  - hordas
  - eventos especiales

## 7. Multijugador

- Objetivo inicial: **hasta 16 jugadores**.
- Multiplayer en tiempo real por WebSocket.
- El servidor es autoritativo.
- El cliente envía intención/entrada, no autoridad.
- El estado sensible debe validarse en Cloudflare Durable Objects.
- El sistema debe prepararse para reconexión y desconexión limpia.

## 8. Cuenta e identidad

- Google será la identidad permanente cuando terminemos la integración.
- Cada cuenta de Tekaym será independiente de DarkPixel.
- El identificador permanente debe ser el `sub` de Google, no únicamente el correo.
- La cuenta debe poder relacionarse posteriormente con:
  - progreso
  - inventario
  - estadísticas
  - recompensas
  - cosméticos
  - configuración

## 9. Firebase / Firestore

Colecciones previstas para Tekaym:
- `tekaym_accounts`
- `tekaym_players`
- `tekaym_runtime`

Se pueden crear otras colecciones cuando el diseño lo requiera.

Reglas:
- El navegador no debe escribir directamente datos económicos o de progreso críticos.
- Cloudflare valida y persiste.
- Las reglas de Firestore deben mantenerse cerradas para acceso anónimo directo salvo que un sistema futuro justifique otra cosa.

## 10. Assets 3D

- **No reutilizar assets de DarkPixel.**
- Buscar y usar nuevos assets 3D directamente de Internet.
- Registrar cada asset nuevo y su licencia antes de usarlo en una versión publicada.
- Preferir CC0, dominio público o licencias claramente compatibles con el proyecto.
- Guardar las fuentes/licencias en `docs/asset-sources.md`.
- Los assets no deben contener secretos ni datos de servicio.

Fuentes iniciales estudiadas:
- Prison Complex Builder — pack de prisión modular
- Zombie Horde and Infected Characters — zombis/infectados
- Kitchen Knife — cuchillo

Estos recursos son referencias/fuentes iniciales y deben verificarse antes de incorporarse definitivamente al build publicado.

## 11. Cliente 3D

Tecnología base prevista:
- Three.js
- WebGL
- Primera persona
- Soporte PC
- Soporte móvil

El cliente debe contemplar desde el inicio:
- cámara FPS
- colisiones
- iluminación
- audio espacial cuando sea posible
- interacción
- HUD
- inventario
- conexión/reconexión
- sincronización de jugadores
- sincronización de zombis

## 12. Rendimiento

La prisión será grande, por lo que debemos evitar cargar/renderizar todo indiscriminadamente.

Plan:
- cargar por zonas
- limitar objetos visibles
- usar instancing donde convenga
- reducir luces costosas
- optimizar colisiones
- limitar frecuencia de sincronización de entidades
- evitar enviar posiciones innecesariamente
- preparar el mapa para streaming/sectorización si crece demasiado

## 13. Reglas de seguridad

Nunca confiar en:
- daño enviado por el cliente
- vida enviada por el cliente
- dinero enviado por el cliente
- inventario enviado por el cliente
- recompensas enviadas por el cliente
- posición sin validación
- resultados de combate sin verificación

Validar en servidor:
- movimiento
- alcance
- cooldowns
- daño
- pickups
- inventario
- recompensas
- estado de cuenta
- persistencia

## 14. Archivos que ya existen en el repositorio

Base inicial creada:
- `README.md`
- `release.json`
- `firestore.rules`
- `.gitignore`
- `.nojekyll`
- `assets/asset-manifest.json`
- `docs/asset-sources.md`
- `src/config.js`
- `src/prison.js`
- prototipos iniciales de servidor/Firebase fueron creados durante la primera etapa

## 15. Estado exacto al pausar

### Ya hecho
- Repositorio independiente creado: `misael546/TekaymOnline`
- Base V1 creada.
- Concepto de prisión grande definido.
- 4 bloques de celdas × 16 celdas = 64 celdas de referencia.
- Spawn desde una celda.
- Zonas protegidas de celdas.
- Blockout inicial 3D.
- Three.js elegido para el cliente.
- Firebase/Firestore elegido como persistencia.
- Google como identidad prevista.
- Assets externos 3D estudiados y registrados.
- Se descartó Belmo por requerir suscripción.
- Nueva arquitectura gratuita definida: GitHub Pages + Cloudflare Workers/Durable Objects + Firebase.

### NO terminado todavía
- Crear/configurar el proyecto de Cloudflare para Tekaym.
- Migrar el prototipo de servidor de Belmo a Cloudflare Worker + Durable Object.
- Configurar WebSocket realtime en Cloudflare.
- Conectar Firebase de Tekaym al backend de Cloudflare.
- Terminar cliente FPS.
- Integrar modelos 3D reales.
- Implementar zombis funcionales.
- Implementar combate autoritativo.
- Implementar salas multiplayer.
- Implementar cuenta Google completa.
- Implementar guardado real de progreso.
- Configurar GitHub Pages.
- Crear CI completo del proyecto.
- Hacer pruebas reales PC/móvil.
- Hacer revisión integral antes de declarar V1 terminada.

## 16. Próximo trabajo al retomar

Orden recomendado:

1. Limpiar del repositorio cualquier resto de Belmo.
2. Convertir el servidor a **Cloudflare Worker + Durable Object**.
3. Crear el estado/sala realtime para 16 jugadores.
4. Conectar Firestore para cuenta y persistencia.
5. Configurar secrets de Cloudflare sin subir credenciales.
6. Completar cliente FPS.
7. Integrar mapa de prisión y assets 3D nuevos.
8. Integrar jugador, cuchillo y zombis.
9. Implementar combate server-authoritative.
10. Implementar HUD, inventario y supervivencia.
11. Implementar Google Login.
12. Publicar cliente con GitHub Pages.
13. Crear workflows de validación/despliegue.
14. Probar PC y móvil.
15. Revisar **todo Tekaym Online** buscando regresiones, duplicados, código huérfano, secretos y referencias a DarkPixel/Belmo.
16. Solo después declarar **V1 lista**.

## 17. Regla de mantenimiento

Cada actualización de Tekaym debe revisar el proyecto completo:
- cliente
- servidor
- WebSocket
- Firebase
- workflows
- manifests
- assets
- autenticación
- persistencia
- seguridad
- rendimiento
- compatibilidad móvil/PC

No declarar una actualización terminada mientras exista un fallo conocido o una referencia obsoleta que pueda provocar regresiones.

## 18. Regla de separación absoluta

**Tekaym Online y DarkPixel Online son proyectos distintos.**

Nunca:
- importar archivos de DarkPixel por comodidad
- usar la base de datos de DarkPixel
- usar secretos de DarkPixel
- reutilizar manifests de DarkPixel
- reutilizar workflows de DarkPixel
- conectar Tekaym a endpoints de DarkPixel
- mezclar sus versiones

La única relación permitida es que ambos forman parte del ecosistema de NeonCore; técnicamente deben permanecer separados.
