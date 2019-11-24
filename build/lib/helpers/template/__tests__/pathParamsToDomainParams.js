"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const pathParamsToDomainParams_1 = tslib_1.__importDefault(require("../pathParamsToDomainParams"));
describe('With req prefix', () => {
    it('Should return req.query', () => {
        const testObject = {
            parameters: [
                {
                    in: 'query',
                },
            ],
        };
        const output = pathParamsToDomainParams_1.default(testObject, false, 'req');
        expect(output).toBe('req.query');
    });
    it('Should return req.body/path/query', () => {
        const testObject = {
            parameters: [
                {
                    in: 'query',
                },
                {
                    in: 'body',
                },
                {
                    in: 'path',
                },
            ],
        };
        const output = pathParamsToDomainParams_1.default(testObject, false, 'req');
        expect(output).toBe('req.body, req.path, req.query');
    });
    it('Should return req.body/path/query with req', () => {
        const testObject = {
            'parameters': [
                {
                    in: 'query',
                },
                {
                    in: 'body',
                },
                {
                    in: 'path',
                },
            ],
            'x-passRequest': true,
        };
        const output = pathParamsToDomainParams_1.default(testObject, false, 'req');
        expect(output).toBe('req.body, req.path, req.query, req');
    });
});
describe('Without req prefix', () => {
    it('Should return req.query and security', () => {
        const testObject = {
            parameters: [
                {
                    in: 'query',
                },
            ],
            security: {
                a: 1,
            },
        };
        const output = pathParamsToDomainParams_1.default(testObject, false);
        expect(output).toBe('jwtData, query');
    });
    it('Should return req.query', () => {
        const testObject = {
            parameters: [
                {
                    in: 'query',
                },
            ],
        };
        const output = pathParamsToDomainParams_1.default(testObject, false);
        expect(output).toBe('query');
    });
    it('Should return req.body/path/query', () => {
        const testObject = {
            parameters: [
                {
                    in: 'query',
                },
                {
                    in: 'body',
                },
                {
                    in: 'path',
                },
            ],
        };
        const output = pathParamsToDomainParams_1.default(testObject, false);
        expect(output).toBe('body, path, query');
    });
    it('Should return req.body/path/query with req', () => {
        const testObject = {
            'parameters': [
                {
                    in: 'query',
                },
                {
                    in: 'body',
                },
                {
                    in: 'path',
                },
            ],
            'x-passRequest': true,
        };
        const output = pathParamsToDomainParams_1.default(testObject, false);
        expect(output).toBe('body, path, query, req');
    });
});
