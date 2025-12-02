"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  trend?: number;
  icon: React.ReactNode;
  isLoading?: boolean;
}

export default function MetricCard({ title, value, description, trend, icon, isLoading }: MetricCardProps) {
      if (isLoading) {
    return (
      <Card className="p-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" /> {/* title placeholder */}
          <Skeleton className="h-5 w-5 rounded-full" /> {/* icon placeholder */}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" /> {/* value placeholder */}
          <Skeleton className="h-3 w-32" /> {/* description placeholder */}
        </CardContent>
      </Card>
    );
  }
  return (

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {trend !== undefined && (
              <>
                {trend >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={trend >= 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(trend)}%
                </span>
              </>
            )}
            {description}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}