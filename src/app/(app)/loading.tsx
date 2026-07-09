import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b px-6 py-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <div className="grid gap-4 p-6 lg:grid-cols-2">
        <Skeleton className="h-40 rounded-[1.5rem] lg:col-span-2" />
        <Skeleton className="h-64 rounded-[1.5rem]" />
        <Skeleton className="h-64 rounded-[1.5rem]" />
      </div>
    </div>
  );
}
