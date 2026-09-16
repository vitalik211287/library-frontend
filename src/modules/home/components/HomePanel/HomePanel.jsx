import AppPanel from "../../../../shared/components/AppPanel/AppPanel.jsx";
import "./HomePanel.css";

const HomePanel = ({
  children,
  className = "",
  clickable = false,
  ...props
}) => {
  return (
    <AppPanel
      className={`home-panel ${className}`.trim()}
      clickable={clickable}
      {...props}
    >
      {children}
    </AppPanel>
  );
};

export default HomePanel;
