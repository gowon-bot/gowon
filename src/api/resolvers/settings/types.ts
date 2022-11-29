export interface APISetting {
  name: string;
  category: string | undefined;
  friendlyName: string;
  description: string;
  type: string;
  scope: string;
  choices: string[] | undefined;
}

export interface SettingValue {
  role?: { name: string; id: string; colour: string };
  string?: string;
  boolean?: boolean;
  number?: number;
}

export interface APISettingWithValue {
  value: SettingValue;
  setting: APISetting;
}
