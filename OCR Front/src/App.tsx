import { Routes, Route } from "react-router-dom";
import HomePage from "./assets/pages/HomePage";
import OpportunitiesPage from "./assets/pages/OpportunitiesPage"
import "./App.css";

function App() {
  return (
    <div className="min-h-screen w-full max-w-full bg-slate-950 overflow-x-hidden">
      <main className="min-h-screen w-full max-w-full overflow-x-hidden">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/candidates/:candidateId/opportunities"
            element={<OpportunitiesPage />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
