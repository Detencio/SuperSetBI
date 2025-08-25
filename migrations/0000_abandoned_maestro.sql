CREATE TABLE "accounts_receivable" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"customer_id" varchar NOT NULL,
	"invoice_id" varchar NOT NULL,
	"invoice_date" timestamp NOT NULL,
	"due_date" timestamp NOT NULL,
	"original_amount" numeric(10, 2) NOT NULL,
	"outstanding_amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"aging_days" integer DEFAULT 0,
	"status" text DEFAULT 'current' NOT NULL,
	"priority" text DEFAULT 'low',
	"collection_agent" text,
	"last_contact_date" timestamp,
	"next_contact_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_conversations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"title" text NOT NULL,
	"last_message_at" timestamp DEFAULT now(),
	"message_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" varchar NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"token_count" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collection_activities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"customer_id" varchar NOT NULL,
	"invoice_id" varchar,
	"activity_type" text NOT NULL,
	"activity_date" timestamp DEFAULT now(),
	"agent" text NOT NULL,
	"notes" text,
	"result" text,
	"follow_up_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"sale_id" varchar NOT NULL,
	"customer_name" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"due_date" timestamp NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" varchar NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"address" text,
	"website" text,
	"industry" text,
	"size" text,
	"logo" text,
	"settings" text,
	"subscription" text DEFAULT 'trial' NOT NULL,
	"subscription_expires_at" timestamp,
	"max_users" integer DEFAULT 5,
	"max_storage" integer DEFAULT 1000,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "companies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "company_invitations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"invited_by" varchar NOT NULL,
	"token" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "company_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"address" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"customer_type" text DEFAULT 'individual' NOT NULL,
	"credit_limit" numeric(10, 2) DEFAULT '0.00',
	"payment_terms" integer DEFAULT 30,
	"registration_date" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dashboards" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"config" text,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "data_imports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"import_type" text NOT NULL,
	"data_type" text NOT NULL,
	"file_name" text,
	"total_records" integer DEFAULT 0,
	"processed_records" integer DEFAULT 0,
	"successful_records" integer DEFAULT 0,
	"failed_records" integer DEFAULT 0,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_log" text,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "enhanced_sales" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"invoice_number" text NOT NULL,
	"customer_id" varchar NOT NULL,
	"salesperson_id" varchar,
	"sale_date" timestamp DEFAULT now(),
	"due_date" timestamp,
	"subtotal" numeric(10, 2) NOT NULL,
	"tax_amount" numeric(10, 2) DEFAULT '0.00',
	"discount_amount" numeric(10, 2) DEFAULT '0.00',
	"total_amount" numeric(10, 2) NOT NULL,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"payment_method" text,
	"channel" text DEFAULT 'store',
	"currency" text DEFAULT 'USD',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "enhanced_sales_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "inventory_movements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"warehouse_id" varchar,
	"movement_type" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_cost" numeric(10, 2),
	"total_value" numeric(10, 2),
	"reason" text,
	"document_number" text,
	"reference_id" varchar,
	"user_id" varchar,
	"notes" text,
	"movement_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"customer_id" varchar NOT NULL,
	"invoice_id" varchar,
	"payment_date" timestamp DEFAULT now(),
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" text NOT NULL,
	"reference" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"sku" text,
	"name" text NOT NULL,
	"category_id" varchar,
	"supplier_id" varchar,
	"warehouse_id" varchar,
	"price" numeric(10, 2) NOT NULL,
	"cost_price" numeric(10, 2),
	"stock" integer NOT NULL,
	"min_stock" integer DEFAULT 10,
	"max_stock" integer DEFAULT 1000,
	"safety_stock" integer DEFAULT 5,
	"reorder_point" integer DEFAULT 15,
	"location" text,
	"unit_measure" text DEFAULT 'unidad',
	"weight" numeric(8, 2),
	"dimensions" text,
	"expiration_date" timestamp,
	"last_movement_date" timestamp,
	"abc_classification" text DEFAULT 'C',
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"demand_forecast" numeric(10, 2) DEFAULT '0',
	"seasonality_factor" numeric(5, 2) DEFAULT '1.00',
	"defect_rate" numeric(5, 2) DEFAULT '0.00',
	"shrinkage_rate" numeric(5, 2) DEFAULT '0.00',
	"storage_cost" numeric(8, 2) DEFAULT '0.00',
	"ordering_cost" numeric(8, 2) DEFAULT '0.00',
	"days_without_movement" integer DEFAULT 0,
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "sale_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"sale_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"discount_percentage" numeric(5, 2) DEFAULT '0.00',
	"line_total" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"sale_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "salespeople" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"territory" text,
	"commission_rate" numeric(5, 2) DEFAULT '0.00',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_alerts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"alert_type" text NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"message" text NOT NULL,
	"threshold" integer,
	"current_value" integer,
	"is_resolved" boolean DEFAULT false,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"name" text NOT NULL,
	"contact_name" text,
	"email" text,
	"phone" text,
	"address" text,
	"lead_time" integer DEFAULT 7,
	"reliability" numeric(5, 2) DEFAULT '95.00',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"permissions" text,
	"last_login_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"name" text NOT NULL,
	"location" text,
	"capacity" integer,
	"created_at" timestamp DEFAULT now()
);
