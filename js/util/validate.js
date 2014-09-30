var Validate = function(){
	this.msgRequired = 'Campo obrigatório';
	this.msgNumber   = 'Campo numérico';
	this.spanErro    = '<span class="message-validade" data-for="#FOR#" >#ERRO#</span>';
};

Validate.inicializar = function(){
	var validate = new Validate();

	$(document).on('keyup', '.required', function(){ validate.required(this); });
};

Validate.valid = function(){
	var validador = new Validate();

	$('.required').each(function(){
		var field = $(this);

		validador.required(field);
	});

	return $('.invalid').length === 0;
};


Validate.prototype.required = function(field){
	field     = $(field);
	var value = field.val();
	value     = $.trim(value);

	if(value){
		this.removeError(field);
		return true;
	}

	this.showError(field, this.msgRequired);
	return false;
};

Validate.prototype.showError = function(field, message){
	field        = $(field);
	fieldname    = field.attr('name');
	var span     = $('span[data-for="'+fieldname+'"]');
	var hasError = span.length > 0;

	field.addClass('invalid');

	if(hasError)
		span.text(message);
	else{
		span = $(this.spanErro.replace('#FOR#', fieldname).replace('#ERRO#', message)).hide();

		field.after(span);
		span.slideDown(300);
	}
}

Validate.prototype.removeError = function(field){
	field = $(field);
	var name = field.attr('name');
	$('span[data-for="'+name+'"]').slideUp(300, function(){$(this).remove();});

	field.removeClass('invalid');
}
