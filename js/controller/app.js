$(function(){
	App.inicializar();
});

var Treino = function(id, nome, feito){
	this.id    = id || Util.guid();
	this.nome  = nome || "";
	this.feito = feito || false;
};

var Exercicio = function(id, nome, serie, repeticao, carga, aparelho, configuracao, feito){
	this.id           = id || Util.guid();
	this.nome         = nome || "";
	this.serie        = serie || 0
	this.repeticao    = repeticao || 0;
	this.carga        = carga || 0;
	this.aparelho     = aparelho || 0;
	this.configuracao = configuracao || "";
	this.feito        = feito || false;
};

var TreinoExercicio = function(id, list){
	this.id         = id;
	this.exercicios = list || [];
};

var App = function(){
	this.treinoKey         = 'treinos';
	this.seletorListTreino = "ul.list.treinos";
	this.treinos           = [];

	this.treinoSelecionado = null;
	this.seletorListExerc  = 'ul.list.exercicios';
	this.treinoExercicio   = new TreinoExercicio();
	this.exercicios        = [];

	this.tplItemList       = '<li id="#ID#">'
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

	////Treino

	$(document).on('click', '#novo_treino', function(e){ e.preventDefault(); scope.novoTreino(); });

	$(document).on('click', 'ul.treinos a.edit', function(e){ e.preventDefault(); scope.editarTreino(this); });

	$(document).on('click', 'ul.treinos a.remove', function(e){ e.preventDefault(); scope.excluirTreino(this); });

	$(document).on('click', 'ul.treinos div.check', function(){ scope.marcarTreino(this); });

	$(document).on('sortstop', 'ul.list.treinos', function(){ scope.ordenarTreinos(); });

	$(document).on('click', '.back.treino', function(){ scope.recuperarTreinos(); scope.carregarPaginaInicial(); });

	$(document).on('click', 'ul.list.treinos div.corpo', function(){ scope.listarExercicios(this); });

	////Exercicio
	$(document).on('click', '#novo_exercicio', function(e){e.preventDefault(); scope.novoExercicio(); });

	$(document).on('submit', '#form_exercicio', function(){ scope.novoExercicioSalvar(); return false; });

	$(document).on('click', '.back.exercicio', function(){ scope.listarExercicios(false, scope.treinoSelecionado.id); });

	$(document).on('click', 'ul.exercicios div.check', function(){ scope.marcarExercicio(this); });
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

App.prototype.buscarTreino = function(treinoId){
	for (var i = 0; i < this.treinos.length; i++) {
		if(this.treinos[i].id === treinoId)
			return this.treinos[i];
	};
};

App.prototype.salvarTreinos = function(){

	localStorage.setItem(this.treinoKey, JSON.stringify(this.treinos));
};

App.prototype.montarTreinos = function(){
	var ul = $(this.seletorListTreino);
	for (var i = 0; i < this.treinos.length; i++) {
		var t = this.treinos[i];
		var classCheck = t.feito ? 'checked' : 'unchecked';

		var li = $(this.tplItemList.replace('#ID#', t.id).replace('#NOME#', t.nome)).hide();

		li.find('.check').addClass(classCheck);

		li.appendTo(ul).slideDown(300);
	};
};

App.prototype.novoTreino = function(){
	var treino = prompt('Informe o título do treino:');

	if(treino){
		var id = Util.guid();
		var ul = $(this.seletorListTreino);

		var li = $(this.tplItemList.replace('#ID#', id).replace('#NOME#', treino)).hide();
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

//------- Exercicios

App.prototype.listarExercicios = function(element, treinoId){
	if(element){
		treinoId = $(element).closest('li').attr('id');
		this.treinoSelecionado = this.buscarTreino(treinoId);
		this.recuperarExercicios(treinoId);
	}

	var scope = this;
	Util.carregarPorAjax('exercicios.html', '.container', function(){
		$('div.titulo').text(scope.treinoSelecionado.nome);

		scope.montarExercicios();

		$('ul.list').sortable();
	});
};

App.prototype.recuperarExercicios = function(treinoId){
	var dados = localStorage.getItem(treinoId);
	if(dados) {
		this.treinoExercicio = JSON.parse(dados);
		this.exercicios      = [];
		for (var i = 0; i < this.treinoExercicio.exercicios.length; i++) {
			var id = this.treinoExercicio.exercicios[i];
			var ex =  JSON.parse(localStorage.getItem(id));
			this.exercicios.push(ex);
		};
	}
	else{
		this.treinoExercicio = new TreinoExercicio(treinoId);
		localStorage.setItem(treinoId, JSON.stringify(this.treinoExercicio));
	}
};

App.prototype.montarExercicios = function(){
	var ul = $(this.seletorListExerc);
	for (var i = 0; i < this.exercicios.length; i++) {
		var e = this.exercicios[i];
		var classCheck = e.feito ? 'checked' : 'unchecked';

		var nome = e.aparelho + ' - ' + e.nome + ' - ' + e.carga + 'kg';

		var li = $(this.tplItemList.replace('#ID#', e.id).replace('#NOME#', nome)).hide();

		li.find('.check').addClass(classCheck);

		li.appendTo(ul).slideDown(300);
	};
};

App.prototype.novoExercicio = function(){
	var scope = this;
	Util.carregarPorAjax('exercicio.html', '.container', function(){
		$('div.titulo').text('Novo Exercício');
	});
};

App.prototype.novoExercicioSalvar = function(){
	var ex   = $('#form_exercicio').serializeObject();
	ex.feito = false;
	ex.id    = Util.guid();

	localStorage.setItem(ex.id, JSON.stringify(ex));

	this.treinoExercicio.exercicios.push(ex.id);
	localStorage.setItem(this.treinoExercicio.id, JSON.stringify(this.treinoExercicio));

	this.exercicios.push(ex);

	this.listarExercicios(false, this.treinoSelecionado.id);
};

App.prototype.marcarExercicio = function(element){
	element = $(element);

	element.toggleClass('checked unchecked');

	var id = element.closest('li').attr('id');

	var exercicio = {};

	for (var i = 0; i < this.exercicios.length; i++) {
		var e = this.exercicios[i];
		if(e.id === id){
			e.feito = !e.feito;
			this.exercicios[i] = e;
			exercicio = e;
			break;
		}
	};

	localStorage.setItem(id, JSON.stringify(exercicio));
};


var Util = function(){};

Util.guid = function(){
	var s4 = function() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	};

	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

Util.carregarPorAjax = function(url, element, callback){
	$.ajax({
		type: 'GET',
		url: url,
		cache: false
	})
	.done(function(data){
		$(element).html(data);
		if(callback)
			callback();
	});
};

jQuery.fn.serializeObject = function () {
    var unindexed_array = this.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function (n, i) {
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
};