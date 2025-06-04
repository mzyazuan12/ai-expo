import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <h1 className="text-6xl font-bold text-gray-100">404</h1>
        <h2 className="text-2xl font-semibold text-gray-200">Page Not Found</h2>
        <p className="text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/challenges">Browse Challenges</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 