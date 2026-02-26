export interface FilterConfig {
  messageFilter?: string;
  fileFilter?: string;
  customFilter?: string;
}

export interface TitleConfig {
  content?: string;
  customContent?: string;
}

export interface PostMessageConfig {
  content?: string;
  customContent?: string;
}

export interface ThreadConfig {
  channelIds: string[];
  filter: FilterConfig;
  title: TitleConfig;
  postMessage?: PostMessageConfig;
}

export type ThreadConfigList = ThreadConfig[];
