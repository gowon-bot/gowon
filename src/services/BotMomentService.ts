export class BotMomentService {
  // Static methods/properties
  private static instance: BotMomentService;

  private constructor() {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new BotMomentService();
    }
  }
}
