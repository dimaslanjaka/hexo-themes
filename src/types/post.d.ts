interface HexoLocalsData {
  [key: string]: any;
  page: {
    [key: string]: any;
    path: string;
  };
  path: string;
  url: string;
  config: Hexo__default["config"];
  theme: Record<string, any>;
  layout: string;
  env: any;
  view_dir: string;
  site: Record<string, any>;
  cache?: boolean;
  /** absolute path source post markdown */
  full_source?: string;
  tags?: any;
  categories?: any;
}
interface HexoRenderData {
  text?: string;
  path?: string;
}

export type HexoPageSchema = import("hexo/dist/types").PageSchema &
  import("hexo/dist/types").PostSchema &
  Record<string, any> &
  HexoLocalsData;
