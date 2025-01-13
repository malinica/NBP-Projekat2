import {BrowserRouter, Route, Routes} from 'react-router-dom'
import './App.css'
import Home from './Components/Home/Home'
import {Toaster} from 'react-hot-toast'
import {UserProvider} from './Context/useAuth'
import LoginPage from './Components/LoginPage/LoginPage'
import RegisterPage from './Components/RegisterPage/RegisterPage'
import {Navbar} from "./Components/Navbar/Navbar.tsx";
import {Footer} from "./Components/Footer/Footer.tsx";
import {CreateProjectPage} from "./Components/CreateProjectPage/CreateProjectPage.tsx";
import {ProjectPage} from "./Components/ProjectPage/ProjectPage.tsx";
import SearchProjectsPage from "./Components/SearchProjectsPage/SearchProjectsPage.tsx";
import SearchUserPage from './Components/SearchUserPage/SearchUserPage.tsx'
import MyProjectsPage from './Components/MyProjectsPage/MyProjectsPage.tsx'

function App() {

    return (
        <>
            <BrowserRouter>
                <UserProvider>
                    <div className="App">
                        <Navbar/>
                        <div className="content">
                            <Routes>
                                <Route path="/" element={<Home/>}/>
                                <Route path="/login" element={<LoginPage/>}/>
                                <Route path="/register" element={<RegisterPage/>}/>
                                <Route path="/create-project" element={<CreateProjectPage/>}/>
                                <Route path="/projects/:projectId" element={<ProjectPage/>}/>
                                <Route path="/search-projects-page" element ={<SearchProjectsPage/>}/>
                                <Route path="/my-projects-page" element ={<MyProjectsPage/>}/>
                                <Route path="/search-user-page" element ={<SearchUserPage/>}/>
                            </Routes>
                        </div>
                        <Footer/>
                        <Toaster position='top-center' reverseOrder={false}/>
                    </div>
                </UserProvider>
            </BrowserRouter>
        </>
    )
}

export default App