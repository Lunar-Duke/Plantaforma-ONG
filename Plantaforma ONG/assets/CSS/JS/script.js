document.addEventListener('DOMContentLoaded', () => {

  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();


  const cpfInput = document.getElementById('cpf');
  const cepInput = document.getElementById('cep');
  const telInput = document.getElementById('telefone');
  const estadoSelect = document.getElementById('estado');
  const cidadeSelect = document.getElementById('cidade');
  const form = document.getElementById('cadastroForm');


  const onlyDigits = str => (str || '').replace(/\D/g, '');


  const maskCPF = v => {
    v = onlyDigits(v).slice(0,11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return v;
  };


  const maskCEP = v => {
    v = onlyDigits(v).slice(0,8);
    v = v.replace(/(\d{5})(\d)/, '$1-$2');
    return v;
  };


  const maskTel = v => {
    v = onlyDigits(v).slice(0,11);
    v = v.replace(/^(\d{2})(\d)/, '($1) $2');
    v = v.replace(/(\d{5})(\d)/, '$1-$2');
    return v;
  };


  function bindNumericInput(inputElem, maskFn) {
    if (!inputElem) return;

    inputElem.addEventListener('input', e => {
      const cursorPos = e.target.selectionStart;
      const oldLen = e.target.value.length;
      e.target.value = maskFn(e.target.value);
 
      const newLen = e.target.value.length;
      const diff = newLen - oldLen;
      e.target.setSelectionRange(cursorPos + Math.max(0,diff), cursorPos + Math.max(0,diff));
    });


    inputElem.addEventListener('keydown', e => {
      const allowed = [
        'Backspace','ArrowLeft','ArrowRight','Delete','Tab','Home','End'
      ];
      if (allowed.includes(e.key)) return;

      if ((e.ctrlKey || e.metaKey) && ['a','c','v','x','A','C','V','X'].includes(e.key)) return;

      if (/^[0-9]$/.test(e.key)) return;

      e.preventDefault();
    });


    inputElem.addEventListener('paste', e => {
      const paste = (e.clipboardData || window.clipboardData).getData('text') || '';
      const digits = onlyDigits(paste);
      if (!digits) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      const formatted = maskFn(digits);
 
      const start = inputElem.selectionStart;
      const end = inputElem.selectionEnd;
      const value = inputElem.value;
      inputElem.value = value.slice(0, start) + formatted + value.slice(end);
      inputElem.setSelectionRange(start + formatted.length, start + formatted.length);
    });
  }

  bindNumericInput(cpfInput, maskCPF);
  bindNumericInput(cepInput, maskCEP);
  bindNumericInput(telInput, maskTel);


  const estados = [
    { uf: 'AC', name: 'Acre' },
    { uf: 'AL', name: 'Alagoas' },
    { uf: 'AP', name: 'Amapá' },
    { uf: 'AM', name: 'Amazonas' },
    { uf: 'BA', name: 'Bahia' },
    { uf: 'CE', name: 'Ceará' },
    { uf: 'DF', name: 'Distrito Federal' },
    { uf: 'ES', name: 'Espírito Santo' },
    { uf: 'GO', name: 'Goiás' },
    { uf: 'MA', name: 'Maranhão' },
    { uf: 'MT', name: 'Mato Grosso' },
    { uf: 'MS', name: 'Mato Grosso do Sul' },
    { uf: 'MG', name: 'Minas Gerais' },
    { uf: 'PA', name: 'Pará' },
    { uf: 'PB', name: 'Paraíba' },
    { uf: 'PR', name: 'Paraná' },
    { uf: 'PE', name: 'Pernambuco' },
    { uf: 'PI', name: 'Piauí' },
    { uf: 'RJ', name: 'Rio de Janeiro' },
    { uf: 'RN', name: 'Rio Grande do Norte' },
    { uf: 'RS', name: 'Rio Grande do Sul' },
    { uf: 'RO', name: 'Rondônia' },
    { uf: 'RR', name: 'Roraima' },
    { uf: 'SC', name: 'Santa Catarina' },
    { uf: 'SP', name: 'São Paulo' },
    { uf: 'SE', name: 'Sergipe' },
    { uf: 'TO', name: 'Tocantins' }
  ];


  if (estadoSelect) {
    estadoSelect.innerHTML = '<option value="">Selecione o estado</option>';
    estados.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.uf;
      opt.textContent = `${s.name} (${s.uf})`;
      estadoSelect.appendChild(opt);
    });
  }


  if (estadoSelect && cidadeSelect) {
    estadoSelect.addEventListener('change', async (e) => {
      const uf = e.target.value;
      cidadeSelect.innerHTML = '<option value="">Carregando cidades...</option>';
      cidadeSelect.disabled = true;

      if (!uf) {
        cidadeSelect.innerHTML = '<option value="">Selecione o estado primeiro</option>';
        cidadeSelect.disabled = true;
        return;
      }

      try {
        const resp = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
        if (!resp.ok) throw new Error('Erro na API IBGE');
        const data = await resp.json();
        cidadeSelect.innerHTML = '<option value="">Selecione a cidade</option>';
        data.forEach(item => {
          const o = document.createElement('option');
          o.value = item.nome;
          o.textContent = item.nome;
          cidadeSelect.appendChild(o);
        });
        cidadeSelect.disabled = false;
      } catch (err) {
        console.error('Erro ao carregar cidades:', err);
        cidadeSelect.innerHTML = '<option value="">Não foi possível carregar cidades</option>';
        cidadeSelect.disabled = true;
      }
    });


    cidadeSelect.innerHTML = '<option value="">Selecione o estado primeiro</option>';
    cidadeSelect.disabled = true;
  }


  if (form) {
    form.addEventListener('submit', function (e) {
      if (!form.checkValidity()) {
        e.preventDefault();
        const firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      e.preventDefault();
      const rawCpf = cpfInput ? onlyDigits(cpfInput.value) : '';
      const rawCep = cepInput ? onlyDigits(cepInput.value) : '';

      console.log('CPF (raw):', rawCpf);
      console.log('CEP (raw):', rawCep);
      alert('Formulário válido! Ver console (F12) para ver os valores sem máscara.');
    });
  }

}); 
