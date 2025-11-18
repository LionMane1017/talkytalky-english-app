CREATE TABLE `systemKnowledge` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(50),
	`topic` varchar(100),
	`content` text NOT NULL,
	`embedding` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `systemKnowledge_id` PRIMARY KEY(`id`)
);
