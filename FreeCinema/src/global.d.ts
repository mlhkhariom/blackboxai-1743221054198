
interface JWPlayer {
  setup: (options: any) => void;
  on: (event: string, callback: (state?: any) => void) => void;
  play: () => void;
  pause: () => void;
  remove: () => void;
  load: () => void;
  setMute: (mute: boolean) => void;
  setVolume: (volume: number) => void;
  setFullscreen: (fullscreen: boolean) => void;
  getQualityLevels: () => Array<{label: string}>;
  setCurrentQuality: (index: number) => void;
}

interface Window {
  jwplayer: (id: string) => JWPlayer;
}
