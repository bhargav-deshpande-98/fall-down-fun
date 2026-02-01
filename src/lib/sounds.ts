// Web Audio API sound effects — Neon arcade theme for Fall Down

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return audioContext
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3
) {
  try {
    const ctx = getAudioContext()

    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  } catch {
    // Audio not available, silently fail
  }
}

// Landing on a platform — short electronic thud
export function playLandSound() {
  playTone(150, 0.06, 'square', 0.12)
}

// Falling through a gap — quick descending blip
export function playFallThroughSound() {
  playTone(500, 0.08, 'sine', 0.15)
  setTimeout(() => playTone(350, 0.06, 'sine', 0.1), 30)
}

// Score milestone (every 10 seconds) — bright ascending chime
export function playMilestoneSound() {
  playTone(550, 0.08, 'triangle', 0.15)
  setTimeout(() => playTone(750, 0.06, 'triangle', 0.12), 40)
}

// Death (pushed off top) — low descending buzz
export function playDeathSound() {
  playTone(200, 0.3, 'sawtooth', 0.25)
  setTimeout(() => playTone(110, 0.25, 'sawtooth', 0.2), 80)
}

// Resume audio context on user interaction (required by browsers)
export function initAudio() {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
  } catch {
    // Audio not available
  }
}
