// Components
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/Components/ui/breadcrumb';
import { Skeleton } from '@/Components/ui/skeleton';

export function PluginBreadcrum({ name, bot }: { name: string; bot: string }) {
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
            {bot ? (
              <BreadcrumbLink href={`/bots/edit/${bot}`}>
                {bot ? bot : <Skeleton className="w-24 h-6 rounded-md" />}
              </BreadcrumbLink>
            ) : (
              <Skeleton className="w-24 h-6 rounded-md" />
            )}
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
