import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import './App.css';
import NewsHomepage from './pages/homepage';
import SportsPage from './pages/sportspage';
import Entertainment from './pages/entertainmentpage';
import ShareMarket from './pages/bsuinesspage';
import ArticleDetailPage from './pages/newsdeatil';
import HealthPage from './pages/healthpage';
import LatestNews from './pages/latestpage'
import ReportCrimeForm from './pages/reportCrimeForm';
import SearchResults from './pages/SearchResults';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<NewsHomepage />} />
          {/* Update this route to accept the article ID parameter */}
          <Route path="article/:id" element={<ArticleDetailPage />} />
          <Route path="sports" element={<SportsPage />} />
          <Route path="entertainment" element={<Entertainment />} />
          <Route path="business" element={<ShareMarket />} />
          <Route path="health" element={<HealthPage />} />
          <Route path="latest" element={<LatestNews/>} />
          <Route path="crimeReportForm" element={<ReportCrimeForm/>}/>
          <Route path="/search" element={<SearchResults />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

