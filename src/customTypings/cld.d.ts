interface Language {
  readonly name: string;
  readonly code: string;
  readonly percent: number;
  readonly score: number;
}
interface Chunk {
  readonly name: string;
  readonly code: string;
  readonly offset: number;
  readonly bytes: number;
}
interface DetectLanguage {
  readonly reliable: boolean;
  readonly textBytes: number;
  readonly languages: Language[];
  readonly chunks: Chunk[];
}
declare module "cld" {
  function detect(text: string):Promise<DetectLanguage>;
}