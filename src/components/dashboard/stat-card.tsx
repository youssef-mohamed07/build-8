"use client";

import { motion } from "framer-motion";
import {
  Building2,
  CheckSquare,
  DollarSign,
  FolderKanban,
  GraduationCap,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { useCurrencyStore } from "@/stores/currency-store";

const ICONS = {
  "dollar-sign": DollarSign,
  "trending-up": TrendingUp,
  "building-2": Building2,
  "folder-kanban": FolderKanban,
  "check-square": CheckSquare,
  users: Users,
  "graduation-cap": GraduationCap,
  wallet: Wallet,
} as const;

export type StatCardIcon = keyof typeof ICONS;

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: StatCardIcon;
  format?: "currency" | "number" | "text";
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  icon,
  format = "text",
  className,
}: StatCardProps) {
  const Icon = ICONS[icon];
  const currency = useCurrencyStore((s) => s.currency);

  const displayValue =
    format === "currency" && typeof value === "number"
      ? formatCurrency(value, currency)
      : format === "number" && typeof value === "number"
        ? value.toLocaleString()
        : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold tracking-tight">{displayValue}</p>
              {change !== undefined && (
                <div className="flex items-center gap-1 text-xs">
                  {change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={cn(
                      "font-medium",
                      change >= 0 ? "text-emerald-500" : "text-red-500"
                    )}
                  >
                    {change >= 0 ? "+" : ""}
                    {change}%
                  </span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              )}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
