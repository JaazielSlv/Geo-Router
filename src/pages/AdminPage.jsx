import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSystems } from '../context/SystemsContext';
import { getCountryLabel, getTypeLabel, normalizeAsn, parseAsNumber, parseListInput, systemToFormValues } from '../lib/as';

const emptyForm = {
  asn: '',
  org: '',
  country: 'BR',
  type: 'enterprise',
  routes: '0',
  description: '',
  status: 'Ativo',
  lat: '',
  lng: '',
  prefixes: '',
  upstreams: '',
  peers: ''
};

export function AdminPage() {
  const location = useLocation();
  const { systems, createSystem, updateSystem, deleteSystem, resetSystems } = useSystems();
  const [form, setForm] = useState(emptyForm);
  const [editingAsn, setEditingAsn] = useState(null);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState('');

  const focusAsn = new URLSearchParams(location.search).get('focus');

  useEffect(() => {
    if (!focusAsn) {
      return;
    }

    const target = systems.find(system => Number(system.asn) === Number(focusAsn));
    if (target) {
      setEditingAsn(target.asn);
      setForm(systemToFormValues(target));
    }
  }, [focusAsn, systems]);

  const filteredSystems = useMemo(() => {
    const term = String(search || '').trim().toUpperCase();

    return systems.filter(system => !term || [system.asn, system.org, system.country, system.type, ...system.prefixes]
      .map(value => String(value).toUpperCase())
      .some(value => value.includes(term)));
  }, [search, systems]);

  const submitForm = event => {
    event.preventDefault();

    const payload = {
      asn: parseAsNumber(form.asn),
      org: form.org.trim(),
      country: form.country.trim().toUpperCase() || 'BR',
      type: form.type,
      routes: Number(form.routes || 0),
      description: form.description.trim(),
      status: form.status.trim() || 'Ativo',
      lat: form.lat === '' ? undefined : Number(form.lat),
      lng: form.lng === '' ? undefined : Number(form.lng),
      prefixes: parseListInput(form.prefixes),
      upstreams: parseListInput(form.upstreams),
      peers: parseListInput(form.peers)
    };

    if (!payload.asn || !payload.org) {
      setFeedback('ASN e organização são obrigatórios.');
      return;
    }

    try {
      if (editingAsn) {
        updateSystem(editingAsn, payload);
        setFeedback(`AS ${normalizeAsn(payload.asn)} atualizado com sucesso.`);
      } else {
        createSystem(payload);
        setFeedback(`AS ${normalizeAsn(payload.asn)} criado com sucesso.`);
      }

      setEditingAsn(null);
      setForm(emptyForm);
    } catch (error) {
      setFeedback(error.message || 'Não foi possível salvar o registro.');
    }
  };

  const startEdit = system => {
    setEditingAsn(system.asn);
    setForm(systemToFormValues(system));
    setFeedback(`Editando ${system.asn}.`);
  };

  const removeSystem = system => {
    const confirmed = window.confirm(`Remover ${system.asn} - ${system.org}?`);

    if (!confirmed) {
      return;
    }

    deleteSystem(system.asn);
    setFeedback(`AS ${system.asn} removido.`);

    if (editingAsn && Number(editingAsn) === Number(system.asn)) {
      setEditingAsn(null);
      setForm(emptyForm);
    }
  };

  return (
    <main className="page-shell container-wide page-stack">
      <header className="page-hero card">
        <span className="badge">CRUD de AS</span>
        <h1>Gerenciar Sistemas Autônomos</h1>
        <p>Crie, edite e remova registros da base local com persistência no navegador.</p>
      </header>

      {feedback ? <div className="card feedback-card">{feedback}</div> : null}

      <section className="crud-grid">
        <form className="card page-section crud-form" onSubmit={submitForm}>
          <div className="detail-card-head">
            <h3>{editingAsn ? `Editar ${normalizeAsn(editingAsn)}` : 'Novo AS'}</h3>
            {editingAsn ? <button type="button" className="btn btn-outline" onClick={() => { setEditingAsn(null); setForm(emptyForm); }}>Cancelar</button> : null}
          </div>

          <div className="form-grid">
            <label>
              <span>ASN</span>
              <input value={form.asn} onChange={event => setForm(current => ({ ...current, asn: event.target.value }))} placeholder="28513" />
            </label>
            <label>
              <span>Organização</span>
              <input value={form.org} onChange={event => setForm(current => ({ ...current, org: event.target.value }))} placeholder="Claro S.A." />
            </label>
            <label>
              <span>País</span>
              <input value={form.country} onChange={event => setForm(current => ({ ...current, country: event.target.value }))} placeholder="BR" />
            </label>
            <label>
              <span>Tipo</span>
              <select value={form.type} onChange={event => setForm(current => ({ ...current, type: event.target.value }))}>
                <option value="enterprise">Enterprise</option>
                <option value="transit">Transit</option>
                <option value="content">Content</option>
              </select>
            </label>
            <label>
              <span>Rotas</span>
              <input value={form.routes} onChange={event => setForm(current => ({ ...current, routes: event.target.value }))} type="number" min="0" />
            </label>
            <label>
              <span>Status</span>
              <input value={form.status} onChange={event => setForm(current => ({ ...current, status: event.target.value }))} placeholder="Ativo" />
            </label>
            <label>
              <span>Latitude</span>
              <input value={form.lat} onChange={event => setForm(current => ({ ...current, lat: event.target.value }))} placeholder="-23.55" />
            </label>
            <label>
              <span>Longitude</span>
              <input value={form.lng} onChange={event => setForm(current => ({ ...current, lng: event.target.value }))} placeholder="-46.63" />
            </label>
          </div>

          <label>
            <span>Descrição</span>
            <textarea value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} rows="4" placeholder="Descrição do sistema autônomo" />
          </label>

          <label>
            <span>Prefixos</span>
            <textarea value={form.prefixes} onChange={event => setForm(current => ({ ...current, prefixes: event.target.value }))} rows="3" placeholder="200.192.0.0/16, 201.6.0.0/16" />
          </label>

          <label>
            <span>Upstreams</span>
            <textarea value={form.upstreams} onChange={event => setForm(current => ({ ...current, upstreams: event.target.value }))} rows="2" placeholder="AS3356, AS1299" />
          </label>

          <label>
            <span>Peers</span>
            <textarea value={form.peers} onChange={event => setForm(current => ({ ...current, peers: event.target.value }))} rows="2" placeholder="AS27699, AS4230" />
          </label>

          <div className="button-row">
            <button type="submit" className="btn btn-primary">{editingAsn ? 'Salvar alterações' : 'Criar AS'}</button>
            <button type="button" className="btn btn-outline" onClick={() => resetSystems()}>Restaurar base original</button>
          </div>
        </form>

        <div className="stack-gap">
          <section className="card page-section">
            <div className="detail-card-head">
              <h3>Registros</h3>
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar na base..." />
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ASN</th>
                    <th>Organização</th>
                    <th>País</th>
                    <th>Tipo</th>
                    <th>Rotas</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSystems.map(system => (
                    <tr key={system.asn}>
                      <td>{system.asn}</td>
                      <td>
                        <strong>{system.org}</strong>
                        <div className="muted-line">{system.prefixes.length} prefixos</div>
                      </td>
                      <td>{getCountryLabel(system.country)}</td>
                      <td>{getTypeLabel(system.type)}</td>
                      <td>{system.routes}</td>
                      <td>
                        <div className="button-row compact">
                          <button type="button" className="btn btn-outline" onClick={() => startEdit(system)}>Editar</button>
                          <button type="button" className="btn btn-danger" onClick={() => removeSystem(system)}>Excluir</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card page-section">
            <div className="detail-card-head">
              <h3>Dica</h3>
            </div>
            <p className="muted-line">Os dados salvos aqui atualizam busca, mapa, detalhe e dashboard automaticamente.</p>
            <Link className="btn btn-primary" to="/search">Testar a busca</Link>
          </section>
        </div>
      </section>
    </main>
  );
}