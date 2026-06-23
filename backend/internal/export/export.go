package export

import (
	"bytes"
	"fmt"
	"strings"
	"time"

	"github.com/jung-kurt/gofpdf"

	"github.com/resume-builder/backend/internal/models"
)

func generateClassicPDF(data models.ResumeData) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(20, 20, 20)
	pdf.AddPage()

	r, g, b := hexToRGB(data.Customization.PrimaryColor)
	fontSize := float64(data.Customization.FontSize)
	if fontSize < 9 {
		fontSize = 11
	}

	pdf.SetFont("Helvetica", "B", 22)
	pdf.SetTextColor(r, g, b)
	pdf.CellFormat(0, 10, data.PersonalInfo.FullName, "", 1, "L", false, 0, "")

	pdf.SetFont("Helvetica", "", 10)
	pdf.SetTextColor(80, 80, 80)
	contact := joinNonEmpty([]string{
		data.PersonalInfo.Email, data.PersonalInfo.Phone, data.PersonalInfo.Location,
		data.PersonalInfo.Website, data.PersonalInfo.LinkedIn, data.PersonalInfo.GitHub,
	}, "  •  ")
	pdf.MultiCell(0, 5, contact, "", "L", false)

	pdf.Ln(4)
	drawSectionHeader(pdf, "Summary", r, g, b)
	pdf.SetFont("Helvetica", "", fontSize)
	pdf.SetTextColor(40, 40, 40)
	pdf.MultiCell(0, 5, data.PersonalInfo.Summary, "", "L", false)

	if len(data.Experience) > 0 {
		pdf.Ln(3)
		drawSectionHeader(pdf, "Experience", r, g, b)
		for _, exp := range data.Experience {
			writeExperienceEntry(pdf, exp, fontSize, r, g, b)
		}
	}

	if len(data.Education) > 0 {
		pdf.Ln(3)
		drawSectionHeader(pdf, "Education", r, g, b)
		for _, edu := range data.Education {
			pdf.SetFont("Helvetica", "B", fontSize)
			pdf.SetTextColor(40, 40, 40)
			pdf.CellFormat(0, 5, fmt.Sprintf("%s %s — %s", edu.Degree, edu.Field, edu.Institution), "", 1, "L", false, 0, "")
			meta := joinNonEmpty([]string{formatDateRange(edu.StartDate, edu.EndDate, false), edu.GPA}, " | ")
			if meta != "" {
				pdf.SetFont("Helvetica", "I", 9)
				pdf.SetTextColor(100, 100, 100)
				pdf.CellFormat(0, 4, meta, "", 1, "L", false, 0, "")
			}
		}
	}

	if len(data.Skills) > 0 {
		pdf.Ln(3)
		drawSectionHeader(pdf, "Skills", r, g, b)
		pdf.SetFont("Helvetica", "", fontSize)
		pdf.SetTextColor(40, 40, 40)
		pdf.MultiCell(0, 5, strings.Join(data.Skills, ", "), "", "L", false)
	}

	if len(data.Projects) > 0 {
		pdf.Ln(3)
		drawSectionHeader(pdf, "Projects", r, g, b)
		for _, proj := range data.Projects {
			pdf.SetFont("Helvetica", "B", fontSize)
			pdf.CellFormat(0, 5, proj.Name, "", 1, "L", false, 0, "")
			if proj.Technologies != "" {
				pdf.SetFont("Helvetica", "I", 9)
				pdf.SetTextColor(100, 100, 100)
				pdf.CellFormat(0, 4, proj.Technologies, "", 1, "L", false, 0, "")
			}
			pdf.SetFont("Helvetica", "", fontSize)
			pdf.SetTextColor(40, 40, 40)
			pdf.MultiCell(0, 5, proj.Description, "", "L", false)
		}
	}

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func generateModernPDF(data models.ResumeData) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(0, 0, 0)
	pdf.AddPage()

	r, g, b := hexToRGB(data.Customization.PrimaryColor)
	fontSize := float64(data.Customization.FontSize)
	if fontSize < 9 {
		fontSize = 11
	}

	pdf.SetFillColor(r, g, b)
	pdf.Rect(0, 0, 70, 297, "F")

	pdf.SetXY(8, 15)
	pdf.SetFont("Helvetica", "B", 16)
	pdf.SetTextColor(255, 255, 255)
	lines := pdf.SplitText(data.PersonalInfo.FullName, 54)
	for _, line := range lines {
		pdf.CellFormat(54, 7, line, "", 1, "L", false, 0, "")
		pdf.SetX(8)
	}

	pdf.SetFont("Helvetica", "", 9)
	pdf.SetXY(8, pdf.GetY()+8)
	for _, item := range []string{data.PersonalInfo.Email, data.PersonalInfo.Phone, data.PersonalInfo.Location} {
		if item != "" {
			pdf.CellFormat(54, 4, item, "", 1, "L", false, 0, "")
			pdf.SetX(8)
		}
	}

	if len(data.Skills) > 0 {
		pdf.SetXY(8, pdf.GetY()+10)
		pdf.SetFont("Helvetica", "B", 11)
		pdf.CellFormat(54, 6, "Skills", "", 1, "L", false, 0, "")
		pdf.SetFont("Helvetica", "", 9)
		for _, skill := range data.Skills {
			pdf.SetX(8)
			pdf.CellFormat(54, 4, "• "+skill, "", 1, "L", false, 0, "")
		}
	}

	pdf.SetXY(78, 15)
	pdf.SetFont("Helvetica", "B", 12)
	pdf.SetTextColor(r, g, b)
	pdf.CellFormat(0, 7, "Summary", "", 1, "L", false, 0, "")
	pdf.SetX(78)
	pdf.SetFont("Helvetica", "", fontSize)
	pdf.SetTextColor(40, 40, 40)
	pdf.MultiCell(120, 5, data.PersonalInfo.Summary, "", "L", false)

	if len(data.Experience) > 0 {
		pdf.SetXY(78, pdf.GetY()+6)
		pdf.SetFont("Helvetica", "B", 12)
		pdf.SetTextColor(r, g, b)
		pdf.CellFormat(0, 7, "Experience", "", 1, "L", false, 0, "")
		for _, exp := range data.Experience {
			pdf.SetX(78)
			writeExperienceEntry(pdf, exp, fontSize, r, g, b)
		}
	}

	if len(data.Education) > 0 {
		pdf.SetXY(78, pdf.GetY()+4)
		pdf.SetFont("Helvetica", "B", 12)
		pdf.SetTextColor(r, g, b)
		pdf.CellFormat(0, 7, "Education", "", 1, "L", false, 0, "")
		for _, edu := range data.Education {
			pdf.SetX(78)
			pdf.SetFont("Helvetica", "B", fontSize)
			pdf.SetTextColor(40, 40, 40)
			pdf.CellFormat(0, 5, fmt.Sprintf("%s %s", edu.Degree, edu.Field), "", 1, "L", false, 0, "")
			pdf.SetX(78)
			pdf.SetFont("Helvetica", "", fontSize-1)
			pdf.CellFormat(0, 4, edu.Institution, "", 1, "L", false, 0, "")
		}
	}

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func generateMinimalPDF(data models.ResumeData) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(25, 25, 25)
	pdf.AddPage()

	fontSize := float64(data.Customization.FontSize)
	if fontSize < 9 {
		fontSize = 11
	}

	pdf.SetFont("Helvetica", "B", 20)
	pdf.SetTextColor(20, 20, 20)
	pdf.CellFormat(0, 10, data.PersonalInfo.FullName, "", 1, "C", false, 0, "")

	pdf.SetFont("Helvetica", "", 9)
	pdf.SetTextColor(120, 120, 120)
	contact := joinNonEmpty([]string{data.PersonalInfo.Email, data.PersonalInfo.Phone, data.PersonalInfo.Location}, "  ·  ")
	pdf.CellFormat(0, 5, contact, "", 1, "C", false, 0, "")
	pdf.Ln(8)

	pdf.SetDrawColor(200, 200, 200)
	pdf.Line(25, pdf.GetY(), 185, pdf.GetY())
	pdf.Ln(6)

	pdf.SetFont("Helvetica", "", fontSize)
	pdf.SetTextColor(50, 50, 50)
	pdf.MultiCell(0, 5, data.PersonalInfo.Summary, "", "C", false)

	for _, section := range []struct {
		title string
		fn    func()
	}{
		{"EXPERIENCE", func() {
			for _, exp := range data.Experience {
				pdf.SetFont("Helvetica", "B", fontSize)
				pdf.CellFormat(0, 5, exp.Position, "", 1, "C", false, 0, "")
				pdf.SetFont("Helvetica", "", fontSize-1)
				pdf.SetTextColor(100, 100, 100)
				pdf.CellFormat(0, 4, fmt.Sprintf("%s · %s", exp.Company, formatDateRange(exp.StartDate, exp.EndDate, exp.Current)), "", 1, "C", false, 0, "")
				pdf.SetTextColor(50, 50, 50)
				pdf.MultiCell(0, 5, exp.Description, "", "C", false)
				pdf.Ln(2)
			}
		}},
		{"EDUCATION", func() {
			for _, edu := range data.Education {
				pdf.SetFont("Helvetica", "B", fontSize)
				pdf.CellFormat(0, 5, fmt.Sprintf("%s %s", edu.Degree, edu.Field), "", 1, "C", false, 0, "")
				pdf.SetFont("Helvetica", "", fontSize-1)
				pdf.SetTextColor(100, 100, 100)
				pdf.CellFormat(0, 4, edu.Institution, "", 1, "C", false, 0, "")
				pdf.SetTextColor(50, 50, 50)
				pdf.Ln(2)
			}
		}},
		{"SKILLS", func() {
			pdf.SetFont("Helvetica", "", fontSize)
			pdf.MultiCell(0, 5, strings.Join(data.Skills, "  ·  "), "", "C", false)
		}},
	} {
		if section.title == "EXPERIENCE" && len(data.Experience) == 0 {
			continue
		}
		if section.title == "EDUCATION" && len(data.Education) == 0 {
			continue
		}
		if section.title == "SKILLS" && len(data.Skills) == 0 {
			continue
		}
		pdf.Ln(4)
		pdf.SetFont("Helvetica", "B", 8)
		pdf.SetTextColor(150, 150, 150)
		pdf.CellFormat(0, 5, section.title, "", 1, "C", false, 0, "")
		pdf.Ln(2)
		section.fn()
	}

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func drawSectionHeader(pdf *gofpdf.Fpdf, title string, r, g, b int) {
	pdf.SetFont("Helvetica", "B", 12)
	pdf.SetTextColor(r, g, b)
	pdf.CellFormat(0, 7, title, "", 1, "L", false, 0, "")
	y := pdf.GetY()
	pdf.SetDrawColor(r, g, b)
	pdf.Line(20, y, 190, y)
	pdf.Ln(2)
}

func writeExperienceEntry(pdf *gofpdf.Fpdf, exp models.Experience, fontSize float64, r, g, b int) {
	pdf.SetFont("Helvetica", "B", fontSize)
	pdf.SetTextColor(40, 40, 40)
	pdf.CellFormat(0, 5, fmt.Sprintf("%s — %s", exp.Position, exp.Company), "", 1, "L", false, 0, "")
	meta := joinNonEmpty([]string{formatDateRange(exp.StartDate, exp.EndDate, exp.Current), exp.Location}, " | ")
	if meta != "" {
		pdf.SetFont("Helvetica", "I", 9)
		pdf.SetTextColor(100, 100, 100)
		pdf.CellFormat(0, 4, meta, "", 1, "L", false, 0, "")
	}
	if strings.TrimSpace(exp.CompanyDescription) != "" {
		pdf.SetFont("Helvetica", "I", fontSize-1)
		if fontSize-1 < 8 {
			pdf.SetFont("Helvetica", "I", 8)
		}
		pdf.SetTextColor(90, 90, 90)
		pdf.MultiCell(0, 4, stripRichMarkup(exp.CompanyDescription), "", "L", false)
	}
	pdf.SetFont("Helvetica", "", fontSize)
	pdf.SetTextColor(60, 60, 60)
	for _, line := range strings.Split(exp.Description, "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		pdf.CellFormat(4, 4, "•", "", 0, "L", false, 0, "")
		pdf.MultiCell(0, 4, stripRichMarkup(line), "", "L", false)
	}
	pdf.Ln(1)
}

func joinNonEmpty(parts []string, sep string) string {
	var out []string
	for _, p := range parts {
		if strings.TrimSpace(p) != "" {
			out = append(out, strings.TrimSpace(p))
		}
	}
	return strings.Join(out, sep)
}

func formatDateRange(start, end string, current bool) string {
	start = formatMonth(start)
	if current {
		if start != "" {
			return start + " — Present"
		}
		return "Present"
	}
	end = formatMonth(end)
	if start != "" && end != "" {
		return start + " — " + end
	}
	return start + end
}

func formatMonth(s string) string {
	s = strings.TrimSpace(s)
	if s == "" {
		return ""
	}
	if len(s) == 4 {
		return s
	}
	if len(s) >= 7 {
		if t, err := time.Parse("2006-01", s[:7]); err == nil {
			return t.Format("Jan 2006")
		}
	}
	return s
}

func hexToRGB(hex string) (int, int, int) {
	hex = strings.TrimPrefix(hex, "#")
	if len(hex) != 6 {
		return 37, 99, 235
	}
	var r, g, b int
	fmt.Sscanf(hex, "%02x%02x%02x", &r, &g, &b)
	return r, g, b
}
