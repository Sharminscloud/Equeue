import RequestTokenPage from "./pages/RequestTokenPage";
import NotificationLogPage from "./pages/NotificationLogPage";
import AppointmentPage from "./pages/AppointmentPage";
import "./App.css";

function App() {
  const path = window.location.pathname; 
  
  if (path === "/appointments") {
    return <AppointmentPage />;
  }
  if (path === "/notifications") {
    return <NotificationLogPage />;
  }

  return <RequestTokenPage />;
}
export default App;