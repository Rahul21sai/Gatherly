import { Check, MapPin, UsersRound } from "lucide-react";
import { money } from "@/lib/format";
import type { Vendor } from "@/lib/types";
import type { EditablePlanProps } from "./props";

const VENDOR_STATUSES = [
  "To research",
  "Shortlisted",
  "Booked",
] as const satisfies readonly Vendor["status"][];

function isVendorStatus(value: string): value is Vendor["status"] {
  return VENDOR_STATUSES.some((status) => status === value);
}

export function VendorsPanel({ plan, onUpdate }: EditablePlanProps) {
  return (
    <div className="tab-content">
      <div className="section-title">
        <span className="soft-icon">
          <UsersRound size={23} />
        </span>
        <div>
          <h2>Your people behind the party.</h2>
          <p>
            A checklist for finding the right partners, and asking the right
            questions.
          </p>
        </div>
      </div>
      <div className="vendor-disclaimer">
        <MapPin size={17} />
        <p>
          Research partners in {plan.input.city}. These are vendor requirements
          with budget allowances, not verified businesses or live quotes.
        </p>
      </div>
      <div className="vendor-grid">
        {plan.vendors.map((vendor) => (
          <section className="panel vendor-card" key={vendor.id}>
            <div className="vendor-top">
              <span className="vendor-icon">
                <UsersRound size={21} />
              </span>
              <select
                className={`status-select ${vendor.status.toLowerCase().replaceAll(" ", "-")}`}
                aria-label={`Status for ${vendor.category}`}
                value={vendor.status}
                onChange={(event) => {
                  const status = event.target.value;
                  if (!isVendorStatus(status)) return;
                  onUpdate({
                    ...plan,
                    vendors: plan.vendors.map((item) =>
                      item.id === vendor.id
                        ? {
                            ...item,
                            status,
                          }
                        : item,
                    ),
                  });
                }}
              >
                {VENDOR_STATUSES.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
            <h3>{vendor.category}</h3>
            <p>{vendor.name}</p>
            <div className="vendor-budget">
              <span>Planning allowance</span>
              <strong>{money(vendor.estimate, plan.input.currency)}</strong>
            </div>
            <h4>Good questions to ask</h4>
            <ul>
              {vendor.questions.map((question) => (
                <li key={question}>
                  <Check size={13} />
                  {question}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
