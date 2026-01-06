import { getSession } from "@/lib/auth-better";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Pagination } from "@/components/ui/pagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ITEMS_PER_PAGE = 15;

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; filter?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const resolvedSearchParams = await searchParams;
  const userName = `${session.user.firstName} ${session.user.lastName}`;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;
  const filter = resolvedSearchParams.filter || "all";

  // Prepare where clause for filter
  const whereClause: any = {
    userId: session.user.id,
  };

  if (filter === "unread") {
    whereClause.read = false;
  } else if (filter === "read") {
    whereClause.read = true;
  }

  // Total notification count
  const totalCount = await prisma.notification.count({
    where: whereClause,
  });

  // Count per filter
  const unreadCount = await prisma.notification.count({
    where: {
      userId: session.user.id,
      read: false,
    },
  });

  const readCount = await prisma.notification.count({
    where: {
      userId: session.user.id,
      read: true,
    },
  });

  // Fetch paginated notifications
  const notifications = await prisma.notification.findMany({
    where: whereClause,
    orderBy: {
      createdDate: "desc",
    },
    skip,
    take: ITEMS_PER_PAGE,
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const notificationTypeLabels = {
    WORKOUT_COMPLETED: { label: "Workout", color: "bg-blue-500" },
    WORKOUT_REMINDER: { label: "Reminder", color: "bg-yellow-500" },
    APPOINTMENT_SCHEDULED: { label: "Appointment", color: "bg-green-500" },
    APPOINTMENT_REMINDER: { label: "Reminder", color: "bg-yellow-500" },
    MEASUREMENT_ADDED: { label: "Measurement", color: "bg-purple-500" },
    CHECKPOINT_DUE: { label: "Checkpoint", color: "bg-orange-500" },
    FEEDBACK_RECEIVED: { label: "Feedback", color: "bg-pink-500" },
    INACTIVITY_WARNING: { label: "Inactivity", color: "bg-red-500" },
  };

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Notifications" />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
            <p className="text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "All notifications read"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline">
              <Check className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        <Tabs defaultValue={filter} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              All ({unreadCount + readCount})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="read">
              Read ({readCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {filter === "unread"
                    ? "Unread Notifications"
                    : filter === "read"
                    ? "Read Notifications"
                    : "All Notifications"}
                </CardTitle>
                <CardDescription>
                  {totalCount > 0
                    ? `${totalCount} notification${totalCount !== 1 ? "s" : ""}`
                    : "No notifications"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {notifications.map((notification) => {
                        const config = notificationTypeLabels[notification.type];
                        return (
                          <div
                            key={notification.id}
                            className={`flex items-start gap-4 p-4 rounded-lg border ${
                              !notification.read ? "bg-accent/50" : ""
                            }`}
                          >
                            <div
                              className={`mt-1 h-2 w-2 rounded-full ${config.color}`}
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium">
                                  {notification.message}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {config.label}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(notification.createdDate, {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                            {!notification.read && (
                              <Button variant="ghost" size="sm">
                                Mark as read
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={totalCount}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Bell className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {filter === "unread"
                        ? "No unread notifications"
                        : filter === "read"
                        ? "No read notifications"
                        : "No notifications available"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
