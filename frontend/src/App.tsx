import { Navigate, Route, Routes, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { lazy, Suspense } from "react";
import NotFoundVideo from "./assets/Not found.gif";
import { Info } from "lucide-react";
import { Layout } from "./components/layouts/Layout";

// Public
const Login = lazy(() => import("./pages/auth/Login"));

// Admin
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Clients = lazy(() => import("./pages/admin/AddClients"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const Template = lazy(() => import("./pages/admin/Templates"));
const Sync = lazy(() => import("./pages/admin/Sync"));
const Types = lazy(() => import("./pages/admin/Types"));
const Compliance = lazy(() => import("./pages/admin/Compliance"));

// Client
const ClientDashboard = lazy(() => import("./pages/client/ClientDashboard"));
const ClientMIS = lazy(() => import("./pages/client/MIS"));
const ClientCompliance = lazy(
  () => import("./pages/client/ComplianceCalendar")
);

// Shared
const Profile = lazy(() => import("./pages/auth/Profile"));
const NotFound = lazy(() => import("./components/reusable/NotFound"));
const Loader = lazy(() => import("./components/loaders/Loader"));


// Protected Route
const ProtectedRoute = ({ role }: { role: string }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }
  return <Outlet />;
};

const App = () => {
  const { initializing } = useAuth();

  if (initializing)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );

  return (
    <>
      {/* Small/medium device notice */}
      <div className="lg:hidden flex flex-col items-center justify-center min-h-screen px-4">
        <div className="flex items-center gap-2">
          <Info height={50} className="text-red-700" />
          <h1 className="text-2xl font-extrabold text-red-700">Oops!</h1>
        </div>
        <h2 className="text-2xl font-bold text-center pb-4">
          This site is best viewed on a laptop
        </h2>
        <div className="pt-4">
          <Suspense fallback={<Loader />}>
            <img src={NotFoundVideo} alt="Not found" className="w-80 mx-auto" />
          </Suspense>
        </div>
        <p className="text-gray-600 text-sm text-center dark:text-white">
          Please switch to a <span className="font-bold">desktop</span> or{" "}
          <span className="font-bold">laptop</span> for the full experience.
        </p>
      </div>

      {/* Main routes for large screens */}
      <div className="hidden lg:block">
         <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <Loader />
            </div>
          }
        >
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Admin */}
          <Route element={<ProtectedRoute role="admin" />}>
            <Route element={<Layout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/clients" element={<Clients />} />
              <Route path="/admin/templates" element={<Template />} />
              <Route path="/admin/sync" element={<Sync />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/profile" element={<Profile />} />
              <Route
                path="/admin/compliance-calendar"
                element={<Compliance />}
              />
              <Route path="/admin/compliance-types" element={<Types />} />
            </Route>
          </Route>

          {/* Client */}
          <Route element={<ProtectedRoute role="client" />}>
            <Route element={<Layout />}>
              <Route path="/client/dashboard" element={<ClientDashboard />} />
              <Route path="/client/mis-report" element={<ClientMIS />} />
              <Route path="/client/profile" element={<Profile />} />
              <Route
                path="/client/compliance-calendar"
                element={<ClientCompliance />}
              />
            </Route>
          </Route>

          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </div>
    </>
  );
};

export default App;
