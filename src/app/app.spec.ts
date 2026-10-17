import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatProgressBarHarness } from '@angular/material/progress-bar/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { App } from './app';
import { AppHarness } from './app.harness';

@Component({
  imports: [App],
  template: '<app-root />',
})
class AppHost {}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppHost],
    }).compileComponents();
  });

  it('renders the header progress bar', async () => {
    const fixture = TestBed.createComponent(AppHost);
    await fixture.whenStable();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const bar = await loader.getHarness(MatProgressBarHarness);

    expect(await bar.getMode()).toBe('determinate');
  });

  it('renders the app title in the header', async () => {
    const fixture = TestBed.createComponent(AppHost);
    await fixture.whenStable();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const harness = await loader.getHarness(AppHarness);

    expect(await harness.getTitleText()).toContain('Misiones');
  });
});
