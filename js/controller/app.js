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

	Validate.inicializar();
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

	$(document).on('click', '#save_exercicio', function(){ scope.salvarExercicio(); });

	$(document).on('click', '.back.exercicio', function(){ scope.listarExercicios(false, scope.treinoSelecionado.id); });

	$(document).on('click', 'ul.exercicios div.check', function(){ scope.marcarExercicio(this); });

	$(document).on('click', 'ul.exercicios a.remove', function(e){ e.preventDefault(); scope.excluirExercicio(this); });

	$(document).on('click', 'ul.exercicios a.edit', function(e){ e.preventDefault(); scope.editarExercicio(this); });

	$(document).on('sortstop', 'ul.list.exercicios', function(){ scope.ordenarExercicios(); });

	$(document).on('click', 'ul.list.exercicios .corpo', function(){ scope.exibirExercicio(this); });

	$(document).on('click', '.preview .close, .preview-backface', function(){ $('.preview, .preview-backface').fadeOut(300); });
};

App.prototype.carregarPaginaInicial = function(){
	var scope = this;

	Util.carregarPorAjax('treinos.html', '.container', function(){
		scope.montarTreinos();
		Util.sortableList();
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

	Util.save(this.treinoKey, this.treinos);
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

		var relacionamento = new TreinoExercicio(id);
		Util.save(id, relacionamento);
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
		// remove o treino
		for (var i = 0; i < this.treinos.length; i++) {
			if(this.treinos[i].id === treinoId){
				this.treinos.splice(i, 1);
				break;
			}
		};
		// atualiza o storage de treinos
		this.salvarTreinos();

		// remove todos os exercicios deste treino
		this.treinoExercicio = JSON.parse(localStorage.getItem(treinoId));
		$.each(this.treinoExercicio.exercicios, function(i, ex){
			localStorage.removeItem(ex);
		});

		// remove o relacionamento de treino/exercicios
		localStorage.removeItem(treinoId);

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

		Util.sortableList();
	});
};

App.prototype.recuperarExercicios = function(treinoId){
	this.treinoExercicio = Util.load(treinoId);
	this.exercicios      = [];
	for (var i = 0; i < this.treinoExercicio.exercicios.length; i++) {
		var id = this.treinoExercicio.exercicios[i];
		var ex = Util.load(id);
		this.exercicios.push(ex);
	};
};

App.prototype.montarExercicios = function(){
	var ul = $(this.seletorListExerc);
	for (var i = 0; i < this.exercicios.length; i++) {
		var e = this.exercicios[i];
		var classCheck = e.feito ? 'checked' : 'unchecked';

		var aparelho = e.aparelho ? e.aparelho + '-' : '';

		var nome = aparelho + e.nome + ' - ' + e.serie + ' x ' + e.repeticao + ' - ' + e.carga + 'kg';

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

App.prototype.salvarExercicio = function(){
	if(Validate.valid()){
		var ex = this.getExercicioForm();

		Util.save(ex.id, ex);

		var index = -1;
		$.each(this.exercicios, function(i, element){
			if(element.id === ex.id){
				index = i;
				return;
			}
		});

		if(index >= 0)
			this.exercicios[index] = ex;
		else{
			this.treinoExercicio.exercicios.push(ex.id);
			Util.save(this.treinoExercicio.id, this.treinoExercicio);

			this.exercicios.push(ex);
		}

		this.listarExercicios(false, this.treinoSelecionado.id);
	}
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

	Util.save(id, exercicio);
};

App.prototype.excluirExercicio = function(element){
	element = $(element);
	var li  = element.closest('li');
	var id  = li.attr('id');

	var index = -1;
	$.each(this.treinoExercicio.exercicios, function(i, ex){
		if(ex === id)
			index = i;
	});

	if(index >= 0)
		this.treinoExercicio.exercicios.splice(index, 1);

	index = -1;
	$.each(this.exercicios, function(i, ex){
		if(ex.id === id)
			index = i;
	});

	if(index >= 0)
		this.exercicios.splice(index, 1);

	Util.delete(id);
	Util.save(this.treinoExercicio.id, this.treinoExercicio);

	li.slideUp(300, function(){li.remove();});
};

App.prototype.editarExercicio = function(element){
	element = $(element);
	var li  = element.closest('li');
	var id  = li.attr('id');

	var exercicio = JSON.parse(localStorage.getItem(id));
	var scope     = this;
	Util.carregarPorAjax('exercicio.html', '.container', function(){
		scope.setExercicioForm(exercicio);
		$('.titulo').text('Editar Exercício');
	});
};

App.prototype.ordenarExercicios = function(){
	this.treinoExercicio.exercicios = [];
	var scope = this;
	$(this.seletorListExerc).find('li').each(function(){
		var id = $(this).attr('id');
		scope.treinoExercicio.exercicios.push(id);
	});

	Util.save(this.treinoExercicio.id, this.treinoExercicio);
};

App.prototype.exibirExercicio = function(element){
	var id = $(element).closest('li').attr('id');

	var exercicio = Util.load(id);

	$('#nome').text(exercicio.nome);
	$('#serie').text(exercicio.serie);
	$('#repeticao').text(exercicio.repeticao);
	$('#carga').text(exercicio.carga);
	$('#aparelho').text(exercicio.aparelho);
	$('#configuracao').text(exercicio.configuracao);

	$('.preview, .preview-backface').fadeIn(300);
};

App.prototype.getExercicioForm = function(){
	var ex = new Exercicio();
	var id = $('#id').val();

	if(id)
		ex.id = id;

	ex.nome         = $('#nome').val();
	ex.serie        = $('#serie').val();
	ex.repeticao    = $('#repeticao').val();
	ex.carga        = $('#carga').val();
	ex.aparelho     = $('#aparelho').val();
	ex.configuracao = $('#configuracao').val();

	return ex;
};

App.prototype.setExercicioForm = function(exercicio){
	$('#id').val(exercicio.id);
	$('#nome').val(exercicio.nome);
	$('#serie').val(exercicio.serie);
	$('#repeticao').val(exercicio.repeticao);
	$('#carga').val(exercicio.carga);
	$('#aparelho').val(exercicio.aparelho);
	$('#configuracao').val(exercicio.configuracao);
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

Util.save = function(key, obj){

	localStorage.setItem(key, JSON.stringify(obj));
};

Util.load = function(key){
	var data = localStorage.getItem(key);

	if(data)
		return JSON.parse(data);

	return null;
};

Util.delete = function(key){

	localStorage.removeItem(key);
};

Util.sortableList = function(){

	$('ul.list').sortable({ delay:300 });
};
