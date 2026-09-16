import AppPanel from "../../../../../shared/components/AppPanel/AppPanel.jsx";

const LibraryManagementPanel = ({
  children,
  className = "",
  variant = "primary",
  ...props
}) => {
  return (
    <AppPanel
      as="section"
      variant={variant}
      className={`library-management-card ${className}`.trim()}
      {...props}
    >
      {children}
    </AppPanel>
  );
};

export default LibraryManagementPanel;
