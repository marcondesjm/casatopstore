import { useState, useEffect } from 'react';
import styles from './LandingPage.module.css';

const ADMIN_PASSWORD = 'casatopstore123';
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const defaultConfig = {
  topBar: {
    text1: 'VAGAS LIMITADAS | OFERTA VÁLIDA APENAS ENQUANTO DURAREM OS ESTOQUES',
    text2: 'ATUALIZADO POR @casatopstore 💅 ACHADOS REAIS, DESCONTOS DE VERDADE'
  },
  logo: {
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80&crop=faces',
    alt: 'casatopstore'
  },
  badge: 'Grupo premium • vagas limitadas',
  title: {
    line1: 'Últimas Vagas para',
    line2: 'Economizar Agora'
  },
  subtitle: {
    lead: 'Últimas vagas disponíveis.',
    body: 'Oferta exclusiva enquanto durarem os estoques. Atualizado por @casatopstore 💅',
    extra: 'Achados reais, descontos de verdade e seleção premium.'
  },
  cta: {
    label: 'ENTRAR NO GRUPO VIP',
    link: 'https://chat.whatsapp.com/KBQB7Bi4qRf2waQdNzgkaj',
    subtext: 'Gratuito • Silencioso • Curadoria Real'
  },
  proof: [
    { value: '3.000+', label: 'clientes ativos' },
    { value: 'Entrega', label: 'rápida e segura' },
    { value: 'WhatsApp', label: 'atendimento real' }
  ],
  scarcity: {
    label: 'Últimas vagas',
    percent: 71,
    remaining: 16,
    note: 'Oferta exclusiva por tempo limitado •'
  },
  features: [
    {
      icon: 'fas fa-gem',
      title: 'Achados reais',
      text: 'Peças selecionadas com valor de verdade e estilo que faz a diferença no dia a dia.'
    },
    {
      icon: 'fas fa-barcode',
      title: 'Atualizado por @casatopstore',
      text: 'Seleções recentes e ofertas com foco em conforto, praticidade e acabamento premium.'
    },
    {
      icon: 'fas fa-layer-group',
      title: 'Oferta exclusiva',
      text: 'Seleção premium e disponibilidade limitada — aproveite antes que o estoque feche.'
    }
  ],
  legal: {
    terms: 'Ao acessar e utilizar o grupo de ofertas da casatopstore, você concorda em usar o material disponibilizado apenas para fins pessoais, informativos e de interesse comercial legítimo. As promoções, descontos e produtos divulgados são meramente ilustrativos e podem sofrer alterações sem aviso prévio devido à disponibilidade de estoque, condições comerciais e ajustes internos da marca. A casatopstore se reserva o direito de alterar, suspender ou encerrar campanhas, ofertas e conteúdos a qualquer momento, sem obrigação prévia de aviso, especialmente quando houver alteração de estoque, disponibilidade ou estratégia comercial. O uso do grupo, links, conteúdos e comunicação é por conta e risco do usuário, e a marca não se responsabiliza por decisões tomadas com base em informações promocionais isoladas.',
    privacy: 'A casatopstore respeita sua privacidade e apenas coleta dados necessários para a operação do grupo de ofertas, comunicação e experiência do usuário. Informações como nome, contato e dados de navegação podem ser armazenados para envio de ofertas, suporte, gestão de campanhas e melhoria da experiência no WhatsApp e em outros canais utilizados pela marca. Os dados são utilizados exclusivamente para fins de relacionamento comercial, atendimento, oferta de produtos, comunicação de campanhas e aprimoramento de serviços. A casatopstore não vende, troca ou compartilha informações pessoais com terceiros, salvo quando exigido por lei, por exigência operacional de parceiros de tecnologia ou para prestação de serviços estritamente necessários. O usuário pode solicitar acesso, correção ou exclusão de seus dados por meio do atendimento da casatopstore, conforme o canal de contato disponível na divulgação oficial da marca.'
  }
};

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const raw = await response.text();
  const payload = raw ? JSON.parse(raw) : {};

  if (!response.ok) {
    throw new Error(payload.message || 'Erro inesperado.');
  }

  return payload;
};

const LandingPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ visible: false, name: '', action: '' });
  const [legalModal, setLegalModal] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isAdminLogged, setIsAdminLogged] = useState(false);
  const [config, setConfig] = useState(defaultConfig);

  useEffect(() => {
    const boot = async () => {
      try {
        const [session, configData] = await Promise.all([
          fetchJson(`${API_BASE}/auth/session`),
          fetchJson(`${API_BASE}/config`)
        ]);

        setIsAdminLogged(Boolean(session.authenticated));
        setConfig(configData.config || defaultConfig);
      } catch (error) {
        console.error('Erro ao carregar configuração:', error);
      }
    };

    boot();
  }, []);

  const names = [
    'Cláudia', 'Renata', 'Patrícia', 'Vanessa', 'Luciana',
    'Juliana', 'Amanda', 'Carolina', 'Beatriz', 'Fernanda',
    'Débora', 'Camila', 'Mariana', 'Larissa', 'Tatiane',
    'Sílvia', 'Bianca', 'Letícia', 'Flávia', 'Helena'
  ];

  const actions = ['entrou no grupo VIP', 'garantiu uma oferta', 'acabou de entrar', 'economizou na compra'];

  useEffect(() => {
    const timer = setTimeout(() => { showNotification(); }, 2000);
    const notificationInterval = setInterval(showNotification, 6000);

    const scarcityInterval = setInterval(() => {
      setConfig((prev) => {
        const current = prev.scarcity;
        const direction = Math.random() > 0.8 ? -1 : 1;
        const delta = Math.random() > 0.7 ? 1 : 2;
        const nextPercent = Math.min(92, Math.max(65, current.percent + (direction * delta)));
        const nextRemaining = Math.max(4, Math.min(20, Math.round((100 - nextPercent) / 5.2)));

        return {
          ...prev,
          scarcity: {
            ...current,
            percent: nextPercent,
            remaining: nextRemaining
          }
        };
      });
    }, 15000);

    return () => {
      clearTimeout(timer);
      clearInterval(notificationInterval);
      clearInterval(scarcityInterval);
    };
  }, []);

  const showNotification = () => {
    const name = names[Math.floor(Math.random() * names.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    setNotification({ visible: true, name, action });
    setTimeout(() => { setNotification(prev => ({ ...prev, visible: false })); }, 3500);
  };

  const saveConfig = async (nextConfig) => {
    try {
      const response = await fetchJson(`${API_BASE}/config`, {
        method: 'PUT',
        body: JSON.stringify(nextConfig)
      });

      setConfig(response.config || nextConfig);
      return true;
    } catch (error) {
      setAdminError(error.message || 'Não foi possível salvar a edição.');
      return false;
    }
  };

  const handleFieldChange = (section, index, field, value) => {
    setConfig((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      if (section === 'proof' || section === 'features') {
        next[section][index][field] = value;
      } else {
        next[section][field] = value;
      }
      return next;
    });
  };

  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    if (typeof window.fbq !== 'undefined') {
      window.fbq('track', 'Lead', {
        content_name: 'Grupo casatopstore',
        content_category: 'Home Decor'
      });
    }
    setIsLoading(true);
    setTimeout(() => {
      window.location.href = config.cta.link;
    }, 1500);
  };

  const handleReset = async () => {
    if (isAdminLogged) {
      const saved = await saveConfig(defaultConfig);
      if (saved) {
        setAdminOpen(false);
      }
      return;
    }

    setConfig(defaultConfig);
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();

    try {
      await fetchJson(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ password: adminPassword })
      });

      setIsAdminLogged(true);
      setAdminLoginOpen(false);
      setAdminOpen(true);
      setAdminError('');
      setAdminPassword('');
    } catch (error) {
      setAdminError(error.message || 'Senha incorreta. Tente novamente.');
    }
  };

  const handleAdminLogout = async () => {
    try {
      await fetchJson(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch (error) {
      console.error('Erro ao sair:', error);
    }

    setIsAdminLogged(false);
    setAdminOpen(false);
    setAdminLoginOpen(false);
    setAdminPassword('');
    setAdminError('');
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const nextConfig = {
        ...config,
        logo: {
          ...config.logo,
          image: String(reader.result)
        }
      };

      setConfig(nextConfig);

      if (isAdminLogged) {
        saveConfig(nextConfig);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className={styles.topBar}>
        <div className={styles.topBarTrack}>
          <span>{config.topBar.text1}</span>
          <span>{config.topBar.text2}</span>
          <span>{config.topBar.text1}</span>
          <span>{config.topBar.text2}</span>
        </div>
      </div>

      <div className={styles.mainWrapper}>
        <div className={styles.container}>
          <div className={styles.logoFrame}>
            <div className={styles.logoInner}>
              <img
                src={config.logo.image}
                alt={config.logo.alt}
                className={styles.logoImg}
              />
            </div>
          </div>

          <div className={styles.heroBadge}>{config.badge}</div>

          <h1 className={styles.title}>
            {config.title.line1}<br />
            <span>{config.title.line2}</span>
          </h1>

          <p className={styles.subtitle}>
            <strong>{config.subtitle.lead}</strong> {config.subtitle.body} <br />
            {config.subtitle.extra}
          </p>

          <div className={styles.ctaBox}>
            <a
              href={config.cta.link}
              className={`${styles.ctaBtn} ${styles.pulseAnimation}`}
              onClick={handleWhatsAppClick}
            >
              <i className="fab fa-whatsapp" style={{ fontSize: '20px' }}></i>
              {config.cta.label}
            </a>
            <div className={styles.ctaSubtext}>
              <i className="fas fa-lock" style={{ color: '#BBB' }}></i> {config.cta.subtext}
            </div>
          </div>

          <div className={styles.socialProof}>
            {config.proof.map((item, index) => (
              <div key={index} className={styles.proofItem}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.scarcityContainer}>
            <div className={styles.scarcityHeader}>
              <span>{config.scarcity.label}</span>
              <span style={{ color: '#9E5A48', fontWeight: '700' }}>{config.scarcity.percent}%</span>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${config.scarcity.percent}%` }}></div>
            </div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '8px', textAlign: 'right' }}>
              {config.scarcity.note} <strong>{config.scarcity.remaining} vagas restantes</strong>
            </div>
          </div>

          <div className={styles.features}>
            {config.features.map((feature, index) => (
              <div key={index} className={styles.featureItem}>
                <div className={styles.featureIcon}><i className={feature.icon}></i></div>
                <div className={styles.featureText}>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </div>
              </div>
            ))}
          </div>

          <footer className={styles.footer}>
            <div className={styles.footerLinks}>
              <a href="#terms" onClick={(e) => { e.preventDefault(); setLegalModal('terms'); }}>Termos de Uso</a>
              {' • '}
              <a href="#privacy" onClick={(e) => { e.preventDefault(); setLegalModal('privacy'); }}>Privacidade</a>
            </div>
            <div className={styles.footerActions}>
              {isAdminLogged ? (
                <>
                  <button type="button" className={styles.adminButton} onClick={() => setAdminOpen(!adminOpen)}>
                    {adminOpen ? 'Fechar painel' : 'Editar'}
                  </button>
                  <button type="button" className={styles.secondaryButton} onClick={handleAdminLogout}>Sair</button>
                </>
              ) : (
                <button type="button" className={styles.adminButton} onClick={() => setAdminLoginOpen(true)}>
                  Acesso admin
                </button>
              )}
            </div>
          </footer>
        </div>
      </div>

      {adminLoginOpen && !isAdminLogged && (
        <div className={styles.adminOverlay} onClick={() => setAdminLoginOpen(false)}>
          <form className={styles.loginPanel} onClick={(e) => e.stopPropagation()} onSubmit={handleAdminLogin}>
            <div className={styles.adminHeader}>
              <h3>Login do painel</h3>
              <button type="button" onClick={() => setAdminLoginOpen(false)}>Fechar</button>
            </div>

            <label className={styles.loginField}>
              <span>Senha</span>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Digite a senha"
              />
            </label>

            {adminError && <p className={styles.loginError}>{adminError}</p>}

            <div className={styles.adminActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => setAdminLoginOpen(false)}>Cancelar</button>
              <button type="submit" className={styles.primaryButton}>Entrar</button>
            </div>
          </form>
        </div>
      )}

      {adminOpen && isAdminLogged && (
        <div className={styles.adminOverlay} onClick={() => setAdminOpen(false)}>
          <div className={styles.adminPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.adminHeader}>
              <h3>Painel de edição</h3>
              <div className={styles.headerActions}>
                <button type="button" className={styles.secondaryButton} onClick={handleAdminLogout}>Sair</button>
                <button type="button" onClick={() => setAdminOpen(false)}>Fechar</button>
              </div>
            </div>

            <div className={styles.adminGrid}>
              <label>
                <span>Badge</span>
                <input value={config.badge} onChange={(e) => setConfig({ ...config, badge: e.target.value })} />
              </label>

              <label>
                <span>Título 1</span>
                <input value={config.title.line1} onChange={(e) => setConfig({ ...config, title: { ...config.title, line1: e.target.value } })} />
              </label>

              <label>
                <span>Título 2</span>
                <input value={config.title.line2} onChange={(e) => setConfig({ ...config, title: { ...config.title, line2: e.target.value } })} />
              </label>

              <label>
                <span>Texto principal</span>
                <textarea value={config.subtitle.body} rows={3} onChange={(e) => setConfig({ ...config, subtitle: { ...config.subtitle, body: e.target.value } })} />
              </label>

              <label>
                <span>Texto extra</span>
                <textarea value={config.subtitle.extra} rows={3} onChange={(e) => setConfig({ ...config, subtitle: { ...config.subtitle, extra: e.target.value } })} />
              </label>

              <label>
                <span>Texto do CTA</span>
                <input value={config.cta.label} onChange={(e) => setConfig({ ...config, cta: { ...config.cta, label: e.target.value } })} />
              </label>

              <label>
                <span>Link do WhatsApp</span>
                <input value={config.cta.link} onChange={(e) => setConfig({ ...config, cta: { ...config.cta, link: e.target.value } })} />
              </label>

              <label>
                <span>Subtexto CTA</span>
                <input value={config.cta.subtext} onChange={(e) => setConfig({ ...config, cta: { ...config.cta, subtext: e.target.value } })} />
              </label>

              <label>
                <span>Topbar 1</span>
                <input value={config.topBar.text1} onChange={(e) => setConfig({ ...config, topBar: { ...config.topBar, text1: e.target.value } })} />
              </label>

              <label>
                <span>Topbar 2</span>
                <input value={config.topBar.text2} onChange={(e) => setConfig({ ...config, topBar: { ...config.topBar, text2: e.target.value } })} />
              </label>

              <label>
                <span>Imagem do logo</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                <input value={config.logo.image} onChange={(e) => setConfig({ ...config, logo: { ...config.logo, image: e.target.value } })} />
              </label>

              <label>
                <span>Legenda da imagem</span>
                <input value={config.logo.alt} onChange={(e) => setConfig({ ...config, logo: { ...config.logo, alt: e.target.value } })} />
              </label>

              {config.proof.map((item, index) => (
                <div key={`proof-${index}`} className={styles.adminGroup}>
                  <label>
                    <span>Valor prova {index + 1}</span>
                    <input value={item.value} onChange={(e) => handleFieldChange('proof', index, 'value', e.target.value)} />
                  </label>
                  <label>
                    <span>Texto prova {index + 1}</span>
                    <input value={item.label} onChange={(e) => handleFieldChange('proof', index, 'label', e.target.value)} />
                  </label>
                </div>
              ))}

              <label>
                <span>Nome da urgência</span>
                <input value={config.scarcity.label} onChange={(e) => setConfig({ ...config, scarcity: { ...config.scarcity, label: e.target.value } })} />
              </label>

              <label>
                <span>Porcentagem</span>
                <input type="number" value={config.scarcity.percent} onChange={(e) => setConfig({ ...config, scarcity: { ...config.scarcity, percent: Number(e.target.value) } })} />
              </label>

              <label>
                <span>Vagas restantes</span>
                <input type="number" value={config.scarcity.remaining} onChange={(e) => setConfig({ ...config, scarcity: { ...config.scarcity, remaining: Number(e.target.value) } })} />
              </label>

              {config.features.map((item, index) => (
                <div key={`feature-${index}`} className={styles.adminGroup}>
                  <label>
                    <span>Ícone recurso {index + 1}</span>
                    <input value={item.icon} onChange={(e) => handleFieldChange('features', index, 'icon', e.target.value)} />
                  </label>
                  <label>
                    <span>Título recurso {index + 1}</span>
                    <input value={item.title} onChange={(e) => handleFieldChange('features', index, 'title', e.target.value)} />
                  </label>
                  <label className={styles.fullWidth}>
                    <span>Texto recurso {index + 1}</span>
                    <textarea rows={3} value={item.text} onChange={(e) => handleFieldChange('features', index, 'text', e.target.value)} />
                  </label>
                </div>
              ))}

              <label className={styles.fullWidth}>
                <span>Termos de uso</span>
                <textarea rows={5} value={config.legal.terms} onChange={(e) => setConfig({ ...config, legal: { ...config.legal, terms: e.target.value } })} />
              </label>

              <label className={styles.fullWidth}>
                <span>Política de privacidade</span>
                <textarea rows={5} value={config.legal.privacy} onChange={(e) => setConfig({ ...config, legal: { ...config.legal, privacy: e.target.value } })} />
              </label>
            </div>

            <div className={styles.adminActions}>
              <button type="button" className={styles.secondaryButton} onClick={handleReset}>Resetar</button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={async () => {
                  const saved = await saveConfig(config);
                  if (saved) {
                    setAdminOpen(false);
                  }
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {legalModal && (
        <div className={styles.legalOverlay} onClick={() => setLegalModal(null)}>
          <div className={styles.legalModal} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.closeLegal}
              onClick={() => setLegalModal(null)}
              aria-label="Fechar"
            >
              ×
            </button>

            {legalModal === 'terms' ? (
              <>
                <h3>Termos de Uso</h3>
                <p>{config.legal.terms}</p>
              </>
            ) : (
              <>
                <h3>Política de Privacidade</h3>
                <p>{config.legal.privacy}</p>
              </>
            )}
          </div>
        </div>
      )}

      {isLoading && (
        <div className={styles.loadingScreen}>
          <div className={styles.spinner}></div>
          <h3 style={{ color: '#5E4B41', fontWeight: '700', fontFamily: "'Playfair Display', serif", letterSpacing: '0.5px' }}>AGUARDE...</h3>
          <p style={{ color: '#999', fontSize: '12px' }}>Preparando seu convite exclusivo.</p>
        </div>
      )}

      {notification.visible && (
        <div className={`${styles.notifyBubble} ${styles.show}`}>
          <i className="fas fa-check-circle" style={{ color: '#9E5A48', fontSize: '14px' }}></i>
          <span><strong>{notification.name}</strong> {notification.action}</span>
        </div>
      )}
    </>
  );
};

export default LandingPage;
