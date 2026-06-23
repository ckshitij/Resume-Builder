package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/resume-builder/backend/internal/models"
)

type ResumeRepository struct {
	pool *pgxpool.Pool
}

func NewResumeRepository(pool *pgxpool.Pool) *ResumeRepository {
	return &ResumeRepository{pool: pool}
}

func (r *ResumeRepository) List(ctx context.Context) ([]models.Resume, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, title, data, created_at, updated_at
		FROM resumes
		ORDER BY updated_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resumes []models.Resume
	for rows.Next() {
		resume, err := scanResume(rows)
		if err != nil {
			return nil, err
		}
		resumes = append(resumes, resume)
	}
	return resumes, rows.Err()
}

func (r *ResumeRepository) Get(ctx context.Context, id uuid.UUID) (models.Resume, error) {
	row := r.pool.QueryRow(ctx, `
		SELECT id, title, data, created_at, updated_at
		FROM resumes WHERE id = $1
	`, id)
	return scanResumeRow(row)
}

func (r *ResumeRepository) Create(ctx context.Context, req models.CreateResumeRequest) (models.Resume, error) {
	data := req.Data
	if req.Title == "" {
		req.Title = "Untitled Resume"
	}
	if data.PersonalInfo.FullName == "" && len(data.Experience) == 0 {
		data = models.DefaultResumeData()
	}

	dataJSON, err := json.Marshal(data)
	if err != nil {
		return models.Resume{}, err
	}

	var resume models.Resume
	err = r.pool.QueryRow(ctx, `
		INSERT INTO resumes (title, data)
		VALUES ($1, $2)
		RETURNING id, title, data, created_at, updated_at
	`, req.Title, dataJSON).Scan(&resume.ID, &resume.Title, &dataJSON, &resume.CreatedAt, &resume.UpdatedAt)
	if err != nil {
		return models.Resume{}, err
	}
	if err := json.Unmarshal(dataJSON, &resume.Data); err != nil {
		return models.Resume{}, err
	}
	return resume, nil
}

func (r *ResumeRepository) Update(ctx context.Context, id uuid.UUID, req models.UpdateResumeRequest) (models.Resume, error) {
	dataJSON, err := json.Marshal(req.Data)
	if err != nil {
		return models.Resume{}, err
	}

	title := req.Title
	if title == "" {
		title = "Untitled Resume"
	}

	var resume models.Resume
	err = r.pool.QueryRow(ctx, `
		UPDATE resumes
		SET title = $2, data = $3, updated_at = NOW()
		WHERE id = $1
		RETURNING id, title, data, created_at, updated_at
	`, id, title, dataJSON).Scan(&resume.ID, &resume.Title, &dataJSON, &resume.CreatedAt, &resume.UpdatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return models.Resume{}, fmt.Errorf("resume not found")
		}
		return models.Resume{}, err
	}
	if err := json.Unmarshal(dataJSON, &resume.Data); err != nil {
		return models.Resume{}, err
	}
	return resume, nil
}

func (r *ResumeRepository) Delete(ctx context.Context, id uuid.UUID) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM resumes WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("resume not found")
	}
	return nil
}

type scannable interface {
	Scan(dest ...interface{}) error
}

func scanResume(rows pgx.Rows) (models.Resume, error) {
	var resume models.Resume
	var dataJSON []byte
	if err := rows.Scan(&resume.ID, &resume.Title, &dataJSON, &resume.CreatedAt, &resume.UpdatedAt); err != nil {
		return models.Resume{}, err
	}
	if err := json.Unmarshal(dataJSON, &resume.Data); err != nil {
		return models.Resume{}, err
	}
	return resume, nil
}

func scanResumeRow(row pgx.Row) (models.Resume, error) {
	var resume models.Resume
	var dataJSON []byte
	if err := row.Scan(&resume.ID, &resume.Title, &dataJSON, &resume.CreatedAt, &resume.UpdatedAt); err != nil {
		return models.Resume{}, err
	}
	if err := json.Unmarshal(dataJSON, &resume.Data); err != nil {
		return models.Resume{}, err
	}
	return resume, nil
}

func (r *ResumeRepository) TouchUpdatedAt(ctx context.Context, id uuid.UUID) error {
	_, err := r.pool.Exec(ctx, `UPDATE resumes SET updated_at = $2 WHERE id = $1`, id, time.Now())
	return err
}
