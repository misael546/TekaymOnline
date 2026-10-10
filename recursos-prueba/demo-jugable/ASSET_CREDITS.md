# Créditos y procedencia de recursos — demo jugable de Tekaym Online

## Modelos de infectados

Los modelos GLB externos de la prueba anterior se retiraron porque su escala/origen visual causaba zombis flotantes y no cumplían el nivel visual esperado. La demo actual usa personajes procedurales creados dentro de `index.html`; no descarga ni utiliza los cuatro modelos GLB listados en la revisión anterior.

## Recursos externos

- Three.js 0.160.0 se carga desde jsDelivr para renderizado 3D.
- No se incorporaron modelos 3D de terceros en la versión actual de esta demo.

## Alcance

- Solo corresponde a `recursos-prueba/demo-jugable/`.
- Está separada de DarkPixel Online y no modifica la versión oficial de Tekaym Online.
- Las texturas de hormigón, metal y suelo se generan localmente mediante CanvasTexture.
- Los infectados actuales usan geometría, materiales y animaciones procedurales del propio demo.
