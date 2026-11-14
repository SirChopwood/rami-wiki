PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_pages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`summary` text,
	`is_published` integer DEFAULT true NOT NULL,
	`author_id` text,
	`updated_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`colours` text DEFAULT '{"background":"#241908","accent":"#a10707","header":"#ffffff","text":"#8c8c8c"}' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_pages`("id", "slug", "title", "content", "summary", "is_published", "author_id", "updated_by", "created_at", "updated_at", "colours") SELECT "id", "slug", "title", "content", "summary", "is_published", "author_id", "updated_by", "created_at", "updated_at", "colours" FROM `pages`;--> statement-breakpoint
DROP TABLE `pages`;--> statement-breakpoint
ALTER TABLE `__new_pages` RENAME TO `pages`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `pages_slug_unique` ON `pages` (`slug`);--> statement-breakpoint
CREATE INDEX `pages_slug_idx` ON `pages` (`slug`);