import { getActivityLog } from "./actions";
import { ActivityFeed } from "./activity-feed";

export default async function ActivityPage() {
  const result = await getActivityLog(1, 50);
  const initialData = result.success
    ? result.data
    : { entries: [], total: 0 };

  return <ActivityFeed initialData={initialData} />;
}
