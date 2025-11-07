ALTER TABLE "Agent"
  ADD COLUMN IF NOT EXISTS "model"         TEXT    NOT NULL DEFAULT 'gpt-3.5-turbo',
  ADD COLUMN IF NOT EXISTS "language"      TEXT             DEFAULT 'English',
  ADD COLUMN IF NOT EXISTS "welcome"       TEXT             DEFAULT 'Hi there! How can I help you?',
  ADD COLUMN IF NOT EXISTS "aiSpeaksFirst" BOOLEAN          DEFAULT false,
  ADD COLUMN IF NOT EXISTS "dynamicMsgs"   BOOLEAN          DEFAULT false,
  ADD COLUMN IF NOT EXISTS "published"     BOOLEAN          DEFAULT false;
