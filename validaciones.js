$(document).ready(function(){
	
    function validacionValida(agrs) {
        console.log("En el campo " + agrs.field.get(0).id + " la validacion de tipo " + agrs.validation.validationType  + " es VALIDA");
    }
    function validacionInvalida(agrs) {
        console.log("En el campo " + agrs.field.get(0).id + " la validacion de tipo " + agrs.validation.validationType + " es invalida");
    }
    function campoValido(agrs) {
        console.log("El campo " + agrs.field.get(0).id + " es VALIDO");
		if(agrs.field.get(0).tagName.toLowerCase() === "div"){
			agrs.field.removeClass("has-error");
		}else{
			agrs.field.parents("div").first().removeClass("has-error");
		}
    }
    function campoInvalido(agrs) {
        console.log("El campo " + agrs.field.get(0).id + " es invalido");
		if(agrs.field.get(0).tagName.toLowerCase() === "div"){
			agrs.field.addClass("has-error");
		}else{
			agrs.field.parents("div").first().addClass("has-error");
		}
        /*if (agrs.messages !== undefined) {
            for (var i = 0; i < agrs.messages.length; i++) {
                //parametros.campo.after('<label class="col-sm-10 mensajeError" style="font-size:14px;font-weight:normal;margin:0px;padding:4px;color:red">'+parametros.mensajes[i]+'</label>');
            }
        }*/
    }
    function formularioValido(agrs) {
        console.log("Formulario VALIDO");
    }
    function formularioInvalido(agrs) {
        console.log("Formulario invalido");
    }
	
	/*
	VALIDATE_ON_SUBMIT
	VALIDATE_ON_BLUR
	VALIDATE_ON_CHANGE
	*/
	
	var validator1 = v.createValidator($("#formulario"), v.VALIDATE_ON_SUBMIT, 
	{
		validValidation: validacionValida,
		invalidValidation: validacionInvalida,
		validField: campoValido,
		invalidField: campoInvalido,
		validForm: formularioValido,
		invalidForm: formularioInvalido
	});
	
	/*
	VALIDATION_TYPE_REQUIRED
	VALIDATION_TYPE_LENGTH
	VALIDATION_TYPE_NUMBER
	VALIDATION_TYPE_INT
	VALIDATION_TYPE_DECIMAL
	VALIDATION_TYPE_VALUE
	VALIDATION_TYPE_EMAIL
	VALIDATION_TYPE_GROUP
	VALIDATION_TYPE_RADIO_GROUP
	VALIDATION_TYPE_CHECKBOX_GROUP
	VALIDATION_TYPE_CUSTOM
	*/
	
	v.addCustomValidation("fecha",function(campo){
		return /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/.test(campo.val().trim());
	});
	
	
	validator1.addValidation($("#txtNombre"), v.VALIDATION_TYPE_REQUIRED);
	validator1.addValidation($("#txtApellido"), v.VALIDATION_TYPE_REQUIRED);
	validator1.addValidation($("#txtNacimiento"), v.VALIDATION_TYPE_CUSTOM, {id: "fecha"});
	validator1.addValidation($("#divSexo"), v.VALIDATION_TYPE_RADIO_GROUP, {required:false,group: "radSexo"});
	validator1.addValidation($("#txtEmail"), v.VALIDATION_TYPE_EMAIL);
	validator1.addValidation($("#txtTelefono"), v.VALIDATION_TYPE_INT);
	validator1.addValidation($("#txtTelefono"), v.VALIDATION_TYPE_LENGTH, {min: 7, max: 11});
	validator1.addValidation($("#txtEdad"), v.VALIDATION_TYPE_INT);
	validator1.addValidation($("#txtEdad"), v.VALIDATION_TYPE_VALUE, {min:1});
	validator1.addValidation($("#txtEstatura"), v.VALIDATION_TYPE_DECIMAL);
	//validator1.addValidation($("#slcNacionalidad"), v.VALIDATION_TYPE_REQUIRED);
	validator1.addValidation($("#txtDni"), v.VALIDATION_TYPE_INT);
	validator1.addValidation($("#txtDni"), v.VALIDATION_TYPE_LENGTH, {min:8, max:8});
	validator1.addValidation($("#txtDomicilio"), v.VALIDATION_TYPE_LENGTH, {max: 20});
	validator1.addValidation($("#divEstudios"), v.VALIDATION_TYPE_CHECKBOX_GROUP,{group: "chkEstudios", min:2});
	
	//
	var validator2 = v.createValidator($("#formulario2"), v.VALIDATE_ON_SUBMIT, 
	{
		validValidation: validacionValida,
		invalidValidation: validacionInvalida,
		validField: campoValido,
		invalidField: campoInvalido,
		validForm: formularioValido,
		invalidForm: formularioInvalido
	});
	
	validator2.addValidation($("#txtUsuario"), v.VALIDATION_TYPE_LENGTH,{required:true, max:8});
	validator2.addValidation($("#txtPassword"), v.VALIDATION_TYPE_REQUIRED);
	
	$("form").submit(function(evt){
		evt.preventDefault();
	});
	
});
