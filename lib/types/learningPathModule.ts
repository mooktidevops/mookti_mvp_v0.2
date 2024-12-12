export interface LearningPathModule {
    learningPathId: string; // references LearningPath.id
    moduleId: string;       // references Module.id
    createdAt: Date;
  }