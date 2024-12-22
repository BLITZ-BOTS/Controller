// Components
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/Components/ui/breadcrumb';
import { Skeleton } from '@/Components/ui/skeleton';

export function BotBreadcrum({ name }: { name: string }) {
  return (
    <>
      {/* Page Breadcrumbs */}
      <div className="mb-[30px]">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Bots</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {name ? (
              <BreadcrumbItem>
                {name ? name : <Skeleton className="w-24 h-6 rounded-md" />}
              </BreadcrumbItem>
            ) : (
              <Skeleton className="w-24 h-6 rounded-md" />
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </>
  );
}
