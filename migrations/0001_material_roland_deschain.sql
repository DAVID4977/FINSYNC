ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "download_history" DROP CONSTRAINT "download_history_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "gst_returns" DROP CONSTRAINT "gst_returns_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "uploaded_files" DROP CONSTRAINT "uploaded_files_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password" SET DATA TYPE varchar(15);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_id" varchar(30) PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "company_name" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone_number" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" varchar(30);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "invoice_upload" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reports" text;--> statement-breakpoint
ALTER TABLE "download_history" ADD CONSTRAINT "download_history_user_id_users_email_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("email_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gst_returns" ADD CONSTRAINT "gst_returns_user_id_users_email_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("email_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_email_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("email_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uploaded_files" ADD CONSTRAINT "uploaded_files_user_id_users_email_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("email_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "company";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "avatar";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_company_name_unique" UNIQUE("company_name");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");