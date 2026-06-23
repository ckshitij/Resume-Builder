package export

import "regexp"

var (
	boldMarkup   = regexp.MustCompile(`\*\*(.+?)\*\*`)
	italicMarkup = regexp.MustCompile(`\*(.+?)\*`)
)

func stripRichMarkup(input string) string {
	out := boldMarkup.ReplaceAllString(input, "$1")
	out = italicMarkup.ReplaceAllString(out, "$1")
	return out
}
