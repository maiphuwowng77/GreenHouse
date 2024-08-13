const common = {
  generateRandomId() {
    return Array(24)
      .fill('')
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
  }
};

export default common;