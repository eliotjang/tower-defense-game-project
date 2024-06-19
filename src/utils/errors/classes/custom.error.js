class CustomError extends Error {
  constructor(message, namespace) {
    super(message);
    this.namespace = namespace;
  }
}

export default CustomError;
