$(function(){
	App.inicializar();
});

var Treino = function(id, nome, feito){
	this.id    = id || Util.guid();
	this.nome  = nome || "";
	this.feito = feito || false;
};


var App = function(){
	this.treinoKey   = 'treinos';
	this.seletorListTreino = "ul.list.treinos";
	this.treinos     = [];
	this.tplTreino   = '<li id="#ID#">'
						+	'<div>'
						+		'<div class="check"></div>'
						+		'<div class="corpo">#NOME#</div>'
						+		'<div class="acao">'
						+			'<a class="edit" title="Editar" href="#"><span class="fa fa-edit"></span></a>'
						+			'<a class="remove" title="Excluir" href="#"><span class="fa fa-trash"></span></a>'
						+		'</div>'
						+	'</div>'
						+'</li>';
};

App.inicializar = function (){
	var app = new App()

	app.recuperarTreinos();

	app.carregarPaginaInicial();

	app.bindEvents();
};

App.prototype.bindEvents = function(){
	var scope = this;

	$(document).on('click', '#novo_treino', function(e){ e.preventDefault(); scope.novoTreino(); });

	$(document).on('click', '.ajax', function(e){ e.preventDefault(); scope.carregarPorAjax(this); });

	$(document).on('click', 'ul.treinos a.edit', function(e){ e.preventDefault(); scope.editarTreino(this); });

	$(document).on('click', 'ul.treinos a.remove', function(e){ e.preventDefault(); scope.excluirTreino(this); });

	$(document).on('click', 'ul.treinos div.check', function(){ scope.marcarTreino(this); });

	$(document).on('sortstop', 'ul.list.treinos', function(){ scope.ordenarTreinos(); });
};

App.prototype.carregarPorAjax = function(element){
	var url = $(element).attr('href');

	$.get(url, function(data){
		$('.container').html(data);
	});
};

App.prototype.carregarPaginaInicial = function(){
	var scope = this;

	Util.carregarPorAjax('treinos.html', '.container', function(){
		scope.montarTreinos();
		$('ul.list').sortable();
	});
};

App.prototype.recuperarTreinos = function(){
	var dados = localStorage.getItem(this.treinoKey);
	this.treinos = dados ? JSON.parse(dados) : [];
};

App.prototype.salvarTreinos = function(){

	localStorage.setItem(this.treinoKey, JSON.stringify(this.treinos));
};

App.prototype.montarTreinos = function(){
	var ul = $(this.seletorListTreino);
	for (var i = 0; i < this.treinos.length; i++) {
		var t = this.treinos[i];
		var classCheck = t.feito ? 'checked' : 'unchecked';

		var li = $(this.tplTreino.replace('#ID#', t.id).replace('#NOME#', t.nome)).hide();

		li.find('.check').addClass(classCheck);

		li.appendTo(ul).slideDown(300);
	};
};

App.prototype.novoTreino = function(){
	var treino = prompt('Informe o título do treino:');

	if(treino){
		var id = Util.guid();
		var ul = $(this.seletorListTreino);

		var li = $(this.tplTreino.replace('#ID#', id).replace('#NOME#', treino)).hide();
		li.find('.check').addClass('unchecked');
		li.appendTo(ul).slideDown(300);

		var t = new Treino(id, treino, false);

		this.treinos.push(t);

		this.salvarTreinos();
	}
};

App.prototype.editarTreino = function(element){
	element = $(element);

	var treino = prompt('Informe o título do treino:');

	if(treino){
		var li       = element.closest('li');
		var treinoId = li.attr('id');

		for (var i = 0; i < this.treinos.length; i++) {
			var t = this.treinos[i];
			if(t.id === treinoId){
				t.nome = treino;
				this.treinos[i] = t;
				break;
			}
		};

		li.find('.corpo').html(treino);

		this.salvarTreinos();
	}
};

App.prototype.excluirTreino = function(element){
	element = $(element);

	var confirmado = confirm('Deseja realmente excluir este treino?');

	if(confirmado){
		var treinoId = element.closest('li').attr('id');

		for (var i = 0; i < this.treinos.length; i++) {
			if(this.treinos[i].id === treinoId){
				this.treinos.splice(i, 1);
				break;
			}
		};

		this.salvarTreinos();

		element.closest('li').slideUp(300, function(){$(this).remove();});
	}
};

App.prototype.marcarTreino = function(element){
	element = $(element);

	element.toggleClass('checked unchecked');

	var id = element.closest('li').attr('id');

	for (var i = 0; i < this.treinos.length; i++) {
		var t = this.treinos[i];
		if(t.id === id){
			t.feito = !t.feito;
			this.treinos[i] = t;
			break;
		}
	};

	this.salvarTreinos();
};

App.prototype.ordenarTreinos = function(){
	this.treinos = [];
	var scope = this;
	$(this.seletorListTreino).find('li').each(function(i, li){
		li = $(li);

		var t = new Treino();

		t.id    = li.attr('id');
		t.nome  = li.find('.corpo').html();
		t.feito = li.find('.check').hasClass('checked');

		scope.treinos.push(t);
	});

	this.salvarTreinos();
};


var Util = function(){};

Util.guid = function(){
	var s4 = function() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	};

	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

Util.carregarPorAjax = function(url, element, callback){
	$.get(url, function(data){
		$(element).html(data);
		if(callback)
			callback();
	});
};