import { CraNoiseMapMigPage } from './app.po';

describe('cra-noise-map-mig App', function() {
  let page: CraNoiseMapMigPage;

  beforeEach(() => {
    page = new CraNoiseMapMigPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
