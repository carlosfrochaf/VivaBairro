ALTER TABLE appeals ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX reports_queue ON reports(state,created_at);
CREATE INDEX notifications_inbox ON notifications(account_id,created_at DESC);
CREATE INDEX audit_post ON audit(post_id,created_at DESC);
