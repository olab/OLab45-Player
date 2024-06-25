"use strict";

export class OLabObject {
  self = this;

  constructor(clientApi, params) {
    this.clientApi = clientApi;
    this.params = params;
    this.target = null;
    this.player = this.clientApi.player;
  }
}
