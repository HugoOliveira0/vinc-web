const features = [
  {
    number: '01',
    title: 'Mapa estrutural da página',
    text: 'Organiza títulos, links, botões, campos e imagens visíveis em um painel lateral.'
  },
  {
    number: '02',
    title: 'Localização assistida',
    text: 'Leva o usuário ao elemento escolhido com rolagem, foco e destaque temporário.'
  },
  {
    number: '03',
    title: 'Comandos de texto e voz',
    text: 'Interpreta instruções para navegar, rolar, ler, preencher e acionar elementos.'
  },
  {
    number: '04',
    title: 'Resumo por síntese de voz',
    text: 'Lê o título e a quantidade de elementos encontrados quando o usuário solicita.'
  },
  {
    number: '05',
    title: 'Inspeção de imagens',
    text: 'Informa descrição alternativa, ausência de texto e indicação de imagem decorativa.'
  },
  {
    number: '06',
    title: 'Preferências acessíveis',
    text: 'Salva tema, escala de texto e redução de movimento diretamente no navegador.'
  }
]

const commands = [
  ['Navegação', 'próximo título'],
  ['Localização', 'imagem 4'],
  ['Ação', 'clicar botão 2'],
  ['Formulário', 'preencher campo 1 com Hugo'],
  ['Rolagem', 'rolar pra baixo'],
  ['Leitura', 'ler resumo']
]

function App() {
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Ir para o conteúdo
      </a>

      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="V.Inc Web, início">
          <span className="brand-mark" aria-hidden="true">V</span>
          <span>V.Inc Web</span>
        </a>

        <nav aria-label="Navegação principal">
          <a href="#recursos">Recursos</a>
          <a href="#funcionamento">Como funciona</a>
          <a href="#comandos">Comandos</a>
          <a href="#instalacao">Instalação</a>
        </nav>
      </header>

      <main id="conteudo" tabIndex={-1}>
        <section className="hero" id="inicio" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Extensão para navegadores Chromium</p>
            <h1 id="hero-title">
              A estrutura da página ao alcance de mais pessoas
            </h1>
            <p className="hero-description">
              O V.Inc Web identifica os elementos visíveis de uma página e
              oferece caminhos complementares de navegação por texto, voz e
              teclado.
            </p>

            <div className="hero-actions">
              <a className="primary-action" href="#instalacao">
                Instalar para demonstração
              </a>
              <a
                className="secondary-action"
                href="https://github.com/HugoOliveira0/vinc-web"
                target="_blank"
                rel="noreferrer"
              >
                Ver código no GitHub
                <span className="visually-hidden">
                  {' '}(abre em uma nova aba)
                </span>
              </a>
            </div>

            <ul className="hero-points" aria-label="Características principais">
              <li>Processamento local</li>
              <li>Sem conta obrigatória</li>
              <li>Painel lateral persistente</li>
            </ul>
          </div>

          <section
            className="product-preview"
            aria-labelledby="preview-title"
          >
            <div className="preview-heading">
              <span className="preview-logo" aria-hidden="true">V</span>
              <div>
                <strong id="preview-title">V.Inc Web</strong>
                <span>Análise concluída</span>
              </div>
            </div>

            <div className="preview-summary">
              <p>Resumo da página</p>
              <dl>
                <div><dt>Títulos</dt><dd>8</dd></div>
                <div><dt>Links</dt><dd>24</dd></div>
                <div><dt>Botões</dt><dd>12</dd></div>
                <div><dt>Campos</dt><dd>3</dd></div>
                <div><dt>Imagens</dt><dd>16</dd></div>
              </dl>
            </div>

            <div className="preview-command">
              <span>Comando</span>
              <code>próximo título</code>
            </div>
          </section>
        </section>

        <section className="section" id="recursos" aria-labelledby="features-title">
          <div className="section-intro">
            <p className="eyebrow">Recursos principais</p>
            <h2 id="features-title">Uma camada complementar de orientação</h2>
            <p>
              A extensão não substitui leitores de tela nem corrige o site
              visitado. Ela apresenta sua estrutura de outra forma e oferece
              ações diretas sobre os elementos encontrados.
            </p>
          </div>

          <div className="feature-list">
            {features.map((feature) => (
              <article className="feature" key={feature.number}>
                <span aria-hidden="true">{feature.number}</span>
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="section process-section"
          id="funcionamento"
          aria-labelledby="process-title"
        >
          <div className="section-intro">
            <p className="eyebrow">Como funciona</p>
            <h2 id="process-title">Da análise à ação</h2>
          </div>

          <ol className="process-list">
            <li>
              <span>1</span>
              <div>
                <h3>Abra o painel</h3>
                <p>A extensão analisa automaticamente a aba ativa permitida.</p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <h3>Consulte o mapa</h3>
                <p>Pesquise e filtre os elementos visíveis encontrados.</p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <h3>Escolha uma ação</h3>
                <p>Use os controles do painel ou um comando de texto ou voz.</p>
              </div>
            </li>
          </ol>
        </section>

        <section className="section commands-section" id="comandos" aria-labelledby="commands-title">
          <div className="section-intro">
            <p className="eyebrow">Comandos disponíveis</p>
            <h2 id="commands-title">A mesma função por caminhos diferentes</h2>
            <p>
              Os exemplos podem ser digitados ou falados. Contrações comuns,
              variações de verbos e números por extenso também são reconhecidos.
            </p>
          </div>

          <table className="command-table">
            <caption className="visually-hidden">
              Exemplos de comandos disponíveis
            </caption>
            <tbody>
              {commands.map(([category, command]) => (
                <tr className="command-row" key={command}>
                  <th scope="row">{category}</th>
                  <td><code>{command}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="section principles" aria-labelledby="principles-title">
          <div className="section-intro">
            <p className="eyebrow">Acessibilidade e privacidade</p>
            <h2 id="principles-title">Decisões do projeto</h2>
          </div>

          <div className="principles-grid">
            <article>
              <h3>Compatibilidade assistiva</h3>
              <p>
                HTML semântico, foco previsível, mensagens de estado e
                controles nativos favorecem o uso por teclado e leitor de tela.
              </p>
            </article>
            <article>
              <h3>Controle do usuário</h3>
              <p>
                Leitura, voz, preenchimento e acionamento dependem de uma ação
                explícita. A extensão não envia formulários automaticamente.
              </p>
            </article>
            <article>
              <h3>Dados locais</h3>
              <p>
                A análise ocorre no navegador. A versão atual não transmite o
                conteúdo visitado para serviços externos.
              </p>
            </article>
            <article>
              <h3>Permissões limitadas</h3>
              <p>
                O Manifest V3 declara somente os recursos necessários para o
                painel, a aba ativa, a análise e as preferências.
              </p>
            </article>
          </div>
        </section>

        <section className="section install-section" id="instalacao" aria-labelledby="install-title">
          <div className="section-intro">
            <p className="eyebrow">Instalação para testes</p>
            <h2 id="install-title">Carregamento local no Chrome</h2>
            <p>
              Enquanto a extensão não está publicada na Chrome Web Store, a
              versão de desenvolvimento pode ser instalada manualmente.
            </p>
          </div>

          <ol className="install-steps">
            <li>Execute <code>npm install</code> e <code>npm run build</code> na pasta extension.</li>
            <li>Abra <code>chrome://extensions</code> e ative o modo do desenvolvedor.</li>
            <li>Selecione “Carregar sem compactação” e escolha a pasta <code>extension/dist</code>.</li>
            <li>Abra uma página comum e selecione o ícone do V.Inc Web.</li>
          </ol>

          <a
            className="primary-action"
            href="https://github.com/HugoOliveira0/vinc-web/tree/desenvolvimento"
            target="_blank"
            rel="noreferrer"
          >
            Acessar repositório
            <span className="visually-hidden">
              {' '}(abre em uma nova aba)
            </span>
          </a>
        </section>
      </main>

      <footer>
        <div className="brand footer-brand">
          <span className="brand-mark" aria-hidden="true">V</span>
          <span>V.Inc Web</span>
        </div>
        <p>Projeto de TCC do curso Técnico em Informática para Internet</p>
        <p>Hugo Oliveira da Silva e Eloá Khadijah Silva Amâncio de Souza</p>
      </footer>
    </>
  )
}

export default App
