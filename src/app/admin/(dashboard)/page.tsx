import { getRsvpOverview, getEventBreakdown } from "./rsvps/actions";
import { getActivityLog } from "./activity/actions";
import { DashboardOverview } from "./dashboard-overview";

export default async function AdminDashboardPage() {
  const [overviewResult, breakdownResult, activityResult] = await Promise.all([
    getRsvpOverview(),
    getEventBreakdown(),
    getActivityLog(1, 10),
  ]);

  return (
    <DashboardOverview
      overview={overviewResult.success ? overviewResult.data : null}
      breakdown={breakdownResult.success ? breakdownResult.data : []}
      recentActivity={
        activityResult.success ? activityResult.data.entries : []
      }
    />
  );
}
