# Learning Framework App · Brief para Claude Code

## Contexto del proyecto

App web para ejecutar un **framework de aprendizaje estructurado de 5 etapas**, diseñado para aprender habilidades prácticas (Escenario B). El usuario crea "temas" (ej: Figma, React, fotografía) y los lleva a través de las 5 etapas hasta completarlos.

El framework fue diseñado y validado en detalle antes de construir la app. Cada decisión tiene una razón — no cambiar la estructura sin entender el razonamiento detrás.

---

## Stack decidido

- **React 18** + **Vite**
- **localStorage** para persistencia (MVP — sin backend, sin auth)
- **CSS puro** (sin Tailwind ni librerías de UI)
- **Deploy:** Vercel (`vercel --prod` desde la carpeta del proyecto)

Sin dependencias adicionales. El proyecto tiene que poder clonarse y correr con `npm install && npm run dev` sin configuración extra.

---

## Sistema de diseño

### Paleta de colores

```css
--bg: #0F0F11;           /* fondo principal */
--surface: #1A1A1F;      /* cards y sidebar */
--surface-2: #22222A;    /* headers de secciones */
--border: #2A2A35;       /* bordes principales */
--border-2: #33333F;     /* bordes secundarios */
--accent: #6C63FF;       /* índigo eléctrico — acento principal */
--accent-dim: rgba(108, 99, 255, 0.15);
--accent-hover: #8178FF;
--green: #2DD4A7;        /* éxito, completado */
--green-dim: rgba(45, 212, 167, 0.12);
--red: #FF5C5C;          /* error, eliminar */
--red-dim: rgba(255, 92, 92, 0.12);
--amber: #F5A623;        /* advertencias */
--amber-dim: rgba(245, 166, 35, 0.12);
--text: #F0EFF5;         /* texto principal */
--text-2: #A09FB5;       /* texto secundario */
--text-3: #5A5970;       /* texto terciario / placeholders */
```

### Tipografía
- **Fuente:** Inter (Google Fonts) — única fuente, todos los pesos
- **Elemento signature:** números de etapa en `72px / font-weight: 800 / opacity: 0.25` como ancla visual de cada sección. Este es el elemento de diseño más importante — no eliminarlo.

### Radios y espaciado
- `--radius: 10px` (cards, modales, bloques de sección)
- `--radius-sm: 6px` (inputs, chips, botones)
- Sidebar: `240px` de ancho fijo

---

## Estructura de archivos

```
learning-framework/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── hooks/
    │   └── useTemas.js
    ├── utils/
    │   └── storage.js
    └── components/
        ├── Diagnostico.jsx
        ├── Mapa.jsx
        ├── Plan.jsx
        ├── Ciclos.jsx
        └── Consolidacion.jsx
```

---

## Modelo de datos (localStorage)

**Key:** `lf_temas` → array de objetos `Tema`

```js
// Tema
{
  id: string,              // crypto.randomUUID()
  nombre: string,          // nombre del tema ingresado por el usuario
  creadoEn: string,        // ISO date
  etapaActual: number,     // 1-5, qué etapa está viendo
  etapas: {
    diagnostico: {
      completado: boolean,
      tema: string,
      capacidadActual: string,
      nivel: string,        // '0' | '1' | '2' | '3'
      objetivo: string,
      criterio: string,
      proyecto: string,
      motivacion: string,
      estilos: string[],    // ['proyectos', 'estructura', 'autodidacta', 'social']
      tiempo: string,
      deadline: string,     // 'si' | 'auto' | 'no'
    },
    mapa: {
      completado: boolean,
      conceptosClave: string,
      dependencias: string,
      enScope: string,
      lagunas: string,
      fuentes: string,
    },
    plan: {
      completado: boolean,
      proyectoSalida: string,
      hitos: string,
      recursos: string,
      primeraAccion: string,
      obstaculos: string,
    },
    ciclos: [               // array — cada ciclo es una entrada nueva
      {
        id: string,
        fecha: string,      // ISO date
        adquirir: string,
        practicar: string,
        romper: string,
        reflexionar: string,
        limitacionDescubierta: string,
        proximoCiclo: string,
      }
    ],
    consolidacion: {
      completado: boolean,
      criterioLogrado: string,
      aprendizajesProceso: string,
      conexiones: string,
      preguntasAbiertas: string,
      comoEnsenarias: string,
    },
  }
}
```

---

## Layout de la app

```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR (240px)          │  MAIN                        │
│  ─────────────────        │  ────────────────────────    │
│  ◈ Aprender               │                              │
│                           │  [HOME: hero + grid temas]   │
│  + Nuevo tema             │       ó                      │
│                           │  [TEMA ACTIVO]               │
│  · Figma UI/UX  ████░  4/5│   ┌──────────────────────┐  │
│  · React Hooks  ██░░░  2/5│   │ tema-header          │  │
│  · Fotografía   █░░░░  1/5│   ├────────────┬─────────┤  │
│                           │   │ etapas-nav │ etapa   │  │
│                           │   │ (220px)    │ content │  │
│                           │   └────────────┴─────────┘  │
└─────────────────────────────────────────────────────────┘
```

**HOME** muestra:
- Hero con título grande + botón "Nuevo tema"
- Grid de temas activos con barra de progreso y dots de etapas

**TEMA ACTIVO** muestra:
- Header sticky con nombre del tema + botón volver + botón eliminar
- Nav izquierda de 220px con las 5 etapas (número, label, sub-label)
- Área de contenido de la etapa seleccionada

---

## Las 5 etapas — detalle de cada una

### Etapa 1 · Diagnóstico
**Secciones:** A (Punto de partida), B (Destino concreto), C (Motivación real), D (Contexto)

**Campos:**
- Tema (input texto)
- Capacidad actual (textarea)
- Nivel (chips: 'Cero contacto' | 'Algo superficial' | 'Bases claras' | 'Intermedio')
- Objetivo (textarea) — **validación activa:** si empieza con "entender/saber sobre/conocer/aprender sobre/comprender" mostrar warning
- Criterio de éxito (textarea)
- Hipótesis de proyecto (textarea)
- Consecuencia de no aprenderlo (textarea)
- Estilos de aprendizaje (chips multi-select: proyectos | estructura | autodidacta | social)
- Tiempo semanal real (chips: '1–2 hs' | '3–5 hs' | '6–10 hs' | '+10 hs')
- Deadline (chips: 'si' | 'auto' | 'no')

**Validaciones:**
- Warning si nivel === '3' (intermedio): riesgo de subestimarse
- Warning si objetivo empieza con verbo vago (lista arriba)

---

### Etapa 2 · Mapa del territorio
**Campos:**
- Conceptos clave (textarea)
- Dependencias entre conceptos (textarea — formato A → B → C)
- En scope / fuera de scope (textarea)
- Lagunas críticas (textarea)
- Fuentes de referencia (textarea)

---

### Etapa 3 · Plan de ataque
**Campos:**
- Proyecto de salida (textarea)
- Hitos intermedios (textarea)
- Recursos — máximo 5 (textarea)
- Primera acción para las próximas 48hs (textarea)
- Obstáculos predecibles y respuestas (textarea)

---

### Etapa 4 · Ciclo de ejecución
**Comportamiento especial:** es la única etapa que no tiene un único formulario — permite registrar **múltiples ciclos** que se acumulan en un historial.

**Formulario de nuevo ciclo:**
- Qué adquiriste (textarea)
- Cómo lo practicaste (textarea)
- Qué rompiste intencionalmente (textarea)
- Reflexión (textarea)
- Limitación descubierta (input — el output más valioso del ciclo)
- Input para el próximo ciclo (input)

**Historial:** lista de ciclos en orden inverso (más reciente primero), cada uno expandible para ver el detalle. Mostrar número de ciclo, resumen de "adquirir", fecha, y la limitación descubierta como pill destacado.

**La etapa se considera "iniciada"** cuando `ciclos.length > 0`.

---

### Etapa 5 · Consolidación
**Campos:**
- Criterio logrado (textarea — sí/no + evidencia)
- Aprendizajes del proceso (textarea)
- Conexiones con otros campos (textarea)
- Preguntas abiertas para próxima iteración (textarea)
- Cómo lo enseñarías en 10 minutos (textarea)

---

## Navegación entre etapas

- La nav izquierda muestra las 5 etapas siempre visibles
- Etapa completada: dot verde con ✓
- Etapa actual: dot índigo con número
- Etapa pendiente: dot gris con número
- **No bloquear** el acceso a etapas no completadas — el usuario puede saltar libremente

---

## Componentes de UI reutilizables

### Chips (selector)
```jsx
// Single select — radio behavior
<div className="chips">
  {opciones.map(op => (
    <button
      className={`chip ${valor === op.v ? 'chip-active' : ''}`}
      onClick={() => set('campo', op.v)}
    >{op.label}</button>
  ))}
</div>

// Multi select — toggle behavior
<button
  className={`chip ${seleccionados.includes(v) ? 'chip-active' : ''}`}
  onClick={() => toggle(v)}
/>
```

### Section block
```jsx
<div className="section-block">
  <div className="section-header">
    <span className="section-tag">A</span>
    <span>Nombre de sección</span>
  </div>
  <div className="field">
    <label>Pregunta</label>
    <p className="field-hint">Hint explicativo</p>
    <textarea ... />
  </div>
</div>
```

### Criterio box (verde al pie de cada etapa)
```jsx
<div className="criterio-box">
  <span className="criterio-icon">✓</span>
  <p><strong>Criterio de completitud:</strong> texto...</p>
</div>
```

### Warning inline
```jsx
{condicion && <div className="warning">⚠ Mensaje de advertencia</div>}
```

---

## Modal de nuevo tema

- Overlay con blur (`backdrop-filter: blur(4px)`)
- Input de nombre del tema
- Enter para confirmar
- Al crear: navegar directamente al tema nuevo en Etapa 1

## Modal de confirmación eliminar

- Confirmar antes de eliminar (acción irreversible)
- Elimina del array de temas en localStorage

---

## Comportamiento del botón Guardar

- Texto: "Guardar [nombre etapa]"
- Al guardar: marcar `completado: true` + feedback visual 2 segundos ("✓ Guardado" en verde)
- El guardado persiste en localStorage inmediatamente

---

## Criterios de calidad no negociables

1. **Los números grandes (72px) deben verse** en cada etapa — son el signature visual del diseño
2. **Sin librerías de componentes** — todo CSS propio
3. **Sin React Router** — navegación con estado local (`useState`)
4. **El localStorage se actualiza en cada cambio** — nunca perder datos al navegar entre etapas
5. **Responsive básico** — funcional en pantallas desde 1024px
6. **La etapa 4 (Ciclos) es la más compleja** — el historial de ciclos es el core del sistema, cuidar su UX

---

## Mejoras para iteraciones futuras (fuera del scope actual)

- Supabase para persistencia en la nube + auth
- Modo offline con sync
- Extensión a Escenario A (temas teóricos/conceptuales) — las preguntas guía de la Etapa 4 necesitan una rama alternativa para temas sin proyecto concreto
- Export del tema completo como PDF o Markdown
- Vista de estadísticas: ciclos por tema, tiempo total, limitaciones más frecuentes
- Animaciones entre etapas
