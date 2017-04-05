/* global ValidatorJS */

$(document).ready(function () {
    // Validación de fecha
    ValidatorJS.addCustomValidation("fecha", function ($input, parametros) {
        var valor = $input.val().trim();
        if (valor.length === 0) {
            return true;
        }
        // Se considera el formato válido como dd/mm/aaaa
        var formatoFecha = (/^\d{2}\/\d{2}\/\d{4}$/.test(valor));
        if (formatoFecha === false) {
            return false;
        }
        if (parametros === undefined) {
            return formatoFecha;
        } else {
            var obtenerFechaDesdeCadena = function (cadena) {
                var partes = cadena.split("/");
                var fecha = null;
                if (partes.length === 3) {
                    fecha = new Date(partes[2], partes[1], partes[0], 0, 0, 0, 0);
                }
                return fecha;
            };
            var fecha = obtenerFechaDesdeCadena(valor);
            var cumpleLimites = true;
            if (parametros.min !== undefined) {
                var fechaMinima = obtenerFechaDesdeCadena(parametros.min);
                if (fechaMinima !== null) {
                    cumpleLimites &= fecha.getTime() >= fechaMinima.getTime();
                }
            }
            if (parametros.max !== undefined) {
                var fechaMaxima = obtenerFechaDesdeCadena(parametros.max);
                if (fechaMaxima !== null) {
                    cumpleLimites &= fecha.getTime() <= fechaMaxima.getTime();
                }
            }
            return cumpleLimites !== 0;
        }
    });

    // Validación de hora
    ValidatorJS.addCustomValidation("hora", function ($input, parametros) {
        var valor = $input.val().trim();
        if (valor.length === 0) {
            return true;
        }
        // Se considera el formato válido como hh:mm
        var formatoHora = (/^\d{2}:\d{2}$/.test(valor));
        if (formatoHora === false) {
            return false;
        }
        if (parametros === undefined) {
            return formatoHora;
        } else {
            var obtenerHoraDesdeCadena = function (cadena) {
                var hoy = new Date();
                var partes = cadena.split(":");
                var horaDate = null;
                if (partes.length === 2) {
                    horaDate = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), partes[0], partes[1], 0, 0);
                }
                return horaDate;
            };
            var hora = obtenerHoraDesdeCadena(valor);
            var cumpleLimites = true;
            if (parametros.min !== undefined) {
                var horaMinima = obtenerHoraDesdeCadena(parametros.min);
                if (horaMinima !== null) {
                    cumpleLimites &= hora.getTime() >= horaMinima.getTime();
                }
            }
            if (parametros.max !== undefined) {
                var horaMaxima = obtenerHoraDesdeCadena(parametros.max);
                if (horaMaxima !== null) {
                    cumpleLimites &= hora.getTime() <= horaMaxima.getTime();
                }
            }
            return cumpleLimites !== 0;
        }
    });

    // Validación de fecha y hora
    ValidatorJS.addCustomValidation("fecha_hora", function ($input, parametros) {
        var valor = $input.val().trim();
        if (valor.length === 0) {
            return true;
        }
        // Se considera el formato válido como dd/mm/aaaa hh:mm
        var formatoFecha = (/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(valor));
        if (formatoFecha === false) {
            return false;
        }
        if (parametros === undefined) {
            return formatoFecha;
        } else {
            var obtenerFechaDesdeCadena = function (cadena) {
                var partes = cadena.split(" ");
                var fecha = null;
                if (partes.length === 2) {
                    var partesFecha = partes[0].split("/");
                    var partesHora = partes[1].split(":");
                    if (partesFecha.length === 3 && partesHora.length === 2) {
                        fecha = new Date(partesFecha[2], partesFecha[1], partesFecha[0], partesHora[0], partesHora[1], 0, 0);
                    }
                }
                return fecha;
            };
            var fecha = obtenerFechaDesdeCadena(valor);
            var cumpleLimites = true;
            if (parametros.min !== undefined) {
                var fechaMinima = obtenerFechaDesdeCadena(parametros.min);
                if (fechaMinima !== null) {
                    cumpleLimites &= fecha.getTime() >= fechaMinima.getTime();
                }
            }
            if (parametros.max !== undefined) {
                var fechaMaxima = obtenerFechaDesdeCadena(parametros.max);
                if (fechaMaxima !== null) {
                    cumpleLimites &= fecha.getTime() <= fechaMaxima.getTime();
                }
            }
            return cumpleLimites !== 0;
        }
    });

    ValidatorJS.addCustomValidation("solo_letras_minusculas_y_digitos", function ($input, parametros) {
        var valor = $input.val();
        if (valor === "") {
            return true;
        } else {
            return /^([a-z0-9])*$/.test(valor);
        }
    });

    ValidatorJS.addCustomValidation("valores_iguales", function ($input, parametros) {
        var otroValor = parametros.otro_input.val();
        var valor = $input.val();
        return otroValor === valor;
    });
});
