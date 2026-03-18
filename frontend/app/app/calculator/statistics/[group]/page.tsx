import {
  STATISTICS_GROUPS,
  type StatisticsGroupSlug,
} from "@/lib/statistics/groups";
import { StatisticsGroupPage } from "@/components/statistics/StatisticsGroupPage";

export default async function Page({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group } = await params;
  const groupSlug = group as StatisticsGroupSlug;

  if (!(groupSlug in STATISTICS_GROUPS)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-primary-dark">Invalid statistics group: {group}</p>
      </div>
    );
  }

  return <StatisticsGroupPage groupSlug={groupSlug} />;
}
