import { useEffect, useState } from "react";
import { fetchNotifications } from "../api/notificationApi";

const NotificationLogPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const result = await fetchNotifications(page, limit);

        setNotifications(result.data || []);
        setTotalPages(result.totalPages || 1);
        setError("");
      } catch (err) {
        setError("Failed to load notifications");
        setNotifications([]);
        setTotalPages(1);
      }
    };

    loadNotifications();
  }, [page, limit]);

  return (
    <div className="page-wrapper">
      <div className="token-card">
        <h1>Notification Logs</h1>

        <div style={{ marginBottom: "20px" }}>
          <a href="/" style={{ marginRight: "16px" }}>
            Token Page
          </a>
          <a href="/appointments">Appointment Page</a>
        </div>

        {error && <p className="message error">{error}</p>}

        {!error && notifications.length === 0 && <p>No notifications yet.</p>}

        {!error &&
          notifications.map((item) => (
            <div
              key={item._id}
              className="result-box"
              style={{ marginBottom: "16px" }}
            >
              <p><strong>Type:</strong> {item.type || "N/A"}</p>
              <p><strong>Channel:</strong> {item.channel || "N/A"}</p>
              <p>
                <strong>Recipient:</strong>{" "}
                {item.recipientEmail || item.recipientPhone || "N/A"}
              </p>
              <p><strong>Status:</strong> {item.status || "N/A"}</p>
              <p><strong>Message:</strong> {item.message || "N/A"}</p>
              <p>
                <strong>Sent At:</strong>{" "}
                {item.sentAt
                  ? new Date(item.sentAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          ))}

        {!error && totalPages > 1 && (
          <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setPage((prev) => prev - 1)}
              disabled={page === 1}
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationLogPage;