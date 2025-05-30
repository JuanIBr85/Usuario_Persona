import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const AdminBreadcrumb = ({ items = [] }) => (
  <Breadcrumb className="mb-4">
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/adminpanel">Panel de Administración</BreadcrumbLink>
      </BreadcrumbItem>
      {items.length > 0 && <BreadcrumbSeparator />}
      {items.map((item, index) => (
        <BreadcrumbItem key={index}>
          {item.href ? (
            <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{item.label}</BreadcrumbPage>
          )}
          {index < items.length - 1 && <BreadcrumbSeparator />}
        </BreadcrumbItem>
      ))}
    </BreadcrumbList>
  </Breadcrumb>
);
