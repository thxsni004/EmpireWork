import { BrowserRouter, Route, Routes } from 'react-router-dom'
import First from './First'
import Header from './Components/Header'
import Footer from './Components/Footer'
import ScrollToHash from './Components/ScrollToHash'
import Contact from './Function/Contact'
import Portfolio from './Function/Portfolio'
import PortfolioDetail from './Function/PortfolioDetails'

function App() {
  return (
    // Header and Footer are inside BrowserRouter so their links can use the router
    <BrowserRouter>
      <ScrollToHash />
      <Header />

      <main>
        <Routes>
          <Route path='/' element={<First />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/portfolio' element={<Portfolio title='Gallery' />} />
          <Route path='/Gallery/:type' element={<PortfolioDetail />} />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  )
}

export default App
