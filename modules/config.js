module.exports = () => {
    let configOpts = {};
    let backend = process.env;

    function set(data) {
        configOpts = data;
    }

    function parseValue(value, type) {
        switch (type) {
        case 'string':
            return `${value}`;
        case 'int':
        case 'integer':
        case 'number':
            return parseInt(value, 10);
        case 'float':
            return parseFloat(value);
        case 'bool':
        case 'boolean':
            return (value === 'true' || parseInt(value, 10) === 1);
        default:
            return value;
        }
    }

    function get(key) {
        if (backend[key]) {
            const type = configOpts[key] && configOpts[key].type;
            const value = backend[key];
            return parseValue(value, type);
        }

        if (configOpts[key] && typeof configOpts[key].default !== 'undefined') {
            return configOpts[key].default;
        }

        if (configOpts[key] && configOpts[key].required === true) {
            throw new Error(
                `Required config value not set: ${key}`,
            );
        }

        return null;
    }

    function setBackend(value) {
        backend = value;
    }

    return {
        set,
        get,
        setBackend,
    };
};
