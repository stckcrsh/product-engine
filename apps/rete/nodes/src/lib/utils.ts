export const processInput = <T>(input?: T[], fallback?: T) => {
  return input && input.length > 0 ? input[0] : fallback as T;
};
