var p = (function(){
	var myself = {};
	
	
	
	return myself;
}());
//test
(function(){
	
	function addMatcher($field, pattern){
		$field.keypress(function(evt){
			checkMatches($(this), pattern, evt);
			//console.log($(this).getCursorPosition());
		});
	}
	
	function checkMatches(field, pattern, evt){
		//console.log(content);
		var $field = field;
		var content = $field.val();
		var indexToCheck = field.getCursorPosition()//content.length;
		console.log("indice: "+indexToCheck);
		//String.fromCharCode(charCode);
		var lastCharacter = String.fromCharCode(evt.keyCode);
		console.log();
		//content.charAt(indexToCheck);
		//console.log("ultimo caracter: " + lastCharacter);
		var patternCharacter = pattern.charAt(indexToCheck);
		console.log(patternCharacter);
		if(patternCharacter == "."){
			//...
			//escribo el caracter
			console.log("permito lo que sea");
			//console.log("char at: "+content.charAt(indexToCheck));
			if(content.charAt(indexToCheck) !== ""){
				//no esta vacio, reemplazo el char anterior
				console.log("reemplazo " + content.charAt(indexToCheck) + " por " +lastCharacter);
				$field.val(replace(content,indexToCheck,lastCharacter));
				evt.preventDefault();
			}
		}else{
			if(patternCharacter != lastCharacter){
				console.log("chars dont match!");
				//no escribi una /, pero si escribi algo que matchee con el char siguiente lo pongo igual y auto pongo la barra
				console.log("trato de escrbiir una / y deso el car");
				indexToCheck++;//nuevov indice
				var nextCharcater = content.charAt(indexToCheck);
				var nextPatternCharacter = pattern.charAt(indexToCheck);
				if(nextPatternCharacter == "."){
					//escribo / y desp el caracter
					var firstPart = content.substring(0,indexToCheck);
					var secondPart = content.substring(indexToCheck);
					$field.val(firstPart + patternCharacter + secondPart);
				}else{
					//no escribo nada
					evt.preventDefault();
				}
			}else{
				//permito que escriba la /
				//$field.val();
			}
		}
	}
	
	function replace(content, index, value){
		var firstPart = content.substring(0,index);
		var secondPart = content.substring(index+1);
		console.log("firstPart:"+firstPart);
		console.log("secondPart:"+secondPart);
		return (firstPart + value + secondPart);
	}

	$(document).ready(function(){
		addMatcher($("#txtNacimiento"), "../../....");
		addMatcher($("#txtDni"), "..-.......-.");
	});
	
	//http://stackoverflow.com/questions/2897155/get-cursor-position-in-characters-within-a-text-input-field
	(function($) {
		$.fn.getCursorPosition = function() {
			var input = this.get(0);
			if (!input) return; // No (input) element found
			if ('selectionStart' in input) {
				// Standard-compliant browsers
				return input.selectionStart;
			} else if (document.selection) {
				// IE
				input.focus();
				var sel = document.selection.createRange();
				var selLen = document.selection.createRange().text.length;
				sel.moveStart('character', -input.value.length);
				return sel.text.length - selLen;
			}
		}
	})($);
})();
