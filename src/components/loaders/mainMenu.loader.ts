import { fetchJSON } from "../../logic/application/fetchJSON";

export async function mainMenuLoader() {
  const quotes = await fetchJSON("quotes");
  return quotes;
}
