import { getEvents } from "./actions";
import { EventList } from "./event-list";

export default async function EventsPage() {
  const result = await getEvents();
  const events = result.success ? result.data : [];

  return <EventList initialEvents={events} />;
}
