import { Fade } from "react-awesome-reveal";

export const AdminLayout = ({ title, description, children, className = "" }) => (
  <div className="w-full max-w-full px-0 sm:px-4 md:px-6 mx-auto py-6">
    <Fade duration={300} triggerOnce>
      <div className="px-4 sm:px-0">
        {title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}
        {description && (
          <p className="text-muted-foreground mb-6">{description}</p>
        )}
      </div>
      <div className={className}>
        {children}
      </div>
    </Fade>
  </div>
);
