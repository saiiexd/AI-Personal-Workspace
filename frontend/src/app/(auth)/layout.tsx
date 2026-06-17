export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-8 bg-background">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
      <div className="hidden lg:flex flex-col justify-center items-center bg-zinc-950 p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-zinc-950 opacity-50"></div>
        <div className="z-10 max-w-md space-y-6">
          <h2 className="text-4xl font-bold">Unify Your Mind</h2>
          <p className="text-zinc-400 text-lg">
            AI Personal Workspace brings your notes, tasks, and documents together with powerful AI intelligence.
          </p>
        </div>
      </div>
    </div>
  );
}
