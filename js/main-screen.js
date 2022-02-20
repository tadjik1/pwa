export default class MainScreenViewModel {
  processing = ko.observable(true);
  files = ko.observableArray();
  inputRef = document.getElementById('file-input');

  constructor() {
    this.playFile = this.playFile.bind(this);
    this.removeFile = this.removeFile.bind(this);

    this.listFiles();
  }

  async listFiles() {
    const files = await localforage.getItem('files');
    this.files(files || []);
    this.processing(false);
  }

  openFileSelection() {
    this.inputRef.click();
  }

  addFile(vm, event) {
    if (event.target.files.length === 0) return;
    if (this.processing()) return;

    this.processing(true);

    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const uuid = crypto.randomUUID();
      const entity = {
        uuid: uuid,
        name: file.name,
        size: file.size,
        type: file.type,
      };

      this.files.push(entity);
      await localforage.setItem(uuid, reader.result);
      await localforage.setItem('files', this.files());

      this.processing(false);
    };
    reader.onerror = (event) => {
      this.processing(false);
    };

    reader.readAsArrayBuffer(file);
  }

  async playFile(file) {
    if (!file.type.includes('audio')) return;

    const content = await localforage.getItem(file.uuid);
    const objectURL = URL.createObjectURL(new Blob([content]));
    const audio = document.createElement('audio');
    audio.autoplay = true;
    audio.onended = () => URL.revokeObjectURL(objectURL);
    audio.src = objectURL;
  }

  async removeFile(_file) {
    const files = this.files();
    const file = files.find(f => f.uuid === _file.uuid);
    if (!file) return;

    this.files(files.filter(f => f.uuid !== _file.uuid));

    await localforage.removeItem(file.uuid);
    await localforage.setItem('files', this.files());
  }

  humanizeSize(size) {
    let sOutput = size + " bytes";
    // optional code for multiples approximation
    const aMultiples = ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    for (let nMultiple = 0, nApprox = size / 1024; nApprox > 1; nApprox /= 1024, nMultiple++) {
      sOutput = nApprox.toFixed(3) + " " + aMultiples[nMultiple];
    }

    return sOutput;
  }
}
