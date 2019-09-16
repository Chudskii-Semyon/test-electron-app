// @flow
export const scroll = (
  element: $ElementType<HTMLElement>,
  next: () => void,
  prev: () => void
): void => {
  if (element.scrollHeight - element.scrollTop === element.offsetHeight) {
    next();
  } else if (element.scrollTop === 0) {
    prev();
  }
};

export const randomDate = (start: number, end: number): Date =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

export const chooseAction = (actions: Array<string>): string => {
  const randomValue: number = Math.floor(Math.random() * actions.length);

  return actions[randomValue];
};
