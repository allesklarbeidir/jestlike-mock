const _mockFactories = {};
const _mockRegistry = {};

module.exports.jestMocker = (function(){

    const automock = function(moduleName){
        throw new Error("Not yet implemented.");
    };

    const mock = function(moduleName, factory, registerInGlobalObj, partialMockId, shouldHandle){
        if(!moduleName || !typeof(moduleName) === "string" || !moduleName.length){
            throw new Error("No module-name specified. Please specify module name either as node-module name or absolute path.");
        }
        if(factory && typeof(factory) === "function"){
            if(partialMockId || (_mockFactories[moduleName] && Array.isArray(_mockFactories[moduleName]))){
                _mockFactories[moduleName] = [...(_mockFactories[moduleName] || []), {factory, partialMockId, shouldHandle}];
            }
            else{
                _mockFactories[moduleName] = {factory, partialMockId, shouldHandle};
            }

            if(registerInGlobalObj){
                global.JESTLIKEMOCK_FACTORIES = global.JESTLIKEMOCK_FACTORIES || {}
                global.JESTLIKEMOCK_FACTORIES[moduleName] = _mockFactories[moduleName];
            }
        }
    };

    const unmock = function(moduleName, partialMockId){
        if(!moduleName || !typeof(moduleName) === "string" || !moduleName.length){
            throw new Error("No module-name specified. Please specify module name either as node-module name or absolute path.");
        }
        if(_mockFactories.hasOwnProperty(moduleName) && !partialMockId){
            delete _mockFactories[moduleName];

            if((global.JESTLIKEMOCK_FACTORIES || {}).hasOwnProperty(moduleName)){
                delete global.JESTLIKEMOCK_FACTORIES[moduleName];
            }

            if(_mockRegistry.hasOwnProperty(moduleName)){
                delete _mockRegistry[moduleName];   

                if((global.JESTLIKEMOCK_REGISTRY || {}).hasOwnProperty(moduleName)){
                    delete global.JESTLIKEMOCK_REGISTRY[moduleName];
                }
            }
        }
        else if(_mockFactories.hasOwnProperty(moduleName) && partialMockId && Array.isArray(_mockFactories[moduleName])){
            const factoryIsGloballyRegistered = (global.JESTLIKEMOCK_FACTORIES || {}).hasOwnProperty(moduleName);

            _mockFactories[moduleName] = _mockFactories[moduleName].filter(mf => mf.partialMockId !== partialMockId);
            if(factoryIsGloballyRegistered){
                global.JESTLIKEMOCK_FACTORIES[moduleName] = global.JESTLIKEMOCK_FACTORIES[moduleName].filter(mf => mf.partialMockId !== partialMockId);
            }


            if(_mockFactories[moduleName].length === 0){
                delete _mockFactories[moduleName];
                if(factoryIsGloballyRegistered){
                    delete global.JESTLIKEMOCK_FACTORIES[moduleName];
                }
            }


            if(_mockRegistry.hasOwnProperty(moduleName) && Array.isArray(_mockRegistry[moduleName])){
                const moduleIsGloballyRegistered = (global.JESTLIKEMOCK_REGISTRY || {}).hasOwnProperty(moduleName);

                _mockRegistry[moduleName] = _mockRegistry[moduleName].filter(mf => mf.partialMockId !== partialMockId);
                if(moduleIsGloballyRegistered){
                    global.JESTLIKEMOCK_REGISTRY[moduleName] = global.JESTLIKEMOCK_REGISTRY[moduleName].filter(mf => mf.partialMockId !== partialMockId)
                }

                if(_mockRegistry[moduleName].length === 0){
                    delete _mockRegistry[moduleName];
                    if(moduleIsGloballyRegistered){
                        delete global.JESTLIKEMOCK_REGISTRY[moduleName];
                    }
                }

            }


        }
    };

    return {
        automock,
        mock,
        unmock
    }
})();


const mergeFactoryResults = (results) => {
    
    return results.reduce((res, r) => ({...res, ...r.factoryResult}), {});

};


module.exports.default = function(_requireValue, fromdir, falseifnotfound){

    if(_requireValue){
        if (_mockFactories.hasOwnProperty(_requireValue)) {

            return Array.isArray(_mockFactories[_requireValue]) ?
            mergeFactoryResults(
                (_mockRegistry[_requireValue] = _mockFactories[_requireValue]
                    .filter(mf => !mf.shouldHandle || mf.shouldHandle(fromdir))
                    .map(mf => ({...mf, factoryResult: mf.factoryResult || mf.factory()}))
                )
            )
            :
            (
                (!_mockFactories[_requireValue].shouldHandle || _mockFactories[_requireValue].shouldHandle(fromdir)) && 
                _mockRegistry.hasOwnProperty(_requireValue) ? _mockRegistry[_requireValue] : (_mockRegistry[_requireValue] = _mockFactories[_requireValue].factory())
            );

        }
        else if ((global.JESTLIKEMOCK_FACTORIES || {}).hasOwnProperty(_requireValue)) {

            global.JESTLIKEMOCK_REGISTRY = global.JESTLIKEMOCK_REGISTRY || {};

            return Array.isArray(global.JESTLIKEMOCK_FACTORIES[_requireValue]) ?
            mergeFactoryResults(
                (global.JESTLIKEMOCK_REGISTRY[_requireValue] = global.JESTLIKEMOCK_FACTORIES[_requireValue]
                    .filter(mf => !mf.shouldHandle || mf.shouldHandle(fromdir))
                    .map(mf => ({...mf, factoryResult: mf.factoryResult || mf.factory()}))
                )
            )
            :
            (
                (!global.JESTLIKEMOCK_FACTORIES[_requireValue].shouldHandle || global.JESTLIKEMOCK_FACTORIES[_requireValue].shouldHandle(fromdir)) &&
                (global.JESTLIKEMOCK_REGISTRY || {}).hasOwnProperty(_requireValue) ? global.JESTLIKEMOCK_REGISTRY[_requireValue] : (global.JESTLIKEMOCK_REGISTRY[_requireValue] = global.JESTLIKEMOCK_FACTORIES[_requireValue].factory())
            );
        }
        else if(!falseifnotfound){
            return require(_requireValue);
        }
        else {
            return false;
        }
    }

};

module.exports.__esModule = true;