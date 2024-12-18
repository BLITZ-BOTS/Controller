import { NotificationProvider, useNotification } from "./Backend/Hooks/NotificationContext";
import "./App.css";

const AppContent = () => {
  const { addNotification } = useNotification();

  const handleSuccess = () => {
    addNotification("This is a success message!", "success");
  };

  const handleError = () => {
    addNotification("This is an error message!", "error");
  };

  const handleLoading = () => {
    addNotification("Loading in progress...", "loading");
  };

  return (
    <div className="p-4">
      <h1>Home Page</h1>
      <button onClick={handleSuccess} className="btn btn-success">
        Show Success Notification
      </button>
      <button onClick={handleError} className="btn btn-danger">
        Show Error Notification
      </button>
      <button onClick={handleLoading} className="btn btn-warning">
        Show Loading Notification
      </button>
    </div>
  );
};

function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}

export default App;
