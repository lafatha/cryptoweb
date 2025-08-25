export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        <form action="/admin/login" method="post">
          <button className="text-sm underline">Logout</button>
        </form>
      </header>
      {children}
    </section>
  );
}
