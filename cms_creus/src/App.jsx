import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Contacto from './pages/Contacto'
import Propuestas from './pages/Propuestas'
import Propuesta from './pages/Propuesta'
import ShadcnExample from './components/ShadcnExample'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/propuestas" element={<Propuestas />} />
        <Route path="/propuesta/:slug" element={<Propuesta />} />
        <Route path="/shadcn-example" element={<ShadcnExample />} />
      </Routes>
    </Router>
  )
}

export default App
