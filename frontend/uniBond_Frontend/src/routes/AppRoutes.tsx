import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import MainLayout from "@/components/layout/MainLayout";
import Home from "@/pages/home/Home";
import SearchResults from "@/pages/search/SearchResults";
import Groups from "@/pages/groups/Groups";
import GroupDetails from "@/pages/groups/GroupDetails";
import Notices from "@/pages/notices/Notices";
import Notifications from "@/pages/notifications/Notifications";
import Profile from "@/pages/profile/Profile";
import ProfessionalCommunication from "@/pages/professional-communication/ProfessionalCommunication";
import CreateProfessionalSession from "@/pages/professional-communication/CreateProfessionalSession";
import SessionDetails from "@/pages/professional-communication/SessionDetails";
import ClassroomList from "@/pages/classrooms/ClassroomList";
import CreateClassroom from "@/pages/classrooms/CreateClassroom";
import ClassroomDetails from "@/pages/classrooms/ClassroomDetails";
import TaskList from "@/pages/tasks/TaskList";
import CreateTask from "@/pages/tasks/CreateTask";
import TaskDetails from "@/pages/tasks/TaskDetails";
import EditTask from "@/pages/tasks/EditTask";
import CompanyList from "@/pages/companies/CompanyList";
import CompanyDetails from "@/pages/companies/CompanyDetails";
import KuppySessions from "@/pages/kuppy/KuppySessions";
import CreateKuppy from "@/pages/kuppy/CreateKuppy";
import CreatePost from "@/pages/home/CreatePost";
import EditPost from "@/pages/home/EditPost";
import CourseList from "@/pages/courses/CourseList";
import CreateCourse from "@/pages/courses/CreateCourse";
import CourseDetails from "@/pages/courses/CourseDetails";
import CourseContentView from "@/pages/courses/CourseContentView";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import AdminRoute from "@/routes/AdminRoute";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminContent from "@/pages/admin/AdminContent";
import { ROUTES } from "@/utils/constants";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path={ROUTES.LOGIN}
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path={ROUTES.REGISTER}
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path={ROUTES.FORGOT_PASSWORD}
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      {/* Protected Routes with Main Layout */}
      <Route
        path={ROUTES.HOME}
        element={
          <ProtectedRoute>
            <MainLayout>
              <Home />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <MainLayout>
              <SearchResults />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.GROUPS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <Groups />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <GroupDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.NOTICES}
        element={
          <ProtectedRoute>
            <MainLayout>
              <Notices />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.NOTIFICATIONS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <Notifications />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PROFESSIONAL_COMMUNICATION}
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProfessionalCommunication />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CREATE_PROFESSIONAL_SESSION}
        element={
          <ProtectedRoute>
            <MainLayout>
              <CreateProfessionalSession />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/professional-communication/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <SessionDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/professional-communication/edit/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CreateProfessionalSession />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PROFILE}
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PROFILE_USER}
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/classrooms"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ClassroomList />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/classrooms/create"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CreateClassroom />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/classrooms/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ClassroomDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <MainLayout>
              <TaskList />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks/create"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CreateTask />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <TaskDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks/:id/edit"
        element={
          <ProtectedRoute>
            <MainLayout>
              <EditTask />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/companies"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CompanyList />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/companies/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CompanyDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.KUPPY_SESSIONS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <KuppySessions />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/kuppy/create"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CreateKuppy />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CREATE_POST}
        element={
          <ProtectedRoute>
            <MainLayout>
              <CreatePost />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.EDIT_POST}
        element={
          <ProtectedRoute>
            <MainLayout>
              <EditPost />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.COURSES}
        element={
          <ProtectedRoute>
            <MainLayout>
              <CourseList />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CREATE_COURSE}
        element={
          <ProtectedRoute>
            <MainLayout>
              <CreateCourse />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${ROUTES.COURSES}/:id`}
        element={
          <ProtectedRoute>
            <MainLayout>
              <CourseDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${ROUTES.COURSES}/edit/:id`}
        element={
          <ProtectedRoute>
            <MainLayout>
              <CreateCourse />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${ROUTES.COURSES}/:id/watch`}
        element={
          <ProtectedRoute>
            <MainLayout>
              <CourseContentView />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/content"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminContent />
            </AdminLayout>
          </AdminRoute>
        }
      />

      {/* Catch all - redirect unknown routes to home */}
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
}
