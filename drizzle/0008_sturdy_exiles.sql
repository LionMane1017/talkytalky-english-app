CREATE TABLE `lessonMetadataCache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lessonId` varchar(64) NOT NULL,
	`pathId` varchar(64),
	`lessonTitle` varchar(200) NOT NULL,
	`lessonImportance` text,
	`topicContext` text,
	`vocabularySummary` text,
	`introductionVariations` text,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lessonMetadataCache_id` PRIMARY KEY(`id`),
	CONSTRAINT `lessonMetadataCache_lessonId_unique` UNIQUE(`lessonId`)
);
--> statement-breakpoint
CREATE TABLE `lessonSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lessonId` varchar(64),
	`pathId` varchar(64),
	`lessonTitle` varchar(200),
	`lessonImportance` text,
	`lessonContext` text,
	`wordOrder` text,
	`currentWordIndex` int NOT NULL DEFAULT 0,
	`isRandomized` enum('yes','no') NOT NULL DEFAULT 'no',
	`status` enum('active','paused','completed','abandoned') NOT NULL DEFAULT 'active',
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`lastActiveAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`wordsCompleted` int NOT NULL DEFAULT 0,
	`totalWords` int,
	`averageScore` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lessonSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lessonWordAttempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lessonSessionId` int NOT NULL,
	`wordId` varchar(64) NOT NULL,
	`attemptNumber` int NOT NULL DEFAULT 1,
	`wordPosition` int,
	`pronunciationScore` int,
	`userTranscription` text,
	`aiFeedback` text,
	`contextUsed` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lessonWordAttempts_id` PRIMARY KEY(`id`)
);
