import { getDietaryReport } from "./actions";
import { DietaryReport } from "./dietary-report";

export default async function DietaryPage() {
  const result = await getDietaryReport();
  const categories = result.success ? result.data : [];

  return <DietaryReport initialCategories={categories} />;
}
