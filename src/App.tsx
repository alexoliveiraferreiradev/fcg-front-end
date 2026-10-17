import { Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { Catalog } from './pages/Catalog'
import { Library } from './pages/Library'
import { MyAccount } from './pages/MyAccount'
import { SignIn } from './pages/SignIn'
import { NextStep, NotFound } from './pages/NextStep'

export function App() {
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <Header />
      {import.meta.env.MODE === 'mock' && (
        <p className="mock-banner" role="note">
          Dados de exemplo (mock), sem Kong. Para usar as APIs de verdade: <code>npm run dev</code>
        </p>
      )}
      <div id="conteudo">
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/entrar" element={<SignIn />} />
          <Route path="/carrinho" element={<NextStep title="Carrinho" />} />
          <Route path="/biblioteca" element={<Library />} />
          <Route path="/pedidos" element={<NextStep title="Meus pedidos" />} />
          <Route path="/conta" element={<MyAccount />} />
          <Route path="/admin/*" element={<NextStep title="Admin" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  )
}
