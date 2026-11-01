// Gemini TTS Audio Service

let currentAudio: HTMLAudioElement | null = null;

export async function speakText(text: string, onStart?: () => void, onEnd?: () => void): Promise<void> {
  if (typeof window === 'undefined') return;

  // Stop any currently playing audio or speech
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  if (onStart) onStart();

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const data = await response.json();

    if (data.success && data.audioBase64) {
      const mime = data.mimeType || 'audio/mp3';
      const audioUrl = `data:${mime};base64,${data.audioBase64}`;
      const audio = new Audio(audioUrl);
      currentAudio = audio;

      audio.onended = () => {
        currentAudio = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        fallbackWebSpeech(text, onEnd);
      };

      await audio.play();
      return;
    }
  } catch (err) {
    console.warn('Server TTS fetch failed, using browser speech synthesis:', err);
  }

  // Fallback to Web Speech API
  fallbackWebSpeech(text, onEnd);
}

function fallbackWebSpeech(text: string, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Select UK/US/PK English voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en-US') || v.lang.includes('en'));
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
