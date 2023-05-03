import { ChoicesValidator } from "./Choices";
import { LengthRangeValidator } from "./LengthRange";
import { NumberValidator } from "./Number";
import { RangeValidator } from "./Range";
import {
  RequiredAndValidator,
  RequiredOrValidator,
  RequiredValidator,
} from "./Required";
import { TimeRangeValidator } from "./TimeRange";

export const validators = {
  LengthRangeValidator,
  NumberValidator,
  RangeValidator,
  RequiredValidator,
  RequiredAndValidator,
  RequiredOrValidator,
  TimeRangeValidator,
  ChoicesValidator,

  positiveNumberValidator: new RangeValidator({
    min: 1,
    message: "Please enter a positive number!",
  }),
};
