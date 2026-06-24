import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BaseLayout } from './components/layouts';
import { Home } from './pages/Home';

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <BaseLayout>
              <Home />
            </BaseLayout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
