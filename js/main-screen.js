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
      const uuid = generateUUID();
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
      Sentry.captureException(reader.error);
      this.processing(false);
    };

    reader.readAsArrayBuffer(file);
  }

  async playFile(file) {
    if (!file.type.includes('audio')) return;

    const context = new AudioContext();
    const content = await localforage.getItem(file.uuid);

    const buffer = await context.decodeAudioData(content);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start();
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

function generateUUID() { // Public Domain/MIT
  var d = new Date().getTime();//Timestamp
  var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16;//random number between 0 and 16
    if(d > 0){//Use timestamp until depleted
      r = (d + r)%16 | 0;
      d = Math.floor(d/16);
    } else {//Use microseconds since page-load if supported
      r = (d2 + r)%16 | 0;
      d2 = Math.floor(d2/16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
