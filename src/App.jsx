import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import First from './First'
import Header from './Components/Header'
import Contact from './Function/Contact'
import Portfolio from './Function/Portfolio'
import PortfolioDetail from './Function/PortfolioDetails'

function App() {


  return (
   <div>
    <Header/>

    <BrowserRouter>
    <Routes>

      <Route path='/' element={<First />} />
       <Route path='/contact' element={<Contact />} />
       <Route path='/portfolio' element={<Portfolio  title='Gallery'/>}  />

<Route path="/Gallery/:id" element={<PortfolioDetail />} />
    </Routes>
    </BrowserRouter>
   </div>
  )
}

export default App
