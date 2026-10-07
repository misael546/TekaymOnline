# Tekaym Online — Diseño base V1

## Identidad
Survival horror 3D en primera persona para navegador. Proyecto completamente independiente de otros juegos.

## Arquitectura
GitHub publica el cliente mediante GitHub Pages.
Cloudflare Workers + Durable Objects ejecutan el backend multiplayer mediante WebSocket/HTTP.
Firebase Firestore es la base de datos dedicada para cuentas y progreso persistente.
Existe una sola versión oficial del proyecto: V1, V2, V3…

## Mundo
La prisión es grande, cerrada y explorable.
V1 define cuatro bloques de celdas con 16 celdas cada uno: 64 celdas.
Cada celda está abierta al inicio y sirve como punto de aparición.
Los zombis no aparecen dentro de las celdas protegidas.

Zonas iniciales:
- Bloques A/B/C/D.
- Corredores principales y transversales.
- Comedor.
- Gimnasio.
- Patio.
- Duchas.
- Lavandería.
- Enfermería.
- Taller.
- Visitas.
- Control.
- Mantenimiento.
- Almacenes.
- Ingreso y seguridad.

## Supervivencia
Vida, resistencia, hambre y sed.
El sistema futuro añadirá ruido, infección, sangrado, temperatura, iluminación, sueño opcional y estados médicos.

## Combate
El jugador comienza únicamente con un cuchillo.
Ataque melee en primera persona.
V1 no incluye armas de fuego.
El servidor debe validar daño y estado real antes de guardar progreso.

## Zombis
Variantes futuras: caminante, corredor, crawler, gritón, inflado, blindado, spitters y brutes.
Nunca deben aparecer dentro de celdas protegidas.
La IA final usará sectores, navegación, percepción, ruido y límites de persecución.

## Eventos
Se planean apagones, alarmas, generadores, puertas de emergencia, brotes, sectores bloqueados y eventos de evacuación.
El objetivo de la partida evolucionará hacia sobrevivir, conseguir recursos y encontrar una salida.

## Multiplayer
Máximo inicial de 16 jugadores por instancia.
La replicación y las reglas importantes serán server-authoritative.

## Progresión
No utilizar monedas ni sistemas de DarkPixel.
V1 solo prepara persistencia y cuenta.
Más adelante: nivel de supervivencia, habilidades, recetas, logros y finales.

## Seguridad y datos
Firebase se usa solo desde el backend mediante Firebase Admin.
Los secretos nunca se guardan en GitHub.
El cliente no escribe directamente la economía, inventario o progreso persistente.
