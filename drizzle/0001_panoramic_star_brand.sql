CREATE TABLE `practiceSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('pronunciation','matching','ielts_part1','ielts_part2','ielts_part3','mock_test') NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced'),
	`score` int,
	`duration` int,
	`wordsCompleted` int,
	`accuracy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `practiceSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalSessions` int NOT NULL DEFAULT 0,
	`pronunciationScore` int NOT NULL DEFAULT 0,
	`fluencyScore` int NOT NULL DEFAULT 0,
	`vocabularyScore` int NOT NULL DEFAULT 0,
	`grammarScore` int NOT NULL DEFAULT 0,
	`ieltsReadyScore` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userProgress_id` PRIMARY KEY(`id`),
	CONSTRAINT `userProgress_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `vocabularyProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`wordId` varchar(64) NOT NULL,
	`attempts` int NOT NULL DEFAULT 0,
	`successCount` int NOT NULL DEFAULT 0,
	`lastScore` int,
	`lastPracticed` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vocabularyProgress_id` PRIMARY KEY(`id`)
);
