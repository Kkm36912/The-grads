CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"snowflake" bigint NOT NULL,
	"username" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "message_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"emoji_code" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "message_reaction_counts" (
	"message_id" uuid NOT NULL,
	"emoji_code" integer NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "message_reaction_counts_message_id_emoji_code_pk" PRIMARY KEY("message_id","emoji_code")
);
--> statement-breakpoint
ALTER TABLE "message_reaction_counts" ADD CONSTRAINT "message_reaction_counts_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;