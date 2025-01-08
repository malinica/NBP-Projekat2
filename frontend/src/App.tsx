import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './Components/Home/Home'
import { Toaster } from 'react-hot-toast'
import { UserProvider } from './Context/useAuth'
import LoginPage from './Components/LoginPage/LoginPage'
import RegisterPage from './Components/RegisterPage/RegisterPage'

function App() {

  return (
    <>
      <BrowserRouter>
        <UserProvider>
          <div className = "App">
            {/* <Navbar/> */}
            <div className="content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Routes>
            </div>
            {/* <Footer /> */}
            <Toaster position='top-center' reverseOrder={false} />
          </div>
        </UserProvider>
      </BrowserRouter>
    </>
  )
}

export default App
