export const metadata = {
  title: "Shipping Policy | KalindiKart",
};

export default function ShippingPolicy() {
  return (
    <div className="container my-5">
      <div className="card shadow-sm border-0">
        <div className="card-body p-4 p-md-5">

          <h1 className="mb-2">Shipping Policy</h1>
          <p className="text-muted fst-italic">Last updated: Jan 8th, 2026</p>
          <hr />

          <p>
            At <strong>KalindiKart</strong>, we ensure your orders are processed,
            packed, and delivered safely and efficiently.
          </p>

          <h5 className="mt-4">Order Processing</h5>
          <ul className="list-group list-group-flush mb-3">
            <li className="list-group-item">Processed within 2–4 business days</li>
            <li className="list-group-item">No shipping on Sundays or public holidays</li>
            <li className="list-group-item">Delays during high volume will be informed</li>
          </ul>

          <h5>Shipping Locations</h5>
          <p>We currently ship across India.</p>

          <h5>Estimated Delivery Time</h5>
          <ul>
            <li>Metro cities: 4–7 business days</li>
            <li>Other locations: 6–10 business days</li>
          </ul>

          <h5>Packaging & Handling</h5>
          <p>Fragile décor items receive extra protective packaging.</p>

          <h5>Order Tracking</h5>
          <p>Tracking details are shared via email or SMS.</p>

          <div className="alert alert-info mt-4">
            For shipping queries, contact <strong>[email-ID]</strong>
          </div>

        </div>
      </div>
    </div>
  );
}
