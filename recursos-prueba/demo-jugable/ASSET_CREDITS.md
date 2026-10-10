# Créditos de modelos 3D — demo jugable de Tekaym Online

## Infectados riggeados y jefe

- **Fuente del modelo y autoría:** [Storm Apocalypse — modelos personalizados](https://github.com/mars-tw/storm-apocalypse/tree/main/public/models/custom/zombies).
- **Licencia:** [MIT](https://github.com/mars-tw/storm-apocalypse/blob/main/LICENSE). El archivo CREDITS.md del repositorio fuente declara que sus modelos originales personalizados se distribuyen bajo la licencia MIT del proyecto.
- **Aviso requerido:** Copyright (c) 2026 mars-tw. Se incluye aquí para cumplir la condición de conservar el aviso de copyright y la licencia.
- **Archivos utilizados:** [zombie-ash.glb](https://github.com/mars-tw/storm-apocalypse/blob/0fcf0a80297a03a7b8da63eb4a2be33138a8d58c/public/models/custom/zombies/zombie-ash.glb), [zombie-frost.glb](https://github.com/mars-tw/storm-apocalypse/blob/0fcf0a80297a03a7b8da63eb4a2be33138a8d58c/public/models/custom/zombies/zombie-frost.glb), [zombie-rust.glb](https://github.com/mars-tw/storm-apocalypse/blob/0fcf0a80297a03a7b8da63eb4a2be33138a8d58c/public/models/custom/zombies/zombie-rust.glb) y [boss-zombie.glb](https://github.com/mars-tw/storm-apocalypse/blob/0fcf0a80297a03a7b8da63eb4a2be33138a8d58c/public/models/custom/boss-zombie.glb).
- **Animaciones documentadas por el generador fuente:** Idle, Walk, Idle_Attack, HitReact y Death.
- **Uso en Tekaym:** Ash para infectados normales, Frost para corredores, Rust para brutos y Boss Zombie para el jefe. El juego normaliza altura y ajusta escala/silueta para mantener colisiones y comportamiento actuales.
- **Carga:** GLB remoto mediante URLs fijadas a un commit de GitHub Raw para que la versión del modelo no cambie silenciosamente.

## Aviso de licencia MIT

Copyright (c) 2026 mars-tw

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.

## Alcance y limitaciones de esta integración

- Se mantiene separada de DarkPixel Online y de la versión oficial de Tekaym Online; solo modifica la demo en recursos-prueba/demo-jugable/.
- Three.js GLTFLoader carga los cuatro modelos. SkeletonUtils clona el rig correctamente para múltiples enemigos.
- Las animaciones se detectan por nombre y se conectan a reposo, caminar/correr, ataque, recibir golpe y muerte. Si una carga externa falla, la demo conserva un modo de compatibilidad para no bloquear la partida.
- Los modelos son estilizados, no escaneos hiperrealistas. Si el objetivo visual requiere más realismo, la siguiente fase debería reemplazar los modelos por otros de mayor detalle con licencia comprobada, sin tocar el sistema de juego.
