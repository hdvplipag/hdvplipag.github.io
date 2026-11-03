/*
 * LICENCIADOS DO APLICATIVO DE NOTAS
 *
 * Fica na mesma pasta do index.html. Para liberar um novo usuário, acrescente uma linha
 * em NOTAS_USUARIOS e publique o arquivo de novo.
 *
 *   email    : e-mail com que a pessoa entra (sem diferenciar maiúsculas)
 *   nome     : aparece no rodapé "Licenciado para"
 *   planilha : ID da planilha Google dessa pessoa (ou o endereço completo da planilha).
 *              Vazio = usa a planilha padrão do script.
 *   url      : endereço /exec do Apps Script. Vazio = usa o endereço padrão do app.
 *   validade : último dia de uso, no formato AAAA-MM-DD. Vazio = sem vencimento.
 *              Depois dessa data o app mostra a tela "Cópia não registrada...".
 */
var NOTAS_USUARIOS = [
  {
    email: 'sbstor@gmail.com',
    nome: 'Sebastiao Torquato',
    planilha: '13KqktuRfviyKjRxZyYR8-WKUxB5aqy_gxoP2sBPb1ZM',
    url: '',
    validade: '2027-12-31'
  }
  // , { email: 'outra.pessoa@gmail.com', nome: 'Outra Pessoa', planilha: 'ID_DA_PLANILHA', url: '', validade: '2026-12-31' }
];

// Data de hoje no formato AAAA-MM-DD (horário do aparelho)
function notasHoje() {
  var d = new Date();
  var m = String(d.getMonth() + 1); if (m.length < 2) m = '0' + m;
  var dia = String(d.getDate()); if (dia.length < 2) dia = '0' + dia;
  return d.getFullYear() + '-' + m + '-' + dia;
}

// Devolve o licenciado do e-mail (ou null se não estiver cadastrado), já com "vencida" calculado.
function notasBuscarUsuario(email) {
  var alvo = String(email || '').trim().toLowerCase();
  if (!alvo) return null;
  for (var i = 0; i < NOTAS_USUARIOS.length; i++) {
    var u = NOTAS_USUARIOS[i];
    if (String(u.email || '').trim().toLowerCase() === alvo) {
      var validade = String(u.validade || '').trim();
      return {
        email: alvo,
        nome: u.nome || alvo,
        planilha: String(u.planilha || '').trim(),
        url: String(u.url || '').trim(),
        validade: validade,
        vencida: !!validade && notasHoje() > validade
      };
    }
  }
  return null;
}
