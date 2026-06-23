package export

import (
	"archive/zip"
	"bytes"
	"fmt"
	"html"
	"io"
	"strings"

	"github.com/jung-kurt/gofpdf"

	"github.com/resume-builder/backend/internal/assets"
	"github.com/resume-builder/backend/internal/models"
)

func GeneratePDF(data models.ResumeData) ([]byte, error) {
	switch data.EffectiveTemplate() {
	case models.TemplateModern:
		return generateModernPDF(data)
	case models.TemplateMinimal:
		return generateMinimalPDF(data)
	case models.TemplateATS:
		return generateATSPDF(data)
	default:
		return generateClassicPDF(data)
	}
}

func GenerateDOCX(data models.ResumeData) ([]byte, error) {
	body := buildDOCXBody(data)
	return packDOCX(body)
}

func generateATSPDF(data models.ResumeData) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "Letter", "")
	pdf.SetMargins(15, 15, 15)
	pdf.AddPage()
	pdf.SetFont("Helvetica", "", 11)

	pi := data.PersonalInfo
	pdf.SetFont("Helvetica", "B", 16)
	pdf.CellFormat(0, 8, pi.FullName, "", 1, "L", false, 0, "")

	pdf.SetFont("Helvetica", "", 10)
	contact := joinNonEmpty([]string{pi.Email, pi.Phone, pi.Location, pi.Website, pi.LinkedIn, pi.GitHub}, " | ")
	pdf.MultiCell(0, 5, contact, "", "L", false)
	pdf.Ln(4)

	for _, section := range data.EnabledSections() {
		switch section.Type {
		case models.SectionSummary:
			if pi.Summary == "" {
				continue
			}
			drawATSSection(pdf, section.Title)
			pdf.SetFont("Helvetica", "", 11)
			pdf.MultiCell(0, 5, pi.Summary, "", "L", false)

		case models.SectionExperience:
			if len(data.Experience) == 0 {
				continue
			}
			drawATSSection(pdf, section.Title)
			for _, exp := range data.Experience {
				pdf.SetFont("Helvetica", "B", 11)
				pdf.CellFormat(0, 5, fmt.Sprintf("%s | %s", exp.Position, exp.Company), "", 1, "L", false, 0, "")
				meta := joinNonEmpty([]string{formatDateRange(exp.StartDate, exp.EndDate, exp.Current), exp.Location}, " | ")
				if meta != "" {
					pdf.SetFont("Helvetica", "", 10)
					pdf.CellFormat(0, 4, meta, "", 1, "L", false, 0, "")
				}
				if strings.TrimSpace(exp.CompanyDescription) != "" {
					pdf.SetFont("Helvetica", "I", 9)
					pdf.MultiCell(0, 4, stripRichMarkup(exp.CompanyDescription), "", "L", false)
				}
				writeBulletLines(pdf, exp.Description, 11)
				pdf.Ln(2)
			}

		case models.SectionEducation:
			if len(data.Education) == 0 {
				continue
			}
			drawATSSection(pdf, section.Title)
			for _, edu := range data.Education {
				pdf.SetFont("Helvetica", "B", 11)
				pdf.CellFormat(0, 5, fmt.Sprintf("%s %s | %s", edu.Degree, edu.Field, edu.Institution), "", 1, "L", false, 0, "")
				meta := joinNonEmpty([]string{formatDateRange(edu.StartDate, edu.EndDate, false), edu.GPA}, " | ")
				if meta != "" {
					pdf.SetFont("Helvetica", "", 10)
					pdf.CellFormat(0, 4, meta, "", 1, "L", false, 0, "")
				}
			}

		case models.SectionSkills:
			if len(data.Skills) == 0 {
				continue
			}
			drawATSSection(pdf, section.Title)
			pdf.SetFont("Helvetica", "", 11)
			pdf.MultiCell(0, 5, strings.Join(data.Skills, ", "), "", "L", false)

		case models.SectionProjects:
			if len(data.Projects) == 0 {
				continue
			}
			drawATSSection(pdf, section.Title)
			for _, proj := range data.Projects {
				title := proj.Name
				if proj.URL != "" {
					title += " | " + proj.URL
				}
				pdf.SetFont("Helvetica", "B", 11)
				pdf.CellFormat(0, 5, title, "", 1, "L", false, 0, "")
				if proj.Technologies != "" {
					pdf.SetFont("Helvetica", "", 10)
					pdf.CellFormat(0, 4, proj.Technologies, "", 1, "L", false, 0, "")
				}
				pdf.SetFont("Helvetica", "", 11)
				pdf.MultiCell(0, 5, proj.Description, "", "L", false)
				pdf.Ln(2)
			}

		case models.SectionCertifications:
			if len(data.Certifications) == 0 {
				continue
			}
			drawATSSection(pdf, section.Title)
			for _, cert := range data.Certifications {
				pdf.SetFont("Helvetica", "B", 11)
				pdf.CellFormat(0, 5, fmt.Sprintf("%s | %s", cert.Name, cert.Issuer), "", 1, "L", false, 0, "")
				if cert.Date != "" {
					pdf.SetFont("Helvetica", "", 10)
					pdf.CellFormat(0, 4, cert.Date, "", 1, "L", false, 0, "")
				}
			}

		case models.SectionLanguages:
			if len(data.Languages) == 0 {
				continue
			}
			drawATSSection(pdf, section.Title)
			var parts []string
			for _, lang := range data.Languages {
				parts = append(parts, fmt.Sprintf("%s (%s)", lang.Name, lang.Proficiency))
			}
			pdf.SetFont("Helvetica", "", 11)
			pdf.MultiCell(0, 5, strings.Join(parts, ", "), "", "L", false)

		case models.SectionCustom:
			for _, block := range data.CustomSections {
				if block.SectionID != section.ID || block.Content == "" {
					continue
				}
				drawATSSection(pdf, section.Title)
				pdf.SetFont("Helvetica", "", 11)
				pdf.MultiCell(0, 5, block.Content, "", "L", false)
			}
		}
	}

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func drawATSSection(pdf *gofpdf.Fpdf, title string) {
	pdf.Ln(3)
	pdf.SetFont("Helvetica", "B", 12)
	pdf.CellFormat(0, 6, strings.ToUpper(title), "", 1, "L", false, 0, "")
	y := pdf.GetY()
	pdf.SetDrawColor(0, 0, 0)
	pdf.Line(15, y, 200, y)
	pdf.Ln(2)
}

func writeBulletLines(pdf *gofpdf.Fpdf, text string, fontSize float64) {
	pdf.SetFont("Helvetica", "", fontSize)
	for _, line := range strings.Split(text, "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		pdf.CellFormat(4, 4, "-", "", 0, "L", false, 0, "")
		pdf.MultiCell(0, 4, stripRichMarkup(line), "", "L", false)
	}
}

func buildDOCXBody(data models.ResumeData) string {
	var b strings.Builder
	writePara := func(text string, bold bool, size int) {
		if text == "" {
			return
		}
		style := ""
		if bold {
			style = `<w:rPr><w:b/><w:sz w:val="` + fmt.Sprint(size*2) + `"/></w:rPr>`
		} else {
			style = `<w:rPr><w:sz w:val="` + fmt.Sprint(size*2) + `"/></w:rPr>`
		}
		b.WriteString(`<w:p><w:r>` + style + `<w:t xml:space="preserve">` + xmlEscape(text) + `</w:t></w:r></w:p>`)
	}
	writeItalicPara := func(text string, size int) {
		if text == "" {
			return
		}
		style := `<w:rPr><w:i/><w:sz w:val="` + fmt.Sprint(size*2) + `"/></w:rPr>`
		b.WriteString(`<w:p><w:r>` + style + `<w:t xml:space="preserve">` + xmlEscape(text) + `</w:t></w:r></w:p>`)
	}

	pi := data.PersonalInfo
	writePara(pi.FullName, true, 16)
	writePara(joinNonEmpty([]string{pi.Email, pi.Phone, pi.Location, pi.Website, pi.LinkedIn, pi.GitHub}, " | "), false, 10)

	for _, section := range data.EnabledSections() {
		switch section.Type {
		case models.SectionSummary:
			if pi.Summary == "" {
				continue
			}
			writePara(strings.ToUpper(section.Title), true, 12)
			writePara(pi.Summary, false, 11)
		case models.SectionExperience:
			if len(data.Experience) == 0 {
				continue
			}
			writePara(strings.ToUpper(section.Title), true, 12)
			for _, exp := range data.Experience {
				writePara(fmt.Sprintf("%s | %s", exp.Position, exp.Company), true, 11)
				meta := joinNonEmpty([]string{formatDateRange(exp.StartDate, exp.EndDate, exp.Current), exp.Location}, " | ")
				writePara(meta, false, 10)
				if strings.TrimSpace(exp.CompanyDescription) != "" {
					writeItalicPara(stripRichMarkup(exp.CompanyDescription), 9)
				}
				for _, line := range strings.Split(exp.Description, "\n") {
					line = strings.TrimSpace(line)
					if line != "" {
						writePara("- "+stripRichMarkup(line), false, 11)
					}
				}
			}
		case models.SectionEducation:
			if len(data.Education) == 0 {
				continue
			}
			writePara(strings.ToUpper(section.Title), true, 12)
			for _, edu := range data.Education {
				writePara(fmt.Sprintf("%s %s | %s", edu.Degree, edu.Field, edu.Institution), true, 11)
				writePara(joinNonEmpty([]string{formatDateRange(edu.StartDate, edu.EndDate, false), edu.GPA}, " | "), false, 10)
			}
		case models.SectionSkills:
			if len(data.Skills) == 0 {
				continue
			}
			writePara(strings.ToUpper(section.Title), true, 12)
			writePara(strings.Join(data.Skills, ", "), false, 11)
		case models.SectionProjects:
			if len(data.Projects) == 0 {
				continue
			}
			writePara(strings.ToUpper(section.Title), true, 12)
			for _, proj := range data.Projects {
				title := proj.Name
				if proj.URL != "" {
					title += " | " + proj.URL
				}
				writePara(title, true, 11)
				writePara(proj.Technologies, false, 10)
				writePara(proj.Description, false, 11)
			}
		case models.SectionCertifications:
			if len(data.Certifications) == 0 {
				continue
			}
			writePara(strings.ToUpper(section.Title), true, 12)
			for _, cert := range data.Certifications {
				writePara(fmt.Sprintf("%s | %s", cert.Name, cert.Issuer), true, 11)
				writePara(cert.Date, false, 10)
			}
		case models.SectionLanguages:
			if len(data.Languages) == 0 {
				continue
			}
			writePara(strings.ToUpper(section.Title), true, 12)
			var parts []string
			for _, lang := range data.Languages {
				parts = append(parts, fmt.Sprintf("%s (%s)", lang.Name, lang.Proficiency))
			}
			writePara(strings.Join(parts, ", "), false, 11)
		case models.SectionCustom:
			for _, block := range data.CustomSections {
				if block.SectionID != section.ID || block.Content == "" {
					continue
				}
				writePara(strings.ToUpper(section.Title), true, 12)
				writePara(block.Content, false, 11)
			}
		}
	}

	return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
		`<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
		`<w:body>` + b.String() + `<w:sectPr/></w:body></w:document>`
}

func packDOCX(documentXML string) ([]byte, error) {
	var buf bytes.Buffer
	zw := zip.NewWriter(&buf)

	staticFiles := []string{
		"[Content_Types].xml",
		"_rels/.rels",
		"word/_rels/document.xml.rels",
	}
	for _, name := range staticFiles {
		content, err := assets.DOCXBase.ReadFile("templates/docx/" + name)
		if err != nil {
			return nil, err
		}
		if err := writeZipFile(zw, name, content); err != nil {
			return nil, err
		}
	}
	if err := writeZipFile(zw, "word/document.xml", []byte(documentXML)); err != nil {
		return nil, err
	}
	if err := zw.Close(); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func writeZipFile(zw *zip.Writer, name string, content []byte) error {
	w, err := zw.Create(name)
	if err != nil {
		return err
	}
	_, err = io.Copy(w, bytes.NewReader(content))
	return err
}

func xmlEscape(s string) string {
	return html.EscapeString(s)
}
