"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkWhitelist = async () => {
      if (!isLoaded || !user) {
        setIsChecking(false);
        return;
      }

      try {
        const response = await fetch("/api/whitelisted-users");
        if (!response.ok) throw new Error("Failed to fetch whitelist");
        const whitelistedUsers = await response.json();

        if (!whitelistedUsers.includes(user.id)) {
          router.push("/");
        }
      } catch (error) {
        console.error("Error checking whitelist:", error);
        router.push("/");
      } finally {
        setIsChecking(false);
      }
    };

    checkWhitelist();
  }, [isLoaded, user, router]);

  if (!isLoaded || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        {children}
      </div>
    </div>
  );
} 