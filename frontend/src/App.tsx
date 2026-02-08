import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import Dashboard from "./pages/Dashboard"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>

          <Route index element={<Dashboard />} />
          <Route path="projects" element={<div className="p-4">Projects Page (Coming Soon)</div>} />
          <Route path="wallets" element={<div className="p-4">Wallets Page (Coming Soon)</div>} />
        
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
