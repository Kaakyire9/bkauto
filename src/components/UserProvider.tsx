"use client"
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const UserContext = createContext<{ userId: string | null }>({ userId: null });

export function useUser() {
  return useContext(UserContext);
}

export default function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data?.session?.user?.id ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return <UserContext.Provider value={{ userId }}>{children}</UserContext.Provider>;
}
