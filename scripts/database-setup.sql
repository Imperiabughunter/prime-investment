
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  display_name text DEFAULT ''::text,
  email text NOT NULL DEFAULT ''::text UNIQUE,
  photo_url text DEFAULT ''::text,
  walletBalance numeric NOT NULL DEFAULT '0'::numeric,
  user_id uuid NOT NULL DEFAULT auth.uid() UNIQUE,
  role text DEFAULT ''::text,
  Investment ARRAY,
  fcm_token text,
  "Investment Balance" numeric NOT NULL DEFAULT '0'::numeric,
  status text NOT NULL DEFAULT 'Inactive'::text,
  CONSTRAINT users_pkey PRIMARY KEY (user_id),
  CONSTRAINT users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Create Investment table
CREATE TABLE IF NOT EXISTS public."Investment" (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_ID uuid DEFAULT auth.uid(),
  amount numeric,
  minAmount numeric,
  maxAmount numeric,
  "Return On Investment" double precision,
  durationValue numeric,
  durationUnit text,
  startDate timestamp without time zone,
  maturityDate timestamp without time zone,
  status text,
  payoutAmount numeric DEFAULT '0'::numeric,
  InvestmentBalance numeric DEFAULT '0'::numeric,
  InvestmentID text,
  InvestmentType text,
  "Expected Profit" numeric,
  payment_method text DEFAULT 'wallet'::text,
  payment_gateway_reference text,
  payment_status text DEFAULT 'pending'::text,
  CONSTRAINT Investment_pkey PRIMARY KEY (id),
  CONSTRAINT Investment_user_ID_fkey FOREIGN KEY (user_ID) REFERENCES auth.users(id)
);

-- Create investment_plans table
CREATE TABLE IF NOT EXISTS public.investment_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  min_amount numeric NOT NULL,
  max_amount numeric NOT NULL,
  roi_percentage numeric NOT NULL,
  duration_months integer NOT NULL,
  risk_level text CHECK (risk_level = ANY (ARRAY['Low'::text, 'Medium'::text, 'High'::text])),
  status text DEFAULT 'active'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT investment_plans_pkey PRIMARY KEY (id)
);

-- Create investment_types table
CREATE TABLE IF NOT EXISTS public.investment_types (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL,
  name text,
  description text,
  minAmount numeric,
  maxAmount numeric,
  minDurationValue numeric,
  maxDurationValue numeric,
  minDurationUnit text,
  maxDurationUnit text,
  defaultROI double precision,
  compoundfrequency text,
  status text,
  CONSTRAINT investment_types_pkey PRIMARY KEY (id)
);

-- Create Transactions table
CREATE TABLE IF NOT EXISTS public."Transactions" (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_Id uuid DEFAULT auth.uid(),
  type text,
  method text,
  amount numeric,
  status text,
  referenceCode character varying,
  timestamp timestamp without time zone,
  currency text,
  "Sender Account" text,
  receipientAccount text,
  transactionID character varying,
  payment_gateway text,
  crypto_currency text,
  gateway_transaction_id text,
  payment_confirmation_code text,
  CONSTRAINT Transactions_pkey PRIMARY KEY (id),
  CONSTRAINT Transactions_user_Id_fkey FOREIGN KEY (user_Id) REFERENCES auth.users(id)
);

-- Create Loan table
CREATE TABLE IF NOT EXISTS public."Loan" (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_Id uuid NOT NULL DEFAULT auth.uid(),
  loanAmount numeric NOT NULL DEFAULT '0'::numeric,
  interestRate double precision,
  durationValue numeric,
  durationUnit text,
  status text,
  applicationDate timestamp without time zone,
  approvalDate timestamp without time zone,
  dueDate timestamp without time zone,
  totalPayable numeric,
  amountRepaid numeric DEFAULT '0'::numeric,
  loanID uuid DEFAULT gen_random_uuid(),
  CONSTRAINT Loan_pkey PRIMARY KEY (id),
  CONSTRAINT Loan_user_Id_fkey FOREIGN KEY (user_Id) REFERENCES auth.users(id)
);

-- Create Loan Repayment table
CREATE TABLE IF NOT EXISTS public."Loan Repayment" (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  amount numeric NOT NULL,
  date timestamp without time zone,
  method text,
  loan_balance numeric NOT NULL DEFAULT '0'::numeric,
  CONSTRAINT "Loan Repayment_pkey" PRIMARY KEY (id),
  CONSTRAINT "Loan Repayment_id_fkey" FOREIGN KEY (id) REFERENCES public."Loan"(id)
);

-- Create Virtual Account table
CREATE TABLE IF NOT EXISTS public."Virtual Account" (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid DEFAULT auth.uid(),
  accountNumber numeric,
  bankName text,
  accountName text,
  balance numeric DEFAULT '0'::numeric,
  currency text,
  accountType text,
  status text,
  updatedAt timestamp without time zone,
  createdByAdmin boolean,
  lastTransaction timestamp without time zone,
  linkedToWallet boolean,
  AccountId text,
  CONSTRAINT "Virtual Account_pkey" PRIMARY KEY (id),
  CONSTRAINT "Virtual Account_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Create Wallet table
CREATE TABLE IF NOT EXISTS public."Wallet" (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_Id uuid DEFAULT auth.uid(),
  balance numeric,
  updatedAt timestamp without time zone,
  CONSTRAINT Wallet_pkey PRIMARY KEY (id),
  CONSTRAINT Wallet_user_Id_fkey FOREIGN KEY (user_Id) REFERENCES auth.users(id)
);

-- Create Notifications table
CREATE TABLE IF NOT EXISTS public."Notifications" (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_Id uuid DEFAULT auth.uid(),
  title text,
  message text,
  Is_Read boolean DEFAULT false,
  created_At timestamp without time zone,
  type text DEFAULT 'info'::text,
  action_url text,
  CONSTRAINT Notifications_pkey PRIMARY KEY (id),
  CONSTRAINT Notifications_user_Id_fkey FOREIGN KEY (user_Id) REFERENCES auth.users(id)
);

-- Create Orders table
CREATE TABLE IF NOT EXISTS public."Orders" (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  orderID uuid DEFAULT gen_random_uuid(),
  type text,
  createdDate timestamp without time zone,
  status text,
  amount numeric,
  user_id uuid DEFAULT auth.uid(),
  transactionID character varying,
  description text,
  CONSTRAINT Orders_pkey PRIMARY KEY (id),
  CONSTRAINT Orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Create KYC table
CREATE TABLE IF NOT EXISTS public."KYC" (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  full_name text,
  email text,
  phone_number bigint,
  country text,
  city text,
  Address text,
  CONSTRAINT KYC_pkey PRIMARY KEY (id),
  CONSTRAINT KYC_email_fkey FOREIGN KEY (email) REFERENCES public.users(email)
);

-- Create Admin table
CREATE TABLE IF NOT EXISTS public."Admin" (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid,
  permissions ARRAY,
  IsActive boolean DEFAULT true,
  lastLogin timestamp without time zone,
  updatedAt timestamp without time zone,
  CONSTRAINT Admin_pkey PRIMARY KEY (id),
  CONSTRAINT Admin_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Create Settings table
CREATE TABLE IF NOT EXISTS public."Settings" (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  key text,
  value text,
  CONSTRAINT Settings_pkey PRIMARY KEY (id)
);

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_settings_pkey PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Investment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Loan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Loan Repayment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Virtual Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Wallet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KYC" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own investments" ON "Investment" FOR SELECT USING (auth.uid() = user_ID);
CREATE POLICY "Users can insert own investments" ON "Investment" FOR INSERT WITH CHECK (auth.uid() = user_ID);

CREATE POLICY "Anyone can view active investment plans" ON investment_plans FOR SELECT USING (status = 'active');

CREATE POLICY "Anyone can view active investment types" ON investment_types FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view own transactions" ON "Transactions" FOR SELECT USING (auth.uid() = user_Id);
CREATE POLICY "Users can insert own transactions" ON "Transactions" FOR INSERT WITH CHECK (auth.uid() = user_Id);

CREATE POLICY "Users can view own loans" ON "Loan" FOR SELECT USING (auth.uid() = user_Id);
CREATE POLICY "Users can insert own loans" ON "Loan" FOR INSERT WITH CHECK (auth.uid() = user_Id);

CREATE POLICY "Users can view own virtual accounts" ON "Virtual Account" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own virtual accounts" ON "Virtual Account" FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own wallet" ON "Wallet" FOR SELECT USING (auth.uid() = user_Id);
CREATE POLICY "Users can update own wallet" ON "Wallet" FOR UPDATE USING (auth.uid() = user_Id);

CREATE POLICY "Users can view own notifications" ON "Notifications" FOR SELECT USING (auth.uid() = user_Id);
CREATE POLICY "Users can update own notifications" ON "Notifications" FOR UPDATE USING (auth.uid() = user_Id);

CREATE POLICY "Users can view own orders" ON "Orders" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON "Orders" FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own KYC" ON "KYC" FOR SELECT USING (email IN (SELECT email FROM users WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own KYC" ON "KYC" FOR INSERT WITH CHECK (email IN (SELECT email FROM users WHERE user_id = auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_investment_user_id ON "Investment"(user_ID);
CREATE INDEX idx_transactions_user_id ON "Transactions"(user_Id);
CREATE INDEX idx_loans_user_id ON "Loan"(user_Id);
CREATE INDEX idx_virtual_account_user_id ON "Virtual Account"(user_id);
CREATE INDEX idx_wallet_user_id ON "Wallet"(user_Id);
CREATE INDEX idx_notifications_user_id ON "Notifications"(user_Id);
CREATE INDEX idx_orders_user_id ON "Orders"(user_id);
CREATE INDEX idx_kyc_email ON "KYC"(email);

-- Insert some default investment plans
INSERT INTO investment_plans (name, description, min_amount, max_amount, roi_percentage, duration_months, risk_level) VALUES
('Starter Plan', 'Low risk investment for beginners', 100, 1000, 5.0, 6, 'Low'),
('Growth Plan', 'Medium risk investment for steady growth', 1000, 10000, 12.0, 12, 'Medium'),
('Premium Plan', 'High risk investment for maximum returns', 10000, 100000, 25.0, 24, 'High')
ON CONFLICT DO NOTHING;

-- Insert some default investment types
INSERT INTO investment_types (name, description, minAmount, maxAmount, minDurationValue, maxDurationValue, minDurationUnit, maxDurationUnit, defaultROI, compoundfrequency, status) VALUES
('Stocks', 'Equity investments in public companies', 100, 50000, 1, 60, 'months', 'months', 15.0, 'quarterly', 'active'),
('Bonds', 'Fixed income government and corporate bonds', 500, 25000, 6, 120, 'months', 'months', 8.0, 'semi-annually', 'active'),
('Mutual Funds', 'Diversified portfolio managed by professionals', 250, 75000, 3, 36, 'months', 'months', 12.0, 'monthly', 'active'),
('ETF', 'Exchange traded funds with low fees', 100, 100000, 1, 240, 'months', 'months', 10.0, 'quarterly', 'active')
ON CONFLICT DO NOTHING;
