import { relations } from "drizzle-orm";
import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";

/**
 * Table Definitions
 */

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").unique().notNull(),
});

export const notifications = sqliteTable(
  "notifications",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    readAt: integer("read_at", { mode: "timestamp" }),
    message: text("message").notNull(),
    actorId: integer("actor_id")
      .notNull()
      .references(() => users.id),
  },
  (table) => ({
    actorIdIndex: index("actor_id_idx").on(table.actorId),
  })
);

export const follows = sqliteTable(
  "follows",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    followerId: integer("follower_id")
      .notNull()
      .references(() => users.id),
    followedId: integer("followed_id")
      .notNull()
      .references(() => users.id),
  },
  (table) => ({
    followerIdIndex: index("follower_id_idx").on(table.followerId),
    followedIdIndex: index("followed_id_idx").on(table.followedId),
  })
);

export const threads = sqliteTable(
  "threads",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    body: text("body").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
  },
  (table) => ({
    userIdIndex: index("user_id_idx").on(table.userId),
    createdAtIndex: index("created_at_idx").on(table.createdAt),
  })
);

export const replies = sqliteTable("replies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  body: text("body").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  threadId: integer("thread_id")
    .notNull()
    .references(() => threads.id),
});

/**
 * Table Relationships
 */

export const userRelations = relations(users, ({ many }) => ({
  notifications: many(notifications),
  follows: many(follows),
  threads: many(threads),
  replies: many(replies),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.id],
  }),
}));

export const followRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
  }),
  followed: one(users, {
    fields: [follows.followedId],
    references: [users.id],
  }),
}));

export const threadRelations = relations(threads, ({ one, many }) => ({
  user: one(users, {
    fields: [threads.userId],
    references: [users.id],
  }),
  replies: many(replies),
}));

export const replyRelations = relations(replies, ({ one }) => ({
  thread: one(threads, {
    fields: [replies.threadId],
    references: [threads.id],
  }),
  user: one(users, {
    fields: [replies.userId],
    references: [users.id],
  }),
}));
