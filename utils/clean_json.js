export function cleanJson(input) {
  if (!input) return input;

  const cleaned = input.replace(/```json\s*/gi, "").replace(/```/g, "");
  const output = cleaned.trim();

  const match = output.match(/\{[\s\S]*?\}/);
  if (match) return match[0];
  return output;
}
