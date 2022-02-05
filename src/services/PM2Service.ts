import { BaseService } from "./BaseService";
import config from "../../config.json";
import pm2, { ProcessDescription } from "pm2";
import { PM2ConnectionError } from "../errors";
import { GowonContext } from "../lib/context/Context";

export class PM2Service extends BaseService {
  appName = config.pm2AppName;

  restart(ctx: GowonContext) {
    this.log(ctx, `Restarting ${this.appName}`);
    this.connectAndRun(() => {
      pm2.restart(this.appName, () => {});
    });
  }

  async describe(ctx: GowonContext): Promise<ProcessDescription> {
    return new Promise((resolve, reject) => {
      this.log(ctx, `Describing ${this.appName}`);

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
