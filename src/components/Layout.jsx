import Sidebar from "./Sidebar";

function Layout({ children }) {

  return (

    <div
      className="
        min-h-screen
        bg-[var(--app-bg)]
        text-[var(--app-text)]
      "
    >

      <Sidebar />

      {/* MAIN CONTENT */}
      <main
        className="
          min-h-screen
          p-4
          sm:p-6
          lg:p-10
          lg:ml-[280px]
        "
      >

        {children}

      </main>

    </div>

  );
}

export default Layout;