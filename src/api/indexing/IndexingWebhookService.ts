export class IndexingWebhookService {
  private static instance?: IndexingWebhookService;

  private constructor() {}

  static getInstance(): IndexingWebhookService {
    if (!this.instance) this.instance = new IndexingWebhookService();

    return this.instance;
  }

  // Instance methods
  private listeners: { [token: string]: () => void } = {};

  handleRequest(token: string) {
    this.notifyListeners(token);
  }

  waitForResponse(token: string, timeout?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.listen(token, () => {
        resolve();
      });

      if (timeout) {
        setTimeout(() => {
          delete this.listeners[token];
          reject("Timeout waiting for webhook!");
        }, timeout);
      }
    });
  }

  onResponse(token: string, callback: () => void) {
    this.listen(token, callback);
  }

  private notifyListeners(token: string) {
    if (this.listeners[token]) {
      this.listeners[token]();
      delete this.listeners[token];
    }
  }

  private listen(token: string, callback: () => void) {
    this.listeners[token] = callback;
  }
}
