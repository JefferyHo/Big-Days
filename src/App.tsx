import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/home/index';
import InfoPage from './pages/info/index';
import Contact from './pages/contact/index';
import './App.css'
import { DBProvider } from './db/DBProvider';
import styled from 'styled-components';

const Footer = () => {
  const location = useLocation();

  // 判断当前路径是否为 "/"
  const isContact = location.pathname === '/contact';

  const navigate = useNavigate();
  return (
    <FooterDiv onClick={() => navigate('/contact')} style={{ cursor: 'pointer', textAlign: 'center' }}>
      { isContact ? null : '免责声明' }
    </FooterDiv>
  );
};

function App() {
  return (
    <DBProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/info/:id?" element={<InfoPage />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </DBProvider>
  )
}

const FooterDiv = styled.div`
  position: fixed;
  bottom: 6px;
  width: 100%;
  text-align: center;
  color: #ccc;
  font-size: .6rem;
`;

export default App
