export const metadata = {
  title: "Privacy Policy | KalindiKart",
};

export default function PrivacyPolicy() {
  return (
    <div className="container my-5">
      <div className="card shadow-sm border-0">
        <div className="card-body p-4 p-md-5">

          <h1>Privacy Policy</h1>
          <p className="text-muted fst-italic">Last updated: Jan 8th, 2026</p>
          <hr />

          <p>
            KalindiKart respects your privacy and is committed to protecting your data.
          </p>

          <h5 className="mt-4">Information We Collect</h5>
          <ul className="list-group list-group-flush mb-3">
            <li className="list-group-item">Name, email, phone, address</li>
            <li className="list-group-item">Payment details (secure gateways)</li>
            <li className="list-group-item">IP address, cookies, device data</li>
          </ul>

          <h5>How We Use Your Data</h5>
          <ul>
            <li>Order processing</li>
            <li>Customer support</li>
            <li>Website improvement</li>
            <li>Marketing (opt-in only)</li>
          </ul>

          <h5>Data Security</h5>
          <p>We use industry-standard security practices.</p>

          <div className="alert alert-success mt-4">
            Privacy concerns? Email <strong>[email-ID]</strong>
          </div>

        </div>
      </div>
    </div>
  );
}
