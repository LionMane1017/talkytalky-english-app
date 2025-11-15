ALTER TABLE `vocabularyProgress` ADD `nextReview` timestamp;--> statement-breakpoint
ALTER TABLE `vocabularyProgress` ADD `reviewInterval` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `vocabularyProgress` ADD `easeFactor` int DEFAULT 250;--> statement-breakpoint
ALTER TABLE `vocabularyProgress` ADD `repetitions` int DEFAULT 0;