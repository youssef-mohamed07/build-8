"use client";

import { motion } from "framer-motion";
import {
  Building2,
  DollarSign,
  FolderKanban,
  GraduationCap,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";

const iconMap = {
  CLIENT_CREATED: Building2,
  PAYMENT_RECEIVED: DollarSign,
  PROJECT_CREATED: FolderKanban,
  CANDIDATE_ADDED: GraduationCap,
  TEAM_MEMBER_ADDED: Users,
};

interface ActivityItem {
  id: string;
  type: keyof typeof iconMap;
  title: string;
  description?: string;
  createdAt: Date | string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = iconMap[activity.type] ?? Building2;
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-medium leading-none">{activity.title}</p>
                  {activity.description && (
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(activity.createdAt)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
