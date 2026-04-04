import { FiBell } from "react-icons/fi";

export default function NotificationsPage() {
  return (
    <section className="adm-section">
      <div className="adm-page-head">
        <h1 className="adm-title">
          <FiBell className="adm-title-icon" />
          Notifications
        </h1>
        <p>Review and manage important platform alerts.</p>
      </div>
      <div className="adm-note-card">
        <FiBell className="adm-note-icon" />
        <div>
          <h4>Notification Center</h4>
          <p>
            Notification channels and templates can be configured and monitored here.
          </p>
        </div>
      </div>
    </section>
  );
}