CREATE TABLE `roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`colour` text DEFAULT '#ffffff' NOT NULL,
	`permissions` text DEFAULT '["read:wiki"]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role_id` integer DEFAULT 0 NOT NULL,
	`discord_id` text,
	`discord_username` text,
	`discord_avatar` text,
	`steam_id` text,
	`steam_username` text,
	`steam_avatar` text
);
