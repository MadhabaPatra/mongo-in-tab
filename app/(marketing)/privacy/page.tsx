export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Privacy Policy & Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: August 17, 2025
        </p>
      </section>

      <section className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold">Introduction</h2>
        <p>
          Welcome to <span className="font-semibold">mongointab.app</span>By
          using our website and services, you agree to the following Privacy
          Policy and Terms of Service.
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-xl font-semibold">Privacy Policy</h2>
        <h3 className="font-semibold">Data Collection</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-semibold">
              No Data Stored on Our Servers:
            </span>{" "}
            All operations—including connection details and browsing
            activity—occur entirely in your browser.
          </li>
          <li>
            <span className="font-semibold">Browser Local Storage:</span>{" "}
            Session data is saved only in your browser and deleted upon
            disconnect.
          </li>
        </ul>
        <h3 className="font-semibold">Data Use</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>We never transmit or share your data.</li>
          <li>No analytics or usage info is tied to your database content.</li>
        </ul>
        <h3 className="font-semibold">Cookies</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>No third-party cookies are used.</li>
          <li>Essential cookies are only for local application features.</li>
        </ul>
        <h3 className="font-semibold">Security</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-semibold">
              Everything stays in your browser.
            </span>{" "}
            No data ever leaves your device.
          </li>
          <li>Always use our official website to avoid imposters.</li>
        </ul>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-xl font-semibold">Terms of Service</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Use the app only for lawful purposes—you’re responsible for your
            database URLs.
          </li>
          <li>This application is provided “as is” with no warranty.</li>
          <li>
            We’re not liable for data loss or damages from using this app.
          </li>
        </ul>
        <h3 className="font-semibold">Changes</h3>
        <p>
          Policy updates will appear here. Continued use means you accept any
          changes.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Contact</h2>
        <p>
          Questions? Write an email to us{" "}
          <a
            className="text-primary underline"
            href="mailto:support@mongointab.app"
          >
            support@mongointab.app
          </a>
        </p>
      </section>
    </main>
  );
}
