import { TrackedError } from "../../database/entity/meta/Error";

export async function generateErrors(): Promise<TrackedError[]> {
  let errors = await TrackedError.find({
    order: {
      occurrenceCount: "DESC",
    },
  });

  return errors;
}
