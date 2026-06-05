import { Route, Routes } from 'react-router-dom';
import Search from './pages/Search/Search';
import Home from './pages/Home/Home';
import Layout from './components/Layout/Layout';
import Counter from './pages/Counter/Counter';
import Users from './pages/Users/Users';
import Liked from './pages/Liked/Liked';
import MovieDetails from './pages/Movie_Info';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/" element={<Search />} />
        <Route path="/browse" element={<Home />} />
        <Route path="/recommendations" element={<Counter />} />
        <Route path="/users" element={<Users />} />
        <Route path="/liked" element={<Liked />} />
      </Routes>
    </Layout>
  );
}

export default App;
