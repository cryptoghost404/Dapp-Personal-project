import logo from './logo.svg';
import './App.css';
import MainContent from './divisions/MainContent';
import Transaction from './Practical Components/Transfer/Transaction';
import PortfolioMain from './Practical Components/Portfolio/Portfolio';
import TokenBalances from './Practical Components/Portfolio/TokenBalances';
import { TransactionHistory } from './Practical Components/Portfolio/TransactionHistory';
import { Route,Routes } from 'react-router';
import NFTs from './Practical Components/Portfolio/NFTs'
function App() {
  return (
  <Routes>
        <Route path="/" element={<MainContent/>} />
        <Route path="/transfer" element={<Transaction/>} />
        <Route path='/portfolio' element={<PortfolioMain/>} />
        <Route path='/portfolio/tokens' element={<TokenBalances/>} />
        <Route path='/portfolio/activity' element={<TransactionHistory/>} />
        <Route path='/portfolio/nfts' element={<NFTs/>} />

      </Routes>
  );
}

export default App;
