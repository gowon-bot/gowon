import { BaseService } from "./BaseService";
import config from "../../config.json";
import pm2, { ProcessDescription } from "pm2";
import { PM2ConnectionError } from "../errors";

export class PM2Service extends BaseService {
  appName = config.pm2AppName;

  restart() {
    this.log(`Restarting ${this.appName}`);
    this.connectAndRun(() => {
      pm2.restart(this.appName, () => {});
    });
  }

  async describe(): Promise<ProcessDescription> {
    return new Promise((resolve, reject) => {
      this.log(`Describing ${this.appName}`);

      this.connectAndRun(() => {
        pm2.describe(this.appName, (err, description) => {
          if (err) reject(err);

          resolve(description[0]);
        });
      });
    });
  }

  private connectAndRun(callback: Function) {
    pm2.connect((err) => {
      if (err) throw new PM2ConnectionError();

      callback();
    });
  }
}
