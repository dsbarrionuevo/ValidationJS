$(document).ready(function(){
	
    function validacionValida(agrs) {
        console.log("En el campo " + agrs.field.get(0).id + " la validacion de tipo " + agrs.validation.validationType  + " es VALIDA");
    }
    function validacionInvalida(agrs) {
        console.log("En el campo " + agrs.field.get(0).id + " la validacion de tipo " + agrs.validation.validationType + " es invalida");
    }
    function campoValido(agrs) {
        console.log("El campo " + agrs.field.get(0).id + " es VALIDO");
		agrs.field.parents("div").first().removeClass("has-error");
    }
    function campoInvalido(agrs) {
        console.log("El campo " + agrs.field.get(0).id + " es invalido");
        agrs.field.parents("div").first().addClass("has-error");
        if (agrs.messages !== undefined) {
            for (var i = 0; i < agrs.messages.length; i++) {
                //parametros.campo.after('<label class="col-sm-10 mensajeError" style="font-size:14px;font-weight:normal;margin:0px;padding:4px;color:red">'+parametros.mensajes[i]+'</label>');
            }
        }
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
	
	v.create($("#formulario"), v.VALIDATE_ON_CHANGE, 
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
	
	v.addValidation($("#txtNombre"), v.VALIDATION_TYPE_REQUIRED);
	v.addValidation($("#txtApellido"), v.VALIDATION_TYPE_REQUIRED);
	v.addValidation($("#txtNacimiento"), v.VALIDATION_TYPE_CUSTOM, {validationId: "fecha"});
	v.addValidation($("#divSexo"), v.VALIDATION_TYPE_RADIO_GROUP, {groupName: "radSexo"});
	v.addValidation($("#txtEmail"), v.VALIDATION_TYPE_EMAIL);
	v.addValidation($("#txtTelefono"), v.VALIDATION_TYPE_INT);
	v.addValidation($("#txtTelefono"), v.VALIDATION_TYPE_LENGTH, {min: 7, max: 11});
	v.addValidation($("#txtEdad"), v.VALIDATION_TYPE_INT);
	v.addValidation($("#txtEdad"), v.VALIDATION_TYPE_VALUE, {min:1});
	v.addValidation($("#txtEstatura"), v.VALIDATION_TYPE_DECIMAL);
	v.addValidation($("#slcNacionalidad"), v.VALIDATION_TYPE_REQUIRED);
	v.addValidation($("#txtDni"), v.VALIDATION_TYPE_INT);
	v.addValidation($("#txtDni"), v.VALIDATION_TYPE_LENGTH, {min:8, max:8});
	v.addValidation($("#txtDomicilio"), v.VALIDATION_TYPE_LENGTH, {max: 20});
	v.addValidation($("#divEstudios"), v.VALIDATION_TYPE_CHECKBOX_GROUP,{groupName: "chkEstudios", min:2});
	
});
