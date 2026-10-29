import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import First from './First'
import PublicLayout from './Components/PublicLayout'
import ScrollToHash from './Components/ScrollToHash'
import Contact from './Function/Contact'
import Portfolio from './Function/Portfolio'
import PortfolioDetail from './Function/PortfolioDetails'

// Staff portal code is loaded only when a /staff page is opened
const StaffRoutes = lazy(() => import('./Staff/StaffRoutes'))

function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />

      <Routes>
        {/* Public website: Header + page + Footer */}
        <Route element={<PublicLayout />}>
          <Route path='/' element={<First />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/portfolio' element={<Portfolio title='Gallery' />} />
          <Route path='/Gallery/:type' element={<PortfolioDetail />} />
        </Route>

        {/* Private staff portal (separate layout, no public Header/Footer) */}
        <Route
          path='/staff/*'
          element={
            <Suspense fallback={<div className='p-5 text-center text-muted'>Loading…</div>}>
              <StaffRoutes />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
