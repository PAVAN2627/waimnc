import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeToActiveNotices, type NoticeRecord } from "@/lib/notices";

interface NoticeContextType {
  notices: NoticeRecord[];
  isLoading: boolean;
}

const NoticeContext = createContext<NoticeContextType>({
  notices: [],
  isLoading: true,
});

export const NoticeProvider = ({ children }: { children: ReactNode }) => {
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsLoading(false);
      return;
    }

    // Single persistent real-time listener for the entire application
    const unsubscribe = subscribeToActiveNotices((activeNotices) => {
      setNotices(activeNotices);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <NoticeContext.Provider value={{ notices, isLoading }}>
      {children}
    </NoticeContext.Provider>
  );
};

export const useNotices = () => useContext(NoticeContext);
