import { useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import conferenceData from './data/conferences.json';
import lastUpdatedData from './data/lastUpdated.json';
import AddConference from './pages/AddConference';
import Bookmarks from './pages/Bookmarks';
import Calendar from './pages/Calendar';
import Compare from './pages/Compare';
import ConferenceDetail from './pages/ConferenceDetail';
import Directory from './pages/Directory';
import Home from './pages/Home';
import Notifications from './pages/Notifications';
import SpecialtyHub from './pages/SpecialtyHub';
import './styles/app.css';
import {
  loadComparedConferences,
  defaultNotificationPreferences,
  loadBookmarks,
  loadNotificationPreferences,
  loadReportedIssues,
  saveComparedConferences,
  saveBookmarks,
  saveNotificationPreferences,
  saveReportedIssues,
} from './utils/storageHelpers';

function RouteTitleManager() {
  const location = useLocation();

  useEffect(() => {
    const titleMap = {
      '/': 'SurgCon | Surgical Conference Directory',
      '/conferences': 'SurgCon | Conference Directory',
      '/calendar': 'SurgCon | Calendar',
      '/bookmarks': 'SurgCon | Bookmarks',
      '/compare': 'SurgCon | Compare',
      '/notifications': 'SurgCon | Notifications',
      '/specialties': 'SurgCon | Specialty Hub',
      '/add-conference': 'SurgCon | Add Conference',
    };

    const matchingTitle = Object.entries(titleMap).find(([path]) =>
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );

    document.title = matchingTitle ? matchingTitle[1] : 'SurgCon';
  }, [location.pathname]);

  return null;
}

function toggleListItem(currentItems, item) {
  return currentItems.includes(item)
    ? currentItems.filter((currentItem) => currentItem !== item)
    : [...currentItems, item];
}

function AppContent() {
  const [bookmarkIds, setBookmarkIds] = useState(() => loadBookmarks());
  const [compareIds, setCompareIds] = useState(() => loadComparedConferences());
  const [notificationPreferences, setNotificationPreferences] = useState(() =>
    loadNotificationPreferences()
  );
  const [reportedIssueIds, setReportedIssueIds] = useState(() => loadReportedIssues());

  useEffect(() => {
    saveBookmarks(bookmarkIds);
  }, [bookmarkIds]);

  useEffect(() => {
    saveComparedConferences(compareIds);
  }, [compareIds]);

  useEffect(() => {
    saveNotificationPreferences(notificationPreferences);
  }, [notificationPreferences]);

  useEffect(() => {
    saveReportedIssues(reportedIssueIds);
  }, [reportedIssueIds]);

  const conferences = conferenceData.map((conference) => ({
    ...conference,
    isBookmarked: bookmarkIds.includes(conference.id),
    isCompared: compareIds.includes(conference.id),
    issueReported: reportedIssueIds.includes(conference.id),
  }));

  const bookmarkedConferences = conferences.filter((conference) => conference.isBookmarked);
  const comparedConferences = conferences.filter((conference) => conference.isCompared);

  function handleToggleBookmark(conferenceId) {
    setBookmarkIds((currentIds) => {
      const nextIds = toggleListItem(currentIds, conferenceId);

      if (currentIds.includes(conferenceId)) {
        setNotificationPreferences((currentPreferences) => ({
          ...currentPreferences,
          selectedConferenceIds: currentPreferences.selectedConferenceIds.filter(
            (currentConferenceId) => currentConferenceId !== conferenceId
          ),
        }));
      }

      return nextIds;
    });
  }

  function handleToggleCompare(conferenceId) {
    setCompareIds((currentIds) =>
      currentIds.includes(conferenceId)
        ? currentIds.filter((currentId) => currentId !== conferenceId)
        : [...currentIds, conferenceId].slice(-4)
    );
  }

  function handleClearCompared() {
    setCompareIds([]);
  }

  function updateNotificationPreferences(updater) {
    setNotificationPreferences((currentPreferences) =>
      typeof updater === 'function' ? updater(currentPreferences) : updater
    );
  }

  function handleToggleReminderConference(conferenceId) {
    updateNotificationPreferences((currentPreferences) => ({
      ...currentPreferences,
      selectedConferenceIds: toggleListItem(currentPreferences.selectedConferenceIds, conferenceId),
    }));
  }

  function handleToggleReminderLeadTime(leadTime) {
    updateNotificationPreferences((currentPreferences) => ({
      ...currentPreferences,
      leadTimes: toggleListItem(currentPreferences.leadTimes, leadTime),
    }));
  }

  function handleToggleReminderCategory(category) {
    updateNotificationPreferences((currentPreferences) => ({
      ...currentPreferences,
      selectedCategories: toggleListItem(currentPreferences.selectedCategories, category),
    }));
  }

  function handleResetNotificationPreferences() {
    setNotificationPreferences(defaultNotificationPreferences);
  }

  function handleReportIssue(conferenceId) {
    setReportedIssueIds((currentIds) =>
      currentIds.includes(conferenceId) ? currentIds : [...currentIds, conferenceId]
    );
  }

  function handleUseFilteredResults(filteredConferences) {
    updateNotificationPreferences((currentPreferences) => ({
      ...currentPreferences,
      selectedFilteredResults: filteredConferences.map((conference) => conference.id),
      selectedConferenceIds: [
        ...new Set([
          ...currentPreferences.selectedConferenceIds,
          ...filteredConferences.filter((conference) => conference.isBookmarked).map((conference) => conference.id),
        ]),
      ],
    }));
  }

  function handleUseFilteredSpecialty(specialty) {
    if (specialty === 'All') {
      return;
    }

    updateNotificationPreferences((currentPreferences) => ({
      ...currentPreferences,
      selectedCategories: toggleListItem(currentPreferences.selectedCategories, specialty),
    }));
  }

  return (
    <div className="app-shell">
      <Header bookmarkedCount={bookmarkedConferences.length} comparedCount={comparedConferences.length} />
      <main className="page-shell">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                conferences={conferences}
                bookmarkedConferences={bookmarkedConferences}
                notificationPreferences={notificationPreferences}
                onToggleBookmark={handleToggleBookmark}
                onToggleCompare={handleToggleCompare}
                onReportIssue={handleReportIssue}
              />
            }
          />
          <Route
            path="/conferences"
            element={
              <Directory
                conferences={conferences}
                onToggleBookmark={handleToggleBookmark}
                onToggleCompare={handleToggleCompare}
                notificationPreferences={notificationPreferences}
                onReportIssue={handleReportIssue}
                onUseFilteredResults={handleUseFilteredResults}
                onUseFilteredSpecialty={handleUseFilteredSpecialty}
                comparedCount={comparedConferences.length}
              />
            }
          />
          <Route
            path="/directory"
            element={<Navigate to="/conferences" replace />}
          />
          <Route
            path="/conferences/:conferenceId"
            element={
              <ConferenceDetail
                conferences={conferences}
                notificationPreferences={notificationPreferences}
                onToggleBookmark={handleToggleBookmark}
                onToggleCompare={handleToggleCompare}
                onToggleReminderConference={handleToggleReminderConference}
                onToggleReminderLeadTime={handleToggleReminderLeadTime}
                onReportIssue={handleReportIssue}
              />
            }
          />
          <Route
            path="/calendar"
            element={
              <Calendar conferences={conferences} bookmarkedConferences={bookmarkedConferences} />
            }
          />
          <Route
            path="/bookmarks"
            element={<Bookmarks bookmarkedConferences={bookmarkedConferences} />}
          />
          <Route
            path="/compare"
            element={
              <Compare
                comparedConferences={comparedConferences}
                onToggleCompare={handleToggleCompare}
                onClearCompared={handleClearCompared}
              />
            }
          />
          <Route
            path="/specialties/:specialtySlug"
            element={
              <SpecialtyHub
                conferences={conferences}
                notificationPreferences={notificationPreferences}
                onToggleBookmark={handleToggleBookmark}
                onToggleCompare={handleToggleCompare}
                onReportIssue={handleReportIssue}
              />
            }
          />
          <Route
            path="/notifications"
            element={
              <Notifications
                conferences={conferences}
                bookmarkedConferences={bookmarkedConferences}
                notificationPreferences={notificationPreferences}
                onUpdateNotificationPreferences={updateNotificationPreferences}
                onToggleReminderConference={handleToggleReminderConference}
                onToggleReminderCategory={handleToggleReminderCategory}
                onToggleReminderLeadTime={handleToggleReminderLeadTime}
                onResetNotificationPreferences={handleResetNotificationPreferences}
              />
            }
          />
          <Route path="/add-conference" element={<AddConference />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer lastUpdated={lastUpdatedData.lastUpdated} />
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <RouteTitleManager />
      <AppContent />
    </HashRouter>
  );
}

export default App;
