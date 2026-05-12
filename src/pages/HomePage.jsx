import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';

const GlobeScene = lazy(() => import('../components/GlobeScene').then(module => ({ default: module.GlobeScene })));

export function HomePage() {
  return (
    <div className="home-page">
      <Suspense fallback={(
        <div id="sceneLayer" aria-hidden="true">
          <div id="globeCanvas" />
          <div className="vignette" />
        </div>
      )}>
        <GlobeScene />
      </Suspense>

      <main className="sections">
        <section className="screen home-screen" id="screen-1" data-screen="1" aria-label="Tela 1: destaque do globo">
          <div className="screenShade" />
          <div className="screenContent heroTitle">
            <h1>Geo Route</h1>
            <p>Rotas BGP entre AS em escala global</p>
          </div>
        </section>

        <section className="screen home-screen" id="screen-2" data-screen="2" aria-label="Tela 2: explicacao sobre BGP e AS">
          <div className="screenShade" />
          <div className="screenContent">
            <div className="lateralLayout">
              <article className="card lateralCard">
                <span className="badge">Rotas BGP entre AS</span>
                <h2>Como a Internet escolhe caminhos</h2>
                <p>
                  O Border Gateway Protocol (BGP) coordena a troca de informacoes entre Sistemas Autonomos (AS) e define quais caminhos a Internet deve seguir para chegar a cada rede.
                  Cada AS anuncia prefixos, politicas de roteamento e preferencia de caminhos para que o trafego encontre a rota mais adequada entre provedores, empresas, provedores de transito e pontos de troca.
                  Essas decisoes sao a base da conectividade global e influenciam diretamente latencia, disponibilidade e alcance dos servicos.
                </p>
              </article>

              <div className="lateralSpacer" aria-hidden="true" />

              <article className="card lateralCard">
                <span className="badge">Monitoramento</span>
                <h2>Por que acompanhar essas rotas</h2>
                <p>
                  Alteracoes inesperadas de caminho AS-AS podem gerar latencia, indisponibilidade e eventos de seguranca como hijacking e flapping.
                  Quando um anuncio muda, um prefixo deixa de ser visto ou um AS passa a anunciar uma rota diferente, isso pode indicar instabilidade ou um incidente de roteamento.
                  Visualizar o globo completo ajuda a identificar essas mudancas mais rapido, comparar conectividade entre redes e investigar onde a topologia foi alterada.
                </p>
              </article>
            </div>
            <p className="descHint">Desca para ver as opcoes de navegacao da plataforma.</p>
          </div>
        </section>

        <section className="screen home-screen" id="screen-3" data-screen="3" aria-label="Tela 3: opcoes da plataforma">
          <div className="screenShade" />
          <div className="screenContent">
            <div className="gridOptions">
              <Link className="option" to="/search">
                <h3>Busca</h3>
                <p>Pesquise ASN, prefixo IP e organizacoes para investigar redes especificas.</p>
              </Link>

              <Link className="option" to="/map">
                <h3>Mapa Interativo</h3>
                <p>Explore conexoes entre AS, destaque rotas e acompanhe topologia BGP.</p>
              </Link>

              <Link className="option" to="/as/28513">
                <h3>Detalhe AS</h3>
                <p>Acesse informacoes completas de cada AS, peers, upstreams e historico.</p>
              </Link>

              <Link className="option" to="/admin">
                <h3>Gerenciar AS</h3>
                <p>Adicione, edite e remova sistemas autonomos usando a base local do site.</p>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}