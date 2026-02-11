"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ContactAdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/admin/json-pages/contact");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to contact page editor...</p>
      </div>
    </div>
  );
}
