export type Project = {
  id: string;
  name: string;
  description?: string;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD";
  startDate: string;
  endDate?: string | null;
  departments: { id: string; name: string }[];
  createdBy?: { email: string };
};

const projects: Project[] = [];

export function getMockProjects() {
  return projects;
}

export function createMockProject(project: Omit<Project, "id">) {
  projects.unshift({
    ...project,
    endDate: project.endDate ?? null,
    id: crypto.randomUUID(),
  });
}
