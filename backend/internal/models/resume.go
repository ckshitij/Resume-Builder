package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type TemplateID string

const (
	TemplateClassic TemplateID = "classic"
	TemplateModern  TemplateID = "modern"
	TemplateMinimal TemplateID = "minimal"
	TemplateATS     TemplateID = "ats"
)

type SectionType string

const (
	SectionPersonal       SectionType = "personal"
	SectionSummary        SectionType = "summary"
	SectionExperience     SectionType = "experience"
	SectionEducation      SectionType = "education"
	SectionSkills         SectionType = "skills"
	SectionProjects       SectionType = "projects"
	SectionCertifications SectionType = "certifications"
	SectionLanguages      SectionType = "languages"
	SectionCustom         SectionType = "custom"
)

// ATSStandardTitles maps section types to headings parsers recognize.
var ATSStandardTitles = map[SectionType]string{
	SectionSummary:        "Professional Summary",
	SectionExperience:     "Work Experience",
	SectionEducation:      "Education",
	SectionSkills:         "Skills",
	SectionProjects:       "Projects",
	SectionCertifications: "Certifications",
	SectionLanguages:      "Languages",
}

type Customization struct {
	TemplateID   TemplateID `json:"templateId"`
	PrimaryColor string     `json:"primaryColor"`
	FontFamily   string     `json:"fontFamily"`
	FontSize     int        `json:"fontSize"`
	ATSMode      bool       `json:"atsMode"`
}

type Section struct {
	ID      string      `json:"id"`
	Type    SectionType `json:"type"`
	Title   string      `json:"title"`
	Enabled bool        `json:"enabled"`
}

type PersonalInfo struct {
	FullName string `json:"fullName"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Location string `json:"location"`
	Website  string `json:"website"`
	LinkedIn string `json:"linkedIn"`
	GitHub   string `json:"github"`
	Summary  string `json:"summary"`
}

type Experience struct {
	ID                 string `json:"id"`
	Company            string `json:"company"`
	Position           string `json:"position"`
	Location           string `json:"location"`
	StartDate          string `json:"startDate"`
	EndDate            string `json:"endDate"`
	Current            bool   `json:"current"`
	CompanyDescription string `json:"companyDescription"`
	Description        string `json:"description"`
}

type Education struct {
	ID          string `json:"id"`
	Institution string `json:"institution"`
	Degree      string `json:"degree"`
	Field       string `json:"field"`
	Location    string `json:"location"`
	StartDate   string `json:"startDate"`
	EndDate     string `json:"endDate"`
	GPA         string `json:"gpa"`
}

type Project struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	URL          string `json:"url"`
	Description  string `json:"description"`
	Technologies string `json:"technologies"`
}

type Certification struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Issuer string `json:"issuer"`
	Date  string `json:"date"`
	URL   string `json:"url"`
}

type Language struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Proficiency string `json:"proficiency"`
}

type CustomSection struct {
	ID      string `json:"id"`
	SectionID string `json:"sectionId"`
	Content string `json:"content"`
}

type ResumeData struct {
	PersonalInfo    PersonalInfo      `json:"personalInfo"`
	Sections        []Section         `json:"sections"`
	Experience      []Experience      `json:"experience"`
	Education       []Education       `json:"education"`
	Skills          []string          `json:"skills"`
	Projects        []Project         `json:"projects"`
	Certifications  []Certification   `json:"certifications"`
	Languages       []Language        `json:"languages"`
	CustomSections  []CustomSection   `json:"customSections"`
	Customization   Customization     `json:"customization"`
}

func DefaultSections() []Section {
	return []Section{
		{ID: "sec-personal", Type: SectionPersonal, Title: "Contact", Enabled: true},
		{ID: "sec-summary", Type: SectionSummary, Title: ATSStandardTitles[SectionSummary], Enabled: true},
		{ID: "sec-experience", Type: SectionExperience, Title: ATSStandardTitles[SectionExperience], Enabled: true},
		{ID: "sec-education", Type: SectionEducation, Title: ATSStandardTitles[SectionEducation], Enabled: true},
		{ID: "sec-skills", Type: SectionSkills, Title: ATSStandardTitles[SectionSkills], Enabled: true},
		{ID: "sec-projects", Type: SectionProjects, Title: ATSStandardTitles[SectionProjects], Enabled: true},
		{ID: "sec-certifications", Type: SectionCertifications, Title: ATSStandardTitles[SectionCertifications], Enabled: false},
		{ID: "sec-languages", Type: SectionLanguages, Title: ATSStandardTitles[SectionLanguages], Enabled: false},
	}
}

func DefaultResumeData() ResumeData {
	return ResumeData{
		PersonalInfo: PersonalInfo{
			FullName: "Jane Doe",
			Email:    "jane.doe@email.com",
			Phone:    "+1 (555) 123-4567",
			Location: "San Francisco, CA",
			Summary:  "Experienced software engineer with a passion for building elegant, user-focused applications.",
		},
		Sections: DefaultSections(),
		Experience: []Experience{
			{
				ID:          uuid.New().String(),
				Company:     "Tech Corp",
				Position:    "Senior Software Engineer",
				Location:    "San Francisco, CA",
				StartDate:   "2021-01",
				EndDate:     "",
				Current:     true,
				Description: "Led development of microservices architecture serving 1M+ users.\nImproved system performance by 40% through optimization.",
			},
		},
		Education: []Education{
			{
				ID:          uuid.New().String(),
				Institution: "University of California",
				Degree:      "B.S.",
				Field:       "Computer Science",
				StartDate:   "2015-09",
				EndDate:     "2019-05",
				GPA:         "3.8",
			},
		},
		Skills: []string{"Go", "TypeScript", "React", "PostgreSQL", "Docker", "AWS"},
		Projects: []Project{
			{
				ID:           uuid.New().String(),
				Name:         "Resume Builder",
				URL:          "https://github.com/example/resume-builder",
				Description:  "Full-stack resume builder with PDF and DOCX export.",
				Technologies: "React, Go, PostgreSQL",
			},
		},
		Customization: Customization{
			TemplateID:   TemplateATS,
			PrimaryColor: "#1a1a1a",
			FontFamily:   "Arial, Helvetica, sans-serif",
			FontSize:     11,
			ATSMode:      true,
		},
	}
}

type Resume struct {
	ID        uuid.UUID  `json:"id"`
	Title     string     `json:"title"`
	Data      ResumeData `json:"data"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
}

type CreateResumeRequest struct {
	Title string     `json:"title"`
	Data  ResumeData `json:"data"`
}

type UpdateResumeRequest struct {
	Title string     `json:"title"`
	Data  ResumeData `json:"data"`
}

func (d *ResumeData) UnmarshalJSON(b []byte) error {
	type Alias ResumeData
	aux := &struct {
		*Alias
	}{
		Alias: (*Alias)(d),
	}
	if err := json.Unmarshal(b, &aux); err != nil {
		return err
	}
	if len(d.Sections) == 0 {
		d.Sections = DefaultSections()
	}
	if d.Customization.TemplateID == "" {
		d.Customization.TemplateID = TemplateATS
	}
	if d.Customization.PrimaryColor == "" {
		d.Customization.PrimaryColor = "#1a1a1a"
	}
	if d.Customization.FontFamily == "" {
		d.Customization.FontFamily = "Arial, Helvetica, sans-serif"
	}
	if d.Customization.FontSize == 0 {
		d.Customization.FontSize = 11
	}
	return nil
}

func (d ResumeData) IsSectionEnabled(t SectionType) bool {
	for _, s := range d.Sections {
		if s.Type == t {
			return s.Enabled
		}
	}
	return false
}

func (d ResumeData) SectionTitle(t SectionType) string {
	for _, s := range d.Sections {
		if s.Type == t && s.Title != "" {
			return s.Title
		}
	}
	if title, ok := ATSStandardTitles[t]; ok {
		return title
	}
	return string(t)
}

func (d ResumeData) EnabledSections() []Section {
	var out []Section
	for _, s := range d.Sections {
		if s.Enabled && s.Type != SectionPersonal {
			out = append(out, s)
		}
	}
	return out
}

func (d ResumeData) EffectiveTemplate() TemplateID {
	if d.Customization.ATSMode || d.Customization.TemplateID == TemplateATS {
		return TemplateATS
	}
	return d.Customization.TemplateID
}
