class BusinessError extends Error {
    constructor(message, code = 400) {
        super(message);
        this.name = 'BusinessError';
        this.code = code;
    }
}

module.exports = BusinessError;
