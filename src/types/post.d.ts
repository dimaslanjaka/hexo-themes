import { HexoLocalsData } from "hexo-renderers";

export type HexoPageSchema = import("hexo/dist/types").PageSchema &
  import("hexo/dist/types").PostSchema &
  Record<string, any> &
  HexoLocalsData;
