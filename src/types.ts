export enum NatsSubjects {
  SHORTIFY = "shortify",
}

export interface UrlModel {
  id: string;
  original_url: string;
}
