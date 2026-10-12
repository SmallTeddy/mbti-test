export type PersonalityTrait = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';

export type PersonalityType = `${PersonalityTrait}${PersonalityTrait}${PersonalityTrait}${PersonalityTrait}`;

export interface QuestionOption {
  trait: PersonalityTrait;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  options: QuestionOption[]
}

export interface PersonalityResult {
  name: string;
  type: PersonalityType;
  details?: string;
  description: string;
}
