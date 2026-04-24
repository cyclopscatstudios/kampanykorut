import type { NavigateFunction } from "react-router-dom";
import type { NavigationService } from "./NavigationService";
import { createLogger } from "../../logger";

const log = createLogger("NavigationService");

export class Navigation implements NavigationService {
  private navigate: NavigateFunction | null = null;

  setNavigate(navigate: NavigateFunction) {
    this.navigate = navigate;
  }

  go(path: string) {
    if (!this.navigate) {
      log.error("Navigate function is not set");
      return;
    }
    this.navigate(path);
  }

  back() {
    if (!this.navigate) {
      log.error("Navigate function is not set");
      return;
    }
    this.navigate(-1);
  }
}
