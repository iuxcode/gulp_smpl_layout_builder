export const sayHello = (message?: String) => {
  alert(message ?? "Hello World!");
  return 0;
};
