import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import First from './First'
import Header from './Components/Header'
import Contact from './Function/Contact'
import Portfolio from './Function/Portfolio'
import PortfolioDetail from './Function/PortfolioDetails'
import PortfolioPreview from './Function/PortfolioPreview'

function App() {


  return (
   <div>
    <Header/>

    <BrowserRouter>
    <Routes>

      <Route path='/' element={<First />} />
       <Route path='/contact' element={<Contact />} />
       <Route path='/portfolio' element={<Portfolio  title='Gallery'/>}  />

<Route path="/Gallery/:type" element={<PortfolioDetail />} />
< Route isSmall={true} />

    </Routes>
    </BrowserRouter>
   </div>
  )
}

export default App
