import Link from "next/link";

import {
  STATISTICS_GROUPS,
  type StatisticsGroupSlug,
} from "@/lib/statistics/groups";
import { Button } from "@/components/ui/button";
import { StatisticsGroupTools } from "@/components/statistics/StatisticsGroupTools";

export function StatisticsGroupPage({
  groupSlug,
}: {
  groupSlug: StatisticsGroupSlug;
}) {
  const group = STATISTICS_GROUPS[groupSlug];

  return (
    <div className="min-h-screen bg-scan-background px-4 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-primary-dark">{group.title}</h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-700">
              {group.description}
            </p>
          </div>
          <Button asChild className="bg-button-main hover:bg-button-main/80">
            <Link href="/app/calculator">Back to Calculator</Link>
          </Button>
        </div>
        <StatisticsGroupTools groupSlug={groupSlug} tools={group.tools} />
      </div>
    </div>
  );
}
