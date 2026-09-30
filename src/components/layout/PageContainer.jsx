import React from "react";

export default function PageContainer({
  children,
  className = "",
  as: Component = "main",
}) {
  const classes = [
    "fm-page-container",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes}>
      <div className="fm-container">
        {children}
      </div>
    </Component>
  );
}
