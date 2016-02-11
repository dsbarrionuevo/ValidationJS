var ValidatorJS = (function () {
    var myself = {};

    /////////////////////funciones de la libreria

    Validator.prototype.VALIDATE_ON_SUBMIT = 0;//valida al submittear el formulario//submit
    Validator.prototype.VALIDATE_ON_BLUR = 1;//valida al hacer blur del campo//blur
    Validator.prototype.VALIDATE_ON_CHANGE = 2;//valida al cambiar el texto del campo//change
    //clase asociada a un formulario
    function Validator(agrs) {
        var instance = this;
        this.form = agrs.form;
        this.message = agrs.message;
        this.validationEvent = agrs.validationEvent;
        if(this.form[0].tagName == "FORM"){
            instance.form.submit(function (evt) {
                instance.validate(evt);
            });
        }else if(this.form[0].tagName == "BUTTON"){
            instance.form.click(function (evt) {
                instance.validate(evt);
            });
        }
        //array asociativo, utiliza como clave el id del campo pasado y como valor un array numerico de validaciones
        this.validations = {};
        this.addValidationForField = function (targetField, validationObject) {
            var target = targetField.get(0).id;
            var countFields = 0;
            var foundField = false;
            for (field in instance.validations) {
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
                instance.validations[target] = [validationObject];
            }
        };
        this.getValidation = function(targetField, validationType){
			var target = targetField.get(0).id;
            for (field in instance.validations) {
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
		this.hasValidation = function(targetField, validationType){
			return (instance.getValidation(targetField, validationType) !== null);
		};
		this.removeValidationForField = function (targetField, validationType) {
            var target = targetField.get(0).id;
            for (field in instance.validations) {
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
                    for (field in instance.validations) {
                        if (field === validationObject.field.get(0).id) {
                            var fieldType = getType(validationObject.field);
                            if (fieldType === "div") {
                                //el evento onblur no se dispara en los divs... por eso busco sus inputs hijos
                                //esto se usaria por ejempo si quiero validar un grupo de checkboxs
                                //objetoValidacion.campo.find("input").change(function(evt){
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
                            if (fieldType === "text" ||
                                    fieldType === "password" ||
                                    fieldType === "number" ||
                                    fieldType === "email") {
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
        this.validValidation = agrs.validValidation;
        this.invalidValidation = agrs.invalidValidation;
        //resutado de las validaciones conjuntas en un campo
        this.validField = agrs.validField;
        this.invalidField = agrs.invalidField;
        //resultado de todas las validaicones de todos los campos en el formulario
        this.validForm = agrs.validForm;
        this.invalidForm = agrs.invalidForm;
        this.validate = function (evt) {
            var validForm = true;
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
                form: instance.form
            }, validForm);
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
                //si el formulario es invalido, DEBO impdir que se envíe... en todos los casos
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
    customValidacion: {
        id: "myId",
        method: function(field, parameters){ return true; }
    }
    */
    Validation.prototype.addCustomValidation = function (customValidation) {
        if (Validation.prototype.getCustomValidation(customValidation.id) === null) {
            Validation.prototype.customValidations.push({
                id: customValidation.id,
                method: customValidation.method
            });
        }
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
        this.message = agrs.message;
        this.applyValidation = function () {
            var value = instance.field.val().trim();
            switch (instance.validationType) {
                case(Validation.prototype.VALIDATION_TYPE_REQUIRED):
                    if (instance.fieldType === "text" ||
                            instance.fieldType === "password" ||
                            instance.fieldType === "number" ||
                            instance.fieldType === "email") {
                        return value.length > 0;
                    } else if (instance.fieldType === "select") {
                        //valores menores a 0 no son validos para un select requerido
                        return parseInt(value) > -1;
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
					if(length > 0){
						return /^-?\d+?$/.test(value);
					}
					return true;
                    break;
                case(Validation.prototype.VALIDATION_TYPE_DECIMAL):
                    if (isNaN(value)) {
                        return false;
                    }
					var length = instance.field.val().trim().length;
					if(length > 0){
						return /^-?\d+(\.\d+)?$/.test(value);
					}
					return true;
                    break;
                case(Validation.prototype.VALIDATION_TYPE_LENGTH):
                    //si solo seteo una longitud maxima y no una minima, el campo puede ser vacio y esto lo toma como valido...
                    //a no ser que tambien le agregue que sea campo requerido
                    var valueLength = value.length;
                    if (instance.parameters === undefined) {
                        return false;
                    }
					if(instance.validator.hasValidation(instance.field,Validation.prototype.VALIDATION_TYPE_REQUIRED)){
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
                    //no funcionaria con un decimal, rever
                    var numberValue = parseFloat(value);
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
					if(length > 0){
						return /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(value);
					}
					return true;
                    break;
                case(Validation.prototype.VALIDATION_TYPE_RADIO_GROUP):
					var selected = false;
                    if (instance.parameters !== undefined && instance.parameters.group !== undefined) {
                        var groupName = instance.parameters.group;
						$("input[type='radio'][name='" + groupName + "']").each(function () {
							if ($(this).is(":checked")) {
								selected = true;
							}
						});
                    }else{
						instance.field.find("input[type='radio']").each(function () {
							if ($(this).is(":checked")) {
								selected = true;
							}
						});
					}
					if(instance.validator.hasValidation(instance.field, Validation.prototype.VALIDATION_TYPE_REQUIRED)){
						return selected;
					}
                    return true;
                    break;
                case(Validation.prototype.VALIDATION_TYPE_GROUP):
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
                    $("input[type='" + groupType + "'][name='" + groupName + "']").each(function () {
                        if ($(this).is(":checked")) {
                            countSelecteds++;
                        }
                    });
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
					}else{
						instance.field.find("input[type='checkbox']").each(function () {
							if ($(this).is(":checked")) {
								countSelecteds++;
							}
						});
					}
					//solo si es requerido, el comportamiento por defeto es ahora no validar a no ser que sea campo requerido
					if(instance.validator.hasValidation(instance.field, Validation.prototype.VALIDATION_TYPE_REQUIRED)){
						if(instance.parameters === undefined){
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
					if(parameters !== undefined){
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
		this.validate = function(){
			return instance.applyValidation();
		};
	}
    //Funciones utiles
    function getType($element) {
        if ($element.get(0).tagName.toLowerCase() === "input") {
            return $element.get(0).type.toLowerCase();
        } else {
            return $element.get(0).tagName.toLowerCase();
        }
    }

    /////////////////////funciones del modulo

	myself.validators = [];

	function ValidatorInstance(id, validator){
		var instance = this;
		this.id = id;
		this.validator = validator;
		this.addValidation = function (field, validationType, optionalParameters) {
			var message = undefined;
			var parameters = undefined;
			if(optionalParameters !== undefined){
				if(optionalParameters.message !== undefined){
					message = optionalParameters.message;
				}
				if(optionalParameters.required !== undefined && optionalParameters.required === true){
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
				for(optionalParameter in optionalParameters){
					if(optionalParameter !== "message" && optionalParameter !== "required"){
						if(hasValidationParameters === false){
							parameters = {};
						}
						parameters[optionalParameter] = optionalParameters[optionalParameter];
						hasValidationParameters = true;
					}
				}
			}
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
	
	//public functions
    myself.createValidator = function (form, validatorType, optionalParameters) {
        var parameters = optionalParameters || {};
		var newValidatorInstance = new ValidatorInstance(
			myself.validators.length,
			new Validator({
				form: form,
				validationEvent: validatorType,
				message: parameters.message,
				validValidation: parameters.validValidation,
				invalidValidation: parameters.invalidValidation,
				validField: parameters.validField,
				invalidField: parameters.invalidField,
				validForm: parameters.validForm,
				invalidForm: parameters.invalidForm
			})
		);
		myself.validators.push(newValidatorInstance);
		return newValidatorInstance;
    };
    myself.addCustomValidation = function (id, method) {
        Validation.prototype.addCustomValidation({
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

    //constantes
    myself.VALIDATE_ON_SUBMIT = Validator.prototype.VALIDATE_ON_SUBMIT;
    myself.VALIDATE_ON_BLUR = Validator.prototype.VALIDATE_ON_BLUR;
    myself.VALIDATE_ON_CHANGE = Validator.prototype.VALIDATE_ON_CHANGE;

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
