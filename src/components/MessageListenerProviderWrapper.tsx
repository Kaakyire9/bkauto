"use client"
import React from "react";
import MessageListenerProvider from "./MessageListenerProvider";
import { useUser } from "./UserProvider";

export default function MessageListenerProviderWrapper({ children }: { children: React.ReactNode }) {
  const { userId } = useUser();
  if (!userId) return <>{children}</>;
  return <MessageListenerProvider currentUserId={userId}>{children}</MessageListenerProvider>;
}
