import { formatINR } from "@/utils/money";

export function SmartBudgetBar({ spent, budget }) {
  // Calculate how much budget is remaining
  const remaining = Math.max(budget - spent, 0);

  // Remaining budget percentage
  const percentage =
    budget > 0
      ? Math.min(Math.max((remaining / budget) * 100, 0), 100)
      : 0;

  // Emoji based on remaining budget
  let emoji = "😢";

  if (percentage >= 80) {
    emoji = "😊";
  } else if (percentage >= 50) {
    emoji = "😁";
  } else if (percentage >= 20) {
    emoji = "😐";
  }

  return (
    <div className="space-y-4">

      {/* Percentage remaining */}
      <div>
        <p className="text-sm text-slate-400">
          Budget remaining
        </p>

        <p className="mt-1 text-2xl font-semibold text-cyan-400">
          {percentage.toFixed(0)}%
        </p>
      </div>

      {/* Budget bar */}
      <div className="relative pt-10">

        {/* Emoji */}
        <div
          className="absolute top-0 -translate-x-1/2 text-3xl transition-all duration-500"
          style={{ left: `${percentage}%` }}
        >
          {emoji}
        </div>

        {/* Background bar */}
        <div className="h-4 w-full overflow-hidden rounded-full bg-slate-700">

          {/* Remaining budget */}
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />

        </div>

        {/* Percentage labels */}
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>

      </div>

      {/* Spending information */}
      <div className="flex justify-between text-sm">

        <span className="text-slate-400">
          Spent {formatINR(spent)} of {formatINR(budget)}
        </span>

        <span className="text-slate-400">
          {percentage >= 80
            ? "Great! You have plenty of budget left >🤑"
            : percentage >= 50
              ? "You're doing well!😁"
              : percentage >= 20
                ? "Watch your spending😢"
                : "Budget is almost finished 😭"}
        </span>

      </div>

    </div>
  );
}