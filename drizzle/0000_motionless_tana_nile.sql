CREATE TYPE "public"."event_mode" AS ENUM('in_person', 'online', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."moderation_status" AS ENUM('ok', 'flagged', 'removed');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('text', 'select', 'checkbox');--> statement-breakpoint
CREATE TABLE "event_hosts" (
	"event_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"can_scan" boolean DEFAULT false NOT NULL,
	CONSTRAINT "event_hosts_event_id_user_id_pk" PRIMARY KEY("event_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description_md" text DEFAULT '' NOT NULL,
	"cover_url" text,
	"logo_url" text,
	"accent_color" text,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"mode" "event_mode" DEFAULT 'in_person' NOT NULL,
	"venue" text,
	"online_url" text,
	"capacity" integer,
	"requires_approval" boolean DEFAULT false NOT NULL,
	"waitlist_enabled" boolean DEFAULT false NOT NULL,
	"status" "event_status" DEFAULT 'draft' NOT NULL,
	"moderation_status" "moderation_status" DEFAULT 'ok' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"label" text NOT NULL,
	"type" "question_type" DEFAULT 'text' NOT NULL,
	"options" jsonb,
	"required" boolean DEFAULT false NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_hosts" ADD CONSTRAINT "event_hosts_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "events_slug_lower_idx" ON "events" USING btree (lower("slug"));--> statement-breakpoint
CREATE INDEX "events_calendar_idx" ON "events" USING btree ("status","moderation_status","starts_at");--> statement-breakpoint
CREATE INDEX "events_owner_idx" ON "events" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "questions_event_position_idx" ON "questions" USING btree ("event_id","position");