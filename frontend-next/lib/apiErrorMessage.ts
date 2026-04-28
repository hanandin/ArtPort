type ApiErrorPayload = {
  code?: string;
  message?: string;
};

const CODE_TO_MESSAGE: Record<string, string> = {
  USERNAME_ASCII_ONLY:
    "Username must use English letters, numbers, and underscores only.",
  USERNAME_PROFANITY:
    "Username contains inappropriate language. Please choose a different one.",
  USERNAME_ALREADY_EXISTS:
    "That username is already taken. Please choose a different one.",
  USERNAME_REQUIRED:
    "Username cannot be empty.",
  EMAIL_ALREADY_EXISTS:
    "An account with that email already exists.",
  AUTH_REQUIRED_FIELDS:
    "Username, email, and password are all required.",
  PASSWORD_WEAK:
    "Password is too weak. It must be at least 8 characters and include uppercase, lowercase, and a number.",
  PASSWORD_INVALID_CHARACTERS:
    "Password contains invalid characters. Use letters, numbers, and: !?@#$%^&*()_+-=",
  BIO_PROFANITY:
    "Bio contains inappropriate language. Please rephrase it.",
  BIO_TOO_LONG:
    "Bio cannot exceed 512 characters.",
  ARTWORK_TITLE_PROFANITY:
    "Title contains inappropriate language. Please rephrase it.",
  ARTWORK_DESCRIPTION_PROFANITY:
    "Description contains inappropriate language. Please rephrase it.",
  FOLDER_NAME_PROFANITY:
    "Folder name contains inappropriate language. Please rephrase it.",
  FOLDER_NAME_REQUIRED:
    "Folder name is required.",
  FOLDER_NAME_TOO_LONG:
    "Folder name must be less than 100 characters.",
  FEEDBACK_QUESTION_PROFANITY:
    "A feedback question contains inappropriate language. Please rephrase it.",
  FEEDBACK_DETAIL_PROFANITY:
    "A feedback help text contains inappropriate language. Please rephrase it.",
  FEEDBACK_OPTION_PROFANITY:
    "A feedback option contains inappropriate language. Please rephrase it.",
  FEEDBACK_TEXT_PROFANITY:
    "Your feedback text contains inappropriate language. Please rephrase it.",
};

export function getApiErrorMessage(
  payload: ApiErrorPayload | null | undefined,
  fallback: string,
): string {
  if (!payload) {
    return fallback;
  }

  const code =
    typeof payload.code === "string" ? payload.code.trim().toUpperCase() : "";

  if (code && CODE_TO_MESSAGE[code]) {
    return CODE_TO_MESSAGE[code];
  }

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  return fallback;
}
