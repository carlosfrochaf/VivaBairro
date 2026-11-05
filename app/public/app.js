// Interface da versão Alfa. As regras de validação vêm do mesmo módulo usado pelo servidor.
import { validarAviso, CATEGORIAS_AVISO, LIMITES } from '/dominio/validacao.js';
import { detectarDadosSensiveis } from '/dominio/privacidade.js';
import { validarCadastro, validarLogin, LIMITES_CONTA } from '/dominio/contas.js';

const CHAVE_BAIRRO = 'vivabairro.bairro';
const CHAVE_RASCUNHO = 'vivabairro.rascunho-aviso';
const ROTAS_PUBLICAS = ['', 'entrar', 'criar-conta'];
const principal = document.getElementById('conteudo');
let catalogo = null;
let sessao; // undefined = ainda não consultada; null = sem login

// ---------- utilidades ----------

const esc = (valor) =>
  String(valor ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const formatarData = (iso) =>
  new Date(iso).toLocaleString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

function avisar(texto) {
  const caixa = document.getElementById('aviso-tela');
  caixa.textContent = texto;
  clearTimeout(avisar.t);
  avisar.t = setTimeout(() => (caixa.textContent = ''), 4500);
}

async function api(caminho, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(caminho, {
      ...opcoes,
      headers: { 'Content-Type': 'application/json' },
      body: opcoes.corpo ? JSON.stringify(opcoes.corpo) : undefined,
    });
  } catch {
    const erro = new Error('Sem conexão com o servidor. Verifique a internet e tente de novo.');
    erro.status = 0;
    throw erro;
  }
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    const erro = new Error(dados.mensagem ?? 'Não foi possível concluir a ação.');
    Object.assign(erro, { status: resposta.status, dados });
    // Sessão expirada em uma ação protegida: volta para a tela de entrada.
    if (resposta.status === 401 && !opcoes.semRedirecionar) {
      sessao = null;
      avisar('Sua sessão terminou. Entre de novo para continuar.');
      location.hash = '#/entrar';
    }
    throw erro;
  }
  return dados;
}

const bairroAtual = () => localStorage.getItem(CHAVE_BAIRRO);
const nomeBairro = (id) => catalogo?.bairros.find((b) => b.id === id)?.nome ?? '';

function mostrar(html, titulo) {
  principal.innerHTML = html;
  document.title = `${titulo} · VivaBairro Alfa`;
  // Leva o foco ao título para leitores de tela anunciarem a nova tela.
  const h1 = principal.querySelector('h1');
  if (h1) {
    h1.tabIndex = -1;
    h1.focus();
  }
}

function telaDeErro(erro) {
  mostrar(
    `<h1>Não foi possível carregar</h1>
     <div class="caixa erro" role="alert"><p>${esc(erro.message)}</p></div>
     <button class="botao" id="tentar">Tentar de novo</button>
     <a class="botao secundario" href="#/inicio">Voltar ao início</a>`,
    'Erro',
  );
  document.getElementById('tentar').onclick = () => rotear();
}

function cartaoEvento(e) {
  const vagas = e.vagas === null ? 'sem limite de vagas' : `${e.vagas} vaga(s)`;
  return `<a class="cartao cartao-evento" href="#/evento/${esc(e.id)}">
      <div class="capa ${capaDe(e.id)}" aria-hidden="true"></div>
      <h3>${esc(e.titulo)}</h3>
      <p class="meta">${esc(formatarData(e.inicio))}</p>
      <p class="meta">${e.confirmados} confirmado(s) · ${vagas}</p>
      <div class="etiquetas">
        <span class="etiqueta ${esc(e.estado)}">${esc(e.estadoNome)}</span>
        ${e.gratuito ? '<span class="etiqueta gratuito">Gratuito</span>' : ''}
        ${e.euConfirmei ? '<span class="etiqueta voce">✓ Você vai</span>' : ''}
      </div>
    </a>`;
}

function cartaoAviso(a, comAcoes = false) {
  const acoes = comAcoes && a.acoes.length
    ? `<div aria-label="Atualizar estado">${a.acoes
        .map((ac) => `<button class="botao secundario pequeno" data-aviso="${esc(a.id)}" data-estado="${esc(ac.id)}">${ac.id === 'aberto' ? 'Reabrir aviso' : `Marcar como ${esc(ac.nome.toLowerCase())}`}</button>`)
        .join('')}</div>`
    : '';
  return `<article class="cartao cartao-aviso">
      <span class="icone" aria-hidden="true">!</span>
      <div>
        <span class="rotulo">${esc(a.categoriaNome)}</span>
        <h3>${esc(a.titulo)}</h3>
        <p class="meta">${esc(a.local)}</p>
        <p class="meta">${esc(a.origem)} · ${esc(formatarData(a.criadoEm))}</p>
        <span class="etiqueta">Estado: ${esc(a.estadoNome)}</span>
      </div>
      ${acoes ? `<div class="acoes-aviso">${acoes}</div>` : ''}
    </article>`;
}

const SOL = `<svg class="sol" viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="44" fill="#FFD166"/><path d="M24 53c17-31 30-32 48 0M28 62h40M36 38V21M60 38V21" fill="none" stroke="#14253D" stroke-width="5" stroke-linecap="round"/></svg>`;
const ONDA = `<svg viewBox="0 0 393 90" preserveAspectRatio="none" aria-hidden="true"><path d="M0 84c70-42 123-4 180-35 63-35 108-2 213-49v90H0Z" fill="#E47A43" opacity=".4"/></svg>`;
const CHECK = `<svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><path d="m9 21 8 8 15-17" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const capaDe = (id) => ([...String(id)].reduce((t, c) => t + c.charCodeAt(0), 0) % 2 ? 'capa-a' : 'capa-b');

// ---------- telas ----------

function esconderNavegacao(esconder) {
  document.querySelector('.topo').hidden = esconder;
  document.querySelector('.navegacao').hidden = esconder;
}

function opcoesBairro(selecionado) {
  return catalogo.bairros
    .map((b) => `<option value="${esc(b.id)}" ${b.id === selecionado ? 'selected' : ''}>${esc(b.nome)}</option>`)
    .join('');
}

// Campo de formulário com rótulo, ajuda e espaço para erro ligados por aria-describedby.
function campoConta(id, rotulo, controle, ajuda = '') {
  return `<div class="campo" id="campo-${id}">
      <label for="${id}">${rotulo}</label>${controle}
      ${ajuda ? `<p class="ajuda" id="ajuda-${id}"><span>${ajuda}</span></p>` : ''}
      <p class="erro-campo" id="erro-${id}" hidden></p></div>`;
}

// Exibe erros por campo e um resumo com links; leva o foco ao primeiro erro.
function exibirErrosConta(form, campos, erros) {
  for (const id of campos) {
    const mensagem = erros[id];
    const el = form.elements[id];
    const erro = document.getElementById(`erro-${id}`);
    const temAjuda = document.getElementById(`ajuda-${id}`);
    document.getElementById(`campo-${id}`).classList.toggle('com-erro', Boolean(mensagem));
    erro.hidden = !mensagem;
    erro.textContent = mensagem ?? '';
    el.setAttribute('aria-invalid', mensagem ? 'true' : 'false');
    el.setAttribute('aria-describedby', [mensagem && `erro-${id}`, temAjuda && `ajuda-${id}`].filter(Boolean).join(' '));
  }
  const lista = campos.filter((c) => erros[c]);
  const resumo = form.querySelector('.resumo-erros');
  resumo.innerHTML = lista.length
    ? `<div class="caixa erro" role="alert"><p><strong>Revise ${lista.length} campo(s):</strong></p><ul>${lista
        .map((c) => `<li><a href="#${c}" data-foco="${c}">${esc(erros[c])}</a></li>`)
        .join('')}</ul></div>`
    : '';
  resumo.querySelectorAll('[data-foco]').forEach((a) => (a.onclick = (ev) => { ev.preventDefault(); form.elements[a.dataset.foco].focus(); }));
  if (lista.length) form.elements[lista[0]].focus();
}

function mostrarErroGeral(form, mensagem) {
  form.querySelector('.resumo-erros').innerHTML = `<div class="caixa erro" role="alert"><p>${esc(mensagem)}</p></div>`;
}

function botaoMostrarSenha(form) {
  form.querySelectorAll('[data-mostrar]').forEach((botao) => {
    botao.onclick = () => {
      const campo = form.elements[botao.dataset.mostrar];
      const visivel = campo.type === 'text';
      campo.type = visivel ? 'password' : 'text';
      botao.textContent = visivel ? 'Mostrar senha' : 'Ocultar senha';
      botao.setAttribute('aria-pressed', String(!visivel));
    };
  });
}

function concluirEntrada(conta, mensagem) {
  sessao = conta;
  localStorage.setItem(CHAVE_BAIRRO, conta.bairroId);
  avisar(mensagem);
  location.hash = '#/inicio';
}

async function entrarDemonstracao(botao) {
  botao.disabled = true;
  try {
    const { conta } = await api('/api/sessao/demonstracao', { method: 'POST' });
    concluirEntrada(conta, 'Você entrou com a conta de demonstração.');
  } catch (erro) {
    avisar(erro.message);
    botao.disabled = false;
  }
}

function telaEntrada() {
  esconderNavegacao(true);
  mostrar(
    `<section class="boas-vindas">
      ${SOL}
      <h1>VivaBairro</h1>
      <p class="chamada">Veja o que acontece no bairro.</p>
      <p class="apoio">Eventos, avisos e iniciativas locais.</p>
      <div class="acoes">
        <a class="botao" href="#/entrar">Entrar</a>
        <a class="botao contorno-claro" href="#/criar-conta">Criar conta</a>
        <button type="button" class="link-claro" id="demo">Explorar com a conta de demonstração</button>
        <p class="rodape">${esc(catalogo.municipio.nome)}. Não pedimos sua localização nem endereço.</p>
      </div>
    </section>`,
    'Boas-vindas',
  );
  document.getElementById('demo').onclick = (ev) => entrarDemonstracao(ev.currentTarget);
}

function telaEntrar() {
  esconderNavegacao(true);
  mostrar(
    `<a class="voltar" href="#/">‹  Voltar</a>
     <h1>Entrar</h1>
     <p class="suave">Use o e-mail e a senha da sua conta.</p>
     <form id="form-entrar" novalidate>
       <div class="resumo-erros"></div>
       ${campoConta('email', 'E-mail', '<input id="email" name="email" type="email" autocomplete="email" inputmode="email" />')}
       ${campoConta('senha', 'Senha', '<input id="senha" name="senha" type="password" autocomplete="current-password" /><button type="button" class="chip" data-mostrar="senha" aria-pressed="false" style="margin-top:8px">Mostrar senha</button>')}
       <button class="botao" type="submit" id="botao-entrar">Entrar</button>
     </form>
     <p>Ainda não tem conta? <a href="#/criar-conta">Criar conta</a></p>
     <p class="suave">Recuperação de senha por e-mail ainda não existe nesta versão.</p>
     <button type="button" class="botao secundario" id="demo">Explorar com a conta de demonstração</button>`,
    'Entrar',
  );
  const form = document.getElementById('form-entrar');
  const campos = ['email', 'senha'];
  botaoMostrarSenha(form);
  document.getElementById('demo').onclick = (ev) => entrarDemonstracao(ev.currentTarget);

  form.onsubmit = async (ev) => {
    ev.preventDefault();
    const valores = { email: form.elements.email.value, senha: form.elements.senha.value };
    const v = validarLogin(valores);
    exibirErrosConta(form, campos, v.erros);
    if (!v.valido) return;
    const botao = document.getElementById('botao-entrar');
    botao.disabled = true;
    botao.textContent = 'Entrando…';
    try {
      const { conta } = await api('/api/sessao', { method: 'POST', corpo: valores, semRedirecionar: true });
      concluirEntrada(conta, `Olá, ${conta.nome}!`);
    } catch (erro) {
      if (erro.dados?.erros) exibirErrosConta(form, campos, erro.dados.erros);
      else mostrarErroGeral(form, erro.message);
      // A senha é apagada; o e-mail continua para a pessoa só corrigir a senha.
      form.elements.senha.value = '';
      form.elements.senha.focus();
      botao.disabled = false;
      botao.textContent = 'Entrar';
    }
  };
}

function telaCriarConta() {
  esconderNavegacao(true);
  mostrar(
    `<a class="voltar" href="#/">‹  Voltar</a>
     <h1>Criar conta</h1>
     <p class="suave">Pedimos só o necessário. Todos os campos são obrigatórios.</p>
     <form id="form-conta" novalidate>
       <div class="resumo-erros"></div>
       ${campoConta('nome', 'Nome de exibição', `<input id="nome" name="nome" autocomplete="nickname" maxlength="${LIMITES_CONTA.nome.max}" />`, 'É como os vizinhos vão ver você. Pode ser um apelido.')}
       ${campoConta('email', 'E-mail', '<input id="email" name="email" type="email" autocomplete="email" inputmode="email" />', 'Usado para entrar. Não aparece para outras pessoas.')}
       ${campoConta('senha', 'Senha', '<input id="senha" name="senha" type="password" autocomplete="new-password" /><button type="button" class="chip" data-mostrar="senha" aria-pressed="false" style="margin-top:8px">Mostrar senha</button>', `Pelo menos ${LIMITES_CONTA.senha.min} caracteres, com letras e números.`)}
       ${campoConta('confirmacao', 'Repita a senha', '<input id="confirmacao" name="confirmacao" type="password" autocomplete="new-password" />')}
       ${campoConta('bairroId', 'Bairro principal', `<select id="bairroId" name="bairroId"><option value="">Selecione…</option>${opcoesBairro('')}</select>`, 'Define o que aparece primeiro no início. Não pedimos endereço.')}
       <button class="botao destaque" type="submit" id="botao-criar">Criar conta</button>
     </form>
     <p>Já tem conta? <a href="#/entrar">Entrar</a></p>`,
    'Criar conta',
  );
  const form = document.getElementById('form-conta');
  const campos = ['nome', 'email', 'senha', 'confirmacao', 'bairroId'];
  const valores = () => Object.fromEntries(campos.map((c) => [c, form.elements[c].value]));
  botaoMostrarSenha(form);

  // Depois do primeiro erro, cada campo é revalidado enquanto a pessoa corrige.
  form.addEventListener('input', (ev) => {
    if (ev.target.getAttribute('aria-invalid') !== 'true') return;
    const { erros } = validarCadastro(valores(), catalogo.bairros.map((b) => b.id));
    const atuais = Object.fromEntries(campos.filter((c) => form.elements[c].getAttribute('aria-invalid') === 'true').map((c) => [c, erros[c]]));
    for (const id of campos) {
      if (!(id in atuais)) continue;
      const erro = document.getElementById(`erro-${id}`);
      erro.hidden = !atuais[id];
      erro.textContent = atuais[id] ?? '';
      document.getElementById(`campo-${id}`).classList.toggle('com-erro', Boolean(atuais[id]));
      if (!atuais[id]) form.elements[id].setAttribute('aria-invalid', 'false');
    }
  });

  form.onsubmit = async (ev) => {
    ev.preventDefault();
    const v = validarCadastro(valores(), catalogo.bairros.map((b) => b.id));
    exibirErrosConta(form, campos, v.erros);
    if (!v.valido) return;
    const botao = document.getElementById('botao-criar');
    botao.disabled = true;
    botao.textContent = 'Criando conta…';
    try {
      const { conta } = await api('/api/contas', { method: 'POST', corpo: valores(), semRedirecionar: true });
      concluirEntrada(conta, `Conta criada. Boas-vindas, ${conta.nome}!`);
    } catch (erro) {
      if (erro.dados?.erros) exibirErrosConta(form, campos, erro.dados.erros);
      else mostrarErroGeral(form, erro.message);
      botao.disabled = false;
      botao.textContent = 'Criar conta';
    }
  };
}

function telaBairro() {
  mostrar(
    `<a class="voltar" href="#/inicio">‹  Início</a>
     <h1>Trocar bairro</h1>
     <p class="suave">Escolha qual bairro ver no início. Isso não muda o bairro das suas publicações.</p>
     <form id="form-bairro">
       <div class="campo"><label for="bairro">Bairro</label>
       <select id="bairro">${opcoesBairro(bairroAtual())}</select></div>
       <button class="botao" type="submit">Ver este bairro</button>
     </form>`,
    'Trocar bairro',
  );
  document.getElementById('form-bairro').onsubmit = (ev) => {
    ev.preventDefault();
    localStorage.setItem(CHAVE_BAIRRO, document.getElementById('bairro').value);
    avisar(`Mostrando ${nomeBairro(bairroAtual())}.`);
    location.hash = '#/inicio';
  };
}

const filtrosFeed = { q: '', tipo: '' };

async function telaInicio() {
  const bairro = bairroAtual();
  const params = new URLSearchParams({ bairro, q: filtrosFeed.q, tipo: filtrosFeed.tipo });
  const feed = await api(`/api/feed?${params}`);
  const ativos = [filtrosFeed.q && `texto “${filtrosFeed.q}”`, filtrosFeed.tipo && (filtrosFeed.tipo === 'evento' ? 'só eventos' : 'só avisos')].filter(Boolean);
  const vazio = !feed.eventos.length && !feed.avisos.length;

  mostrar(
    `<h1 class="ola">Olá!</h1>
     <p class="suave">Bairro selecionado · ${esc(nomeBairro(bairro))} · <a href="#/bairro">trocar</a></p>
     <form class="busca" id="form-busca" role="search">
       <label for="q" class="pular">Buscar no bairro</label>
       <input id="q" type="search" value="${esc(filtrosFeed.q)}" placeholder="Buscar: praça, luz, feira" />
       <button class="botao pequeno" type="submit">Buscar</button>
     </form>
     <div class="filtros" role="group" aria-label="Tipo de publicação">
       ${[['', 'Tudo'], ['evento', 'Eventos'], ['aviso', 'Avisos']]
         .map(([v, n]) => `<button class="chip" data-tipo="${v}" aria-pressed="${filtrosFeed.tipo === v}">${n}</button>`)
         .join('')}
     </div>
     ${ativos.length ? `<p class="filtros-ativos">Filtros ativos: ${esc(ativos.join(', '))} · <button class="chip" id="limpar">Limpar filtros</button></p>` : ''}
     ${vazio
       ? `<div class="caixa info" role="status"><p><strong>Nada encontrado.</strong></p>
          <p>Tente outra palavra, limpe os filtros ou escolha outro bairro.</p></div>`
       : ''}
     ${feed.eventos.length ? `<section class="destaque-semana"><span class="rotulo">Próximos dias</span><h2>Próximas atividades</h2>
       <p>Eventos no bairro selecionado.</p></section>
       <div class="grade">${feed.eventos.map(cartaoEvento).join('')}</div>` : ''}
     ${feed.avisos.length ? `<h2>Avisos do bairro</h2><div class="lista-avisos">${feed.avisos.map((a) => cartaoAviso(a)).join('')}</div>` : ''}`,
    'Início',
  );

  document.getElementById('form-busca').onsubmit = (ev) => {
    ev.preventDefault();
    filtrosFeed.q = document.getElementById('q').value.trim();
    rotear();
  };
  principal.querySelectorAll('[data-tipo]').forEach((b) => (b.onclick = () => { filtrosFeed.tipo = b.dataset.tipo; rotear(); }));
  const limpar = document.getElementById('limpar');
  if (limpar) limpar.onclick = () => { filtrosFeed.q = ''; filtrosFeed.tipo = ''; rotear(); };
}

function confirmarAcao(mensagem, rotuloConfirmar) {
  return new Promise((resolver) => {
    const dialogo = document.createElement('dialog');
    dialogo.setAttribute('aria-labelledby', 'dlg-titulo');
    dialogo.innerHTML = `<h2 id="dlg-titulo" style="margin-top:0">Confirmar</h2><p>${esc(mensagem)}</p>
      <button class="botao perigo" value="sim">${esc(rotuloConfirmar)}</button>
      <button class="botao secundario" value="nao" autofocus>Manter como está</button>`;
    document.body.append(dialogo);
    dialogo.querySelectorAll('button').forEach((b) => (b.onclick = () => dialogo.close(b.value)));
    dialogo.onclose = () => { resolver(dialogo.returnValue === 'sim'); dialogo.remove(); };
    dialogo.showModal();
  });
}

async function telaEvento(id) {
  const e = await api(`/api/eventos/${encodeURIComponent(id)}`);
  const podeConfirmar = e.estado === 'inscricoes-abertas' && !e.euConfirmei;
  let acao;
  if (e.euConfirmei) acao = `<div class="caixa info"><p>✓ Você confirmou presença.</p></div><button class="botao perigo" id="cancelar">Cancelar minha presença</button>`;
  else if (e.estado === 'lotado') acao = `<div class="caixa alerta" role="status"><p><strong>Evento lotado.</strong> Não há vagas agora. Se alguém cancelar, a vaga volta a aparecer aqui.</p></div>`;
  else if (!podeConfirmar) acao = `<div class="caixa alerta"><p>Este evento não aceita confirmações (${esc(e.estadoNome)}).</p></div>`;
  else acao = `<button class="botao" id="confirmar">Quero participar</button>`;

  mostrar(
    `<div class="capa-evento ${capaDe(e.id)}">
       <a class="voltar" href="#/inicio">‹  Voltar</a>
       <span class="sol-capa" aria-hidden="true"></span>${ONDA}
     </div>
     <div class="detalhe">
       <span class="rotulo">Evento · ${esc(e.bairro)}</span>
       <h1>${esc(e.titulo)}</h1>
       <p class="suave">${esc(formatarData(e.inicio))} até ${esc(new Date(e.fim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))}</p>
       <span class="etiqueta ${esc(e.estado)}">${esc(e.estadoNome)}</span>${e.gratuito ? '<span class="etiqueta gratuito">Gratuito</span>' : ''}
       <hr class="divisor" />
       <p>${esc(e.descricao)}</p>
       <div class="ponto-encontro">
         <span class="rotulo">Ponto de encontro</span>
         <p>${esc(e.local)}</p>
         <p class="meta">${e.confirmados} pessoa(s) confirmada(s) · ${e.vagas === null ? 'sem limite de vagas' : `${e.vagas} vaga(s) restante(s)`}</p>
         <span class="pino" aria-hidden="true">⌖</span>
       </div>
       <div id="erro-acao"></div>
       ${acao}
     </div>`,
    e.titulo,
  );

  const mostrarErro = (erro) => {
    document.getElementById('erro-acao').innerHTML = `<div class="caixa erro" role="alert"><p>${esc(erro.message)}</p></div>`;
  };
  const confirmar = document.getElementById('confirmar');
  if (confirmar) confirmar.onclick = async () => {
    confirmar.disabled = true;
    confirmar.textContent = 'Confirmando…';
    try {
      await api(`/api/eventos/${encodeURIComponent(id)}/presenca`, { method: 'POST' });
      location.hash = `#/confirmado/${id}`;
    } catch (erro) {
      mostrarErro(erro);
      confirmar.disabled = false;
      confirmar.textContent = 'Quero participar';
    }
  };
  const cancelar = document.getElementById('cancelar');
  if (cancelar) cancelar.onclick = async () => {
    if (!(await confirmarAcao('Sua vaga será liberada para outra pessoa. Você pode confirmar de novo enquanto houver vaga.', 'Cancelar presença'))) return;
    try {
      await api(`/api/eventos/${encodeURIComponent(id)}/presenca`, { method: 'DELETE' });
      avisar('Presença cancelada.');
      rotear();
    } catch (erro) { mostrarErro(erro); }
  };
}

async function telaConfirmado(id) {
  const e = await api(`/api/eventos/${encodeURIComponent(id)}`);
  mostrar(
    `<div class="confirmado"><div class="selo" aria-hidden="true"><span>${CHECK}</span></div>
     <h1>Presença confirmada!</h1><p class="suave">Seu lugar está reservado.</p></div>
     <div class="cartao cartao-destaque"><span class="rotulo">Sua próxima atividade</span><h3>${esc(e.titulo)}</h3><p class="meta">${esc(formatarData(e.inicio))} · ${esc(e.local)}</p></div>
     <a class="botao" href="#/perfil">Ver minhas atividades</a>
     <a class="botao secundario" href="#/inicio">Voltar ao início</a>
     <p class="nota">Lembretes por e-mail ainda não existem nesta versão.</p>`,
    'Presença confirmada',
  );
}

function lerRascunho() {
  try { return JSON.parse(localStorage.getItem(CHAVE_RASCUNHO)) ?? {}; } catch { return {}; }
}

function telaPublicar() {
  const r = { bairroId: bairroAtual(), ...lerRascunho() };
  const temRascunho = Boolean(r.titulo || r.descricao || r.local);
  const opcoesCat = CATEGORIAS_AVISO.map((c) => `<option value="${c.id}" ${c.id === r.categoria ? 'selected' : ''}>${esc(c.nome)}</option>`).join('');
  const opcoesBairro = catalogo.bairros.map((b) => `<option value="${b.id}" ${b.id === r.bairroId ? 'selected' : ''}>${esc(b.nome)}</option>`).join('');
  const campo = (id, rotulo, html, ajuda) => `<div class="campo" id="campo-${id}">
      <label for="${id}">${rotulo}</label>${html}
      <p class="ajuda" id="ajuda-${id}"><span>${ajuda}</span><span id="conta-${id}"></span></p>
      <p class="erro-campo" id="erro-${id}" hidden></p></div>`;

  mostrar(
    `<a class="voltar" href="#/inicio">‹  Início</a>
     <h1>Criar aviso</h1>
     <p class="suave">Conte algo importante para o bairro. Campos com * são obrigatórios.</p>
     ${temRascunho ? '<div class="caixa info" role="status"><p>Recuperamos o rascunho que você começou. <button class="chip" id="descartar">Descartar rascunho</button></p></div>' : ''}
     <div class="caixa alerta"><p><strong>Não é canal de emergência.</strong> Em risco imediato, procure os canais oficiais de emergência da sua região.</p></div>
     <div id="resumo-erros"></div>
     <form id="form-aviso" novalidate>
       ${campo('titulo', 'Título *', `<input id="titulo" name="titulo" maxlength="${LIMITES.titulo.max}" value="${esc(r.titulo)}" placeholder="Ex.: banco quebrado na praça" />`, `De ${LIMITES.titulo.min} a ${LIMITES.titulo.max} caracteres.`)}
       ${campo('categoria', 'Categoria *', `<select id="categoria" name="categoria"><option value="">Selecione…</option>${opcoesCat}</select>`, 'Ajuda vizinhos a encontrar o aviso.')}
       ${campo('bairroId', 'Bairro *', `<select id="bairroId" name="bairroId">${opcoesBairro}</select>`, 'O aviso aparece no feed deste bairro.')}
       ${campo('local', 'Local *', `<input id="local" name="local" maxlength="${LIMITES.local.max}" value="${esc(r.local)}" placeholder="Rua ou ponto de referência público" />`, 'Use um lugar público. Não informe endereço residencial.')}
       ${campo('descricao', 'O que aconteceu? *', `<textarea id="descricao" name="descricao" maxlength="${LIMITES.descricao.max}" placeholder="Explique de um jeito simples para quem puder ajudar.">${esc(r.descricao)}</textarea>`, 'Não inclua telefone, documentos ou dados de outras pessoas.')}
       <div id="alerta-privacidade" aria-live="polite"></div>

       <section class="ia" aria-labelledby="ia-titulo">
         <h2 id="ia-titulo" style="margin-top:0">Sugestão por IA (opcional)</h2>
         <p class="suave">Nesta Alfa a IA é <strong>simulada</strong>: regras locais, sem envio a serviço externo.</p>
         <p>Se você autorizar, apenas o <strong>título</strong> e a <strong>descrição</strong> são enviados. Conta, bairro e local não são enviados. Nada é publicado automaticamente.</p>
         <label class="marcar"><input type="checkbox" id="consentimento" /> Autorizo enviar título e descrição para gerar uma sugestão.</label>
         <button type="button" class="botao secundario" id="pedir-ia" disabled>Sugerir categoria e resumo</button>
         <div id="resultado-ia" aria-live="polite"></div>
       </section>

       <button class="botao destaque" type="submit" id="publicar">Publicar aviso</button>
       <p class="suave">Você pode publicar sem usar a IA.</p>
     </form>`,
    'Criar aviso',
  );

  const form = document.getElementById('form-aviso');
  const campos = ['titulo', 'categoria', 'bairroId', 'local', 'descricao'];
  const valores = () => Object.fromEntries(campos.map((c) => [c, form.elements[c].value]));

  function marcarErro(id, mensagem) {
    const caixa = document.getElementById(`campo-${id}`);
    const el = form.elements[id];
    const erro = document.getElementById(`erro-${id}`);
    caixa.classList.toggle('com-erro', Boolean(mensagem));
    erro.hidden = !mensagem;
    erro.textContent = mensagem ?? '';
    el.setAttribute('aria-invalid', mensagem ? 'true' : 'false');
    el.setAttribute('aria-describedby', mensagem ? `erro-${id} ajuda-${id}` : `ajuda-${id}`);
  }

  function atualizarContadores() {
    for (const id of ['titulo', 'local', 'descricao']) {
      document.getElementById(`conta-${id}`).textContent = `${form.elements[id].value.length}/${LIMITES[id].max}`;
    }
  }

  function atualizarPrivacidade() {
    const v = valores();
    const alertas = detectarDadosSensiveis(v.titulo, v.descricao, v.local);
    document.getElementById('alerta-privacidade').innerHTML = alertas.length
      ? `<div class="caixa alerta"><p><strong>Revise antes de publicar:</strong></p><ul>${alertas.map((a) => `<li>${esc(a.mensagem)} Evite expor dados pessoais.</li>`).join('')}</ul></div>`
      : '';
  }

  // Salva o rascunho a cada digitação: erro de rede ou da IA não apaga o texto (RF-10, RNF-07).
  form.addEventListener('input', (ev) => {
    if (campos.includes(ev.target.name)) {
      localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(valores()));
      if (ev.target.getAttribute('aria-invalid') === 'true') {
        marcarErro(ev.target.name, validarAviso(valores(), catalogo.bairros.map((b) => b.id)).erros[ev.target.name]);
      }
    }
    atualizarContadores();
    atualizarPrivacidade();
  });
  // Valida cada campo ao sair dele.
  form.addEventListener('focusout', (ev) => {
    if (campos.includes(ev.target.name) && ev.target.value) {
      marcarErro(ev.target.name, validarAviso(valores(), catalogo.bairros.map((b) => b.id)).erros[ev.target.name]);
    }
  });
  atualizarContadores();
  atualizarPrivacidade();
  campos.forEach((c) => marcarErro(c, null));

  const descartar = document.getElementById('descartar');
  if (descartar) descartar.onclick = async () => {
    if (await confirmarAcao('O texto que você escreveu será apagado.', 'Descartar rascunho')) {
      localStorage.removeItem(CHAVE_RASCUNHO);
      telaPublicar();
    }
  };

  const consentimento = document.getElementById('consentimento');
  const pedirIa = document.getElementById('pedir-ia');
  consentimento.onchange = () => (pedirIa.disabled = !consentimento.checked);
  pedirIa.onclick = async () => {
    const saida = document.getElementById('resultado-ia');
    const v = valores();
    pedirIa.disabled = true;
    pedirIa.textContent = 'Gerando sugestão…';
    const motivos = {
      'sem-consentimento': 'Marque a autorização para pedir uma sugestão.',
      'texto-vazio': 'Escreva o título ou a descrição antes de pedir uma sugestão.',
      'tempo-esgotado': 'A sugestão demorou demais.',
      'resposta-invalida': 'A sugestão recebida não era válida.',
      falha: 'O serviço de sugestão falhou.',
    };
    try {
      const r = await api('/api/ia/sugestao', { method: 'POST', corpo: { consentimento: consentimento.checked, titulo: v.titulo, descricao: v.descricao } });
      if (!r.ok) {
        saida.innerHTML = `<div class="caixa alerta"><p>${esc(motivos[r.motivo] ?? motivos.falha)} Seu texto continua no formulário e você pode publicar sem IA.</p></div>`;
      } else {
        const nomeCat = CATEGORIAS_AVISO.find((c) => c.id === r.sugestao.categoria)?.nome;
        saida.innerHTML = `<div class="caixa info"><p class="rotulo">Sugestão (revise antes de usar)</p>
          <p><strong>Categoria:</strong> ${esc(nomeCat)}</p>
          <div class="campo"><label for="resumo-ia">Resumo sugerido (editável)</label><textarea id="resumo-ia">${esc(r.sugestao.resumo)}</textarea></div>
          <button type="button" class="botao pequeno" id="usar-ia">Usar sugestão</button>
          <button type="button" class="botao secundario pequeno" id="descartar-ia">Descartar</button></div>`;
        document.getElementById('usar-ia').onclick = () => {
          form.elements.categoria.value = r.sugestao.categoria;
          const resumo = document.getElementById('resumo-ia').value.trim();
          if (resumo) form.elements.descricao.value = resumo;
          form.dispatchEvent(new Event('input'));
          localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(valores()));
          saida.innerHTML = '<p class="suave">Sugestão aplicada. Revise o texto e publique quando quiser.</p>';
          form.elements.descricao.focus();
        };
        document.getElementById('descartar-ia').onclick = () => (saida.innerHTML = '<p class="suave">Sugestão descartada. Seu texto não mudou.</p>');
      }
    } catch (erro) {
      saida.innerHTML = `<div class="caixa alerta"><p>${esc(erro.message)} Seu texto continua no formulário.</p></div>`;
    } finally {
      pedirIa.disabled = !consentimento.checked;
      pedirIa.textContent = 'Sugerir categoria e resumo';
    }
  };

  function exibirErros(erros) {
    campos.forEach((c) => marcarErro(c, erros[c]));
    const lista = campos.filter((c) => erros[c]);
    document.getElementById('resumo-erros').innerHTML = lista.length
      ? `<div class="caixa erro" role="alert" tabindex="-1" id="caixa-erros"><p><strong>Revise ${lista.length} campo(s):</strong></p><ul>${lista
          .map((c) => `<li><a href="#${c}" data-foco="${c}">${esc(erros[c])}</a></li>`)
          .join('')}</ul></div>`
      : '';
    principal.querySelectorAll('[data-foco]').forEach((a) => (a.onclick = (ev) => { ev.preventDefault(); form.elements[a.dataset.foco].focus(); }));
    if (lista.length) form.elements[lista[0]].focus();
  }

  form.onsubmit = async (ev) => {
    ev.preventDefault();
    const v = validarAviso(valores(), catalogo.bairros.map((b) => b.id));
    if (!v.valido) return exibirErros(v.erros);
    exibirErros({});
    const botao = document.getElementById('publicar');
    botao.disabled = true;
    botao.textContent = 'Publicando…';
    try {
      const r = await api('/api/avisos', { method: 'POST', corpo: valores() });
      localStorage.removeItem(CHAVE_RASCUNHO);
      avisar('Aviso publicado. Você pode acompanhar o estado em Meu perfil.');
      location.hash = '#/perfil';
      return r;
    } catch (erro) {
      // Erros do servidor voltam para os mesmos campos; o rascunho continua salvo.
      if (erro.dados?.erros) exibirErros(erro.dados.erros);
      else document.getElementById('resumo-erros').innerHTML = `<div class="caixa erro" role="alert"><p>${esc(erro.message)} Seu texto foi mantido.</p></div>`;
      botao.disabled = false;
      botao.textContent = 'Publicar aviso';
    }
  };
}

async function telaPerfil() {
  const p = await api('/api/perfil');
  mostrar(
    `<h1 class="ola">Meu espaço</h1>
     <div class="perfil-cabecalho">
       <span class="avatar" aria-hidden="true">${esc(p.conta.nome.trim().charAt(0).toUpperCase())}</span>
       <div><h2>${esc(p.conta.nome)}</h2><p>Bairro principal: ${esc(p.conta.bairro)}</p><p>${esc(p.conta.email)}</p></div>
     </div>
     <div class="numeros"><div><strong>${p.eventos.length}</strong><span>atividades</span></div><div><strong>${p.avisos.length}</strong><span>avisos</span></div></div>
     <h2>Próximas atividades</h2>
     ${p.eventos.length
       ? p.eventos.map((e) => `<a class="cartao item-lista" href="#/evento/${esc(e.id)}"><div><h3>${esc(e.titulo)}</h3><p class="meta">${esc(formatarData(e.inicio))} · Confirmada</p></div><span class="seta" aria-hidden="true">›</span></a>`).join('')
       : '<p class="suave">Você ainda não confirmou presença em eventos. <a href="#/inicio">Ver eventos do bairro</a></p>'}
     <h2>Seus avisos</h2>
     <div id="erro-perfil"></div>
     <div class="lista-avisos">${p.avisos.length ? p.avisos.map((a) => cartaoAviso(a, true)).join('') : '<p class="suave">Você ainda não publicou avisos. <a href="#/publicar">Criar aviso</a></p>'}</div>`,
    'Meu perfil',
  );
  principal.insertAdjacentHTML('beforeend', '<button class="botao secundario" id="sair">Sair da conta</button>');
  document.getElementById('sair').onclick = async () => {
    await api('/api/sessao', { method: 'DELETE' }).catch(() => {});
    sessao = null;
    localStorage.removeItem(CHAVE_RASCUNHO);
    avisar('Você saiu da conta.');
    location.hash = '#/';
  };
  principal.querySelectorAll('[data-aviso]').forEach((b) => (b.onclick = async () => {
    try {
      await api(`/api/avisos/${encodeURIComponent(b.dataset.aviso)}/estado`, { method: 'PATCH', corpo: { estado: b.dataset.estado } });
      avisar('Estado do aviso atualizado.');
      telaPerfil();
    } catch (erro) {
      document.getElementById('erro-perfil').innerHTML = `<div class="caixa erro" role="alert"><p>${esc(erro.message)}</p></div>`;
    }
  }));
}

// ---------- roteamento ----------

async function rotear() {
  const [, rota = '', id] = location.hash.replace(/^#\/?/, '/').split('/');
  try {
    catalogo ??= await api('/api/bairros');
    if (sessao === undefined) {
      sessao = await api('/api/sessao', { semRedirecionar: true }).then((r) => r.conta).catch(() => null);
    }
    // Sem login, só as telas públicas; com login, as públicas levam ao início.
    if (!sessao && !ROTAS_PUBLICAS.includes(rota)) return void (location.hash = '#/');
    if (sessao && ROTAS_PUBLICAS.includes(rota)) return void (location.hash = '#/inicio');
    if (rota === '') return telaEntrada();
    if (rota === 'entrar') return telaEntrar();
    if (rota === 'criar-conta') return telaCriarConta();

    if (!bairroAtual()) localStorage.setItem(CHAVE_BAIRRO, sessao.bairroId);
    esconderNavegacao(false);
    document.getElementById('bairro-ativo').textContent = nomeBairro(bairroAtual());
    document.querySelectorAll('.navegacao a').forEach((a) =>
      a.dataset.rota === rota ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
    if (rota === 'bairro') return telaBairro();
    if (rota === 'evento') return await telaEvento(id);
    if (rota === 'confirmado') return await telaConfirmado(id);
    if (rota === 'publicar') return telaPublicar();
    if (rota === 'perfil') return await telaPerfil();
    return await telaInicio();
  } catch (erro) {
    if (erro.status !== 401) telaDeErro(erro);
  }
}

window.addEventListener('hashchange', rotear);
rotear();
