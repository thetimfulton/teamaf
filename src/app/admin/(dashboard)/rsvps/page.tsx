import { getRsvpOverview, getEventBreakdown } from "./actions";
import { RsvpDashboard } from "./rsvp-dashboard";

export default async function RsvpsPage() {
  const [overviewResult, breakdownResult] = await Promise.all([
    getRsvpOverview(),
    getEventBreakdown(),
  ]);

  return (
    <RsvpDashboard
      initialOverview={overviewResult.success ? overviewResult.data : null}
      initialBreakdown={breakdownResult.success ? breakdownResult.data : []}
    />
  );
}
