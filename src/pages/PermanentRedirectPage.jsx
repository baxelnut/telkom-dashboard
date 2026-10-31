// Style
import "./PermanentRedirectPage.css";

const NEW_URL = "https://galaksi-rsoregional3.com";

export default function PermanentRedirectPage() {
  return (
    <main className="redirect-page">
      <div className="redirect-content">
        <span className="redirect-eyebrow">
          Pemberitahuan Perpindahan Website
        </span>

        <h1>Website ini telah berpindah.</h1>

        <p>
          Website RSO Regional 3 telah berpindah secara permanen ke alamat URL baru.
          Silakan kunjungi website terbaru kami untuk mendapatkan informasi dan
          layanan terkini.
        </p>

        <a
          href={NEW_URL}
          className="redirect-button"
          target="_self"
          rel="noopener noreferrer"
        >
          Kunjungi Website Baru
          <span aria-hidden="true">↗</span>
        </a>

        <span className="redirect-url">{NEW_URL}</span>
      </div>
    </main>
  );
}
