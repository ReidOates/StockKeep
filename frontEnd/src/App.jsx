import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import PrivateRoute from "./components/PrivateRoute";
import MainLayout from "./components/MainLayout";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: "#1E293B",
            color: "#F8FAFC",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            fontSize: "0.9rem"
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/categories" element={<Categories />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;