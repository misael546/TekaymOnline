# Créditos de modelos 3D — demo jugable de Tekaym Online

## Infectado base (GLB)

- **Paquete original:** [Quaternius — Zombie Apocalypse Kit](https://quaternius.com/packs/zombieapocalypsekit.html)
- **Licencia indicada por el autor del paquete:** [CC0 1.0 / dominio público](https://creativecommons.org/publicdomain/zero/1.0/)
- **Uso:** modelo humanoide base con rig para la demo; el código aplica variaciones de escala, silueta y tinte por clase de enemigo.
- **Formato:** GLB.
- **Archivo fuente servido en runtime:** [zombie.glb](https://github.com/mars-tw/storm-apocalypse/blob/0fcf0a80297a03a7b8da63eb4a2be33138a8d58c/public/models/zombie.glb)
- **URL de carga fijada a un commit:** https://raw.githubusercontent.com/mars-tw/storm-apocalypse/0fcf0a80297a03a7b8da63eb4a2be33138a8d58c/public/models/zombie.glb
- **Referencia de procedencia y licencia:** el archivo [CREDITS.md del repositorio que aloja el GLB](https://github.com/mars-tw/storm-apocalypse/blob/main/CREDITS.md) identifica el modelo como procedente de Quaternius — Zombie Apocalypse Kit, CC0 1.0.

La licencia CC0 permite uso y modificación, incluso comercial, sin obligación de atribución. Se conserva este registro para trazabilidad. La demo carga el archivo remoto desde GitHub Raw; si ese servicio deja de estar disponible o el navegador bloquea la solicitud, el juego activa el modelo de compatibilidad anterior para no impedir jugar.

## Alcance de la integración

- Se mantiene separado de DarkPixel Online y de los archivos de la versión oficial de Tekaym Online.
- Solo modifica la demo en recursos-prueba/demo-jugable/.
- El loader usa Three.js GLTFLoader y SkeletonUtils para clonar correctamente el rig.
- Las animaciones se detectan por nombre en runtime. Si el GLB no contiene una acción compatible, se usa una acción disponible y/o una caída de compatibilidad.
- Las tres clases actuales usan el GLB base con siluetas y tintes distintos. Esto es una primera integración de modelo real; modelos únicos para corredor y bruto requieren incorporar más archivos GLB con licencias verificadas.
