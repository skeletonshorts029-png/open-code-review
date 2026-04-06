import { ProtectedRoute } from "@/components/auth/protected-route";
import { OnboardingMultiStepForm } from "@/components/onboarding/onboarding-multi-step-form";

export default function OnboardingPage() {
  return (
    <ProtectedRoute requireOnboarding={false}>
      <div className="section-shell flex min-h-screen items-center justify-center py-12">
        <OnboardingMultiStepForm />
      </div>
    </ProtectedRoute>
  );
}
