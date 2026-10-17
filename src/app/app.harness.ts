import { ComponentHarness } from '@angular/cdk/testing';

export class AppHarness extends ComponentHarness {
  static hostSelector = 'app-root';

  private readonly title = this.locatorFor('h1');

  async getTitleText(): Promise<string> {
    return (await this.title()).text();
  }
}
