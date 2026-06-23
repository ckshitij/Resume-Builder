package assets

import "embed"

//go:embed migrations/*.sql
var Migrations embed.FS

//go:embed templates/html/*.html
var HTMLTemplates embed.FS

//go:embed all:templates/docx
var DOCXBase embed.FS

//go:embed templates/meta.json
var TemplateMeta []byte
