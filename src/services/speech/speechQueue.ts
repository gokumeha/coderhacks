export class SpeechQueue {
  private activeUtterance: SpeechSynthesisUtterance | null = null;

  public cancelCurrent() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Clear the queue to prevent overlapping speech
      window.speechSynthesis.cancel();
      this.activeUtterance = null;
    }
  }

  public play(utterance: SpeechSynthesisUtterance): Promise<void> {
    return new Promise((resolve) => {
      // Auto-cancel any currently playing speech before starting new one
      this.cancelCurrent();

      this.activeUtterance = utterance;

      // Browser Garbage Collection Bug Patch:
      // Chrome notoriously garbage-collects utterances before they finish playing.
      // Attaching to window prevents this silent failure.
      (window as any)._activeUtterance = utterance;

      utterance.onend = () => {
        (window as any)._activeUtterance = null;
        this.activeUtterance = null;
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('[SpeechQueue] Speech synthesis interrupted or failed:', e);
        (window as any)._activeUtterance = null;
        this.activeUtterance = null;
        resolve(); // Resolve anyway so UI doesn't freeze
      };

      // Trigger playback
      window.speechSynthesis.speak(utterance);
    });
  }
}

export const speechQueue = new SpeechQueue();
