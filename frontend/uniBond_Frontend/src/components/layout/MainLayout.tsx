import { useLocation } from "react-router-dom";
import TopNavbar from "./TopNavbar";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  const location = useLocation();
  const isProfilePage = location.pathname.startsWith('/profile');
  const isWidePage =
    location.pathname.startsWith('/companies') ||
    location.pathname.startsWith('/kuppy') ||
    location.pathname.startsWith('/tasks') ||
    location.pathname.startsWith('/search') ||
    location.pathname.startsWith('/professional-communication');

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)]">
      <TopNavbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isProfilePage ? (
          children
        ) : (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-3">
              <LeftSidebar />
            </div>
            
            {isWidePage ? (
              <div className="col-span-12 md:col-span-9">
                {children}
              </div>
            ) : (
              <>
                <div className="col-span-12 md:col-span-6">
                  {children}
                </div>
                <div className="col-span-12 md:col-span-3">
                  <RightSidebar />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
