#!/bin/bash
set -e

DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-"ai_workspace"}
DB_USER=${DB_USER:-"postgres"}
BACKUP_BUCKET=${BACKUP_BUCKET:-"ai-personal-workspace-backups"}

if [ -z "$1" ]; then
  echo "Usage: $0 <backup-filename-in-s3>"
  exit 1
fi

BACKUP_FILE=$1

echo "Downloading backup from S3: s3://$BACKUP_BUCKET/$BACKUP_FILE..."
aws s3 cp "s3://$BACKUP_BUCKET/$BACKUP_FILE" "/tmp/$BACKUP_FILE"

echo "Terminating active database connections..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" || true

echo "Restoring database $DB_NAME..."
pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --clean --no-owner --no-privileges -v "/tmp/$BACKUP_FILE"

echo "Database restoration completed successfully."
rm "/tmp/$BACKUP_FILE"
