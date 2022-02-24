import {
  InvalidStateError,
  isSpotifyCodeError,
  SpotifyCode,
  SpotifyCodeResponse,
} from "../../services/Spotify/SpotifyService.types";

type SpotifyCallback = (data: SpotifyCodeResponse) => void;

export class SpotifyWebhookService {
  private static instance?: SpotifyWebhookService;

  private constructor() {}

  static getInstance(): SpotifyWebhookService {
    if (!this.instance) this.instance = new SpotifyWebhookService();

    return this.instance;
  }

  // Instance methods
  private listeners: { [state: string]: SpotifyCallback } = {};

  handleRequest(data: SpotifyCodeResponse) {
    const state = data.state;

    this.notifyListeners(state, data);
  }

  waitForResponse(state: string, timeoutInMS?: number): Promise<SpotifyCode> {
    return new Promise((resolve, reject) => {
      this.listen(state, (data) => {
        if (isSpotifyCodeError(data)) {
          reject(data.error);
        } else {
          resolve(data);
        }
      });

      if (timeoutInMS) {
        setTimeout(() => {
          delete this.listeners[state];
          reject("Timeout waiting for webhook!");
        }, timeoutInMS);
      }
    });
  }

  onResponse(state: string, callback: SpotifyCallback) {
    this.listen(state, callback);
  }

  private notifyListeners(state: string, data: SpotifyCodeResponse) {
    if (this.listeners[state]) {
      this.listeners[state](data);
      delete this.listeners[state];
    } else {
      throw new InvalidStateError();
    }
  }

  private listen(state: string, callback: SpotifyCallback) {
    this.listeners[state] = callback;
  }
}
