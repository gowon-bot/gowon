import { TwitterAuthURL } from "../../services/Twitter/converters/Auth";

export type TwitterAuthResponse = { state: string; code: string };
type TwitterCallback = (
  data: TwitterAuthResponse,
  codeVerifier: string
) => void;
type TwitterAuthListener = {
  callback: TwitterCallback;
  codeVerifier: string;
};

export class TwitterWebhookService {
  private static instance?: TwitterWebhookService;

  private constructor() {}

  static getInstance(): TwitterWebhookService {
    if (!this.instance) this.instance = new TwitterWebhookService();

    return this.instance;
  }

  // Instance methods
  private listeners: { [state: string]: TwitterAuthListener } = {};

  handleRequest(data: TwitterAuthResponse) {
    const state = data.state;

    this.notifyListeners(state, data);
  }

  waitForResponse(
    url: TwitterAuthURL,
    timeoutInMS?: number
  ): Promise<TwitterAuthResponse> {
    return new Promise((resolve, reject) => {
      this.listen(url.state, {
        codeVerifier: url.codeVerifier,
        callback: (data) => {
          resolve(data);
        },
      });

      if (timeoutInMS) {
        setTimeout(() => {
          delete this.listeners[url.state];
          reject("Timeout waiting for webhook!");
        }, timeoutInMS);
      }
    });
  }

  onResponse(state: string, callback: TwitterAuthListener) {
    this.listen(state, callback);
  }

  private notifyListeners(state: string, data: TwitterAuthResponse) {
    if (this.listeners[state]) {
      const { callback, codeVerifier } = this.listeners[state];

      callback(data, codeVerifier);
      delete this.listeners[state];
    } else {
      // TODO: make this for twitter
      // throw new InvalidStateError();
    }
  }

  private listen(state: string, listener: TwitterAuthListener) {
    this.listeners[state] = listener;
  }
}
