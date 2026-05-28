// FungiCode Plan Mode — Sprint 0 placeholder

export interface PlanMode {
  generatePlan(prompt: string): Promise<string>;
  executePlan(): Promise<void>;
}

// TODO: Sprint 1 — structured planning loop
export class FungiPlanMode implements PlanMode {
  async generatePlan(_prompt: string): Promise<string> {
    throw new Error("FungiPlanMode.generatePlan() not yet implemented — Sprint 1");
  }

  async executePlan(): Promise<void> {
    throw new Error("FungiPlanMode.executePlan() not yet implemented — Sprint 1");
  }
}