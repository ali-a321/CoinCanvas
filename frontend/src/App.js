import './App.css';
import {Route, Routes} from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashbaord from './pages/Dashboard';

function App() {
  return (
    <div className="App">
      <Routes>

        <Route exact path= '/' element ={<LandingPage />} />
    
        <Route path= '/dashboard' element ={<Dashbaord />} />
      
      </Routes>    
    
    </div>
  );
}

export default App;
