"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Zap, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FOUNDERS } from "@/lib/founders";
import { quickLoginAction, skipAuthAction } from "@/server/actions/auth.actions";

function resolveCallbackUrl(): string {
  if (typeof window === "undefined") return "/dashboard";
  const callback = new URLSearchParams(window.location.search).get("callbackUrl");
  if (callback?.startsWith("/") && !callback.startsWith("//")) return callback;
  return "/dashboard";
}

export function AuthDevActions() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  function navigateAfterAuth(message: string) {
    toast.success(message);
    router.push(resolveCallbackUrl());
    router.refresh();
  }

  async function handleQuickLogin(founder: "youssef" | "saif") {
    setLoading(founder);
    const result = await quickLoginAction(founder);
    setLoading(null);

    if (result.success) {
      navigateAfterAuth(`Welcome, ${FOUNDERS[founder].name}!`);
    } else {
      toast.error(result.error);
    }
  }

  async function handleSkipAuth() {
    setLoading("skip");
    const result = await skipAuthAction();
    setLoading(null);

    if (result.success) {
      navigateAfterAuth(`Welcome, ${FOUNDERS.youssef.name}!`);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="mt-6 space-y-3 border-t border-border pt-6">
      <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Quick access
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
      <p className="text-center text-[11px] text-muted-foreground">
        Password: Build8@2026
      </p>
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
    </div>
  );
}
