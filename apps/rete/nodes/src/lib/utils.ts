export const processInput = <T>(input?: T[]) => {
  return input && input.length > 0 ? input[0] : undefined;
};
