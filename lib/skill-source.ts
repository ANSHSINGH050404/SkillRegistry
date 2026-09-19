export interface SkillCandidate {
  name: string;
  repositoryUrl: string;
  description?: string;
}

export interface SkillSource {
  discover(): Promise<SkillCandidate[]>;
}

export class ManualSubmissionSource implements SkillSource {
  async discover(): Promise<SkillCandidate[]> {
    return [];
  }
}
