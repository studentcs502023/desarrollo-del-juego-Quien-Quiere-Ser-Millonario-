
<template>
  <div class="neon-cabina">

    <!-- JUEGO -->
    <div class="game-arena" v-if="!terminado && !cargandoPreguntas">

      <!-- BARRA SUPERIOR -->
      <div class="neon-bar">
        <div class="user-tag">
          <span class="dot"></span>
          👤 {{ nombreJugador }}
        </div>
        <div class="lifeline-panel">
          <button class="lifeline-neon" :disabled="telefonoUsado" @click="usarTelefono">📞</button>
          <button class="lifeline-neon" :disabled="publicoUsado" @click="usarPublico">👥</button>
          <button class="lifeline-neon" :disabled="cincuentaUsado" @click="usar5050">50:50</button>
        </div>
        <div class="prize-neon">
          <span class="prize-glow">${{ premioActual }}</span>
        </div>
      </div>

      <!-- PREGUNTA -->
      <div class="neon-question">
        <div class="question-content">{{ preguntaActual?.texto || 'Cargando...' }}</div>
      </div>

      <!-- RESPUESTAS -->
      <div class="neon-answers">
        <button
          v-for="(resp, i) in preguntaActual?.respuestas || []"
          :key="i"
          :class="[
            'answer-neon',
            `answer-${i}`,
            claseRespuesta(i),
            respuestasOcultas.includes(i) ? 'dim-neon' : ''
          ]"
          @click="clickRespuesta(i)"
          :disabled="respondido || respuestasOcultas.includes(i)"
        >
          <span class="answer-neon-letter">{{ letras[i] }}</span>
          <span class="answer-neon-text">{{ resp }}</span>
        </button>
      </div>
    </div>

    <!-- CARGANDO PREGUNTAS -->
    <div v-if="cargandoPreguntas" class="neon-loading">
      <div class="loading-glitch">⚡ GENERANDO PREGUNTAS CON IA ⚡</div>
      <div class="loading-spinner">🤖</div>
      <div class="loading-text">Gemini está creando preguntas personalizadas...</div>
    </div>

    <!-- ESCALERA -->
    <div class="neon-ladder">
      <div class="ladder-header">💰 PREMIOS</div>
      <div class="ladder-list">
        <div
          v-for="(nivel, idx) in niveles.slice().reverse()"
          :key="idx"
          :class="['ladder-neon-step', {
            'active': (niveles.length - idx - 1) === nivelActual,
            'safe': nivel.seguro
          }]">
          <span>{{ nivel.nivel }}</span>
          <span>${{ nivel.premio }}</span>
  <div>
    <p >Tiempo restante: {{ tiempoRestante }} segundos</p>
  </div>
        </div>
      </div>
    </div>

    <!-- RESULTADO -->
    <div v-if="terminado" class="neon-result">
      <div 
        class="result-glitch" 
        :class="{ win: gano, lose: !gano }"
      >
        {{ gano ? 'VICTORIA' : 'GAME OVER' }}
      </div>

      <div class="result-prize-neon">
        ${{ gano ? premioActual : premioSeguro }}
      </div>

      <button 
        class="neon-restart" 
        @click="reiniciarJuego"
      >
        ⚡ JUGAR ⚡
      </button>
    </div>

    <!-- ANIMACIONES -->
    <div v-if="mostrarAnimacionTelefono" class="animacion-ayuda telefono-anim">
      <div class="onda-llamada" v-for="i in 3" :key="i"></div>
      <div class="icono-llamada">📞</div>
      <div class="burbuja">¡LLAMANDO!</div>
    </div>

    <div v-if="mostrarAnimacionPublico" class="animacion-ayuda publico-anim">
      <div class="gente" v-for="i in 5" :key="i">👤</div>
      <div class="burbuja-publico">👥 ENCUESTA</div>
    </div>

    <div v-if="mostrarAnimacion5050" class="animacion-ayuda cincuenta-anim">
      <div class="rayo">⚡</div>
      <div class="rayo">⚡</div>
      <div class="rayo">⚡</div>
      <div class="burbuja-5050">50:50</div>
    </div>

    <!-- MODAL NEON -->
    <div v-if="mostrarMensaje" class="neon-modal">
      <div class="neon-modal-box">
        <div class="neon-modal-title">{{ tituloMensaje }}</div>
        <div class="neon-modal-content">{{ contenidoMensaje }}</div>
        <button class="neon-modal-btn" @click="cerrarMensaje">CONTINUAR</button>
      </div>
    </div>

    <!-- MODAL ERROR GEMINI -->
    <div v-if="mostrarError" class="neon-modal error-modal">
      <div class="neon-modal-box">
        <div class="neon-modal-title">⚠️ ERROR DE CONEXIÓN</div>
        <div class="neon-modal-content">
          No se pudieron generar preguntas con Gemini.
          {{ mensajeError }}
        </div>
        <button class="neon-modal-btn" @click="reintentarCarga">REINTENTAR</button>
      </div>
    </div>

  </div>
</template>

<!-- <script setup>
import { ref, computed, onMounted,onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const letras = ['A', 'B', 'C', 'D']














const tiempoRestante = ref(30)
let temporizador = null


function iniciarTemporizador() {
  tiempoRestante.value = 30

  temporizador = setInterval(() => {
    tiempoRestante.value--

    if (tiempoRestante.value <= 0) {
      clearInterval(temporizador)
      tiempoTerminado()
    }
  }, 1000)

}

function tiempoTerminado() {
 terminado.value=true

}

onMounted(() => {
  iniciarTemporizador()
})

onUnmounted(() => {
  clearInterval(temporizador)
})







/* =========================
   CONFIGURACIÓN GEMINI
========================= */
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent"
const API_KEY = import.meta.env.VITE_API_KEY

/* =========================
   DATOS INICIALES
========================= */
const nombreJugador = localStorage.getItem('nombreJugador') || 'Jugador'
const dificultad = sessionStorage.getItem('dificultad') || 'facil'

const preguntas = ref([])
const cargandoPreguntas = ref(true)
const mostrarError = ref(false)
const mensajeError = ref('')

const nivelActual = ref(0)
const respondido = ref(false)
const terminado = ref(false)
const gano = ref(false)
const respuestaElegida = ref(null)
const respuestasOcultas = ref([])

const telefonoUsado = ref(false)
const publicoUsado = ref(false)
const cincuentaUsado = ref(false)

const mostrarAnimacionTelefono = ref(false)
const mostrarAnimacionPublico = ref(false)
const mostrarAnimacion5050 = ref(false)

/* =========================
   MODAL
========================= */
const mostrarMensaje = ref(false)
const tituloMensaje = ref('')
const contenidoMensaje = ref('')

function cerrarMensaje() {
  mostrarMensaje.value = false
}

function reintentarCarga() {
  mostrarError.value = false
  cargandoPreguntas.value = true
  cargarPreguntasGemini()
}

/* =========================
   AUDIO
========================= */
const sonidoTelefono = new Audio('/sounds/telefono.mp3')
const sonidoPublico = new Audio('/sounds/publico.mp3')
sonidoTelefono.loop = true
sonidoTelefono.volume = 1
sonidoPublico.loop = true
sonidoPublico.volume = 1

function fadeOutAudio(audio, duration = 1000) {
  const steps = 20
  const stepTime = duration / steps
  const volumeStep = audio.volume / steps

  const fade = setInterval(() => {
    if (audio.volume > volumeStep) {
      audio.volume -= volumeStep
    } else {
      clearInterval(fade)
      audio.pause()
      audio.currentTime = 0
      audio.volume = 1
    }
  }, stepTime)
}

/* =========================
   CARGAR PREGUNTAS CON GEMINI
========================= */
async function cargarPreguntasGemini() {
  try {
    const prompt = `
Genera 10 preguntas de trivia de nivel ${dificultad} en formato JSON con esta estructura exacta:

[
  {
    "texto": "Capital de Francia?",
    "correcta": 1,
    "respuestas": ["Madrid", "París", "Roma", "Berlín"]
  }
]

REGLAS IMPORTANTES:
- Genera EXACTAMENTE 10 preguntas diferentes
- Cada pregunta debe tener 4 opciones (índices 0, 1, 2, 3 para A, B, C, D)
- El campo "correcta" debe ser el índice de la respuesta correcta (0, 1, 2 o 3)
- Las preguntas deben ser variadas: cultura general, ciencia, historia, geografía, arte, tecnología
- Nivel de dificultad: ${dificultad} (${dificultad === 'facil' ? 'preguntas básicas' : dificultad === 'medio' ? 'dificultad intermedia' : 'preguntas avanzadas'})
- Las respuestas incorrectas deben ser creíbles pero claramente erróneas
- Devuelve SOLO el array JSON, sin texto adicional, sin markdown, sin \`\`\`json
`

    console.log('🎯 Generando preguntas con Gemini...')
    
    const response = await axios.post(
      API_URL,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": API_KEY
        }
      }
    )

    let texto = response.data.candidates[0].content.parts[0].text
    texto = texto.replace(/```json\n?|```/g, "").trim()
    
    const preguntasGeneradas = JSON.parse(texto)
    
    // Validar que tenemos 10 preguntas
    if (!Array.isArray(preguntasGeneradas) || preguntasGeneradas.length !== 10) {
      throw new Error('Gemini no generó exactamente 10 preguntas')
    }
    
    // Validar estructura de cada pregunta
    preguntasGeneradas.forEach((p, index) => {
      if (!p.texto || !Array.isArray(p.respuestas) || p.respuestas.length !== 4 || 
          typeof p.correcta !== 'number' || p.correcta < 0 || p.correcta > 3) {
        throw new Error(`Pregunta ${index + 1} tiene formato inválido`)
      }
    })
    
    preguntas.value = preguntasGeneradas
    console.log('✅ Preguntas generadas exitosamente:', preguntas.value.length)
    
  } catch (error) {
    console.error('❌ Error con Gemini:', error)
    mensajeError.value = error.response?.data?.error?.message || error.message
    mostrarError.value = true
    preguntas.value = [] // Vacío para evitar que el juego intente usar preguntas inexistentes
  } finally {
    cargandoPreguntas.value = false
  }
}

/* =========================
   INICIALIZACIÓN
========================= */
onMounted(() => {
  cargarPreguntasGemini()
})

/* =========================
   PREMIOS
========================= */
const niveles = computed(() => {
  return preguntas.value.map((_, i) => ({
    nivel: i + 1,
    premio: (i + 1) * 1000,
    seguro: i === 4 // Pregunta 5 es segura
  }))
})

const preguntaActual = computed(() => preguntas.value[nivelActual.value])
const premioActual = computed(() => niveles.value[nivelActual.value]?.premio || 0)
const premioSeguro = computed(() => {
  const seguros = niveles.value.filter(n => n.seguro && n.nivel <= nivelActual.value + 1)
  return seguros.length ? seguros[seguros.length - 1].premio : 0
})

/* =========================
   RESPUESTAS
========================= */
function clickRespuesta(i) {
  if (respondido.value || !preguntaActual.value) return
  respondido.value = true
  respuestaElegida.value = i
iniciarTemporizador()

  if (i === preguntaActual.value.correcta) {
    if (nivelActual.value < preguntas.value.length - 1) {
      setTimeout(() => {
        nivelActual.value++
        respondido.value = false
        respuestaElegida.value = null
        respuestasOcultas.value = []
      }, 1200)
    } else {
      gano.value = true
      terminado.value = true
    }
  } else {
    setTimeout(() => { terminado.value = true }, 1200)
  }
}

function claseRespuesta(i) {
  if (!respondido.value) return ''
  if (i === preguntaActual.value?.correcta) return 'correct-neon'
  if (i === respuestaElegida.value) return 'wrong-neon'
  if (respuestasOcultas.value.includes(i)) return 'dim-neon'
  return ''
}

/* =========================
   AYUDAS
========================= */
function usarTelefono() {
  if (telefonoUsado.value || respondido.value || !preguntaActual.value) return
  telefonoUsado.value = true
  mostrarAnimacionTelefono.value = true
  sonidoTelefono.currentTime = 0
  sonidoTelefono.play()

  setTimeout(() => {
    mostrarAnimacionTelefono.value = false
    fadeOutAudio(sonidoTelefono, 1000)

    const probabilidadAcertar = 0.8
    if (Math.random() < probabilidadAcertar) {
      tituloMensaje.value = '📞 LLAMADA CONECTADA'
      contenidoMensaje.value =
        `Tu amigo cree que la respuesta correcta es:\n\n"${preguntaActual.value.respuestas[preguntaActual.value.correcta]}"`
    } else {
      const incorrectas = preguntaActual.value.respuestas
        .map((_, i) => i)
        .filter(i => i !== preguntaActual.value.correcta)
      const err = preguntaActual.value.respuestas[
        incorrectas[Math.floor(Math.random() * incorrectas.length)]
      ]
      tituloMensaje.value = '📞 LLAMADA INSEGURA'
      contenidoMensaje.value =
        `Tu amigo duda...\n\nCree que podría ser:\n\n"${err}"`
    }
    mostrarMensaje.value = true
  }, 2000)
}

function usarPublico() {
  if (publicoUsado.value || respondido.value || !preguntaActual.value) return
  publicoUsado.value = true
  mostrarAnimacionPublico.value = true
  sonidoPublico.currentTime = 0
  sonidoPublico.play()

  setTimeout(() => {
    mostrarAnimacionPublico.value = false
    fadeOutAudio(sonidoPublico, 1000)

    const porcentajeCorrecto = 60 + Math.floor(Math.random() * 20)
    const restante = 100 - porcentajeCorrecto
    const incorrectas = preguntaActual.value.respuestas
      .map((_, i) => i)
      .filter(i => i !== preguntaActual.value.correcta)

    const distribucion = []
    let resto = restante
    for (let i = 0; i < incorrectas.length - 1; i++) {
      const val = Math.floor(Math.random() * (resto + 1))
      distribucion.push(val)
      resto -= val
    }
    distribucion.push(resto)

    let mensaje = 'RESULTADO DE LA ENCUESTA:\n\n'
    incorrectas.forEach((idx, i) => {
      mensaje += `${letras[idx]}: ${distribucion[i]}%\n`
    })
    mensaje += `${letras[preguntaActual.value.correcta]}: ${porcentajeCorrecto}%`

    tituloMensaje.value = '👥 ENCUESTA DEL PÚBLICO'
    contenidoMensaje.value = mensaje
    mostrarMensaje.value = true
  }, 2000)
}

function usar5050() {
  if (cincuentaUsado.value || respondido.value || !preguntaActual.value) return
  cincuentaUsado.value = true
  mostrarAnimacion5050.value = true

  setTimeout(() => {
    mostrarAnimacion5050.value = false
    const incorrectas = preguntaActual.value.respuestas
      .map((_, i) => i)
      .filter(i => i !== preguntaActual.value.correcta)
    const ocultar = []
    while (ocultar.length < 2) {
      const idx = incorrectas[Math.floor(Math.random() * incorrectas.length)]
      if (!ocultar.includes(idx)) ocultar.push(idx)
    }
    respuestasOcultas.value = ocultar
  }, 2000)
}

/* =========================
   REINICIAR
========================= */
function reiniciarJuego() {
  const puntajeFinal = gano.value ? premioActual.value : premioSeguro.value
  sessionStorage.setItem('nombreJugador', nombreJugador)
  sessionStorage.setItem('puntajeJugador', `$${puntajeFinal}`)
  router.push({ name: 'ranking' })
}
</script> -->

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const letras = ['A', 'B', 'C', 'D']

/* =========================
   CONFIGURACIÓN GEMINI
========================= */
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent"
const API_KEY = import.meta.env.VITE_API_KEY

/* =========================
   DATOS INICIALES
========================= */
const nombreJugador = localStorage.getItem('nombreJugador') || 'Jugador'
const dificultad = sessionStorage.getItem('dificultad') || 'facil'

const preguntas = ref([])
const cargandoPreguntas = ref(true)
const mostrarError = ref(false)
const mensajeError = ref('')

const nivelActual = ref(0)
const respondido = ref(false)
const terminado = ref(false)
const gano = ref(false)
const respuestaElegida = ref(null)
const respuestasOcultas = ref([])

const telefonoUsado = ref(false)
const publicoUsado = ref(false)
const cincuentaUsado = ref(false)

const mostrarAnimacionTelefono = ref(false)
const mostrarAnimacionPublico = ref(false)
const mostrarAnimacion5050 = ref(false)

/* =========================
   MODAL
========================= */
const mostrarMensaje = ref(false)
const tituloMensaje = ref('')
const contenidoMensaje = ref('')

function cerrarMensaje() {
  mostrarMensaje.value = false
}

function reintentarCarga() {
  mostrarError.value = false
  cargandoPreguntas.value = true
  cargarPreguntasGemini()
}

/* =========================
   AUDIO
========================= */
const sonidoTelefono = new Audio('/sounds/telefono.mp3')
const sonidoPublico = new Audio('/sounds/publico.mp3')
sonidoTelefono.loop = true
sonidoTelefono.volume = 1
sonidoPublico.loop = true
sonidoPublico.volume = 1

function fadeOutAudio(audio, duration = 1000) {
  const steps = 20
  const stepTime = duration / steps
  const volumeStep = audio.volume / steps

  const fade = setInterval(() => {
    if (audio.volume > volumeStep) {
      audio.volume -= volumeStep
    } else {
      clearInterval(fade)
      audio.pause()
      audio.currentTime = 0
      audio.volume = 1
    }
  }, stepTime)
}

/* =========================
   TEMPORIZADOR
========================= */
const tiempoRestante = ref(30)
let temporizador = null

function iniciarTemporizador() {
  // Limpiar temporizador existente si lo hay
  if (temporizador) {
    clearInterval(temporizador)
  }
  
  tiempoRestante.value = 30
  temporizador = setInterval(() => {
    tiempoRestante.value--
    if (tiempoRestante.value <= 0) {
      clearInterval(temporizador)
      tiempoTerminado()
    }
  }, 1000)
}

function tiempoTerminado() {
  terminado.value = true
}

function detenerTemporizador() {
  if (temporizador) {
    clearInterval(temporizador)
    temporizador = null
  }
}

/* =========================
   CARGAR PREGUNTAS CON GEMINI
========================= */
async function cargarPreguntasGemini() {
  try {
    const prompt = `
Genera 10 preguntas de trivia de nivel ${dificultad} en formato JSON con esta estructura exacta:

[
  {
    "texto": "Capital de Francia?",
    "correcta": 1,
    "respuestas": ["Madrid", "París", "Roma", "Berlín"]
  }
]

REGLAS IMPORTANTES:
- Genera EXACTAMENTE 10 preguntas diferentes
- Cada pregunta debe tener 4 opciones (índices 0, 1, 2, 3 para A, B, C, D)
- El campo "correcta" debe ser el índice de la respuesta correcta (0, 1, 2 o 3)
- Las preguntas deben ser variadas: cultura general, ciencia, historia, geografía, arte, tecnología
- Nivel de dificultad: ${dificultad} (${dificultad === 'facil' ? 'preguntas básicas' : dificultad === 'medio' ? 'dificultad intermedia' : 'preguntas avanzadas'})
- Las respuestas incorrectas deben ser creíbles pero claramente erróneas
- Devuelve SOLO el array JSON, sin texto adicional, sin markdown, sin \`\`\`json
`

    console.log('🎯 Generando preguntas con Gemini...')
    
    const response = await axios.post(
      API_URL,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": API_KEY
        }
      }
    )

    let texto = response.data.candidates[0].content.parts[0].text
    texto = texto.replace(/```json\n?|```/g, "").trim()
    
    const preguntasGeneradas = JSON.parse(texto)
    
    // Validar que tenemos 10 preguntas
    if (!Array.isArray(preguntasGeneradas) || preguntasGeneradas.length !== 10) {
      throw new Error('Gemini no generó exactamente 10 preguntas')
    }
    
    // Validar estructura de cada pregunta
    preguntasGeneradas.forEach((p, index) => {
      if (!p.texto || !Array.isArray(p.respuestas) || p.respuestas.length !== 4 || 
          typeof p.correcta !== 'number' || p.correcta < 0 || p.correcta > 3) {
        throw new Error(`Pregunta ${index + 1} tiene formato inválido`)
      }
    })
    
    preguntas.value = preguntasGeneradas
    console.log('✅ Preguntas generadas exitosamente:', preguntas.value.length)
    
    // INICIAR TEMPORIZADOR SOLO DESPUÉS DE QUE LAS PREGUNTAS ESTÉN LISTAS
    iniciarTemporizador()
    
  } catch (error) {
    console.error('❌ Error con Gemini:', error)
    mensajeError.value = error.response?.data?.error?.message || error.message
    mostrarError.value = true
    preguntas.value = []
  } finally {
    cargandoPreguntas.value = false
  }
}

/* =========================
   INICIALIZACIÓN
========================= */
onMounted(() => {
  cargarPreguntasGemini()
})

onUnmounted(() => {
  detenerTemporizador()
})

/* =========================
   PREMIOS
========================= */
const niveles = computed(() => {
  return preguntas.value.map((_, i) => ({
    nivel: i + 1,
    premio: (i + 1) * 1000,
    seguro: i === 4
  }))
})

const preguntaActual = computed(() => preguntas.value[nivelActual.value])
const premioActual = computed(() => niveles.value[nivelActual.value]?.premio || 0)
const premioSeguro = computed(() => {
  const seguros = niveles.value.filter(n => n.seguro && n.nivel <= nivelActual.value + 1)
  return seguros.length ? seguros[seguros.length - 1].premio : 0
})

/* =========================
   RESPUESTAS
========================= */
function clickRespuesta(i) {
  if (respondido.value || !preguntaActual.value) return
  
  // DETENER TEMPORIZADOR CUANDO SE RESPONDE
  detenerTemporizador()
  
  respondido.value = true
  respuestaElegida.value = i

  if (i === preguntaActual.value.correcta) {
    if (nivelActual.value < preguntas.value.length - 1) {
      setTimeout(() => {
        nivelActual.value++
        respondido.value = false
        respuestaElegida.value = null
        respuestasOcultas.value = []
        // REINICIAR TEMPORIZADOR PARA LA SIGUIENTE PREGUNTA
        iniciarTemporizador()
      }, 1200)
    } else {
      gano.value = true
      terminado.value = true
      detenerTemporizador()
    }
  } else {
    setTimeout(() => { 
      terminado.value = true
      detenerTemporizador()
    }, 1200)
  }
}

function claseRespuesta(i) {
  if (!respondido.value) return ''
  if (i === preguntaActual.value?.correcta) return 'correct-neon'
  if (i === respuestaElegida.value) return 'wrong-neon'
  if (respuestasOcultas.value.includes(i)) return 'dim-neon'
  return ''
}

/* =========================
   AYUDAS
========================= */
function usarTelefono() {
  if (telefonoUsado.value || respondido.value || !preguntaActual.value) return
  telefonoUsado.value = true
  mostrarAnimacionTelefono.value = true
  sonidoTelefono.currentTime = 0
  sonidoTelefono.play()

  setTimeout(() => {
    mostrarAnimacionTelefono.value = false
    fadeOutAudio(sonidoTelefono, 1000)

    const probabilidadAcertar = 0.8
    if (Math.random() < probabilidadAcertar) {
      tituloMensaje.value = '📞 LLAMADA CONECTADA'
      contenidoMensaje.value =
        `Tu amigo cree que la respuesta correcta es:\n\n"${preguntaActual.value.respuestas[preguntaActual.value.correcta]}"`
    } else {
      const incorrectas = preguntaActual.value.respuestas
        .map((_, i) => i)
        .filter(i => i !== preguntaActual.value.correcta)
      const err = preguntaActual.value.respuestas[
        incorrectas[Math.floor(Math.random() * incorrectas.length)]
      ]
      tituloMensaje.value = '📞 LLAMADA INSEGURA'
      contenidoMensaje.value =
        `Tu amigo duda...\n\nCree que podría ser:\n\n"${err}"`
    }
    mostrarMensaje.value = true
  }, 2000)
}

function usarPublico() {
  if (publicoUsado.value || respondido.value || !preguntaActual.value) return
  publicoUsado.value = true
  mostrarAnimacionPublico.value = true
  sonidoPublico.currentTime = 0
  sonidoPublico.play()

  setTimeout(() => {
    mostrarAnimacionPublico.value = false
    fadeOutAudio(sonidoPublico, 1000)

    const porcentajeCorrecto = 60 + Math.floor(Math.random() * 20)
    const restante = 100 - porcentajeCorrecto
    const incorrectas = preguntaActual.value.respuestas
      .map((_, i) => i)
      .filter(i => i !== preguntaActual.value.correcta)

    const distribucion = []
    let resto = restante
    for (let i = 0; i < incorrectas.length - 1; i++) {
      const val = Math.floor(Math.random() * (resto + 1))
      distribucion.push(val)
      resto -= val
    }
    distribucion.push(resto)

    let mensaje = 'RESULTADO DE LA ENCUESTA:\n\n'
    incorrectas.forEach((idx, i) => {
      mensaje += `${letras[idx]}: ${distribucion[i]}%\n`
    })
    mensaje += `${letras[preguntaActual.value.correcta]}: ${porcentajeCorrecto}%`

    tituloMensaje.value = '👥 ENCUESTA DEL PÚBLICO'
    contenidoMensaje.value = mensaje
    mostrarMensaje.value = true
  }, 2000)
}

function usar5050() {
  if (cincuentaUsado.value || respondido.value || !preguntaActual.value) return
  cincuentaUsado.value = true
  mostrarAnimacion5050.value = true

  setTimeout(() => {
    mostrarAnimacion5050.value = false
    const incorrectas = preguntaActual.value.respuestas
      .map((_, i) => i)
      .filter(i => i !== preguntaActual.value.correcta)
    const ocultar = []
    while (ocultar.length < 2) {
      const idx = incorrectas[Math.floor(Math.random() * incorrectas.length)]
      if (!ocultar.includes(idx)) ocultar.push(idx)
    }
    respuestasOcultas.value = ocultar
  }, 2000)
}

/* =========================
   REINICIAR
========================= */
function reiniciarJuego() {
  detenerTemporizador()
  const puntajeFinal = gano.value ? premioActual.value : premioSeguro.value
  sessionStorage.setItem('nombreJugador', nombreJugador)
  sessionStorage.setItem('puntajeJugador', `$${puntajeFinal}`)
  router.push({ name: 'ranking' })
}
</script>

<style>
/* NEON CABINA - VERSIÓN MEJORADA CON COLORES NEON */

.neon-cabina {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a2a 0%, #1a0033 100%);
  display: flex;
  position: relative;
  overflow: hidden;
  font-family: 'Arial Black', sans-serif;
}

.neon-cabina::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, rgba(255,0,255,0.1), transparent 70%);
  pointer-events: none;
}

.game-arena {
  flex: 3;
  padding: 30px;
  display: flex;
  flex-direction: column;
}

/* BARRA SUPERIOR MÁS RADIACTIVA */
.neon-bar {
  background: rgba(10, 10, 30, 0.8);
  backdrop-filter: blur(10px);
  border: 2px solid #ff00ff;
  border-radius: 50px;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  box-shadow: 0 0 30px #ff00ff, 0 0 60px #00ffff, inset 0 0 20px #ff00ff;
  animation: barPulse 3s infinite;
}

@keyframes barPulse {
  0%, 100% { border-color: #ff00ff; box-shadow: 0 0 30px #ff00ff, 0 0 60px #00ffff; }
  50% { border-color: #00ffff; box-shadow: 0 0 30px #00ffff, 0 0 60px #ff00ff; }
}

.user-tag {
  color: #fff;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 0 10px cyan, 0 0 20px magenta;
}

.dot {
  width: 15px;
  height: 15px;
  background: #0f0;
  border-radius: 50%;
  box-shadow: 0 0 20px #0f0, 0 0 40px #ff0;
  animation: dotPulse 1s infinite;
}

@keyframes dotPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.lifeline-panel {
  display: flex;
  gap: 15px;
}

.lifeline-neon {
  background: transparent;
  border: 3px solid gold;
  color: gold;
  font-size: 2rem;
  padding: 10px 20px;
  margin: 0 10px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 20px gold;
  font-weight: bold;
}

.lifeline-neon:hover:not(:disabled) {
  transform: scale(1.1);
  background: rgba(255, 215, 0, 0.2);
  box-shadow: 0 0 40px gold, 0 0 80px orange;
}

.lifeline-neon:disabled {
  opacity: 0.3;
  filter: grayscale(1);
  cursor: not-allowed;
}

.prize-neon {
  font-size: 2.2rem;
  font-weight: 900;
}

.prize-glow {
  color: gold;
  text-shadow: 0 0 20px gold, 0 0 40px orange, 0 0 60px red;
  animation: prizeGlow 2s infinite;
}

@keyframes prizeGlow {
  0%, 100% { text-shadow: 0 0 20px gold, 0 0 40px orange; }
  50% { text-shadow: 0 0 40px gold, 0 0 80px red, 0 0 120px magenta; }
}

/* PREGUNTA CON MÁS ESTILO */
.neon-question {
  background: linear-gradient(145deg, #1a0033, #000a1a);
  border: 3px solid cyan;
  border-radius: 40px;
  padding: 40px;
  margin-bottom: 40px;
  text-align: center;
  box-shadow: 0 0 50px cyan, 0 0 100px magenta, inset 0 0 30px cyan;
  transform: perspective(1000px) rotateX(2deg);
}

.question-content {
  font-size: 2.5rem;
  font-weight: 900;
  color: white;
  text-shadow: 0 0 10px cyan, 0 0 20px magenta, 0 0 30px blue;
  letter-spacing: 2px;
}

/* RESPUESTAS CON COLORES ÚNICOS */
.neon-answers {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
}

.answer-neon {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  border: 3px solid;
  border-radius: 30px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1.4rem;
  color: white;
  box-shadow: 0 10px 20px rgba(0,0,0,0.5);
}

.answer-0 { border-color: #ff00ff; box-shadow: 0 0 30px #ff00ff; }
.answer-1 { border-color: #00ffff; box-shadow: 0 0 30px #00ffff; }
.answer-2 { border-color: #ffff00; box-shadow: 0 0 30px #ffff00; }
.answer-3 { border-color: #ff6600; box-shadow: 0 0 30px #ff6600; }

.answer-neon:hover:not(:disabled) {
  transform: scale(1.05) translateY(-5px);
  filter: brightness(1.3);
}

.answer-0:hover { background: rgba(255, 0, 255, 0.2); }
.answer-1:hover { background: rgba(0, 255, 255, 0.2); }
.answer-2:hover { background: rgba(255, 255, 0, 0.2); }
.answer-3:hover { background: rgba(255, 102, 0, 0.2); }

.answer-neon-letter {
  font-size: 2rem;
  font-weight: 900;
  color: inherit;
  text-shadow: 0 0 10px currentColor;
}

.answer-neon-text {
  flex: 1;
  text-align: left;
}

/* ESTADOS DE RESPUESTA */
.correct-neon {
  background: rgba(0, 255, 0, 0.3) !important;
  border-color: #0f0 !important;
  box-shadow: 0 0 50px #0f0, 0 0 100px #0f0 !important;
  animation: correctFlash 0.5s;
}

.wrong-neon {
  background: rgba(255, 0, 0, 0.3) !important;
  border-color: #f00 !important;
  box-shadow: 0 0 50px #f00, 0 0 100px #f00 !important;
  animation: wrongFlash 0.5s;
}

@keyframes correctFlash {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.5); background: rgba(0, 255, 0, 0.5); }
}

@keyframes wrongFlash {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.5); background: rgba(255, 0, 0, 0.5); }
}

.dim-neon {
  opacity: 0.3 !important;
  filter: grayscale(1) !important;
  pointer-events: none !important;
}

/* ESCALERA DE PREMIOS MEJORADA */
.neon-ladder {
  width: 300px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border-left: 3px solid gold;
  padding: 30px 0;
  position: relative;
  overflow-y: auto;
  box-shadow: -20px 0 30px rgba(255, 215, 0, 0.3);
}

.ladder-header {
  font-size: 2rem;
  font-weight: 900;
  color: gold;
  text-align: center;
  padding: 20px;
  text-shadow: 0 0 20px gold, 0 0 40px orange;
  border-bottom: 2px solid gold;
  margin-bottom: 20px;
}

.ladder-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.ladder-neon-step {
  padding: 15px 25px;
  margin: 5px 20px;
  border-radius: 30px;
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
  color: #fff;
  border: 2px solid rgba(255,255,255,0.2);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.ladder-neon-step::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: 0.5s;
}

.ladder-neon-step:hover::before {
  left: 100%;
}

.ladder-neon-step.active {
  border-color: cyan;
  background: rgba(0, 255, 255, 0.2);
  box-shadow: 0 0 30px cyan;
  transform: scale(1.05);
  font-weight: 900;
  color: cyan;
  text-shadow: 0 0 10px cyan;
}

.ladder-neon-step.safe {
  border-color: gold;
  box-shadow: 0 0 20px gold;
  background: rgba(255, 215, 0, 0.1);
}

/* RESULTADO FINAL GLITCH */
.neon-result {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(20px);
}

.result-glitch {
  font-size: 6rem;
  font-weight: 900;
  text-transform: uppercase;
  animation: glitch 1s infinite;
}

.result-glitch.win {
  color: gold;
  text-shadow: -10px 0 cyan, 10px 0 magenta;
}

@keyframes glitch {
  0%, 100% { transform: skew(0deg, 0deg); opacity: 1; }
  95% { transform: skew(5deg, -5deg); opacity: 0.8; text-shadow: -5px 0 red, 5px 0 blue; }
  96% { transform: skew(-5deg, 5deg); opacity: 0.9; text-shadow: 5px 0 blue, -5px 0 red; }
}

.result-prize-neon {
  font-size: 4rem;
  color: gold;
  text-shadow: 0 0 30px gold, 0 0 60px orange, 0 0 90px red;
  margin: 40px 0;
  animation: prizePulse 1.5s infinite;
}

@keyframes prizePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); text-shadow: 0 0 50px gold, 0 0 100px red; }
}

.neon-restart {
  background: transparent;
  border: 4px solid cyan;
  color: cyan;
  font-size: 2.5rem;
  padding: 20px 60px;
  border-radius: 60px;
  cursor: pointer;
  box-shadow: 0 0 50px cyan;
  transition: all 0.3s;
  font-weight: 900;
}

.neon-restart:hover {
  transform: scale(1.1);
  background: rgba(0, 255, 255, 0.2);
  box-shadow: 0 0 80px cyan, 0 0 150px magenta;
  border-color: magenta;
  color: magenta;
}

/* ANIMACIONES DE AYUDAS MÁS COLORIDAS */
.animacion-ayuda {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5000;
  pointer-events: none;
}

.telefono-anim {
  position: relative;
}

.onda-llamada {
  position: absolute;
  border: 4px solid cyan;
  border-radius: 50%;
  animation: onda 2s infinite;
  box-shadow: 0 0 50px cyan, inset 0 0 30px cyan;
}

.onda-llamada:nth-child(1) { animation-delay: 0s; }
.onda-llamada:nth-child(2) { animation-delay: 0.5s; }
.onda-llamada:nth-child(3) { animation-delay: 1s; }

@keyframes onda {
  0% { width: 100px; height: 100px; opacity: 1; }
  100% { width: 500px; height: 500px; opacity: 0; }
}

.icono-llamada {
  font-size: 5rem;
  position: relative;
  z-index: 10;
  animation: llamadaPulse 1s infinite;
  filter: drop-shadow(0 0 30px cyan);
}

@keyframes llamadaPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.publico-anim {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.gente {
  font-size: 4rem;
  margin: 10px;
  animation: genteBounce 0.5s infinite alternate;
  filter: drop-shadow(0 0 20px gold);
}

.gente:nth-child(1) { animation-delay: 0s; }
.gente:nth-child(2) { animation-delay: 0.1s; }
.gente:nth-child(3) { animation-delay: 0.2s; }
.gente:nth-child(4) { animation-delay: 0.3s; }
.gente:nth-child(5) { animation-delay: 0.4s; }

@keyframes genteBounce {
  0% { transform: translateY(0) rotate(0deg); }
  100% { transform: translateY(-50px) rotate(10deg); }
}

.cincuenta-anim {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.rayo {
  font-size: 8rem;
  position: absolute;
  animation: rayoFlash 0.3s infinite;
  filter: drop-shadow(0 0 50px cyan) drop-shadow(0 0 100px magenta);
}

.rayo:nth-child(1) { animation-delay: 0s; left: 30%; }
.rayo:nth-child(2) { animation-delay: 0.1s; right: 30%; }
.rayo:nth-child(3) { animation-delay: 0.2s; transform: rotate(180deg); }

@keyframes rayoFlash {
  0%, 100% { opacity: 0; transform: rotate(0deg) scale(0.5); }
  50% { opacity: 1; transform: rotate(180deg) scale(1.5); }
}

.burbuja, .burbuja-publico, .burbuja-5050 {
  background: rgba(0,0,0,0.9);
  padding: 30px 60px;
  border-radius: 60px;
  font-size: 3rem;
  font-weight: 900;
  border: 4px solid;
  box-shadow: 0 0 100px;
  backdrop-filter: blur(20px);
  z-index: 100;
  position: relative;
}

.burbuja { border-color: cyan; color: cyan; box-shadow: 0 0 100px cyan; }
.burbuja-publico { border-color: gold; color: gold; box-shadow: 0 0 100px gold; }
.burbuja-5050 { border-color: magenta; color: magenta; box-shadow: 0 0 100px magenta; }

/* MODAL MEJORADO */
.neon-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(20px);
}

.neon-modal-box {
  background: linear-gradient(145deg, #000a1a, #1a0033);
  border: 4px solid cyan;
  border-radius: 40px;
  padding: 50px;
  width: 600px;
  text-align: center;
  box-shadow: 0 0 100px cyan, 0 0 200px magenta, inset 0 0 50px cyan;
  animation: modalAppear 0.5s;
}

@keyframes modalAppear {
  0% { transform: scale(0.5) rotate(-10deg); opacity: 0; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.neon-modal-title {
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(45deg, cyan, magenta, gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 30px;
  text-shadow: 0 0 30px cyan;
}

.neon-modal-content {
  white-space: pre-line;
  font-size: 1.5rem;
  color: white;
  margin-bottom: 40px;
  text-shadow: 0 0 10px cyan;
  padding: 20px;
  border: 2px dashed rgba(0, 255, 255, 0.3);
  border-radius: 30px;
}

.neon-modal-btn {
  background: transparent;
  border: 4px solid gold;
  padding: 15px 50px;
  border-radius: 50px;
  color: gold;
  font-size: 1.5rem;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 0 40px gold;
  transition: all 0.3s;
}

.neon-modal-btn:hover {
  transform: scale(1.1);
  background: rgba(255, 215, 0, 0.2);
  box-shadow: 0 0 80px gold, 0 0 150px orange;
  border-color: orange;
  color: orange;
}

/* Scrollbar personalizada */
.neon-ladder::-webkit-scrollbar {
  width: 8px;
}

.neon-ladder::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.5);
}

.neon-ladder::-webkit-scrollbar-thumb {
  background: linear-gradient(cyan, magenta);
  border-radius: 4px;
}

.neon-ladder::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(magenta, gold);
}
</style>