"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Zap, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FOUNDERS } from "@/lib/founders";
import { quickLoginAction, skipAuthAction } from "@/server/actions/auth.actions";

export function AuthDevActions() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  if (process.env.NODE_ENV === "production") return null;

  async function handleQuickLogin(founder: "youssef" | "saif") {
    setLoading(founder);
    const result = await quickLoginAction(founder);
    setLoading(null);

    if (result.success) {
      toast.success(`Welcome, ${FOUNDERS[founder].name}!`);
      router.push("/dashboard");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleSkipAuth() {
    setLoading("skip");
    const result = await skipAuthAction();
    setLoading(null);

    if (result.success) {
      toast.success("Auth skipped — dev mode");
      router.push("/dashboard");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="mt-6 space-y-3 border-t border-border pt-6">
      <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Dev access
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!!loading}
          onClick={() => handleQuickLogin("youssef")}
        >
          <LogIn className="h-4 w-4" />
          {loading === "youssef" ? "..." : FOUNDERS.youssef.name}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!!loading}
          onClick={() => handleQuickLogin("saif")}
        >
          <LogIn className="h-4 w-4" />
          {loading === "saif" ? "..." : FOUNDERS.saif.name}
        </Button>
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="w-full"
        disabled={!!loading}
        onClick={handleSkipAuth}
      >
        <Zap className="h-4 w-4" />
        {loading === "skip" ? "Skipping..." : "Skip auth"}
      </Button>
      <p className="text-center text-[11px] text-muted-foreground">
        Password: {FOUNDERS.youssef.name} / {FOUNDERS.saif.name} → Build8@2026
      </p>
    </div>
  );
}
