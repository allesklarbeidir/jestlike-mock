const _mockFactories = {};
const _mockRegistry = {};

module.exports.jestMocker = (function(){

    const automock = function(moduleName){
        throw new Error("Not yet implemented.");
    };

    const mock = function(moduleName, factory, registerInGlobalObj){
        if(!moduleName || !typeof(moduleName) === "string" || !moduleName.length){
            throw new Error("No module-name specified. Please specify module name either as node-module name or absolute path.");
        }
        if(factory && typeof(factory) === "function"){
            _mockFactories[moduleName] = factory;
            if(registerInGlobalObj){
                global.JESTLIKEMOCK_FACTORIES = global.JESTLIKEMOCK_FACTORIES || {}
                global.JESTLIKEMOCK_FACTORIES[moduleName] = _mockFactories[moduleName];
            }
        }
    };

    const unmock = function(moduleName){
        if(!moduleName || !typeof(moduleName) === "string" || !moduleName.length){
            throw new Error("No module-name specified. Please specify module name either as node-module name or absolute path.");
        }
        if(_mockFactories.hasOwnProperty(moduleName)){
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
    };

    return {
        automock,
        mock,
        unmock
    }
})();
module.exports.default = function(_requireValue, falseifnotfound){

    if(_requireValue){
        if (_mockFactories.hasOwnProperty(_requireValue)) {
            if(_mockRegistry.hasOwnProperty(_requireValue)){
                return _mockRegistry[_requireValue];
            }

            return (_mockRegistry[_requireValue] = _mockFactories[_requireValue]());
        }
        else if ((global.JESTLIKEMOCK_FACTORIES || {}).hasOwnProperty(_requireValue)) {
            if((global.JESTLIKEMOCK_REGISTRY || {}).hasOwnProperty(_requireValue)){
                return global.JESTLIKEMOCK_REGISTRY[_requireValue];
            }

            global.JESTLIKEMOCK_REGISTRY = global.JESTLIKEMOCK_REGISTRY || {};
            return (global.JESTLIKEMOCK_REGISTRY[_requireValue] = global.JESTLIKEMOCK_FACTORIES[_requireValue]());
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