const NOTIFICATION_SOUND_URL = '/sounds/notification.mp3';

let audioCtx: AudioContext | null = null;
let unlockListenerAttached = false;
let notificationAudio: HTMLAudioElement | null = null;

function getNotificationAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!notificationAudio) {
    notificationAudio = new Audio(NOTIFICATION_SOUND_URL);
    notificationAudio.preload = 'auto';
  }
  return notificationAudio;
}

export function unlockNotificationAudio(): void {
  if (typeof window === 'undefined') return;
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') void audioCtx.resume();
  } catch {
    // Autoplay policy or unsupported environment
  }

  getNotificationAudio()?.load();
}

/** İlk tıklamada ses kilidini aç (tarayıcı autoplay politikası). */
export function attachNotificationAudioUnlock(): void {
  if (typeof window === 'undefined' || unlockListenerAttached) return;
  unlockListenerAttached = true;
  const unlock = () => {
    unlockNotificationAudio();
    const audio = getNotificationAudio();
    if (audio) {
      const prevVolume = audio.volume;
      audio.volume = 0.001;
      void audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = prevVolume;
        })
        .catch(() => {
          audio.volume = prevVolume;
        });
    }
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock, { once: true, passive: true });
  window.addEventListener('keydown', unlock, { once: true });
}

function playDefaultTone(): void {
  if (typeof window === 'undefined') return;
  try {
    unlockNotificationAudio();
    if (!audioCtx || audioCtx.state !== 'running') return;

    const now = audioCtx.currentTime;
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(0.22, now + start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.start(now + start);
      osc.stop(now + start + duration + 0.04);
    };

    playTone(880, 0, 0.11);
    playTone(659, 0.13, 0.14);
  } catch {
    // ignore
  }
}

export function playBookingNotificationSound(): void {
  if (typeof window === 'undefined') return;

  const audio = getNotificationAudio();
  if (!audio) return;

  audio.currentTime = 0;
  void audio.play().catch(() => playDefaultTone());
}
