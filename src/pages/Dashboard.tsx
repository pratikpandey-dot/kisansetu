import { DashboardShell } from "./dashboard/DashboardShell";
import HomePage from "./dashboard/HomePage";
import RegisterPage from "./dashboard/RegisterPage";
import DocumentsPage from "./dashboard/DocumentsPage";
import BookSlotPage from "./dashboard/BookSlotPage";
import QueuePage from "./dashboard/QueuePage";
import PricesPage from "./dashboard/PricesPage";
import HistoryPage from "./dashboard/HistoryPage";
import SupportPage from "./dashboard/SupportPage";
import ProfilePage from "./dashboard/ProfilePage";
import SettingsPage from "./dashboard/SettingsPage";
import AboutPage from "./dashboard/AboutPage";
import { Route, Routes } from "react-router";

export default function Dashboard() {
  return (
    <DashboardShell>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="book" element={<BookSlotPage />} />
        <Route path="queue" element={<QueuePage />} />
        <Route path="prices" element={<PricesPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="about" element={<AboutPage />} />
      </Routes>
    </DashboardShell>
  );
}
