import toast from "react-hot-toast";

export function reportError(errorOrContext, userMessageOrError) {
  const hasContextMessage =
    typeof errorOrContext === "string" &&
    userMessageOrError &&
    typeof userMessageOrError !== "string";
  const error = hasContextMessage ? userMessageOrError : errorOrContext;
  const context = hasContextMessage ? errorOrContext : null;
  const userMessage =
    !hasContextMessage && typeof userMessageOrError === "string"
      ? userMessageOrError
      : null;

  if (import.meta.env.DEV) {
    if (context) {
      console.error(context, error);
    } else {
      console.error(error);
    }
  }

  if (userMessage) {
    toast.error(userMessage);
  }
}
