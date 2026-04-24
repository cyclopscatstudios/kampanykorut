import { singleton } from "tsyringe";

@singleton()
export class AssetService {
  getAssetUrl(path: string): string {
    return path;
  }
}
