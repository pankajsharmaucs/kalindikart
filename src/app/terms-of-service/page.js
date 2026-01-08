export const metadata = {
  title: "Terms of Service | KalindiKart",
};

export default function TermsOfService() {
  return (
    <div className="container my-5">
      <div className="card shadow-sm border-0">
        <div className="card-body p-4 p-md-5">

          <h1>Terms of Service</h1>
          <p className="text-muted fst-italic">Last updated: Jan 8th, 2026</p>
          <hr />

          <p>
            By accessing or using KalindiKart, you agree to the following terms.
          </p>

          <h5 className="mt-4">Eligibility</h5>
          <p>You must be at least 18 years old to place an order.</p>

          <h5>Product Information</h5>
          <p>
            Minor variations may occur due to handcrafted nature or screen differences.
          </p>

          <h5>Pricing & Payments</h5>
          <p>All prices are listed in INR and processed via secure gateways.</p>

          <h5>Intellectual Property</h5>
          <p>All website content belongs to KalindiKart.</p>

          <h5>Governing Law</h5>
          <p>These terms are governed by the laws of India.</p>

          <div className="alert alert-secondary mt-4">
            For questions, contact <strong>[email-ID]</strong>
          </div>

        </div>
      </div>
    </div>
  );
}
