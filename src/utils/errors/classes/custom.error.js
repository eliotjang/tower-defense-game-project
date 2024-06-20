class CustomError extends Error {
  constructor(message, namespace) {
    super(message);
    this.name = 'CustomError';
    this.namespace = namespace;
  }
}

export default CustomError;
