import { Validation } from "./ValidationChecker";
import { RequiredValidator } from "./validators/Required";

export function userValidator(): Validation {
  return {
    user: {
      validator: new RequiredValidator({
        message: "please specify a valid user!",
      }),
      dependsOn: ["username"],
    },
  };
}
