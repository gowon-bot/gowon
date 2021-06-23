type IndexingCallback = (error?: string) => void;

export class IndexingWebhookService {
  private static instance?: IndexingWebhookService;

  private constructor() {}

  static getInstance(): IndexingWebhookService {
    if (!this.instance) this.instance = new IndexingWebhookService();

    return this.instance;
  }

  // Instance methods
  private listeners: { [token: string]: IndexingCallback } = {};

  handleRequest(token: string, error?: string) {
    this.notifyListeners(token, error);
  }

  waitForResponse(token: string, timeout?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.listen(token, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });

      if (timeout) {
        setTimeout(() => {
          delete this.listeners[token];
          reject("Timeout waiting for webhook!");
        }, timeout);
      }
    });
  }

  onResponse(token: string, callback: IndexingCallback) {
    this.listen(token, callback);
  }

  private notifyListeners(token: string, error?: string) {
    if (this.listeners[token]) {
      this.listeners[token](error);
      delete this.listeners[token];
    }
  }

  private listen(token: string, callback: IndexingCallback) {
    this.listeners[token] = callback;
  }
}
