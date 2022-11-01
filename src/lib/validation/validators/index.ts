import { TimeRangeValidator } from "./TimeRange";
import { ChoicesValidator } from "./Choices";
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
  TimeRangeValidator,
  ChoicesValidator,
};
