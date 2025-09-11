# Plan de implementación por fases — NesSnake (NS)

Referencias:
- Documentación principal: [Readme.md](Readme.md)
- Propuestas de mecánicas: [Research.md](Research.md)
- Entorno devcontainer: [.devcontainer/devcontainer.json](.devcontainer/devcontainer.json)

## Fase 0 — Preparación del repositorio y entorno (1 semana)
Entregables:
- Estructura inicial del proyecto (engine/webapp/mobile), README de desarrollo.
- Contenedor dev listo y documentado (ver [.devcontainer/devcontainer.json](.devcontainer/devcontainer.json)).
Criterios de aceptación:
- `npm run start` / `./gradlew run` (según stack elegido) arranca una pantalla vacía.
Riesgos:
- Dependencias cruzadas; mitigación: CI básico que valide build.

## Fase 1 — MVP de jugabilidad central (3 semanas)
Objetivo:
- Implementar el motor de trazado de líneas, colisiones básicas y meta (llegar al extremo).
Entregables:
- Movimiento y trazado locales (móvil: Lienzo Único; web: teclado/ratón).
- Detección de colisión contra bordes y propia línea.
- HUD mínimo (contador, medidor de trazado).
Criterios de aceptación:
- Partida 1v1 local funciona; ganador determinado por colisión o meta.
Notas:
- Basarse en controles descritos en [Readme.md](Readme.md).

## Fase 2 — UI/UX inicial y feedback (2 semanas)
Objetivo:
- Integrar ideas UI/UX prioritarias: Neon Ribbon menu, Eco-Puntaje Dinámico y Glitch Armónico.
Entregables:
- Menú Neon Ribbon básico, animaciones de puntaje y SFX para colisión/power-up.
- Implementación del Medidor de Trazado "Pulso de Neón".
Criterios de aceptación:
- Prueba de usuario interna valida la claridad del feedback (3 testers).
Riesgos:
- Performance en móviles; mitigación: optimizar shaders/sprites.

## Fase 3 — Zonas de Flujo Dinámico (4 semanas)
Objetivo:
- Añadir Zonas (aceleración, ralentización, fantasma, bloqueo, eco-línea).
Entregables:
- Sistema de spawn y lógica de zonas (configurable por tipo/duración).
- VFX/SFX por zona y efectos sobre la entidad línea.
Criterios de aceptación:
- Zonas afectan movimiento como especificado y son visibles/informativas.
Notas:
- Empezar con reglas deterministas, luego añadir IA para spawn en posteriores sprints.

## Fase 4 — Ráfagas de Tinta Etérea (3 semanas)
Objetivo:
- Sistema de recurso (Tinta), recolección, selección de Ráfagas (loadout) y activación.
Entregables:
- UI para medidor de Tinta, 2–3 Ráfagas funcionales (Impulso, Escudo, Muro Espejismo).
- Cooldowns / balance inicial.
Criterios de aceptación:
- Ráfagas reproducibles y testeables en duelos; no rompe equilibrio básico.

## Fase 5 — Ecos del Rival: grabación y reproducción asíncrona (5 semanas)
Objetivo:
- Registrar trazas (coordenadas + timestamps), reproducir como "ecós" y leaderboard simple.
Entregables:
- Formato de Eco (compacto), almacenamiento local/servidor y UI para desafiar Ecos.
- Backend mínimo o e2e con almacenamiento en Google Cloud (opcional, preparar integraciones con env de devcontainer).
Criterios de aceptación:
- Un jugador puede guardar un Eco y otro jugador lo puede cargar y competir contra la reproducción exacta.
Riesgos:
- Tamaño/privacidad de datos; mitigación: compresión y políticas de retención.

## Fase 6 — Pulido, QA y lanzamiento de beta (3 semanas)
Entregables:
- Ajuste de balance, tests automatizados (unitarios + integración), métricas básicas.
- Soporte para builds web y móvil (PWA o wrappers).
Criterios de aceptación:
- Beta cerrada con N players, telemetría activa, issues triaged.

## Fase 7 — Iteración avanzada y monetización/engagement (continuo)
Actividades:
- IA para spawn dinámico de Zonas, nuevas Ráfagas, sistema de progresión y eventos.
- Optimización de retención: logros, recompensas por Ecos, UGC.
Métricas a monitorear:
- DAU/WAU, tasa de retención D1/D7/D30, tiempo medio por sesión, conversiones (si aplica).

## Entregables transversales y prácticas
- CI/CD: build + tests + linters.
- Telemetría: eventos para uso de Zonas, Ráfagas y desafíos de Ecos.
- Documentación: endpoints, formatos de Eco, guías de balance.
- Plan de pruebas: playtests semanales y sprints de QA dedicados.

## Estimación global
Duración aproximada: 4–5 meses hasta beta funcional (dependiendo del equipo: 1 equipo pequeño = 4–5 devs; 1–2 devs aumentará duración).

## Riesgos principales y mitigaciones
- Balance: playtests y telemetría temprana.
- Performance móvil: perfiles y optimización gráfica.
- Escalado Ecos: límites, purga y compresión.