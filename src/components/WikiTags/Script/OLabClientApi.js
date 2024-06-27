import {
  OLabTextQuestion,
  OLabSingleChoiceQuestion,
  OLabMultipleChoiceQuestion,
  OLabSliderQuestion,
  OLabDropdownQuestion,
  OLabDragAndDropQuestion,
} from "./OLabQuestion";

// main view class
export class OLabClientApi {
  constructor(params) {
    var vm = this;

    vm.scopedObjects = params.scopedObjects;
    vm.dynammicObjects = params.dynammicObjects;

    // these are the methods/properties we expose to the outside
    vm.service = {
      scopedObjects: vm.scopedObjects,
      dynammicObjects: vm.dynammicObjects,
      getDragAndDropQuestion: vm.getDragAndDropQuestion,
      getDropDownQuestion: vm.getDropDownQuestion,
      getMultipleChoiceQuestion: vm.getMultipleChoiceQuestion,
      getSingleChoiceQuestion: vm.getSingleChoiceQuestion,
      getSliderQuestion: vm.getSliderQuestion,
      getTextQuestion: vm.getTextQuestion,
      hello: vm.hello,
    };

    vm.hello();

    return vm.service;
  }

  hello() {
    console.log("hello from OLabClientApi.");
  }

  getSliderQuestion(id) {
    var question = new OLabSliderQuestion(this, id);
    return question;
  }

  getDropDownQuestion(id) {
    var question = new OLabDropdownQuestion(this, id);
    return question;
  }

  getDragAndDropQuestion(id) {
    var question = new OLabDragAndDropQuestion(this, id);
    return question;
  }

  getTextQuestion(id) {
    var question = new OLabTextQuestion(this, id);
    return question;
  }

  getMultipleChoiceQuestion(id) {
    var question = new OLabMultipleChoiceQuestion(this, id);
    return question;
  }

  getSingleChoiceQuestion(id) {
    var question = new OLabSingleChoiceQuestion(this, id);
    return question;
  }
}
