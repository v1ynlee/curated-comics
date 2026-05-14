-- Enable pg_cron extension for scheduled task execution
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule a cron job to publish articles that have reached their scheduled_date.
-- Runs every 5 minutes, transitioning articles from 'scheduled' to 'published' state.
-- Sets publish_date to the originally scheduled_date value and updates the timestamp.
SELECT cron.schedule(
  'publish-scheduled-articles',
  '*/5 * * * *',
  $$
    UPDATE articles
    SET publication_state = 'published',
        publish_date = scheduled_date,
        updated_at = NOW()
    WHERE publication_state = 'scheduled'
      AND scheduled_date <= NOW();
  $$
);
