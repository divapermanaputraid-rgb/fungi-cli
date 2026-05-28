// FungiCode memory: project-memory — Sprint 0 placeholder

export interface ProjectMemory {
  load(): Promise<string>;
  save(context: string): Promise<void>;
}

// TODO: implement actual project memory in Sprint 1
export class FungiProjectMemory implements ProjectMemory {
  async load(): Promise<string> {
    throw new Error("FungiProjectMemory.load() not yet implemented — Sprint 1");
  }

  async save(_context: string): Promise<void> {
    throw new Error("FungiProjectMemory.save() not yet implemented — Sprint 1");
  }
}