$(document).ready(function(){
	//escribiendo en html
    /*$("form").each(function(){
     var $form = $(this);
     if($form.data("validador")){
     var tipoValidadorData = $form.data("validador");
     var tipoValidador;
     if(tipoValidadorData === "campo"){
     tipoValidador = Validador.prototype.VALIDADOR_BLUR;
     }else if(tipoValidadorData === "texto"){
     tipoValidador = Validador.prototype.VALIDADOR_CHANGE;
     }else{
     tipoValidador = Validador.prototype.VALIDADOR_FORMULARIO;
     }
     var validador = new Validador({
     tipoValidador: tipoValidador,
     formulario: $form,
     campoValido: campoValido, 
     campoInvalido: campoInvalido, 
     formularioValido: formularioValido
     });
     $form.find("input").each(function(){
     var $input = $(this);
     if($input.data("validacion")){
     var parametrosValidacion = undefined;
     var listaValidaciones = $input.data("validacion");
     var partes = listaValidaciones.split(" ");
     for(var i=0; i<partes.length; i++){
     var tipoValidacionData = partes[i];
     var tipoValidacion;
     if(tipoValidacionData === "requerido"){
     tipoValidacion = Validacion.prototype.TIPO_VALIDACION_REQUERIDO;
     }else if(tipoValidacionData === "numero"){
     tipoValidacion = Validacion.prototype.TIPO_VALIDACION_NUMERICO;
     }else if(tipoValidacionData === "email"){
     tipoValidacion = Validacion.prototype.TIPO_VALIDACION_EMAIL;
     }else if(tipoValidacionData === "longitud"){
     //else if(/longitud\(((min|minimo):[0-9]+(,\s*(max|maximo):[0-9]+)?|(max|maximo):[0-9]+(,\s*(min|minimo):[0-9]+)?)\)/.test(tipoValidacionData)){}
     tipoValidacion = Validacion.prototype.TIPO_VALIDACION_LONGITUD;
     var longitudMinima = parseInt($input.data("longitud-min"));
     var longitudMaxima = parseInt($input.data("longitud-max"));
     parametrosValidacion = {};
     parametrosValidacion.longitudMinima = longitudMinima;
     parametrosValidacion.longitudMaxima = longitudMaxima;
     }else if(tipoValidacionData === "valor"){
     //else if(/longitud\(((min|minimo):[0-9]+(,\s*(max|maximo):[0-9]+)?|(max|maximo):[0-9]+(,\s*(min|minimo):[0-9]+)?)\)/.test(tipoValidacionData)){}
     tipoValidacion = Validacion.prototype.TIPO_VALIDACION_LONGITUD;
     var valorMinimo = $input.data("valor-min");
     var valorMaximo = $input.data("valor-max");
     parametrosValidacion = {};
     parametrosValidacion.valorMinimo = valorMinimo;
     parametrosValidacion.valorMaximo = valorMaximo;
     }
     
     validador.agregarValidacion(new Validacion({
     campo: $input,
     tipoValidacion: tipoValidacion,
     parametrosValidacion: parametrosValidacion
     }));
     }
     }
     });
     }
     });*/
});