import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Pages — kreiraćemo ih nakon
import LandingPage     from './pages/LandingPage';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import DashboardPage   from './pages/DashboardPage';
import PropertiesPage  from './pages/PropertiesPage';
import PropertyDetailPage   from './pages/PropertyDetailPage';
import CreatePropertyPage   from './pages/CreatePropertyPage';
import RepairsPage          from './pages/RepairsPage';
import RepairDetailPage     from './pages/RepairDetailPage';
import CreateRepairPage     from './pages/CreateRepairPage';
import WorkersPage          from './pages/WorkersPage';
import WorkerProfilePage    from './pages/WorkerProfilePage';
import ProfilePage          from './pages/ProfilePage';
import AdminPage            from './pages/AdminPage';
import NotFoundPage         from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected — svi ulogovani */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }/>

        <Route path="/workers" element={
          <ProtectedRoute>
            <WorkersPage />
          </ProtectedRoute>
        }/>

        <Route path="/workers/:id" element={
          <ProtectedRoute>
            <WorkerProfilePage />
          </ProtectedRoute>
        }/>

        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }/>

        {/* Owner only */}
        <Route path="/properties" element={
          <ProtectedRoute roles={['PropertyOwner']}>
            <PropertiesPage />
          </ProtectedRoute>
        }/>

        <Route path="/properties/:id" element={
          <ProtectedRoute roles={['PropertyOwner']}>
            <PropertyDetailPage />
          </ProtectedRoute>
        }/>

        <Route path="/properties/create" element={
          <ProtectedRoute roles={['PropertyOwner']}>
            <CreatePropertyPage />
          </ProtectedRoute>
        }/>

        {/* Owner + Worker */}
        <Route path="/repairs" element={
          <ProtectedRoute roles={['PropertyOwner', 'Worker']}>
            <RepairsPage />
          </ProtectedRoute>
        }/>

        <Route path="/repairs/:id" element={
          <ProtectedRoute roles={['PropertyOwner', 'Worker']}>
            <RepairDetailPage />
          </ProtectedRoute>
        }/>

        <Route path="/repairs/create" element={
          <ProtectedRoute roles={['PropertyOwner']}>
            <CreateRepairPage />
          </ProtectedRoute>
        }/>

        {/* Admin only */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['Admin']}>
            <AdminPage />
          </ProtectedRoute>
        }/>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;