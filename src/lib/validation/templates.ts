import { Validation } from "./ValidationChecker";
import { Required } from "./validators/Required";

export function userValidator(): Validation {
  return {
    user: {
      validator: new Required({
        message: "please specify a valid user!",
      }),
      dependsOn: ["username"],
    },
  };
}
