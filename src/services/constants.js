module.exports = Object.freeze({
  BROADCAST_SENDER: "_BROADCAST_",
  TURKER_SENDER: "Turker",

  CMD_ADDTURKEE: "ADDATTENDEE",
  CMD_DELLEARNER: "DELATTENDEE",

  SIGNALCMD_REGISTERLEARNER: "registerLearner",
  SIGNALCMD_REGISTERTURKER: "registerModerator",
  SIGNALCMD_ASSIGNTURKEE: "assignAttendee",
  SIGNALMETHOD_MESSAGE: "message",
  SIGNALCMD_ROOMASSIGNED: "roomassignment",
  SIGNALCMD_ROOMCLOSE: "roomclose",
  SIGNALCMD_ROOMREJOINED: "roomrejoined",
  SIGNALCMD_LEARNER_UNASSIGNED: "learnerunassignment",
  SIGNALCMD_ATRIUMASSIGNED: "atriumassignment",
  SIGNALMETHOD_SYSTEM_MESSAGE: "systemmessage",
  SIGNALCMD_UNASSIGNED: "UNASSIGNED",
  SIGNALCMD_ATRIUMUPDATE: "atriumupdate",
  SIGNALCMD_CONNECTIONSTATUS: "CONNECTSTATUS",
  SIGNALCMD_TURKER_DISCONNECTED: "moderatordisconnected",
  SIGNALCMD_LEARNER_LIST: "learnerlist",
  SIGNALCMD_LEARNER_ASSIGNED: "learnerassignment",
  SIGNALCMD_TURKER_ASSIGNED: "moderatorassignment",
  SIGNALCMD_SERVER_ERROR: "servererror",
  SIGNALCMD_JUMP_NODE: "jumpnode",

  SIGNALCMD_TURKERCONNECT: "TURKERCONNECT",
  SIGNALCMD_TURKEECONNECT: "TURKEECONNECT",
  SIGNALCMD_TURKERDISCONNECT: "TURKERDISCONNECT",
  SIGNALCMD_TURKEEDISCONNECT: "TURKEEDISCONNECT",
  SIGNALCMD_TURKEELIST: "TURKEELIST",
  SIGNALCMD_TURKEELOAD: "TURKEELOAD",
  SIGNALCMD_TURKEEUNLOAD: "TURKEEUNLOAD",
  SIGNALCMD_TURKEEMESSAGE: "TURKEEMESSAGE",

  SIGNALCMD_SYSTEM_BROADCAST: "systemBroadcastMessage",
  SIGNALCMD_COHORT_BROADCAST: "cohortBroadcastMessage",

  SIGNALCMD_ECHO: "echo",
  SIGNALCMD_COMMAND: "command",
  SIGNALCMD_CONNECTED: "CONNECTED",
  SIGNALCMD_DISCONNECTED: "DISCONNECTED",

  TURKER_MAX_LOAD: 8,

  CLASSNAME_INACTIVE: "status-inactive",
  CLASSNAME_ACTIVE: "status-active",

  INCOMING_BOX_CLASS: "incoming-box",
  SEND_BUTTON_CLASS: "send-button",
  CLEAR_BUTTON_CLASS: "clear-button",
  DISCONNECT_BUTTON_CLASS: "disconnect-button",
  MESSAGEENTRY_BOX_CLASS: "message-entry-box",
  MESSAGE_BOX_CLASS: "message-box",
  STATUS_TEXT_CLASS: "status-text",
  PARTNER_ID_CLASS: "partner-name",
  BUTTON_BOX_CLASS: "button-box",

  TOKEN_TYPE_EXTERNAL: "external",
  TOKEN_TYPE_ANONYMOUS: "anonymous",
  TOKEN_TYPE_NATIVE: "native",
});
