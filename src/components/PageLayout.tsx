import React from "react";

/**
 * PageLayout: Lightweight content wrapper for sub-pages.
 * The persistent TopHeader, MainNav, Footer, SearchModal, and MobileQuickDock
 * are maintained at the route level in PublicLayout.
 */
const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="w-full">{children}</div>;
};

export default PageLayout;
