import { parseAsInteger, parseAsString, useQueryStates, parseAsStringEnum } from "nuqs";
import { DEFAULT_PAGE } from "@/constants";
import {MeetingStatus} from "../types";

export const useMeetingsFilters = () => { // it acts like useState()
  return useQueryStates({
    search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
     //if you get empty string - simply remove this "?search=test" from the url "to enhance user experience"
    page: parseAsInteger
      .withDefault(DEFAULT_PAGE)
      .withOptions({ clearOnDefault: true }),
    status: parseAsStringEnum(Object.values(MeetingStatus)),
    agentId: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  });
};
