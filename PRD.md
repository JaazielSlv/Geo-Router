#### 1. **Visão Geral do Projeto**
O objetivo é construir uma **plataforma de rastreamento e visualização de roteamento entre Sistemas Autônomos (AS)** na Internet. O sistema permitirá a análise em tempo real de como os provedores e redes se interconectam globalmente, facilitando a detecção de anomalias, instabilidades e ataques de roteamento (e.g. sequestro de prefixo).

---

#### 2. **Problema a Ser Resolvido**
- Falta de visibilidade centralizada sobre as rotas BGP entre AS.
- Dificuldade em detectar alterações de caminho e incidentes (hijacking, flapping) em tempo real.
- Complexidade para compreender topologia global de forma interativa e acessível.

---

#### 3. **Público-Alvo**
1. **Operadores de Provedor de Internet (ISPs)**
2. **Time de Segurança de Redes**
3. **Pesquisadores e acadêmicos de redes**
4. **Empresas de monitoramento e análise de tráfego**
5. **Órgãos reguladores e de governança de Internet**

---

#### 4. **Funcionalidades Principais**

| ID | Funcionalidade | Descrição | Prioridade |
|----|----------------|-----------|------------|
| F1 | Coleta de anúncios BGP | Agregação de streams de RIBs/updates de diversas fontes (RouteViews, RIPE, etc.) + Integração com APIs públicas (BGPView, RIPEstat) para dados em tempo real | Alta |
| F2 | Processamento em tempo real | Parse de mensagens, construção de visão de roteamento e armazenamento incremental | Alta |
| F3 | Detecção de mudanças | Compare estados de rota e emita alertas de alterações de caminho ou perda de prefixo | Alta |
| F4 | Identificação de anomalias | Flags para sequestro de prefixo, flapping, loops, anúncios inválidos | Alta |
| F5 | Mapas de topologia interativos | Visualização de AS como nós e peering como enlaces, zoom e filtros geográficos | Alta |
| F6 | Histórico e replay | Linha do tempo para ver eventos passados e reconstruir estados de roteamento | Média |
| F7 | APIs de consulta | Endpoints REST/GraphQL para terceiros obter dados e métricas | Média |
| F8 | Painel de alertas e notificações | Interface para configurar e receber e‑mails/SMS/webhooks | Média |
| F9 | Relatórios e métricas | Estatísticas agregadas (média de prefixos, alterações por AS, etc.) | Baixa |

---

#### 5. **Requisitos Não Funcionais**
- **Escalabilidade**: lidar com milhões de anúncios por dia, múltiplas fontes simultâneas.
- **Latência**: atualizações de rota refletidas no sistema em <1 segundo.
- **Disponibilidade**: arquitetura redundante para 99,9 % uptime.
- **Segurança**: proteção contra ingestão de dados maliciosos, autenticação para APIs.
- **Portabilidade**: deploy em nuvem (Kubernetes/Docker) ou VM on‑premises.

---

#### 6. **Casos de Uso Principais**

1. **Operador visualiza topologia do seu AS** e rastreia caminhos até um prefixo específico.
2. **Sistema detecta um sequestro de prefixo** e envia alerta em tempo real.
3. **Analista faz replay** de um incidente passado para investigar causa.
4. **Integração via API** para obter estatísticas de roteamento para dashboard interno.
5. **Usuário filtra mapa** por região, provedor ou tipo de conexão.

---

#### 7. **Critérios de Aceitação**
- Receber e armazenar dados BGP de pelo menos três fontes principais.
- Exibir mapa de AS com conectividade correta sobre dados reais.
- Alertar automaticamente sobre >90 % de eventos de mudança de rota detectados manualmente.
- Documentação da API e painel replicáveis em ambiente de teste.

---

#### 8. **Dependências**
- Acesso a coletores BGP (RouteViews, RIPE RIS, etc.).
- Banco de dados de grafos ou timeseries (e.g., Neo4j, InfluxDB).
- Ferramenta de visualização (D3.js, Cytoscape, etc.).
- Infraestrutura de notificação (e‑mail, SMS, webhooks).

---

#### 9. **Riscos e Mitigações**
- **Sobrecarga de dados** → pipeline de ingestão com back‑pressure e amostragem.
- **Dados inconsistentes** → validação e filtragem de anúncios inválidos.
- **Mapas muito complexos** → agrupar/nivelar informações no front‑end.
- **Dependência de fontes externas** → redundância e cache local.

---

#### 10. **Métricas de Sucesso**
- Latência média de detecção <1 s.
- Volume de eventos processados (>1 M/dia).
- Tempo médio até alerta acionado (<5 s após o evento).
- Adoção por X ISPs ou Y usuários em 6 meses.

---

> 💡 **Resumo:**  
O produto fornecerá uma visão em tempo real e histórica das rotas BGP entre AS, com mapas interativos e alertas para anomalias, ajudando operadores e pesquisadores a entender e responder rapidamente à dinâmica do roteamento global.

---

#### 11. **Integração com APIs BGP (Implementado)**

Foi implementada uma integração com APIs públicas para obter dados BGP reais:

- **APIs Utilizadas:**
  - BGPView (bgpview.io) - Para upstreams, peers e downstreams de AS
  - RIPEstat (stat.ripe.net) - Como alternativa para validação

- **Funcionalidades Implementadas:**
  - Busca dinâmica de conexões upstream/downstream/peer
  - Cache local com expiração de 24h para reduzir chamadas à API
  - Tratamento de erros e fallbacks para dados offline
  - Suporte a coordenadas geográficas para visualização no mapa

- **Dados Atuais no Mapa:**
  - 15 AS brasileiros principais com conexões reais
  - Transit providers internacionais conectados (Level 3, Telia, GTT, etc.)
  - Conexões baseadas em dados BGP públicos e atualizados

- **Arquitetura da Implementação:**
  - `js/bgp-api.js` - Cliente para APIs BGP com cache inteligente
  - `pages/map.html` - Mapa Leaflet com dados dinâmicos
  - Fallback automático para dados offline quando APIs falham

- **Limitações Atuais:**
  - Rate limiting das APIs públicas (dados atualizados a cada 24h)
  - Cobertura limitada a ASs conhecidos (não busca automática de novos AS)
  - Dados de coordenadas geográficas baseados em sedes conhecidas

- **Próximas Melhorias Planejadas:**
  - Implementação de stream de dados BGP em tempo real
  - Expansão para mais ASs automaticamente
  - Detecção de anomalias em tempo real
  - Alertas para mudanças de roteamento

- **Funcionalidades Implementadas:**
  - Busca dinâmica de conexões upstream/downstream/peer para qualquer AS
  - Cache local com localStorage (24h de validade) para reduzir chamadas à API
  - Tratamento de erros e fallbacks para dados offline
  - Status de carregamento na interface
  - Foco em AS brasileiros com coordenadas geográficas aproximadas

- **Arquivos Modificados:**
  - `js/bgp-api.js` - Classe BGPAPI com métodos para buscar dados
  - `pages/map.html` - Integração do mapa com carregamento dinâmico
  - Carregamento inicial de 15 AS brasileiros conhecidos

- **Limitações:**
  - Coordenadas geográficas aproximadas (não geolocalização automática)
  - Rate limiting das APIs públicas
  - Dados IPv4 apenas (IPv6 não implementado)

---
- `static/dashboard.html` – Mockup do dashboard principal com mapa brasileiro de AS e indicadores rápidos.

As páginas usam classes utilitárias do Tailwind e carregam o script `lucide.createIcons()` para renderizar os ícones definidos via atributo `data-lucide`.

#### 12. **Visão Geral do Dashboard Principal**

O dashboard proporciona uma visão imediata do estado da rede usando elementos visuais e métricas-chave:

- **Mapa brasileiro de AS:** topologia onde nós representam Sistemas Autônomos e linhas mostram conexões BGP.
- **Indicadores rápidos:**
  - número total de AS monitorados;
  - número de prefixos ativos;
  - eventos recentes (últimos minutos);
  - alertas ativos.
- **Feed de eventos em tempo real:** lista dinâmica de ocorrências como novas rotas, mudanças de caminho e anúncios suspeitos.

Essa abordagem ajuda o usuário a compreender de forma rápida e intuitiva o panorama atual da Internet, destacando quaisquer anomalias ou mudanças significativas.

---

#### 13. **Mapa Interativo da Internet**

Esta é a funcionalidade central do projeto, estendendo o mapa estático para uma visualização interativa de toda a topologia global.

**Recursos principais:**

- **Zoom & Pan:** permita ao usuário navegar livremente pelo mapa, aproximando e afastando regiões de interesse.
- **Clique em um AS:** ao selecionar um nó, exibir detalhes como nome, ASN, prefixos anunciados, peerings e estatísticas de alterações recentes.
- **Destaque de rotas específicas:** o usuário pode pesquisar por um prefixo e o sistema desenha o caminho BGP correspondente sobre a topologia (modo highlight de rota).
- **Filtros dinâmicos:**
  - por prefixo (p.ex., 2001:db8::/32);
  - por provedor/ASN;
  - por número de hops ou distância AS‑AS;
  - por tipo de conexão (peerings, transit, etc.).

Esses controles ajudam a reduzir a complexidade visual e focar em subconjuntos de interesse para investigação.

**Modo Highlight de Rota:**

- Barra de busca onde o usuário insere um prefixo ou ASN de origem/destino.
- O mapa realça a sequência de ASs que compõem o caminho BGP atual ou histórico.
- Possibilidade de alternar entre última rota conhecida e versões anteriores (replay).

Essas funcionalidades compõem a segunda fase do projeto, transformando o dashboard em uma ferramenta de exploração profunda e investigação de eventos de roteamento. O foco está em usabilidade e performance, já que mapas ricos podem envolver milhares de nós e arestas.

---

#### 14. **Terceira Fase: Busca e Investigação de Redes**

Uma página dedicada permite ao usuário pesquisar e investigar redes específicas usando ASN, prefixo IP ou nome de provedor.

**Componentes:**
- **Campo de busca** único (ASN, IP, prefixo ou nome organizacional).
- **Resultados detalhados** exibindo:
  - ASN e nome da organização;
  - lista de prefixos atualmente anunciados;
  - provedores upstream e peers;
  - histórico de rotas e alterações.

Essa funcionalidade complementa o mapa interativo, oferecendo um ponto de entrada direto para informações de uma rede específica e facilitando análises precisas e comparações ao longo do tempo.

---

#### 15. **Quarta Fase: Detalhe de AS a partir do Mapa**

Ao clicar em um nó do mapa, o sistema redireciona para uma página de detalhes específicos do AS selecionado.

**Informações exibidas:**
- nome da organização e número ASN;
- prefixos anunciados;
- provedores upstream e peers;
- número total de rotas conhecidas;
- mini‑grafo local mostrando conexões diretas do AS.

Este recurso fornece contexto rápido durante a navegação pelo mapa e facilita a investigação de cada Sistema Autônomo sem sair da interface visual.
