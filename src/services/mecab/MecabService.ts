import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { BaseService } from "../BaseService";
import jskana from "jskana";

export class MecabService extends BaseService {

  mecabProcess:ChildProcessWithoutNullStreams;

  constructor() {
    super();
    this.mecabProcess = spawn("mecab");
  }
  
  //currently unused, when bot shutdown script is added, call this method for more graceful exit. Not necessary.
  public close() {
    this.mecabProcess.kill("SIGINT");
  }

  private segmentText(input:string):Promise<string> {
    this.mecabProcess.stdin.write(input);
  
    return new Promise((resolve, reject) => {

      const resolver = (data:string, resolve:(value: string | PromiseLike<string>) => void) => {
        resolve(data.toString());
        clearHandlers(resolver, rejecter);
      }
    
      const rejecter = (error:string, reject:(reason?: any) => void) => {
        reject(error);
        clearHandlers(resolver, rejecter);
      }

      const clearHandlers = (resolver:(data: string, resolve: (value: string | PromiseLike<string>) => void) => void, rejecter:(error: string, reject: (reason?: any) => void) => void) => {
        this.mecabProcess.stdout.removeListener('data', resolver);
        this.mecabProcess.stderr.removeListener('data', rejecter);
      }
  
      this.mecabProcess.stdout.on('data', (data:string) => { resolver(data, resolve) });
      this.mecabProcess.stderr.on('data', (error:string) => { rejecter(error, reject) });
    });
  }

  public async processJapanese(input:string) {
    const unprocessed = await this.segmentText(input + "\n");
    const processed = unprocessed.split("\n").slice(0,-2).map(word => {
      const commasplit = word.split(",");
      const kanji = word.split("\t")[0];
      if (commasplit[commasplit.length - 2] === "*") {
        return [kanji,kanji,kanji,kanji,kanji];
      } else {
        return [kanji,
                jskana.katakanaToHiragana(commasplit[commasplit.length - 2]),
                commasplit[commasplit.length - 2],
                commasplit[commasplit.length - 1]];
      }
      
    }).reduce((acc, cur) => {
      acc[0] += cur[0];
      acc[1] += cur[1];
      acc[2] += cur[2];
      acc[3] += cur[3];
      return acc;
    }, ["", "", "", "", ""]);
    return [...processed.slice(0,3), jskana.kanaToRomaji(processed[3]), jskana.kanaToRomaji(processed[2]), input].join("").replace(/\s+/g, "");
  }

}