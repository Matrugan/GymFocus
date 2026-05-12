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
          ml-[280px]
          min-h-screen
          p-10
        "
      >

        {children}

      </main>

    </div>

  );
}

export default Layout;