import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppRouter from "./routes/AppRouter.jsx";
import Preview from "./pages/Preview/Preview.jsx";
import { useAuth } from "./data/auth.js";
import { loadPreview, usePreview } from "./data/preview.js";

function App() {
  const { status } = useAuth();
  const preview = usePreview();
  const { pathname } = useLocation();

  useEffect(() => {
    if (status !== 'loading') loadPreview();
  }, [status]);

  if (pathname !== '/auth') {
    if (!preview) return null;
    if (preview.closed && !preview.allowed) return <Preview />;
  }

  return (
        <AppRouter />
  );
}

export default App;
