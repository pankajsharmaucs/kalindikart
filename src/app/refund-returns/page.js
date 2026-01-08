export const metadata = {
  title: "Refund & Returns Policy | KalindiKart",
};

export default function RefundReturnsPolicy() {
  return (
    <div className="container my-5">
      <div className="card shadow-sm border-0">
        <div className="card-body p-4 p-md-5">

          <h1>Refund & Returns Policy</h1>
          <p className="text-muted fst-italic">Last updated: Jan 8th, 2026</p>
          <hr />

          <p>
            If you receive a damaged, defective, or incorrect product,
            we are here to help.
          </p>

          <h5 className="mt-4">Eligible for Return</h5>
          <ul className="list-group list-group-flush mb-3">
            <li className="list-group-item">Damaged during transit</li>
            <li className="list-group-item">Defective product</li>
            <li className="list-group-item">Wrong item delivered</li>
            <li className="list-group-item">Request within 48 hours</li>
          </ul>

          <h5>Non-Returnable Items</h5>
          <ul>
            <li>Misuse or mishandling</li>
            <li>Normal wear & tear</li>
            <li>Handcrafted variations</li>
            <li>Final sale items</li>
          </ul>

          <h5>Refund Process</h5>
          <p>
            Refunds are processed within 7–10 business days after inspection.
          </p>

          <div className="alert alert-warning mt-4">
            Email return requests to <strong>[email-ID]</strong>
          </div>

        </div>
      </div>
    </div>
  );
}
