import { ComponentHarness } from '@angular/cdk/testing';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';

export class ZoneSectionHarness extends ComponentHarness {
  static hostSelector = 'app-zone-section';

  private readonly headerButton = this.locatorFor('[data-testid="zone-header"]');
  private readonly checkboxes = this.locatorForAll(MatCheckboxHarness);

  async toggleCollapse(): Promise<void> {
    await (await this.headerButton()).click();
  }

  async isExpanded(): Promise<boolean> {
    return (await (await this.headerButton()).getAttribute('aria-expanded')) === 'true';
  }

  async toggleQuest(questName: string): Promise<void> {
    await (await this.questCheckbox(questName)).toggle();
  }

  async isQuestChecked(questName: string): Promise<boolean> {
    return (await this.questCheckbox(questName)).isChecked();
  }

  private async questCheckbox(questName: string): Promise<MatCheckboxHarness> {
    const label = `Completar misión ${questName}`;
    const checkboxes = await this.checkboxes();
    for (const checkbox of checkboxes) {
      if ((await checkbox.getAriaLabel()) === label) {
        return checkbox;
      }
    }
    throw new Error(`No quest checkbox labeled "${label}"`);
  }
}
