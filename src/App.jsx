
import Content from './components/Content'
import Footer from './components/Footer'
import Header from './components/Header'
import Login from './components/Login'
import "./App.css"
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import NewAccount from './components/NewAccount'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />

                <Route path="/home" element={
                    <div id="Container">
                        <Header />
                        <Content />
                        <Footer />
                    </div>
                } />
                <Route path = "/NewAccount"  element={<NewAccount/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App
