import { getGuests } from "./actions";
import { GuestTable } from "./guest-table";

export default async function GuestsPage() {
  const result = await getGuests({ page: 1, perPage: 50, sortField: "name", sortDir: "asc" });

  const initialData =
    result.success
      ? result.data
      : { guests: [], total: 0 };

  return <GuestTable initialData={initialData} />;
}
