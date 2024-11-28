export type PersonalityTrait = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';

export type PersonalityType = `${PersonalityTrait}${PersonalityTrait}${PersonalityTrait}${PersonalityTrait}`;

type OptionsType = {
  [K in PersonalityTrait]?: string;
};

export interface Question {
  id: number;
  text: string;
  options: OptionsType
}

export interface PersonalityResult {
  name: string;
  type: PersonalityType;
  details?: string;
  description: string;
}
