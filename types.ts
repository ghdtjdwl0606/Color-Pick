
export interface ColorVariation {
  label: string;
  highlight: string;
  shadow: string;
}

export interface ColorDetail {
  name: string;
  base: string;
  variations: ColorVariation[];
  reason: string;
}

export interface RecommendationResponse {
  themeName: string;
  colors: ColorDetail[];
}

export type ViewMode = 'sphere' | 'cube';

export interface StageObject {
  id: string;
  color: ColorDetail;
  activeVariationIndex: number;
  type: ViewMode;
  x: number;
  y: number;
  size: number;
}

export interface CustomPalette {
  id: string;
  name: string;
  colors: string[];
}
