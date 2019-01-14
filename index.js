const _mockFactories = {};
const _mockRegistry = {};

module.exports.jestMocker = (function(){

    const automock = function(moduleName){
        throw new Error("Not yet implemented.");
    };

    const mock = function(moduleName, factory){
        if(!moduleName || !typeof(moduleName) === "string" || !moduleName.length){
            throw new Error("No module-name specified. Please specify module name either as node-module name or absolute path.");
        }
        if(factory && typeof(factory) === "function"){
            _mockFactories[moduleName] = factory;
        }
    };

    const unmock = function(moduleName){
        if(!moduleName || !typeof(moduleName) === "string" || !moduleName.length){
            throw new Error("No module-name specified. Please specify module name either as node-module name or absolute path.");
        }
        if(_mockFactories.hasOwnProperty(moduleName)){
            delete _mockFactories[moduleName];

            if(_mockRegistry.hasOwnProperty(moduleName)){
                delete _mockRegistry[moduleName];   
            }
        }
    };

    return {
        automock,
        mock,
        unmock
    }
})();
module.exports.default = function(_requireValue){

    if(_requireValue){
        if (_mockFactories.hasOwnProperty(_requireValue)) {
            if(_mockRegistry.hasOwnProperty(_requireValue)){
                return _mockRegistry[_requireValue];
            }

            return (_mockRegistry[_requireValue] = _mockFactories[_requireValue]());
        }
        else{
            return require(_requireValue);
        }
    }

};

module.exports.__esModule = true;