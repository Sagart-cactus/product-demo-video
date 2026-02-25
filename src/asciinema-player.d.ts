// Ambient declaration for asciinema-player (no @types package available)
declare module "asciinema-player" {
  interface PlayerOptions {
    autoPlay?: boolean;
    controls?: boolean | "auto";
    fit?: "width" | "height" | "both" | false;
    theme?: string;
    speed?: number;
    terminalFontSize?: string;
    rows?: number;
    cols?: number;
    startAt?: number;
  }

  interface Player {
    seek(time: number): void;
    play(): void;
    pause(): void;
    dispose(): void;
  }

  export function create(
    src: string,
    container: HTMLElement,
    options?: PlayerOptions
  ): Player;
}
