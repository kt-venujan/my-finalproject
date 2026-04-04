import { FiBarChart2 } from "react-icons/fi";

export default function AnalyticsPage() {
  return (
    <section className="adm-section">
      <div className="adm-page-head">
        <h1 className="adm-title">
          <FiBarChart2 className="adm-title-icon" />
          Analytics
        </h1>
        <p>Track platform trends and performance from this section.</p>
      </div>
      <div className="adm-note-card">
        <FiBarChart2 className="adm-note-icon" />
        <div>
          <h4>Analytics Panel</h4>
          <p>
            Core analytics widgets can be added here once metric APIs are finalized.
          </p>
        </div>
      </div>
    </section>
  );
}