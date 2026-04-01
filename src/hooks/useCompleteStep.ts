"use client";

// ─── src/hooks/useCompleteStep.ts ─────────────────────────────────────────────
//
// Call this hook after any successful creation action to auto-tick
// the corresponding onboarding checklist step.
//
// Usage:
//   const completeStep = useCompleteStep();
//   // after creating a department:
//   completeStep("department");
//
// Valid IDs: "department" | "employee" | "project" | "task" | "ai_employee"

import { useCallback } from "react";
import { useOnboarding } from "@/context/OnboardingContext";

export type OnboardingStepId =
  | "department"
  | "employee"
  | "project"
  | "task"
  | "ai_employee";

export function useCompleteStep() {
  const onboarding = useOnboarding();

  return useCallback(
    (stepId: OnboardingStepId) => {
      onboarding?.completeStep(stepId);
    },
    [onboarding]
  );
}

// ════════════════════════════════════════════════════════════════════════════
// WHERE TO CALL completeStep() IN YOUR EXISTING DIALOGS:
// ════════════════════════════════════════════════════════════════════════════
//
// 1. CreateDepartmentDialog.tsx
//    import { useCompleteStep } from "@/hooks/useCompleteStep";
//    const completeStep = useCompleteStep();
//    // inside handleSubmit after successful api.post:
//    completeStep("department");
//
// 2. CreateEmployeeDialog (create-employee-dialog.tsx)
//    completeStep("employee");
//
// 3. CreateProjectDialog.tsx
//    completeStep("project");
//
// 4. CreateTaskDialog.tsx
//    completeStep("task");
//
// 5. Marketplace page (marketplace-page.tsx) — after install
//    completeStep("ai_employee");
//
// OR in AssignTaskDialog.tsx — after first AI task executed:
//    completeStep("ai_employee");
//
// ════════════════════════════════════════════════════════════════════════════
// EXAMPLE — how it looks in CreateDepartmentDialog.tsx:
// ════════════════════════════════════════════════════════════════════════════
//
// import { useCompleteStep } from "@/hooks/useCompleteStep";
//
// export default function CreateDepartmentDialog({ onCreated }: Props) {
//   const completeStep = useCompleteStep();
//   ...
//   async function handleSubmit(e: React.FormEvent) {
//     ...
//     try {
//       await api.post("/api/departments", { name });
//       toast.success("Department created!");
//
//       completeStep("department"); // ← ADD THIS ONE LINE
//
//       setOpen(false);
//       setName("");
//       onCreated();
//     } catch ...
//   }
// }
