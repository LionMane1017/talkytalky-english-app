CREATE TABLE `emailPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`weeklyReport` enum('enabled','disabled') NOT NULL DEFAULT 'enabled',
	`monthlyReport` enum('enabled','disabled') NOT NULL DEFAULT 'enabled',
	`achievementNotifications` enum('enabled','disabled') NOT NULL DEFAULT 'enabled',
	`preferredDay` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') DEFAULT 'monday',
	`lastWeeklyReport` timestamp,
	`lastMonthlyReport` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `emailPreferences_userId_unique` UNIQUE(`userId`)
);
