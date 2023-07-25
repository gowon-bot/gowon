import { ChoicesValidator } from "./Choices";
import { DateRangeValidator } from "./DateRange";
import { LengthRangeValidator } from "./LengthRange";
import { NumberValidator } from "./Number";
import { RangeValidator } from "./Range";
import {
  RequiredAndValidator,
  RequiredOrValidator,
  RequiredValidator,
} from "./Required";

export const validators = {
  LengthRangeValidator,
  NumberValidator,
  RangeValidator,
  RequiredValidator,
  RequiredAndValidator,
  RequiredOrValidator,
  DateRangeValidator,
  ChoicesValidator,

  positiveNumberValidator: new RangeValidator({
    min: 1,
    message: "Please enter a positive number!",
  }),
};
