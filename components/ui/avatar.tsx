import { cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  image,
  className,
}: {
  name?: string;
  image?: string;
  className?: string;
}) {
  if (image) {
    return (
      <img
        src={image}
        alt={name || "Profile"}
        className={cn("h-12 w-12 rounded-2xl border border-white/10 object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white",
        className
      )}
    >
      {initials(name)}
    </div>
  );
}
