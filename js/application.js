import MainScreenViewModel from './main-screen.js';

ko.components.register('main-screen', {
  viewModel: MainScreenViewModel,
  template: { element: 'main-screen' },
});

class AppViewModel {
  db = {
    name: 'pwa',
    version: 1,
    description: 'db for storing files locally'
  };

  screen = ko.observable('main-screen');

  constructor() {
    localforage.config({
      name: this.db.name,
      version: this.db.version,
      description: this.db.description,
      driver: [localforage.INDEXEDDB],
    });
  }
}

ko.applyBindings(new AppViewModel());
