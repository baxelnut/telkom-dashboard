import Icon from "../components/ui/icons/Icon";
import { SVG_PATHS } from "../data/utilsData";
import "./MaintenancePage.css";

const ADMIN_CONTACT = import.meta.env.VITE_ADMIN_CONTACT || "";

export default function MaintenancePage() {
  return (
    <main className="maintenance">
      <section className="maintenance__card">
        <div className="maintenance__icon" aria-hidden="true">
          <Icon path={SVG_PATHS.hourglass} size={36} />
        </div>

        <h1 className="maintenance__title">Kami akan segera kembali</h1>
        <p className="maintenance__text">
          Situs web saat ini belum dapat diakses karena sedang dalam
          pemeliharaan. Mohon tunggu sejenak dan coba lagi, atau hubungi admin
          jika Anda memerlukan bantuan mendesak.
        </p>

        <div className="maintenance__actions">
          <button
            type="button"
            className="maintenance__btn maintenance__btn--primary"
            onClick={() => window.location.reload()}
          >
            Coba Lagi
          </button>
          {ADMIN_CONTACT && (
            <a
              className="maintenance__btn maintenance__btn--ghost"
              href={
                ADMIN_CONTACT.includes("@")
                  ? `mailto:${ADMIN_CONTACT}`
                  : ADMIN_CONTACT
              }
            >
              Hubungi Admin
            </a>
          )}
        </div>
      </section>
    </main>
  );
}
