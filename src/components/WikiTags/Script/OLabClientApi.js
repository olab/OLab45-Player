// main view class
export class OLabClientApi {
  constructor(params) {
    var vm = this;

    vm.scopedObjects = params.scopedObjects;
    vm.dynammicObjects = params.dynammicObjects;

    // these are the methods/properties we expose to the outside
    vm.service = {
      hello: vm.hello,
    };

    return vm.service;
  }

  hello() {
    console.log("hello from OlabClientAPI.");
  }
}
