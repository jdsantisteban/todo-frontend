import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Todos from "./pages/Todos";
import PrivateRoute from "./components/PrivateRoute";
import { Toaster } from "react-hot-toast";

function Navbar() {
  const linkClasses =
    "rounded-lg px-3 py-2 text-slate-700 font-medium hover:bg-slate-100 hover:text-slate-900";

  const activeClasses = "bg-slate-200 text-slate-900";

  return (
    <nav className="flex sm:justify-center space-x-4 p-4 border-b border-slate-200">
      <NavLink
        to="/register"
        className={({ isActive }) =>
          `${linkClasses} ${isActive ? activeClasses : ""}`
        }
      >
        Register
      </NavLink>
      <NavLink
        to="/login"
        className={({ isActive }) =>
          `${linkClasses} ${isActive ? activeClasses : ""}`
        }
      >
        Login
      </NavLink>
      <NavLink
        to="/todos"
        className={({ isActive }) =>
          `${linkClasses} ${isActive ? activeClasses : ""}`
        }
      >
        Todos
      </NavLink>
    </nav>
  );
}

function App() {
  return (
    <Router>
      {/* Toast provider */}
      <Toaster position="top-right" reverseOrder={false}></Toaster>

      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Route */}
        <Route
          path="/todos"
          element={
            <PrivateRoute>
              <Todos />
            </PrivateRoute>
          }
        />

        {/* Default → redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
