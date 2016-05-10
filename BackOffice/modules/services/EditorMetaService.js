import R from "ramda"

//Modifiers
let modify=(fieldInfo, ...modifiers)=>modifiers.reduce((field, m)=>m(field),(fieldInfo));
let newType = (baseType, ...modifiers) => modify({type:baseType}, ...modifiers);
let createAddPropModifer = (propName)=> R.curry((payload, fieldInfo)=>({...fieldInfo, [propName]: payload }));
let [allowedValues,  description  , compare  , validate  ,  defaultValue, typeAlias] = 
    ["allowedValues", "description", "compare", "validate", "defaultValue", "typeAlias"].map(createAddPropModifer);


//types
const types = {
    get String(){
        return newType("string");
    },
    Enum(...values){
        return newType("string", typeAlias("enum"), allowedValues(values));
    },
    get Bool(){
        return newType("bool");
    },
    get Number(){
        return newType("number");
    },
    get Empty(){
        return newType("empty");
    },
    get Version(){
        return newType("string", typeAlias("version"),compare("version"), validate( /[0-9.]/));
    }
}

export default class EditorMetaService{
    
    _meta = {};
    
    async init(){
        this.meta = {
            identities:{
                "device":{}
            },
            fields:{
               "device":{
                    "PartnerBrandId": defaultValue("AsurionFriends")
                                      (description("The name of the partner")
                                      (types.String)),
                    "DeviceOsType": defaultValue("Android")(types.Enum("Android","IOs")),
                    "AgentOsVersion": types.Version,
                    "AgentVersion": defaultValue("1.0.0.0")(types.Version),
                    "DeviceOsVersion": types.Version,
                    "IsInGroup": defaultValue(false)(types.Bool),
                }
            }
        } 
    }
    
    getFieldMeta(field){
        if (field==="") return types.Empty;
        var [identity, property] = field.split(".");
        return this.meta.fields[identity][property];
    }
    
    getKeyMeta(key){
        
    }
    
    getSuggestions({type, query}){
        if (type==="MatcherProperty"){
            var {input} = query;
            return R.reduce(R.concat, []) 
                (R.keys(this.meta.identities).map(identity=> R.toPairs(this.meta.fields[identity]).map(([field,meta]) => ({label:`${field}`, value:`${identity}.${field}` ,meta })))
            );
        }
        else {
            return [];
        }
    }
    
}