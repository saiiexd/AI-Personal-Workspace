#!/bin/bash
set -e

# Load environment variables
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-"ai_workspace"}
DB_USER=${DB_USER:-"postgres"}
BACKUP_BUCKET=${BACKUP_BUCKET:-"ai-personal-workspace-backups"}

BACKUP_NAME="${DB_NAME}_backup_$(date +%Y%m%d_%H%M%S).sql"

echo "Starting database backup for $DB_NAME..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -F c -b -v -f "/tmp/$BACKUP_NAME"

echo "Uploading backup to AWS S3 bucket: $BACKUP_BUCKET..."
aws s3 cp "/tmp/$BACKUP_NAME" "s3://$BACKUP_BUCKET/$BACKUP_NAME"

echo "Backup completed successfully: $BACKUP_NAME"
rm "/tmp/$BACKUP_NAME"
