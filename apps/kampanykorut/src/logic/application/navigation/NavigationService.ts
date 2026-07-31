export interface NavigationService {
  go(path: string): void;
  back(): void;
}
