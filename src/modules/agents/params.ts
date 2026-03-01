/*
we created this file because we cannot access a hook in the server component.
as we want to match the initial load with the server component “agent.page.tsx” to avoid unauthorized errors
*/

import { createLoader, parseAsInteger, parseAsString } from "nuqs/server";
import { DEFAULT_PAGE } from "@/constants";

export const filtersSearchParams = { //objet key:value

    search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),

    page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
}

export const loadSearchParams = createLoader(filtersSearchParams); //now we have equivalent of server component