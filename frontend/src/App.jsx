import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Layout from './components/Layout/Layout';
import Counter from './pages/Counter/Counter';
import Users from './pages/Users/Users';
import Liked from './pages/Liked/Liked';
import Browse from './pages/Browse/Browse';

import MovieDetails from './pages/Movie_Info';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/recommendations" element={<Counter />} />
        <Route path="/users" element={<Users />} />
        <Route path="/liked" element={<Liked />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Layout>
  );
}

export default App;
