'use client';

/**
 * Inner Admin Layout
 * This layout wraps admin pages. The parent layout (app/(admin)/layout.tsx)
 * already provides the sidebar, so this just passes children through.
 */
export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simply render children - the parent layout handles sidebar and main structure
  return <>{children}</>;
}
