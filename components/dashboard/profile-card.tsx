import { Avatar } from "@/components/ui/avatar";
import { Pill } from "@/components/ui/pill";
import { UserProfile } from "@/lib/types";

export function ProfileCard({ profile }: { profile: UserProfile | null }) {
  return (
    <div className="premium-card panel-rise p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar name={profile?.fullName} image={profile?.profileImage} className="h-24 w-24 text-xl" />
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-semibold text-white">{profile?.fullName || "Your profile"}</h2>
            {profile?.role ? <Pill tone="info">{profile.role}</Pill> : null}
          </div>
          <p className="mt-2 text-sm text-slate-400">{profile?.email || "Add your email"}</p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            {profile?.goals || "Tell Buildynex what outcomes matter to you so your problem discovery and startup planning can stay role-aware."}
          </p>
        </div>
      </div>
    </div>
  );
}
