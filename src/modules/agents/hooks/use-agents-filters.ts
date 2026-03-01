import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { DEFAULT_PAGE } from "@/constants";

export const useAgentsFilters = () => { // it acts like useState()
  return useQueryStates({
    search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
     //if you get empty string - simply remove this "?search=test" from the url "to enhance user experience"
    page: parseAsInteger
      .withDefault(DEFAULT_PAGE)
      .withOptions({ clearOnDefault: true }),
  });
};
