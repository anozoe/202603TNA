import { ERROR_MESSAGES } from "../constants/Message";

export const getErrorMessage = (code, ...args) => {
  const message = ERROR_MESSAGES[code] || ERROR_MESSAGES.DEFAULT;
  return message.replace(/\{(\d+)\}/g, (match, index) => args[index]);
};
