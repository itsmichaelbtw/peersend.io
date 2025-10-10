export class ProgressThrottler {
  private lastPercentage: number = 0;
  private lastUpdate: number = 0;
  private threshold: number;
  private minimumTimeDelta: number;

  constructor(threshold: number, time: number) {
    this.threshold = threshold;
    this.minimumTimeDelta = time;
    this.lastUpdate = performance.now();
  }

  public canUpdate(currentPercentage: number): boolean {
    const now = performance.now();
    const percentageDiff = currentPercentage - this.lastPercentage;
    const timeDiff = now - this.lastUpdate;

    if (currentPercentage >= 100) {
      this.lastPercentage = currentPercentage;
      this.lastUpdate = now;
      return true;
    }

    if (percentageDiff >= this.threshold && timeDiff >= this.minimumTimeDelta) {
      this.lastPercentage = currentPercentage;
      this.lastUpdate = now;
      return true;
    }

    return false;
  }

  public reset(): void {
    this.lastPercentage = 0;
    this.lastUpdate = performance.now();
  }
}
