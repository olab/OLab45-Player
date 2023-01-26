// main view class
class OlabClientAPI {

  constructor(params) {

    var vm = this;

    vm.player = params.olabPlayer;

    // these are the methods/properties we expose to the outside
    vm.service = {
      hello: hello,
      getConstant: getConstant,
      getQuestion: getQuestion,
      getCounter: getCounter,
      log: vm.player.instance.log
    };

    vm.player.utilities.Log("Created OlabClientAPI.");

    return vm.service;
  }

  getConstant(id) {

    try {

      var params = [];
      params.id = id;

      return new OLabConstant(vm, params);

    } catch (e) {

      vm.player.utilities.LogError(e.message);

    }

    return null;

  }

  getCounter(id) {

    try {

      var params = [];
      params.id = id;

      return new OLabCounter(vm, params);

    } catch (e) {

      vm.player.utilities.LogError(e.message);

    }

    return null;

  }

  getQuestion(id) {

    try {

      var params = [];
      params.id = id;

      var question = vm.player.getQuestion(params.id);
      var questionType = question.questionType;

      if (questionType === 1) {
        return new OLabQuestionSingleLine(vm, params);
      }
      else if (questionType === 3) {
        return new OLabQuestionMultipleChoice(vm, params);
      }
      else if (questionType === 4) {
        return new OLabQuestionRadio(vm, params);
      }

    } catch (e) {

      vm.player.utilities.LogError(e.message);

    }

    return null;
  }

  hello() {

    alert("hello from OlabClientAPI.");
    var t = vm.player.getConstant("SystemTime");
    alert("time is: " + t['value']);
  }

};

export default OlabClientAPI;