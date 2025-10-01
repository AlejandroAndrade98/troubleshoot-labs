export type Step = {
  id: string;
  title: string;
  hint?: string;
  validate: (input: string, ctx: GameContext) => boolean;
  successMessage?: string;
};

export type Scenario = {
  id: string;
  name: string;
  intro: string;
  steps: Step[];
};

export type GameContext = {
  vars: Record<string, any>;
  stepIndex: number;
  completed: boolean;
};
