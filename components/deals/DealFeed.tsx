import { DealCard } from "./DealCard";
import type { DealCardProps } from "./DealCard";

interface DealFeedProps {
  deals: DealCardProps[];
  emptyMessage?: string;
}

export function DealFeed({
  deals,
  emptyMessage = "No deals found. Check back soon!",
}: DealFeedProps) {
  if (!deals.length) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-brand-gray-400 uppercase tracking-widest">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {deals.map((deal) => (
        <DealCard key={deal._id} {...deal} />
      ))}
    </div>
  );
}
