# Modo: pipeline — Inbox de URLs (Second Brain)

Procesa URLs de ofertas acumuladas en `data/pipeline.md`. El usuario agrega URLs cuando quiera y luego ejecuta `/career-ops pipeline` para procesarlas todas.

## Workflow

1. **Pre-paso: re-procesar entradas `[!]`** (ver sección "Re-procesamiento de entradas `[!]`" más abajo). Cualquier `- [!] #NNN ...` cuyo `jds/NNN.txt` ya exista debe procesarse ANTES de las URLs nuevas, usando el archivo local como fuente del JD.
2. **Leer** `data/pipeline.md` → buscar items `- [ ]` en la sección "Pendientes" (y URLs sueltas en la sección "Inbox", si las hay).
3. **Para cada URL pendiente**:
   a. Calcular siguiente `REPORT_NUM` secuencial: máximo entre (i) números extraídos de `reports/*.md`, (ii) números en entradas `[!]` y `[x]` de `data/pipeline.md` y `data/pipeline-archive.md`, más 1. Esto garantiza que las entradas `[!]` reservan su número incluso antes de tener archivo de reporte.
   b. **Extraer JD** usando Playwright (browser_navigate + browser_snapshot) → WebFetch → WebSearch.
   c. **Si la URL no es accesible** (todos los métodos fallan, o LinkedIn/login-walled, o 403/404):
      - Reservar el `REPORT_NUM` calculado en (a).
      - Escribir la línea como: `- [!] #NNN | {url} | {empresa-si-conocida} | needs JD at jds/NNN.txt — {motivo: login-required / 403 / 404 / closed / etc.}`
      - **NO generar reporte, NO asignar score, NO generar PDF, NO añadir a `applications.md`.** La entrada `[!]` es solo un marcador con número reservado. No inferir nada del título o URL.
      - Continuar con la siguiente URL.
   d. **Si la URL es accesible**, ejecutar auto-pipeline completo: Evaluación A-F → Report .md → PDF (si score >= 3.0) → Tracker.
   e. **Mover de "Pendientes" a "Procesadas"**: `- [x] #NNN | URL | Empresa | Rol | Score/5 | PDF ✅/❌`.
4. **Si hay 3+ URLs pendientes**, lanzar agentes en paralelo (Agent tool con `run_in_background`) para maximizar velocidad.
5. **Al terminar**, mostrar tabla resumen, incluyendo entradas `[!]` que aún esperan JD manual:

```
| # | Empresa | Rol | Score | PDF | Acción recomendada |
```

## Formato de pipeline.md

```markdown
## Pendientes
- [ ] https://jobs.example.com/posting/123
- [ ] https://boards.greenhouse.io/company/jobs/456 | Company Inc | Senior PM
- [!] #145 | https://www.linkedin.com/jobs/view/4400000000 | Confidential Search | needs JD at jds/145.txt — login required

## Procesadas
- [x] #143 | https://jobs.example.com/posting/789 | Acme Corp | AI PM | 4.2/5 | PDF ✅
- [x] #144 | https://boards.greenhouse.io/xyz/jobs/012 | BigCo | SA | 2.1/5 | PDF ❌
```

**Lectura del marcador `[!]`:**
- `#NNN` → número reservado; el archivo de reporte NO existe todavía.
- El usuario guardará el JD en `jds/NNN.txt` y la próxima corrida de pipeline lo procesará automáticamente.
- Hasta entonces, NO existe score, NO existe entrada en `applications.md`, NO existe PDF.

## Detección inteligente de JD desde URL

1. **Playwright (preferido):** `browser_navigate` + `browser_snapshot`. Funciona con todas las SPAs.
2. **WebFetch (fallback):** Para páginas estáticas o cuando Playwright no está disponible.
3. **WebSearch (último recurso):** Buscar en portales secundarios que indexan el JD.

**Casos especiales:**
- **LinkedIn**: Casi siempre requiere login → tratar como inaccesible. Reservar `REPORT_NUM`, escribir `- [!] #NNN | {url} | {empresa-si-conocida} | needs JD at jds/NNN.txt — login required`. NO inferir score desde el título de la URL.
- **PDF**: Si la URL apunta a un PDF, leerlo directamente con Read tool.
- **`local:` prefix**: Leer el archivo local. Ejemplo: `local:jds/linkedin-pm-ai.md` → leer `jds/linkedin-pm-ai.md`. Sirve también para JDs que el usuario pegó previamente.
- **403/404/closed**: Mismo flujo que LinkedIn — `[!]` con número reservado y motivo. NO inferir.

## Numeración automática

El siguiente `REPORT_NUM` se calcula como `max(...) + 1` sobre TRES fuentes (no solo `reports/`), para que las entradas `[!]` con número reservado no colisionen con nuevas evaluaciones:

1. **`reports/*.md`** → extraer prefijo numérico (ej. `142-medispend-2026-04-15.md` → 142).
2. **`data/pipeline.md`** → extraer `#NNN` de toda entrada `[!]` y `[x]` en cualquier sección.
3. **`data/pipeline-archive.md`** → mismo extractor.

Tomar el máximo absoluto y sumar 1.

## Re-procesamiento de entradas `[!]`

Las entradas `[!] #NNN` representan URLs que no se pudieron leer automáticamente (LinkedIn login-walled, 403, 404, captcha, etc.). El número está reservado pero el reporte aún no existe. El usuario las "desbloquea" pegando el JD manualmente en `jds/NNN.txt`.

**Al inicio de cada corrida de `/career-ops pipeline`, ANTES de procesar URLs nuevas:**

1. Buscar todas las líneas `- [!] #NNN ...` en `data/pipeline.md`.
2. Para cada una, comprobar si `jds/NNN.txt` existe en disco.
3. **Si existe** →
   - Leer `jds/NNN.txt` como fuente del JD (equivalente a tratar la URL como `local:jds/NNN.txt`).
   - Ejecutar evaluación A-F completa con el contenido del archivo: report `reports/NNN-{slug}-{fecha}.md` → PDF (si score >= 3.0) → entrada en `applications.md`.
   - Reemplazar la línea `[!]` por `- [x] #NNN | url-original | empresa | rol | score/5 | PDF ✅/❌` y moverla a `## Procesadas`.
4. **Si no existe** → dejar la entrada `[!]` intacta. Reportar al final como "still awaiting jds/NNN.txt — paste JD text and re-run".

**Regla dura:** una entrada `[!]` NUNCA debe convertirse en `[x]` sin un `jds/NNN.txt` real en disco. Sin JD manual no hay score, no hay reporte, no hay PDF, no hay entrada en tracker. Cero inferencia desde título o URL.

## Sincronización de fuentes

Antes de procesar cualquier URL, verificar sync:
```bash
node cv-sync-check.mjs
```
Si hay desincronización, advertir al usuario antes de continuar.
