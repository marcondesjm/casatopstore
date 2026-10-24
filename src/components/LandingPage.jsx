import { useState, useEffect } from 'react';
import heroImage from '../assets/hero.png';
import styles from './LandingPage.module.css';
import { supabase, requireSupabase, readSiteConfig, isSiteAdmin, writeSiteConfig } from '../utils/supabase';

const adminEntry = window.location.hostname.startsWith('admin.') || window.location.pathname === '/admin' || window.location.pathname === '/admin/';

const defaultConfig = {
  topBar: {
    text1: 'VAGAS LIMITADAS | OFERTA VÁLIDA APENAS ENQUANTO DURAREM OS ESTOQUES',
    text2: 'ATUALIZADO POR @casatopstore 💅 ACHADOS REAIS, DESCONTOS DE VERDADE'
  },
  logo: {
    image: heroImage,
    alt: 'casatopstore'
  },
  badge: 'Grupo premium • vagas limitadas',
  palette: {
    primary: '#95401C',
    secondary: '#6f2f18',
    soft: '#DED6C8',
    accent: '#BD9965',
    background: '#f6f1eb'
  },
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
    subtext: 'Gratuito • Silencioso • Curadoria Real',
    color: '#25D366'
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

const LandingPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ visible: false, name: '', action: '' });
  const [legalModal, setLegalModal] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(adminEntry);
  const [adminEmail, setAdminEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedConfig, setSavedConfig] = useState(defaultConfig);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isAdminLogged, setIsAdminLogged] = useState(false);
  const [showCredit, setShowCredit] = useState(false);
  const [config, setConfig] = useState(defaultConfig);

  useEffect(() => {
    let active = true;
    const syncSession = async (session) => {
      try {
        const allowed = await isSiteAdmin(session?.user?.id);
        if (!active) return;
        setIsAdminLogged(allowed);
        setAdminOpen(adminEntry && allowed);
        setAdminLoginOpen(adminEntry && !allowed);
        if (session && !allowed) setAdminError('Esta conta não tem permissão de administrador.');
      } catch (error) {
        if (active) setAdminError(error.message);
      }
    };
    const boot = async () => {
      try {
        const client = requireSupabase();
        const content = await readSiteConfig();
        if (active && content) {
          const next = { ...defaultConfig, ...content };
          setConfig(next);
          setSavedConfig(next);
        }
        const { data, error } = await client.auth.getSession();
        if (error) throw error;
        await syncSession(data.session);
      } catch (error) {
        if (active) setAdminError(error.message);
        console.error('Erro ao carregar configuração:', error);
      }
    };
    boot();
    const listener = supabase?.auth.onAuthStateChange((_event, session) => {
      // Run database requests outside the auth callback lock.
      setTimeout(() => { if (active) syncSession(session); }, 0);
    });
    return () => { active = false; listener?.data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    const handleContextMenu = (event) => {
      event.preventDefault();
      setShowCredit(true);
    };

    const handleKeyDown = (event) => {
      const devToolsKeys = ['F12', 'Shift', 'Control', 'Meta', 'Alt'];

      const isBlockedShortcut =
        event.key === 'F12' ||
        (event.ctrlKey && event.key.toLowerCase() === 'u') ||
        (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'i') ||
        (event.metaKey && event.key.toLowerCase() === 'u') ||
        (event.metaKey && event.shiftKey && event.key.toLowerCase() === 'i') ||
        (event.ctrlKey && event.key.toLowerCase() === 's') ||
        (event.metaKey && event.key.toLowerCase() === 's') ||
        devToolsKeys.includes(event.key);

      if (isBlockedShortcut) {
        event.preventDefault();
        setShowCredit(true);
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
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

    return () => {
      clearTimeout(timer);
      clearInterval(notificationInterval);
    };
  }, []);

  const showNotification = () => {
    const name = names[Math.floor(Math.random() * names.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    setNotification({ visible: true, name, action });
    setTimeout(() => { setNotification(prev => ({ ...prev, visible: false })); }, 3500);
  };

  const saveConfig = async (nextConfig) => {
    setIsSaving(true);
    setAdminError('');
    try {
      await writeSiteConfig(nextConfig);
      setConfig(nextConfig);
      setSavedConfig(structuredClone(nextConfig));
      return true;
    } catch (error) {
      setAdminError(error.message || 'Não foi possível salvar a edição.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const closeAdmin = () => {
    setConfig(structuredClone(savedConfig));
    setAdminOpen(false);
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

  const themeVars = {
    '--brand': config.palette?.primary || '#95401C',
    '--brand-dark': config.palette?.secondary || '#6f2f18',
    '--brand-soft': config.palette?.soft || '#DED6C8',
    '--gold': config.palette?.accent || '#BD9965',
    '--page-bg': config.palette?.background || '#f6f1eb'
  };

  const ctaButtonStyle = {
    background: `linear-gradient(135deg, ${config.cta.color || '#25D366'}, ${config.cta.color || '#25D366'} 42%, #1faa5a 100%)`,
    boxShadow: `0 18px 40px ${config.cta.color ? `${config.cta.color}66` : '#25D36666'}`
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
      if (!window.confirm('Restaurar o conteúdo padrão? Esta ação substituirá o conteúdo salvo.')) return;
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
      const client = requireSupabase();
      const { data, error } = await client.auth.signInWithPassword({ email: adminEmail, password: adminPassword });
      if (error) throw new Error('E-mail ou senha inválidos.');
      if (!await isSiteAdmin(data.user.id)) {
        await client.auth.signOut();
        throw new Error('Esta conta não tem permissão de administrador.');
      }

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
      const { error } = await requireSupabase().auth.signOut();
      if (error) throw error;
    } catch (error) {
      setAdminError(error.message);
      return;
    }

    setConfig(structuredClone(savedConfig));
    setIsAdminLogged(false);
    setAdminOpen(false);
    setAdminLoginOpen(false);
    setAdminPassword('');
    setAdminError('');
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setAdminError('Escolha uma imagem PNG, JPEG, WebP ou GIF de até 2 MB.');
      return;
    }

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

      <div className={styles.mainWrapper} style={themeVars}>
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
              style={ctaButtonStyle}
              onClick={handleWhatsAppClick}
            >
              <i className="fab fa-whatsapp" style={{ fontSize: '20px' }}></i>
              {config.cta.label}
            </a>
            <div className={styles.ctaSubtext}>
              <i className="fas fa-lock" style={{ color: '#25D366' }}></i> {config.cta.subtext}
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
              {adminEntry && <button type="button" onClick={() => isAdminLogged ? setAdminOpen(true) : setAdminLoginOpen(true)}>Abrir painel</button>}

              <a href="#terms" onClick={(e) => { e.preventDefault(); setLegalModal('terms'); }}>Termos de Uso</a>
              {' • '}
              <a href="#privacy" onClick={(e) => { e.preventDefault(); setLegalModal('privacy'); }}>Privacidade</a>
            </div>
          </footer>

          <div className={styles.footerNote}>
            © 2026 Casa Top Store. Todos os direitos reservados. | Site criado por{' '}
            <a href="https://www.instagram.com/marcondes.machado.oficial/" target="_blank" rel="noreferrer">
              @marcondes.machado.oficial
            </a>
          </div>
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
              <span>E-mail</span>
              <input type="email" required autoComplete="username" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
            </label>
            <label className={styles.loginField}>
              <span>Senha</span>
              <input
                type="password"
                required
                autoComplete="current-password"
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
        <div className={styles.adminOverlay} onClick={closeAdmin}>
          <div className={styles.adminPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.adminHeader}>
              <h3>Painel de edição</h3>
              <div className={styles.headerActions}>
                <button type="button" className={styles.secondaryButton} onClick={handleAdminLogout}>Sair</button>
                <button type="button" onClick={closeAdmin}>Fechar</button>
              </div>
            </div>

            {adminError && <p role="alert" className={styles.loginError}>{adminError}</p>}
            <fieldset disabled={isSaving} className={styles.adminFields}>
            <div className={styles.adminGrid}>
              <label>
                <span>Badge</span>
                <input value={config.badge} onChange={(e) => setConfig({ ...config, badge: e.target.value })} />
              </label>

              <label>
                <span>Cor principal</span>
                <input
                  type="color"
                  value={config.palette?.primary || '#95401C'}
                  onChange={(e) => setConfig({ ...config, palette: { ...config.palette, primary: e.target.value } })}
                />
              </label>

              <label>
                <span>Cor secundária</span>
                <input
                  type="color"
                  value={config.palette?.secondary || '#6f2f18'}
                  onChange={(e) => setConfig({ ...config, palette: { ...config.palette, secondary: e.target.value } })}
                />
              </label>

              <label>
                <span>Cor de destaque</span>
                <input
                  type="color"
                  value={config.palette?.accent || '#BD9965'}
                  onChange={(e) => setConfig({ ...config, palette: { ...config.palette, accent: e.target.value } })}
                />
              </label>

              <label>
                <span>Cor suave</span>
                <input
                  type="color"
                  value={config.palette?.soft || '#DED6C8'}
                  onChange={(e) => setConfig({ ...config, palette: { ...config.palette, soft: e.target.value } })}
                />
              </label>

              <label>
                <span>Cor de fundo</span>
                <input
                  type="color"
                  value={config.palette?.background || '#f6f1eb'}
                  onChange={(e) => setConfig({ ...config, palette: { ...config.palette, background: e.target.value } })}
                />
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
                <span>Cor do botão</span>
                <input
                  type="color"
                  value={config.cta.color || '#b76542'}
                  onChange={(e) => setConfig({ ...config, cta: { ...config.cta, color: e.target.value } })}
                />
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
                {isSaving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
            </fieldset>
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
