"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const YAML = require('js-yaml');
const RefParser = require('json-schema-ref-parser');
const commandRun = require('./commandRun');
const OpenAPIInjectInterfaceNaming = require('./OpenAPIInjectInterfaceNaming');
const GeneratedComparison = require('./GeneratedComparison');
class OpenAPIBundler {
    async bundle(filePath, config) {
        let content;
        let parsedContent;
        let parsedContentWithInterfaceNaming;
        let dereferencedJSON;
        let mergedParameters;
        let injectedInterfaces;
        let bundledJSON;
        try {
            content = await this.getFileContent(filePath);
        }
        catch (e) {
            console.error('Can not load the content of the Swagger specification file');
            throw e;
        }
        try {
            parsedContent = this.parseContent(content);
        }
        catch (e) {
            console.error('Can not parse the content of the Swagger specification file');
            throw e;
        }
        try {
            parsedContentWithInterfaceNaming = (new OpenAPIInjectInterfaceNaming(parsedContent, config)).inject();
        }
        catch (e) {
            console.error('Can not dereference the JSON obtained from the content of the Swagger specification file');
            throw e;
        }
        try {
            dereferencedJSON = await this.dereference(parsedContentWithInterfaceNaming);
        }
        catch (e) {
            console.error('Can not dereference the JSON obtained from the content of the Swagger specification file');
            throw e;
        }
        try {
            mergedParameters = (new OpenAPIInjectInterfaceNaming(dereferencedJSON, config)).mergeParameters();
        }
        catch (e) {
            console.error('Can not merge the request paramters to build the interfaces:');
            throw e;
        }
        try {
            injectedInterfaces = await this.injectInterfaces(mergedParameters, config);
        }
        catch (e) {
            console.error('Cannot inject the interfaces:');
            throw e;
        }
        try {
            bundledJSON = await this.bundleObject(injectedInterfaces);
        }
        catch (e) {
            console.error('Cannot bundle the object:');
            throw e;
        }
        global.verboseLogging(bundledJSON);
        return JSON.parse(JSON.stringify(bundledJSON));
    }
    async getFileContent(filePath) {
        return fs.readFileSync(path.resolve(__dirname, filePath));
    }
    parseContent(content) {
        content = content.toString('utf8');
        try {
            return JSON.parse(content);
        }
        catch (e) {
            return YAML.safeLoad(content);
        }
    }
    async dereference(json) {
        return RefParser.dereference(json, {
            dereference: {
                circular: 'ignore',
            },
        });
    }
    async bundleObject(json) {
        return RefParser.bundle(json, {
            dereference: {
                circular: 'ignore',
            },
        });
    }
    /**
     *
     * @param apiObject Dereference'd' object
     * @param config
     * @return {Promise<void>}
     */
    async injectInterfaces(apiObject, config) {
        apiObject.interfaces = [];
        const defKeys = Object.keys(apiObject.definitions);
        for (let i = 0; i < defKeys.length; ++i) {
            const definitionObject = apiObject.definitions[defKeys[i]];
            try {
                apiObject.interfaces.push({
                    name: defKeys[i],
                    content: await this.generateInterfaceText(defKeys[i], definitionObject, config.targetDir),
                });
            }
            catch (e) {
                console.log(defKeys[i]);
                console.log(e);
                throw new Error('Could not generate the interface text for the above object');
            }
        }
        const pathsKeys = Object.keys(apiObject.paths);
        for (let i = 0; i < pathsKeys.length; ++i) {
            const singlePath = pathsKeys[i];
            const methods = Object.keys(apiObject.paths[singlePath]);
            for (let j = 0; j < methods.length; ++j) {
                const method = methods[j];
                const xRequestDefinitions = apiObject.paths[singlePath][method]['x-request-definitions'];
                if (xRequestDefinitions) {
                    const xRequestDefinitionsKeys = Object.keys(xRequestDefinitions);
                    for (let k = 0; k < xRequestDefinitionsKeys.length; ++k) {
                        const paramType = xRequestDefinitionsKeys[k];
                        if (xRequestDefinitions[paramType].interfaceText === '' &&
                            xRequestDefinitions[paramType].params.length > 0) {
                            xRequestDefinitions[paramType].interfaceText = await this.generateInterfaceText(apiObject.paths[singlePath][method]['x-request-definitions'][paramType].name, _.get(apiObject, apiObject.paths[singlePath][method]['x-request-definitions'][paramType].params[0]), config.targetDir);
                        }
                        apiObject.interfaces.push({
                            name: apiObject.paths[singlePath][method]['x-request-definitions'][paramType].name,
                            content: apiObject.paths[singlePath][method]['x-request-definitions'][paramType].interfaceText,
                        });
                    }
                }
            }
        }
        apiObject.interfaces = apiObject.interfaces.sort((a, b) => (a.name > b.name) ? 1 : -1);
        return apiObject;
    }
    async generateInterfaceText(mainInterfaceName, definitionObject, targetDir) {
        const baseInterfaceDir = path.join(GeneratedComparison.getCacheBaseDir(targetDir), 'interface');
        fs.ensureDirSync(baseInterfaceDir);
        const tmpJsonSchema = path.join(baseInterfaceDir, mainInterfaceName + '.json');
        // write the json to disk
        fs.writeJsonSync(tmpJsonSchema, definitionObject);
        // parse to interface
        return commandRun('node', [
            path.join(__dirname, '../node_modules/quicktype/dist/cli/index.js'),
            '--just-types',
            '--src',
            tmpJsonSchema,
            '--src-lang',
            'schema',
            '--lang',
            'ts',
        ]);
    }
}
exports.default = new OpenAPIBundler();
