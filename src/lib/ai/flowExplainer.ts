export function explainWorkflow(name: string, stepCount: number): string {
  return `Workflow '${name}' executes ${stepCount} automated follow-up steps with response-based branching.`;
}
