import { parseRichText } from '../utils/richText';

interface Props {
  text: string;
  className?: string;
}

export function RichText({ text, className }: Props) {
  const segments = parseRichText(text);

  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (seg.type === 'bold') {
          return <strong key={i}>{seg.text}</strong>;
        }
        if (seg.type === 'italic') {
          return <em key={i}>{seg.text}</em>;
        }
        return <span key={i}>{seg.text}</span>;
      })}
    </span>
  );
}
