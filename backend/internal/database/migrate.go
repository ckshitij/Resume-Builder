package database

import (
	"context"
	"fmt"
	"io/fs"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/resume-builder/backend/internal/assets"
)

func RunMigrations(ctx context.Context, pool *pgxpool.Pool) error {
	entries, err := fs.Glob(assets.Migrations, "migrations/*.sql")
	if err != nil {
		return fmt.Errorf("glob migrations: %w", err)
	}
	for _, path := range entries {
		content, err := assets.Migrations.ReadFile(path)
		if err != nil {
			return fmt.Errorf("read migration %s: %w", path, err)
		}
		if _, err := pool.Exec(ctx, string(content)); err != nil {
			return fmt.Errorf("run migration %s: %w", path, err)
		}
	}
	return nil
}
