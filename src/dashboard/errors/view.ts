import { generateErrors } from "./logic";
import { numberDisplay } from "../../helpers";

export default async function (): Promise<string> {
  let errors = await generateErrors();

  return `
<h1>Errors</h1>
<ui>
${errors.map((error) => {
  return `<li><span style="font-family: monospace">${error.name}</span> (${numberDisplay(
    error.occurrenceCount,
    "occurrence"
  )})</li>`;
}).join("")}
</ui>
    `;
}
