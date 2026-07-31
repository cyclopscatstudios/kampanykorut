import { fetchJSON } from "@/logic/application";

export async function mainMenuLoader() {
  const quotes = await fetchJSON("quotes");
  return quotes;
}
