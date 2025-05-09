
import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  isMuted: boolean;
  
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  isMuted: true, // Start muted by default
  
  setBackgroundMusic: (music) => {
    music.muted = get().isMuted; // Apply current mute state
    set({ backgroundMusic: music });
  },
  
  setHitSound: (sound) => {
    sound.muted = get().isMuted; // Apply current mute state
    set({ hitSound: sound });
  },
  
  setSuccessSound: (sound) => {
    sound.muted = get().isMuted; // Apply current mute state
    set({ successSound: sound });
  },
  
  toggleMute: () => {
    const { isMuted, backgroundMusic, hitSound, successSound } = get();
    const newMutedState = !isMuted;
    
    // Apply muted state to all audio elements
    if (backgroundMusic) {
      backgroundMusic.muted = newMutedState;
    }
    if (hitSound) {
      hitSound.muted = newMutedState;
    }
    if (successSound) {
      successSound.muted = newMutedState;
    }
    
    // Update the state
    set({ isMuted: newMutedState });
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound && !isMuted) {
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(error => {
        console.log("Hit sound play prevented:", error);
      });
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound && !isMuted) {
      successSound.currentTime = 0;
      successSound.play().catch(error => {
        console.log("Success sound play prevented:", error);
      });
    }
  }
}));
