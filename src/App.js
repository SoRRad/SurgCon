import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import conferences from './data/conferences.json';
import CalendarPage from './pages/CalendarPage';
import ConferenceDetailPage from './pages/ConferenceDetailPage';
import ConferenceDirectoryPage from './pages/ConferenceDirectoryPage';
import HomePage from './pages/HomePage';
import SubmitConferencePage from './pages/SubmitConferencePage';
import './styles/app.css';

function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <Header />
        <main className="page-shell">
          <Routes>
            <Route path="/" element={<HomePage conferences={conferences} />} />
            <Route
              path="/conferences"
              element={<ConferenceDirectoryPage conferences={conferences} />}
            />
            <Route
              path="/conferences/:conferenceId"
              element={<ConferenceDetailPage conferences={conferences} />}
            />
            <Route path="/calendar" element={<CalendarPage conferences={conferences} />} />
            <Route path="/submit" element={<SubmitConferencePage conferences={conferences} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}

export default App;
