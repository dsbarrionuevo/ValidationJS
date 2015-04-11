var p = (function(){
	var myself = {};
	
	
	
	return myself;
}());
//test
(function(){
	
	function addMatcher($field, pattern){
		$field.keyup(function(){
			checkMatches($(this), pattern)
		});
	}
	
	function checkMatches(field, pattern){
		//console.log(content);
		var $field = field;
		var content = $field.val();
		var indexToCheck = content.length - 1;
		var lastCharacter = content.charAt(indexToCheck);
		//console.log("ultimo caracter: " + lastCharacter);
		var patternCharacter = pattern.charAt(indexToCheck);
		if(patternCharacter == "."){
			//...
		}else{
			if(patternCharacter != lastCharacter){
				console.log("chars dont match!");
			}else{
				$field.val();
			}
		}
	}

	$(document).ready(function(){
		addMatcher($("#txtNacimiento"), "../../....");
	});
})();