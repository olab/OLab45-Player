// "use strict";
import { OLabApiObject } from "../OLabApiObject";
import { Log, LogInfo, LogError } from "../../../../utils/Logger";

export class OLabApiDomObject extends OLabApiObject {
  constructor(clientApi, id) {
    super(clientApi, id);
  }
}
