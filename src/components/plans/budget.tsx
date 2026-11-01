import { ShieldCheck, Wallet } from "lucide-react";
import { money } from "@/lib/format";
import { BudgetDonut } from "./shared";
import type { EditablePlanProps } from "./props";

export function BudgetPanel({ plan, onUpdate }: EditablePlanProps) {
  const spent = plan.budget.reduce(
    (totalSpent, budgetItem) => totalSpent + budgetItem.spent,
    0,
  );
  const remaining = plan.input.budget - spent;
  return (
    <div className="tab-content">
      <div className="section-title">
        <span className="soft-icon">
          <Wallet size={23} />
        </span>
        <div>
          <h2>
            Every{" "}
            {plan.input.currency === "INR"
              ? "rupee"
              : plan.input.currency === "USD"
                ? "dollar"
                : "euro"}
            , accounted for.
          </h2>
          <p>Thoughtful estimates. Real spending. No last-minute surprises.</p>
        </div>
      </div>
      <div className="budget-totals">
        <div>
          <span>Total planned</span>
          <strong>{money(plan.input.budget, plan.input.currency)}</strong>
        </div>
        <div>
          <span>Actually spent</span>
          <strong>{money(spent, plan.input.currency)}</strong>
        </div>
        <div className={remaining < 0 ? "negative" : ""}>
          <span>{remaining < 0 ? "Over budget" : "Still available"}</span>
          <strong>{money(Math.abs(remaining), plan.input.currency)}</strong>
        </div>
      </div>
      <section className="panel budget-table">
        <div className="budget-table-head">
          <span>Category</span>
          <span>Planned</span>
          <span>Actual spend</span>
          <span>Remaining</span>
        </div>
        {plan.budget.map((item) => (
          <div className="budget-table-row" key={item.id}>
            <span className="budget-category">
              <i style={{ background: item.color }} />
              {item.category}
            </span>
            <strong>{money(item.allocated, plan.input.currency)}</strong>
            <label className="spend-input">
              <span>
                {plan.input.currency === "INR"
                  ? "₹"
                  : plan.input.currency === "USD"
                    ? "$"
                    : "€"}
              </span>
              <input
                aria-label={`Actual spend for ${item.category}`}
                type="number"
                min="0"
                max="1000000000"
                step="1"
                value={item.spent}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (Number.isFinite(value) && value >= 0 && value <= 1e9)
                    onUpdate({
                      ...plan,
                      budget: plan.budget.map((budgetItem) =>
                        budgetItem.id === item.id
                          ? { ...budgetItem, spent: Math.round(value) }
                          : budgetItem,
                      ),
                    });
                }}
              />
            </label>
            <span className={item.allocated < item.spent ? "negative" : ""}>
              {money(item.allocated - item.spent, plan.input.currency)}
            </span>
          </div>
        ))}
        <div className="panel-note">
          <ShieldCheck size={17} />
          <span>
            These are planning estimates, not vendor quotes. Confirm taxes,
            deposits and cancellation terms.
          </span>
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>The shape of your celebration</h2>
            <p>
              Allocations reflect your priorities, with a contingency reserve.
            </p>
          </div>
        </div>
        <BudgetDonut plan={plan} />
      </section>
    </div>
  );
}
