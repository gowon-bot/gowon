import { Logger } from "../lib/Logger";
import chalk from "chalk";

export class BaseService {
  constructor(public logger?: Logger) {}

  protected log(msg: string): void {
    Logger.log(this.constructor.name, chalk`{grey ${msg}}`, this.logger);
  }
}
