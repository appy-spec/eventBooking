import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Shell } from "./components/Layout";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import EventDetails from "./pages/EventDetails";
import { Booking } from "./pages/Booking";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <Routes location={location}>
          <Route
            path="/"
            element={
              <Shell>
                <Home />
              </Shell>
            }
          />
          <Route
            path="/explore"
            element={
              <Shell>
                <Explore />
              </Shell>
            }
          />
          <Route
            path="/event/:id"
            element={
              <Shell>
                <EventDetails />
              </Shell>
            }
          />
          <Route path="/book/:id" element={<Booking />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/signup" element={<Auth mode="signup" />} />
          <Route
            path="/account"
            element={
              <Shell>
                <Account />
              </Shell>
            }
          />
          <Route path="/admin" element={<Admin />} />
          <Route
            path="*"
            element={
              <Shell>
                <div className="px-5 py-32 text-center">
                  <h1 className="font-display text-4xl font-bold">
                    Page not found
                  </h1>
                  <a href="/" className="mt-5 inline-block underline">
                    Back home
                  </a>
                </div>
              </Shell>
            }
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
