import { router } from "@/routes/router.tsx";
import { useLocation, useRoutes } from "react-router-dom";
import { Header } from "@/components/header/header.tsx";
import { Footer } from "@/components/footer/footer.tsx";
import { PageBackButton } from "@/components/navigation/page-back-button";
import "./app.css";

function App() {
  const location = useLocation();
  const routes = useRoutes(router);
  const showFallbackBackButton = !pageHasInlineBackButton(location.pathname);

  return (
    <div className="app-root">
      <Header />
      <main className="app-content">
        {routes}
        {showFallbackBackButton ? (
          <div className="app-page-back">
            <PageBackButton />
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

function pageHasInlineBackButton(pathname: string) {
  return (
    pathname === "/dashboard" ||
    pathname === "/auth" ||
    pathname === "/invoice/upload" ||
    pathname === "/invoice/upload/manual" ||
    pathname === "/invoice/upload/confirm" ||
    pathname === "/invoice/upload/complate" ||
    pathname === "/claims/new" ||
    pathname.endsWith("/review")
  );
}

export default App;
