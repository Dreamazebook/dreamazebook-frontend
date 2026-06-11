const CONTENT_SQUARE_URL = process.env.NEXT_PUBLIC_CONTENTSQUARE_SCRIPT_URL;

export default function ContentSquare() {
  if (!CONTENT_SQUARE_URL) return null;
  return <script src={CONTENT_SQUARE_URL} async />;
}
