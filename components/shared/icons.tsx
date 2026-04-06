export function ArrowUpRightIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 14L14 6M8 6H14V12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.805 12.23c0-.77-.069-1.508-.198-2.215H12v4.192h5.487a4.693 4.693 0 0 1-2.035 3.08v2.56h3.293c1.929-1.777 3.06-4.394 3.06-7.617Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.76 0 5.074-.915 6.765-2.473l-3.293-2.56c-.915.614-2.086.977-3.472.977-2.668 0-4.928-1.8-5.736-4.22H2.86v2.64A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.264 13.724A5.995 5.995 0 0 1 5.944 12c0-.598.108-1.18.32-1.724V7.636H2.86A10 10 0 0 0 2 12c0 1.613.386 3.14 1.06 4.364l3.204-2.64Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.056c1.5 0 2.848.516 3.91 1.53l2.93-2.93C17.07 2.989 14.756 2 12 2A10 10 0 0 0 2.86 7.636l3.404 2.64C7.072 7.856 9.332 6.056 12 6.056Z"
      />
    </svg>
  );
}

export function SunIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M10 2.4V4.2M10 15.8V17.6M17.6 10H15.8M4.2 10H2.4M15.23 4.77L13.96 6.04M6.04 13.96L4.77 15.23M15.23 15.23L13.96 13.96M6.04 6.04L4.77 4.77"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MoonIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M12.952 2.9A6.86 6.86 0 0 0 9.6 16.8a6.86 6.86 0 0 0 6.608-4.968A6.4 6.4 0 0 1 12.4 12.6a6.38 6.38 0 0 1-5.9-8.492A6.84 6.84 0 0 0 12.952 2.9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
