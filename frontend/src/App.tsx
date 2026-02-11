import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import Dashboard from "./pages/Dashboard"
import Projects from "./pages/Projects"
import ProjectCreate from "./pages/ProjectCreate";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectItemCreate from "./pages/ProjectItemCreate";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>

          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/new" element={<ProjectCreate />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="projects/:id/add-item" element={<ProjectItemCreate />} />

          
          <Route path="wallets" element={<div className="p-4">Wallets Page (Coming Soon)</div>} />
        
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
