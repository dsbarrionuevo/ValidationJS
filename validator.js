var ValidatorJS = (function () {
    var myself = {};

    ///////////////////// Funciones privadas

    // Valida al submittear el formulario: evento submit
    Validator.prototype.VALIDATE_ON_SUBMIT = 0;

    // Valida al hacer blur del campo: evento blur
    Validator.prototype.VALIDATE_ON_BLUR = 1;

    // Valida al cambiar el texto del campo: evento change
    Validator.prototype.VALIDATE_ON_CHANGE = 2;

    // Clase asociada a un formulario
    function Validator(args) {
        var instance = this;
        this.form_or_button = args.form_or_button;
        this.message = args.message;
        this.validationEvent = args.validationEvent;
        //estos dos eventos son solo para la validacion de todo el formulario, en el futuro 
        //podriamos agregarlas a las validaciones de los campos individaules tambien
        this.before = args.before;
        this.after = args.after;
        //podrias crear una function onError que capturaria todas las excepciones...

        if (this.form_or_button[0].tagName.toLowerCase() == "form") {
            instance.form_or_button.submit(function (evt) {
                instance.validate(evt);
            });
        } else if (this.form_or_button[0].tagName.toLowerCase() == "button") {
            instance.form_or_button.click(function (evt) {
                instance.validate(evt);
            });
        } else {
            throw "Invalid argument";
        }

        // Array asociativo: utiliza como clave el id del campo pasado y como valor un array numerico de validaciones
        // Este array mantiene las validaciones que se deber√°n realizar por cada campo.
        this.validations = {};

        this.addValidationForField = function (targetField, validationObject) {
            //para no tener que obligar de ponerle un id a todos los campos de un formulario 
            //podria usar como target el mismo jquery object y despuas hacer un mecanismo de equals
            //para poder obtener un campo especifico
            var target = targetField.get(0).id;
            var countFields = 0;
            var foundField = false;
            for (var field in instance.validations) {
                //aqui deberia ir el mecanismo de equals
                if (field === target) {
                    foundField = true;
                    //verifico que no tenga ese tipo de validacion ya cargado...
                    var validationTypeAlreadyExists = false;
                    for (var i = 0; i < instance.validations[target].length; i++) {
                        if (instance.validations[target][i].validationType === validationObject.validationType) {
                            validationTypeAlreadyExists = true;
                        }
                    }
                    if (!validationTypeAlreadyExists) {
                        instance.validations[target].push(validationObject);
                        //console.log("Agrego validacion de tipo "+validationObject.validationType+" para "+target);
                    }
                }
                countFields++;
            }
            if (countFields === 0 || !foundField) {
                //console.log("Agrego validacion de tipo "+validationObject.validationType+" para "+target);
                //creo el array con la primera validacion para ese campo
                instance.validations[target] = [validationObject];
            }
        };
        this.getValidation = function (targetField, validationType) {
            var target = targetField.get(0).id;
            for (var field in instance.validations) {
                if (field === target) {
                    for (var i = 0; i < instance.validations[target].length; i++) {
                        if (instance.validations[target][i].validationType === validationType) {
                            return instance.validations[target][i];
                        }
                    }
                }
            }
            return null;
        };
        this.hasValidation = function (targetField, validationType) {
            return (instance.getValidation(targetField, validationType) !== null);
        };
        this.removeValidationForField = function (targetField, validationType) {
            var target = targetField.get(0).id;
            for (var field in instance.validations) {
                if (field === target) {
                    for (var i = 0; i < instance.validations[target].length; i++) {
                        if (instance.validations[target][i].validationType === validationType) {
                            //borro todas las validaciones de ese tipo, no solo la primera
                            instance.validations[target].splice(i, 1);
                            //console.log("Borro validacion tipo "+tipoValidacion+" para "+idCampo);
                        }
                    }
                }
            }
        };
        this.addValidation = function (validationObject) {
            //cargo primero las validaciones en el array del validador
            for (var i = 0; i < validationObject.validations.length; i++) {
                instance.addValidationForField(validationObject.field, new Validation({
                    field: validationObject.field,
                    validationType: validationObject.validations[i].validationType,
                    parameters: validationObject.validations[i].parameters,
                    validator: instance,
                    message: validationObject.validations[i].message
                }));
            }
            //funciones general que uso dentro de los eventos siguientes...
            var validationFunction = function (evt, targetField) {
                var validField = true;
                var validationsForField = instance.validations[targetField];
                var messages = [];
                for (var i = 0; i < validationsForField.length; i++) {
                    var validationForField = validationsForField[i];
                    var validValidation = validationForField.validate();
                    instance.callValidationFunctions({
                        event: evt,
                        validation: validationForField,
                        field: validationForField.field,
                        message: validationForField.message
                    }, validValidation);
                    if (!validValidation) {
                        validField = false;
                    }
                    if (validationForField.mensaje !== undefined) {
                        messages.push(validationForField.mensaje);
                    }
                }
                instance.callFieldFunctions({
                    event: evt,
                    field: validationForField.field,
                    //validations: validationsForField//se lo podria enviar...
                    messages: messages
                }, validField);
            };
            switch (instance.validationEvent) {
                case(Validator.prototype.VALIDATOR_SUBMIT):
                    //la validacion se realiza al hacer submit del formulario entero
                    break;
                    //la ultima validacion individual enmascara los resultados de las validaciones anteriores
                case(Validator.prototype.VALIDATE_ON_BLUR):
                    for (var field in instance.validations) {
                        if (field === validationObject.field.get(0).id) {
                            var fieldType = getType(validationObject.field);
                            if (fieldType === "div") {
                                //el evento onblur no se dispara en los divs... por eso busco sus inputs hijos
                                //esto se usaria por ejempo si quiero validar un grupo de checkboxs
                                validationObject.field.find("input").blur(function (evt) {
                                    validationFunction(evt, validationObject.field.get(0).id);
                                });
                            } else {
                                validationObject.field.blur(function (evt) {
                                    validationFunction(evt, validationObject.field.get(0).id);
                                });
                            }
                        }
                    }
                    break;
                case(Validator.prototype.VALIDATE_ON_CHANGE):
                    for (field in instance.validations) {
                        if (field === validationObject.field.get(0).id) {
                            var fieldType = getType(validationObject.field);
                            if (checkAttributeMatches(fieldType, ["text", "password", "number", "email"])) {
                                validationObject.field.keyup(function (evt) {
                                    validationFunction(evt, validationObject.field.get(0).id);
                                });
                            } else {
                                validationObject.field.change(function (evt) {
                                    validationFunction(evt, validationObject.field.get(0).id);
                                });
                            }
                        }
                    }
                    break;
            }
        };
        //resultado de las validaciones individuales
        this.validValidation = args.validValidation;
        this.invalidValidation = args.invalidValidation;
        //resutado de las validaciones conjuntas en un campo
        this.validField = args.validField;
        this.invalidField = args.invalidField;
        //resultado de todas las validaciones de todos los campos en el formulario
        this.validForm = args.validForm;
        this.invalidForm = args.invalidForm;
        this.validate = function (evt) {
            var validForm = true;
            if (instance.before !== undefined) {
                //le paso solo los campos, no sus validaciones
                var fields = [];//only ids
                for (var fieldId in instance.validations) {
                    fields.push(fieldId);
                }
                instance.before({
                    event: evt,
                    validationEvent: instance.validationEvent,
                    fields: fields
                });
            }
            for (var field in instance.validations) {
                //la propiedad campo es el id del campo en si
                var validationsForField = instance.validations[field];
                if (validationsForField.length === 0) {
                    continue;
                }
                var validField = true;
                var messagesForField = [];
                var targetField = null;
                for (var i = 0; i < validationsForField.length; i++) {
                    var validationForField = validationsForField[i];
                    targetField = validationForField.field;
                    var validValidation = validationForField.validate();
                    instance.callValidationFunctions({
                        event: evt,
                        validation: validationForField,
                        field: validationForField.field,
                        message: validationForField.message
                    }, validValidation);
                    if (!validValidation) {
                        //si al menos una validacion de este campo es invalida, todo el campo es invalido
                        validField = false;
                        if (validationForField.message !== undefined) {
                            messagesForField.push(validationForField.message);
                        }
                    }
                }
                instance.callFieldFunctions({
                    event: evt,
                    field: targetField, //deberia ser distinto de null...
                    //validations: validationsForField//se lo podria enviar...
                    messages: messagesForField
                }, validField);
                if (!validField) {
                    //si al menos una validacion de un campo es invalida, todo el formulario es invalido
                    validForm = false;
                }
            }
            instance.callFormFunctions({
                event: evt,
                validator: instance,
                form: instance.form_or_button
            }, validForm);
            if (instance.after !== undefined) {
                instance.after({
                    event: evt
                });
            }
            return validForm;
        };
        //llamar funciones predefinias de validacion
        this.callValidationFunctions = function (parameters, result) {
            if (!result) {
                if (instance.invalidValidation !== undefined) {
                    instance.invalidValidation(parameters);
                }
            } else {
                if (instance.validValidation !== undefined) {
                    instance.validValidation(parameters);
                }
            }
        };
        this.callFieldFunctions = function (parameters, result) {
            if (!result) {
                if (instance.invalidField !== undefined) {
                    instance.invalidField(parameters);
                }
            } else {
                if (instance.validField !== undefined) {
                    instance.validField(parameters);
                }
            }
        };
        this.callFormFunctions = function (parameters, result) {
            if (!result) {
                //si el formulario es invalido, DEBO impdir que se env√≠e... en todos los casos
                if (parameters.event !== undefined) {
                    parameters.event.preventDefault();
                }
                if (instance.invalidForm !== undefined) {
                    instance.invalidForm(parameters);
                }
            } else {
                if (instance.validForm !== undefined) {
                    instance.validForm(parameters);
                }
            }
        };
    }

    Validation.prototype.VALIDATION_TYPE_REQUIRED = 0;
    Validation.prototype.VALIDATION_TYPE_LENGTH = 1;//sirve para cualquier tipo de valor
    Validation.prototype.VALIDATION_TYPE_NUMBER = 2;
    Validation.prototype.VALIDATION_TYPE_INT = 3;
    Validation.prototype.VALIDATION_TYPE_DECIMAL = 4;
    Validation.prototype.VALIDATION_TYPE_VALUE = 5;//sirve solo para valores numericos
    Validation.prototype.VALIDATION_TYPE_EMAIL = 6;
    Validation.prototype.VALIDATION_TYPE_GROUP = 7;
    Validation.prototype.VALIDATION_TYPE_RADIO_GROUP = 8;
    Validation.prototype.VALIDATION_TYPE_CHECKBOX_GROUP = 9;
    Validation.prototype.VALIDATION_TYPE_CUSTOM = 10;
    Validation.prototype.VALIDATION_TYPE_COMPARE = 11;
    //
    Validation.prototype.customValidations = [];
    /*
     
     */
    /**
     * Agrega la validaciÛn a la lista de validaciones personalizadas, retorna 
     * 'true' si ha podido agregar la validaciÛn (sÛlo cuando en la lista de 
     * validaciones personalizadas no existe ya una validaciÛn con el mismo id),
     * 'false' en caso contratio.
     * @param {type} customValidation Objecto que representa la validaciÛn 
     * personalizada de la siguiente forma: 
     *  customValidacion: {
     *      id: "myId",
     *      method: function(field, parameters){ return boolean; }
     *      }
     * @returns {Boolean} 'True' si se pudo agregar la validaciÛn personalizada,
     * 'false' en caso contratio.
     */
    Validation.prototype.addCustomValidation = function (customValidation) {
        if (Validation.prototype.getCustomValidation(customValidation.id) === null) {
            Validation.prototype.customValidations.push({
                id: customValidation.id,
                method: customValidation.method
            });
            return true;
        }
        return false;
    };
    Validation.prototype.getCustomValidation = function (id) {
        for (var i = 0; i < Validation.prototype.customValidations.length; i++) {
            var customValidation = Validation.prototype.customValidations[i];
            if (id === customValidation.id) {
                return customValidation;
            }
        }
        return null;
    };
    Validation.prototype.removeCustomValidation = function (id) {
        //podria usar if(getCustomValidation(validationId) !== null){} pero no tendria el indice...
        for (var i = 0; i < Validation.prototype.customValidations.length; i++) {
            var customValidation = Validation.prototype.customValidations[i];
            if (id === customValidation.id) {
                Validation.prototype.customValidations.slice(i, 1);
                return true;
            }
        }
        return false;
    };
    //asociado a un unico campo
    function Validation(agrs) {
        var instance = this;
        this.field = agrs.field;
        if (instance.field !== null && instance.field !== undefined) {
            //this.fieldType podrÌa ser: text, password, radio, checkbox, reset, 
            //button, submit (y los de html5...), tambiÈn textarea, select.
            this.fieldType = getType(instance.field);
        } else {
            this.fieldType = undefined;
        }
        this.validationType = agrs.validationType;
        this.parameters = agrs.parameters;
        //cargo la validacion personalizada si no la tengo
        if (instance.validationType === Validation.prototype.VALIDATION_TYPE_CUSTOM) {
            if (instance.parameters.id !== undefined && instance.parameters.method !== undefined) {
                Validation.prototype.addCustomValidation({
                    id: instance.parameters.id,
                    method: instance.parameters.method
                });
            }
        }
        this.validator = agrs.validator;
        //es el mensaje de error
        this.message = agrs.message;
        this.applyValidation = function () {
            //deberia verificar que posea el atributo value
            var value = instance.field.val().trim();
            switch (instance.validationType) {
                case(Validation.prototype.VALIDATION_TYPE_REQUIRED):
                    if (checkAttributeMatches(instance.fieldType, ["text", "password", "number", "email"])) {
                        return value.length > 0;
                    } else if (instance.fieldType === "select") {
                        //en caso de que el select posea cadenas por ejemplo, y 
                        //queremos setear la cadena "vacio" como opcion vacÌa, 
                        //debemos setearle como que lo represente el sigueinte 
                        //invalidRequiredValue, el mismo ser· tratado como cadena.
                        if (instance.parameters !== undefined && instance.parameters.invalidRequiredValue !== undefined) {
                            return !(value === instance.parameters.invalidRequiredValue);
                        }
                        //para un uso m·s genÈrico permito que agrega una funciÛn 
                        //que recibe como par·metro el valor seleccionado en 
                        //el select y retorna true si es v·lido y false en caso contrario
                        if (instance.parameters !== undefined && instance.parameters.checkRequiredMethod !== undefined) {
                            return instance.parameters.checkRequiredMethod(value);
                        }
                        // Valor igual a -1 no es v·lido para un select requerido
                        if (isNaN(value)) {
                            return true;
                        }
                        //como fallback compara con un int y el mismo debe ser 
                        //distinto a -1 para ser v·lido
                        return parseInt(value) !== -1;
                    } else {
                        //para requerir radio o checkboxes deberia pasar un tipoCampo explicito
                        //---> Aca deberia hacer algo en serio util, es decir, comprobar que al menos un radio o un check
                        //estan seleccionados, pero esa comprobacion la hago en el mismo validation_type_check o radio
                        //por eso aqui solo devuelvo true...
                        return true;
                    }
                    break;
                case(Validation.prototype.VALIDATION_TYPE_NUMBER):
                    //si el campo esta vacio regresa valido = true, porque no hay numero o texto cargado...
                    return !isNaN(value);
                    break;
                case(Validation.prototype.VALIDATION_TYPE_INT):
                    if (isNaN(value)) {
                        return false;
                    }
                    var length = instance.field.val().trim().length;
                    //esto no deberia hacerse aqui, porque si necesito validar 
                    //que sea entero y tambine requerido debo agregar ambas 
                    //validaciones, y si en la validacion de int tambien hago 
                    //la de requerido entonces la de requerido se lanzaria dos veces.
                    if (instance.parameters !== undefined) {
                        var required = instance.parameters.required;
                        if (required !== undefined && required && length === 0)
                            return false;
                    }
                    if (length === 0)
                        return true;
                    var isInt = /^-?\d+?$/.test(value);
                    if (isInt) {
                        var int = parseInt(value);
                        if (isNaN(int)) {
                            //no pudo parsear correctamente
                            return false;
                        }
                        if (instance.parameters === undefined) {
                            return true;
                        }
                        var min = instance.parameters.min;
                        var max = instance.parameters.max;
                        //esta comprobacion de != undefined provoca que necesariamente 
                        //si quiero comprobar un rango debo setear ambos parametros, 
                        //y no me deja por ejemplo soo setear el min o solo el max. 
                        //Deberia cambiarse...
                        if (min === undefined || max === undefined) {
                            return true;
                        } else {
                            if (min !== undefined) {
                                if (int < min) {
                                    return false;
                                }
                            }
                            if (max !== undefined) {
                                if (int > max) {
                                    return false;
                                }
                            }
                            return true;
                        }
                    }
                    return false;
                case(Validation.prototype.VALIDATION_TYPE_DECIMAL):
                    if (isNaN(value)) {
                        return false;
                    }
                    var length = instance.field.val().trim().length;
                    //en algun lugar deberia permitir moficiar si el punto o la 
                    //coma es el separador de decimales
                    if (length > 0) {
                        return /^-?\d+(\.\d+)?$/.test(value);
                    }
                    //faltan validaciones de min y max
                    return true;
                    break;
                case(Validation.prototype.VALIDATION_TYPE_LENGTH):
                    //si solo seteo una longitud maxima y no una minima, el campo 
                    //puede ser vacio y esto lo toma como valido...
                    //a no ser que tambien le agregue que sea campo requerido, eso 
                    //es lo correcto
                    var valueLength = value.length;
                    if (instance.parameters === undefined) {
                        //necesariamente debe tener seteado un max o min
                        return false;
                    }
                    var min = instance.parameters.min;
                    var max = instance.parameters.max;
                    if (min === undefined && max === undefined) {
                        return false;
                    }
                    if (min !== undefined) {
                        if (valueLength < min) {
                            return false;
                        }
                    }
                    if (max !== undefined) {
                        if (valueLength > max) {
                            return false;
                        }
                    }
                    return true;
                    break;
                case(Validation.prototype.VALIDATION_TYPE_VALUE):
                    if (isNaN(value)) {
                        return false;
                    }
                    if (instance.parameters === undefined) {
                        return false;
                    }
                    //no funcionaria con un decimal, revisar
                    var numberValue = parseFloat(value);
                    if (isNaN(numberValue)) {
                        //no pudo parsear correctamente
                        return false;
                    }
                    var min = instance.parameters.min;
                    var max = instance.parameters.max;
                    if (min === undefined && max === undefined) {
                        return false;
                    }
                    if (min !== undefined) {
                        if (numberValue < min) {
                            return false;
                        }
                    }
                    if (max !== undefined) {
                        if (numberValue > max) {
                            return false;
                        }
                    }
                    return true;
                    break;
                case(Validation.prototype.VALIDATION_TYPE_EMAIL):
                    var length = instance.field.val().trim().length;
                    if (length > 0) {
                        return /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(value);
                    }
                    return true;
                    break;
                case(Validation.prototype.VALIDATION_TYPE_RADIO_GROUP):
                    //revisar
                    var selected = false;
                    if (instance.parameters !== undefined && instance.parameters.group !== undefined) {
                        var groupName = instance.parameters.group;
                        //deberia pasar como parametro desde que formulario o div 
                        //dentro del formulario buscar, para evitar complicaciones 
                        //en caso de que haya dos grupos de radios con los mismos names
                        $("input[type='radio'][name='" + groupName + "']").each(function () {
                            if ($(this).is(":checked")) {
                                selected = true;
                            }
                        });
                    } else {
                        instance.field.find("input[type='radio']").each(function () {
                            if ($(this).is(":checked")) {
                                selected = true;
                            }
                        });
                    }
                    if (instance.validator.hasValidation(instance.field, Validation.prototype.VALIDATION_TYPE_REQUIRED)) {
                        return selected;
                    }
                    return true;
                    break;
                case(Validation.prototype.VALIDATION_TYPE_GROUP):
                    //sirve para checkboxes o radios
                    if (instance.parameters === undefined) {
                        return false;
                    }
                    if (instance.parameters.group === undefined) {
                        return false;
                    }
                    if (instance.parameters.type === undefined) {
                        return false;
                    }
                    var groupType = instance.parameters.type;
                    var groupName = instance.parameters.group;
                    var countSelecteds = 0;
                    //tambien hace falta pasar como parametro de donde buscar
                    $("input[type='" + groupType + "'][name='" + groupName + "']").each(function () {
                        if ($(this).is(":checked")) {
                            countSelecteds++;
                        }
                    });
                    var min = instance.parameters.min;
                    var max = instance.parameters.max;
                    if (min === undefined && max === undefined) {
                        //como minimo valida que este al menos uno seleccionado
                        return countSelecteds >= 1;
                    }
                    if (min !== undefined) {
                        if (countSelecteds < min) {
                            return false;
                        }
                    }
                    if (max !== undefined) {
                        if (countSelecteds > max) {
                            return false;
                        }
                    }
                    return true;
                    break;
                case(Validation.prototype.VALIDATION_TYPE_CHECKBOX_GROUP):
                    var countSelecteds = 0;
                    if (instance.parameters !== undefined && instance.parameters.group !== undefined) {
                        var groupName = instance.parameters.group;
                        $("input[type='checkbox'][name='" + groupName + "']").each(function () {
                            if ($(this).is(":checked")) {
                                countSelecteds++;
                            }
                        });
                    } else {
                        instance.field.find("input[type='checkbox']").each(function () {
                            if ($(this).is(":checked")) {
                                countSelecteds++;
                            }
                        });
                    }
                    //solo si es requerido, el comportamiento por defeto es ahora 
                    //no validar a no ser que sea campo requerido
                    if (instance.validator.hasValidation(instance.field, Validation.prototype.VALIDATION_TYPE_REQUIRED)) {
                        if (instance.parameters === undefined) {
                            return countSelecteds >= 1;
                        }
                        var min = instance.parameters.min;
                        var max = instance.parameters.max;
                        if (min === undefined && max === undefined) {
                            return countSelecteds >= 1;
                        }
                        if (min !== undefined) {
                            if (countSelecteds < min) {
                                return false;
                            }
                        }
                        if (max !== undefined) {
                            if (countSelecteds > max) {
                                return false;
                            }
                        }
                    }
                    return true;
                    break;
                case(Validation.prototype.VALIDATION_TYPE_CUSTOM):
                    if (instance.parameters === undefined) {
                        return false;
                    }
                    var id = instance.parameters.id;
                    if (id === undefined) {
                        return false;
                    }
                    var customValidation = Validation.prototype.getCustomValidation(id);
                    if (customValidation === undefined || customValidation === null) {
                        return false;
                    }
                    var parameters = instance.parameters.parameters;
                    if (parameters !== undefined) {
                        return customValidation.method(instance.field, parameters);
                    }
                    return customValidation.method(instance.field);
                case(Validation.prototype.VALIDATION_TYPE_COMPARE):
                    //implementacion futuras
                    //usos posibles: igualdad de strings, check del tipo de dato, mayor menor igual en campos y checkboxs seleccionados, etc...
                    return false;
                    break;
                default:
                    return false;
                    break;
            }
        };
        this.validate = function () {
            return instance.applyValidation();
        };
    }
    //Funciones utiles
    function getType($element) {
        if ($element.get(0).tagName.toLowerCase() === "input") {
            return $element.get(0).type.toLowerCase();
        } else {
            //para selects o textarea, por ejemplo
            return $element.get(0).tagName.toLowerCase();
        }
    }
    //comprueba que coincide con al menos uno de los valores pedidos
    function checkAttributeMatches(attributeName, values) {
        for (var i = 0; i < values.length; i++) {
            if (attributeName === values[i]) {
                return true;
            }
        }
        return false;
    }

    /////////////////////funciones del modulo

    myself.validators = [];

    function ValidatorInstance(id, validator) {
        var instance = this;
        this.id = id;
        this.validator = validator;
        this.addValidation = function (field, validationType, optionalParameters) {
            var message = undefined;
            var parameters = undefined;
            if (optionalParameters !== undefined) {
                if (optionalParameters.message !== undefined) {
                    message = optionalParameters.message;
                }
                //el parametro 'required' agrega autom·ticamente la validaciÛn 
                //de tipo campo requerido, sin embargo no establece un mensaje 
                //de especÌfico.
                if (optionalParameters.required !== undefined && optionalParameters.required === true) {
                    instance.validator.addValidation({
                        field: field,
                        validations: [
                            {
                                validationType: Validation.prototype.VALIDATION_TYPE_REQUIRED
                            }
                        ]
                    });
                }
                var hasValidationParameters = false;
                for (var optionalParameter in optionalParameters) {
                    //estos par·metros ya estarÌa contemplados...
                    if (optionalParameter !== "message" && optionalParameter !== "required") {
                        if (hasValidationParameters === false) {
                            parameters = {};
                        }
                        parameters[optionalParameter] = optionalParameters[optionalParameter];
                        hasValidationParameters = true;
                    }
                }
            }
            //en caso de que el objecto jQuery field sea un selector por clase, 
            //aquÌ serÌa el lugar donde recorrerÌa y agregarÌa la validaciÛn para 
            //cada uno de ellos.
            instance.validator.addValidation({
                field: field,
                validations: [
                    {
                        validationType: validationType,
                        parameters: optionalParameters,
                        message: message
                    }
                ]
            });
        };
        this.removeValidation = function (field, validationType) {
            instance.validator.removeValidationForField(field, validationType);
        };
    }

    ///////////////////// Funciones p√∫blicas

    /*
     Crea un validador a partir de un objeto jQuery formulario (tagName=FORM)
     o un bot√≥n (tagName=BUTTON), una constante que indica cu√°ndo se debe
     ejecutar las validaciones y par√°metros opcionales.
     */
    myself.createValidator = function (form_or_button, validatorType, optionalParameters) {
        var parameters = optionalParameters || {};
        var newValidatorInstance = new ValidatorInstance(
                myself.validators.length,
                new Validator({
                    form_or_button: form_or_button,
                    validationEvent: validatorType,
                    message: parameters.message,
                    validValidation: parameters.validValidation,
                    invalidValidation: parameters.invalidValidation,
                    validField: parameters.validField,
                    invalidField: parameters.invalidField,
                    validForm: parameters.validForm,
                    invalidForm: parameters.invalidForm,
                    before: parameters.before,
                    after: parameters.after
                })
                );
        myself.validators.push(newValidatorInstance);
        return newValidatorInstance;
    };

    // Funciones que permiten agregar, obtener y eliminar una validaci√≥n personalizada.

    myself.addCustomValidation = function (id, method) {
        return Validation.prototype.addCustomValidation({
            id: id,
            method: method
        });
    };
    myself.getCustomValidation = function (id) {
        return Validation.prototype.getCustomValidation(id);
    };
    myself.removeCustomValidation = function (id) {
        return Validation.prototype.removeCustomValidation(id);
    };

    ///////////////////// Constantes p√∫blicas

    // Indican cu√°ndo ejecutar la validaci√≥n.

    myself.VALIDATE_ON_SUBMIT = Validator.prototype.VALIDATE_ON_SUBMIT;
    myself.VALIDATE_ON_BLUR = Validator.prototype.VALIDATE_ON_BLUR;
    myself.VALIDATE_ON_CHANGE = Validator.prototype.VALIDATE_ON_CHANGE;

    // Indican el tipo de validaci√≥n.

    myself.VALIDATION_TYPE_REQUIRED = Validation.prototype.VALIDATION_TYPE_REQUIRED;
    myself.VALIDATION_TYPE_LENGTH = Validation.prototype.VALIDATION_TYPE_LENGTH;
    myself.VALIDATION_TYPE_NUMBER = Validation.prototype.VALIDATION_TYPE_NUMBER;
    myself.VALIDATION_TYPE_INT = Validation.prototype.VALIDATION_TYPE_INT;
    myself.VALIDATION_TYPE_DECIMAL = Validation.prototype.VALIDATION_TYPE_DECIMAL;
    myself.VALIDATION_TYPE_VALUE = Validation.prototype.VALIDATION_TYPE_VALUE;
    myself.VALIDATION_TYPE_EMAIL = Validation.prototype.VALIDATION_TYPE_EMAIL;
    myself.VALIDATION_TYPE_GROUP = Validation.prototype.VALIDATION_TYPE_GROUP;
    myself.VALIDATION_TYPE_RADIO_GROUP = Validation.prototype.VALIDATION_TYPE_RADIO_GROUP;
    myself.VALIDATION_TYPE_CHECKBOX_GROUP = Validation.prototype.VALIDATION_TYPE_CHECKBOX_GROUP;
    myself.VALIDATION_TYPE_CUSTOM = Validation.prototype.VALIDATION_TYPE_CUSTOM;

    return myself;
}());
