(() => {
    'use strict';

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const announcer = document.getElementById('live-announcer');

    function announce(msg) {
        if (!announcer) return;
        announcer.textContent = '';
        window.setTimeout(() => {
            announcer.textContent = msg;
        }, 40);
    }

    /* ======================================================================
       1. Automação de Datas: Idade (Aniversário 08/02/2002) e Ano Atual
       ====================================================================== */
    const BIRTH_YEAR = 2002;
    const BIRTH_MONTH = 2; // Fevereiro
    const BIRTH_DAY = 8;   // Dia 8

    function calculateCurrentAge() {
        const now = new Date();
        let age = now.getFullYear() - BIRTH_YEAR;
        const month = now.getMonth() + 1;
        const day = now.getDate();
        if (month < BIRTH_MONTH || (month === BIRTH_MONTH && day < BIRTH_DAY)) {
            age -= 1;
        }
        return age;
    }

    const currentAge = calculateCurrentAge();
    document.querySelectorAll('.auto-age').forEach((el) => {
        el.textContent = String(currentAge);
    });

    const yearEl = document.getElementById('auto-current-year');
    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }

    /* Fallback seguro da foto de perfil */
    const profilePhoto = document.getElementById('profile-photo');
    if (profilePhoto) {
        profilePhoto.addEventListener('error', () => {
            profilePhoto.src = './mgt/eu.jpeg';
            profilePhoto.style.objectPosition = '54% 66%';
        }, { once: true });
    }

    /* Inicializa ícones Lucide quando carregados */
    if (window.lucide) {
        window.lucide.createIcons();
    }

    /* ======================================================================
       2. Menu Mobile, Cápsula Orbital na Navbar & Botões Magnéticos no Hero
       ====================================================================== */
    const menuToggle = document.getElementById('menu-toggle');
    const primaryNav = document.getElementById('primary-nav');
    const navList = document.getElementById('nav-list');
    const navLinks = document.querySelectorAll('.nav-link');
    let isUserNavClick = false;
    let userNavClickTimer = 0;

    function moveNavGlider(targetLink) {
        if (!navList || !targetLink || window.innerWidth <= 1020) return;
        const listRect = navList.getBoundingClientRect();
        const linkRect = targetLink.getBoundingClientRect();
        if (linkRect.width <= 0) return;

        const x = linkRect.left - listRect.left;
        navList.style.setProperty('--glider-x', `${x.toFixed(1)}px`);
        navList.style.setProperty('--glider-w', `${linkRect.width.toFixed(1)}px`);
        navList.style.setProperty('--glider-opacity', '1');
        navList.dataset.gliderReady = 'true';
    }

    function syncNavToCurrent() {
        const current = navList ? navList.querySelector('.nav-link.is-current') : null;
        if (current) moveNavGlider(current);
    }

    function setCurrentNavByHref(hashHref) {
        navLinks.forEach((link) => {
            const active = link.getAttribute('href') === hashHref;
            link.classList.toggle('is-current', active);
            if (active) {
                link.setAttribute('aria-current', 'location');
            } else {
                link.removeAttribute('aria-current');
            }
        });
        syncNavToCurrent();
    }

    if (navList) {
        navLinks.forEach((link) => {
            link.addEventListener('mouseenter', () => moveNavGlider(link));
            link.addEventListener('focus', () => moveNavGlider(link));
            link.addEventListener('click', () => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    isUserNavClick = true;
                    setCurrentNavByHref(href);
                    window.clearTimeout(userNavClickTimer);
                    userNavClickTimer = window.setTimeout(() => {
                        isUserNavClick = false;
                    }, 950);
                }
            });
        });

        navList.addEventListener('mouseleave', syncNavToCurrent);
        navList.addEventListener('focusout', (e) => {
            if (!navList.contains(e.relatedTarget)) {
                syncNavToCurrent();
            }
        });

        syncNavToCurrent();
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(syncNavToCurrent);
        }
        window.addEventListener('resize', syncNavToCurrent, { passive: true });
    }

    function closeMobileNav() {
        if (!menuToggle || !primaryNav) return;
        primaryNav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Abrir menu');
    }

    if (menuToggle && primaryNav) {
        menuToggle.addEventListener('click', () => {
            const open = primaryNav.classList.toggle('is-open');
            menuToggle.setAttribute('aria-expanded', String(open));
            menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        });

        primaryNav.querySelectorAll('a').forEach((a) => {
            a.addEventListener('click', closeMobileNav);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && primaryNav.classList.contains('is-open')) {
                closeMobileNav();
                menuToggle.focus();
            }
        });
    }

    /* Lente gravitacional interativa nos botões do Hero (Buraco Negro) */
    document.querySelectorAll('.magnetic-bh-btn').forEach((btn) => {
        btn.addEventListener('pointermove', (e) => {
            if (e.pointerType !== 'mouse' || reducedMotionQuery.matches) return;
            const rect = btn.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            const relX = e.clientX - rect.left;
            const relY = e.clientY - rect.top;
            const pctX = (relX / rect.width) * 100;
            const pctY = (relY / rect.height) * 100;
            const pullX = ((relX / rect.width) - 0.5) * 7;
            const pullY = ((relY / rect.height) - 0.5) * 6;

            btn.style.setProperty('--mx', `${pctX.toFixed(1)}%`);
            btn.style.setProperty('--my', `${pctY.toFixed(1)}%`);
            btn.style.setProperty('--tx', `${pullX.toFixed(2)}px`);
            btn.style.setProperty('--ty', `${pullY.toFixed(2)}px`);
        });

        btn.addEventListener('pointerleave', () => {
            btn.style.setProperty('--mx', '50%');
            btn.style.setProperty('--my', '50%');
            btn.style.setProperty('--tx', '0px');
            btn.style.setProperty('--ty', '0px');
        });
    });

    /* ======================================================================
       3. Terminal Ubuntu Simplificado (Claro tanto para RH quanto para Infra)
       ====================================================================== */
    const ubuntuOutput = document.getElementById('ubuntu-output');
    const termButtons = document.querySelectorAll('[data-term-cmd]');

    const ubuntuCommands = {
        resumo: {
            cmd: './resumo.sh',
            items: [
                `Nome: João Gabriel Barros Guimarães (${currentAge} anos)`,
                'Vivência: 2 anos como Estagiário de Infraestrutura na DEEP ESG',
                'Foco: Infraestrutura, Redes, Cloud (AWS / GCP) e DevOps',
                'Idioma: Inglês Avançado (C1) · São José dos Campos, SP'
            ]
        },
        automacoes: {
            cmd: './automacoes-criadas.sh',
            items: [
                'Backups AWS: Script Python + GCP que valida backups e envia e-mail semanal',
                'Offboarding: Suspensão automática de acessos (Workspace, GitHub e Jira)',
                'Auditoria: Varredura automática contra acessos indevidos de ex-colaboradores'
            ]
        },
        redes: {
            cmd: './redes-e-suporte.sh',
            items: [
                'Monitoramento local de rede utilizando Zabbix, Docker e Docker Compose',
                'Gestão do parque de máquinas e suporte técnico de infraestrutura',
                'Redes TCP/IP, Cisco Packet Tracer, Linux, Shell Script e Active Directory (LDAP)'
            ]
        },
        idiomas: {
            cmd: './formacao-e-idiomas.sh',
            items: [
                'FATEC SJC: Desenvolvimento de Software Multiplataforma (2024 – 2027)',
                'SENAC SJC: Formação em Hardware e Redes (Concluído em 2023)',
                'Idiomas: Português nativo e Inglês Avançado (Nível C1) · CNH B'
            ]
        }
    };

    function runUbuntuCommand(key, replaceAll = false) {
        if (!ubuntuOutput) return;

        const data = ubuntuCommands[key];
        if (!data) return;

        if (replaceAll) {
            ubuntuOutput.replaceChildren();
        }

        const block = document.createElement('div');
        block.className = 'u-block';

        const prompt = document.createElement('div');
        prompt.className = 'u-prompt';

        const user = document.createElement('span');
        user.className = 'u-user';
        user.textContent = 'gabriel@ubuntu';

        const sep1 = document.createTextNode(':');

        const dir = document.createElement('span');
        dir.className = 'u-dir';
        dir.textContent = '~';

        const sep2 = document.createTextNode('$ ');

        const cmd = document.createElement('span');
        cmd.className = 'u-cmd';
        cmd.textContent = data.cmd;

        prompt.append(user, sep1, dir, sep2, cmd);

        const ul = document.createElement('ul');
        ul.className = 'u-list';
        ul.setAttribute('role', 'list');

        data.items.forEach((line) => {
            const li = document.createElement('li');
            const bullet = document.createElement('span');
            bullet.className = 'u-bullet';
            bullet.setAttribute('aria-hidden', 'true');
            bullet.textContent = '▸';

            const txt = document.createElement('span');
            txt.textContent = line;

            li.append(bullet, txt);
            ul.append(li);
        });

        block.append(prompt, ul);
        ubuntuOutput.append(block);
        ubuntuOutput.scrollTop = ubuntuOutput.scrollHeight;
    }

    runUbuntuCommand('resumo', true);

    termButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const cmdKey = btn.dataset.termCmd;
            document.querySelectorAll('.u-pill').forEach((p) => {
                p.classList.toggle('is-active', p === btn);
            });
            runUbuntuCommand(cmdKey, true);
        });
    });

    /* ======================================================================
       4. Sistema Estelar Interativo de Competências (Ícones SVG Reais)
       ====================================================================== */
    const skillsCatalog = [
        // Órbita 1: Cloud & Redes (raio 19%)
        {
            id: 'aws',
            name: 'Amazon Web Services (AWS)',
            short: 'AWS',
            group: 'infra',
            groupLabel: 'Órbita 1 · Cloud & Redes',
            orbitRadius: 19,
            icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/amazonwebservices/amazonwebservices-original-wordmark.svg',
            desc: 'Criação de rotina automatizada para verificar backups de clientes no S3 via boto3 e uso de EC2 e RDS em aplicações web.',
            context: 'Usado em: DEEP ESG (Backups AWS) · FATEC (Inv.Sort e Checkpoint)'
        },
        {
            id: 'gcp',
            name: 'Google Cloud (GCP)',
            short: 'Google Cloud',
            group: 'infra',
            groupLabel: 'Órbita 1 · Cloud & Redes',
            orbitRadius: 19,
            icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg',
            desc: 'Execução serverless com Cloud Functions, agendamento com Cloud Scheduler e retenção de arquivos via gcloud CLI e Cloud Storage.',
            context: 'Usado em: DEEP ESG (Automação de Backups e Offboarding)'
        },
        {
            id: 'oci',
            name: 'Oracle Cloud Infrastructure (OCI)',
            short: 'Oracle Cloud',
            group: 'infra',
            groupLabel: 'Órbita 1 · Cloud & Redes',
            orbitRadius: 19,
            icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/oracle/oracle-original.svg',
            desc: 'Arquitetura e infraestrutura corporativa na Oracle Cloud: provisionamento em nuvem, cluster Kubernetes gerenciado (OKE), redes virtuais e esteiras GitOps.',
            context: 'Usado em: FATEC SJC / Xertica.ai (Projeto PrecedentIA)'
        },
        {
            id: 'zabbix',
            name: 'Zabbix',
            short: 'Zabbix',
            group: 'infra',
            groupLabel: 'Órbita 1 · Cloud & Redes',
            orbitRadius: 19,
            icon: './mgt/icons/zabbix.svg',
            desc: 'Monitoramento ativo da rede local do escritório e acompanhamento de disponibilidade subindo o ambiente com Docker Compose.',
            context: 'Usado em: DEEP ESG (Monitoramento de Rede Local)'
        },
        {
            id: 'cisco',
            name: 'Redes TCP/IP & Cisco',
            short: 'Redes TCP/IP',
            group: 'infra',
            groupLabel: 'Órbita 1 · Cloud & Redes',
            orbitRadius: 19,
            icon: 'https://cdn.simpleicons.org/cisco/1BA0D7',
            desc: 'Estruturação de redes locais, endereçamento TCP/IP, diagnóstico de conectividade no escritório e topologias no Cisco Packet Tracer.',
            context: 'Usado em: SENAC SJC (Hardware & Redes) · DEEP ESG'
        },
        {
            id: 'ad-ldap',
            name: 'Active Directory & LDAP',
            short: 'AD / LDAP',
            group: 'infra',
            groupLabel: 'Órbita 1 · Cloud & Redes',
            orbitRadius: 19,
            icon: './mgt/icons/ldap-ad.svg',
            desc: 'Gerenciamento de serviços de diretório, autenticação via protocolo LDAP, permissões de usuários e administração de máquinas.',
            context: 'Usado em: SENAC SJC · Administração de Acessos'
        },

        // Órbita 2: Automação & Linux (raio 32.5%)
        {
            id: 'python',
            name: 'Python',
            short: 'Python',
            group: 'auto',
            groupLabel: 'Órbita 2 · Automação & Linux',
            orbitRadius: 32.5,
            icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg',
            desc: 'Linguagem principal para scripts de infraestrutura, integração com APIs REST, automação na AWS (boto3) e aplicações Flask.',
            context: 'Usado em: DEEP ESG · FATEC (Smart Farming)'
        },
        {
            id: 'docker',
            name: 'Docker & Docker Compose',
            short: 'Docker',
            group: 'auto',
            groupLabel: 'Órbita 2 · Automação & Linux',
            orbitRadius: 32.5,
            icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg',
            desc: 'Conteinerização de serviços de monitoramento (Zabbix) e orquestração de aplicações web + banco de dados MySQL.',
            context: 'Usado em: DEEP ESG (Rede/Zabbix) · FATEC (Containers)'
        },
        {
            id: 'linux',
            name: 'Linux & Servidores',
            short: 'Linux',
            group: 'auto',
            groupLabel: 'Órbita 2 · Automação & Linux',
            orbitRadius: 32.5,
            icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg',
            desc: 'Operação por linha de comando, permissões, serviços de rede, suporte a ambientes corporativos e automação em servidores.',
            context: 'Usado em: Rotina de Infraestrutura · SENAC · FATEC'
        },
        {
            id: 'bash',
            name: 'Shell Script (Bash)',
            short: 'Shell / Bash',
            group: 'auto',
            groupLabel: 'Órbita 2 · Automação & Linux',
            orbitRadius: 32.5,
            icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bash/bash-original.svg',
            desc: 'Automação de configurações de rede, rotinas em sistemas Linux e execução rápida de tarefas administrativas.',
            context: 'Usado em: SENAC SJC · Suporte de Infraestrutura'
        },
        {
            id: 'appsscript',
            name: 'Google Apps Script & Workspace Admin',
            short: 'Apps Script',
            group: 'auto',
            groupLabel: 'Órbita 2 · Automação & Linux',
            orbitRadius: 32.5,
            icon: './mgt/icons/appsscript.svg',
            desc: 'Automação direta na infraestrutura do Google Workspace (Google Admin API e Chat API) para offboarding e auditoria de contas.',
            context: 'Usado em: DEEP ESG (Offboarding e Auditoria Automática)'
        },
        {
            id: 'gh-actions',
            name: 'Git & GitHub Actions',
            short: 'GitHub Actions',
            group: 'auto',
            groupLabel: 'Órbita 2 · Automação & Linux',
            orbitRadius: 32.5,
            icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/githubactions/githubactions-original.svg',
            desc: 'Pipelines de execução automatizada, integração com GitHub API para gestão de membros da organização e versionamento Git.',
            context: 'Usado em: DEEP ESG (Pipelines IAM/Backups) · Projetos FATEC'
        },

        // Órbita 3: Sistemas, APIs & Dados (raio 45%)
        {
            id: 'mysql',
            name: 'MySQL & Bancos SQL',
            short: 'MySQL',
            group: 'dev',
            groupLabel: 'Órbita 3 · Sistemas & Dados',
            orbitRadius: 45,
            icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg',
            desc: 'Modelagem relacional, consultas analíticas, execução em containers Docker e instâncias gerenciadas no AWS RDS.',
            context: 'Usado em: Smart Farming · Checkpoint · Inv.Sort'
        },
        {
            id: 'jira',
            name: 'Jira & Integração via API',
            short: 'Jira / API',
            group: 'dev',
            groupLabel: 'Órbita 3 · Sistemas & Dados',
            orbitRadius: 45,
            icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jira/jira-original.svg',
            desc: 'Gestão de chamados de TI, organização de sprints como Scrum Master e integração via Jira REST API nas automações de acesso.',
            context: 'Usado em: DEEP ESG (Chamados & API) · FATEC (Scrum)'
        },
        {
            id: 'nodejs',
            name: 'Node.js & JavaScript',
            short: 'Node.js / JS',
            group: 'dev',
            groupLabel: 'Órbita 3 · Sistemas & Dados',
            orbitRadius: 45,
            icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg',
            desc: 'Construção de APIs back-end integradas à nuvem AWS e interfaces dinâmicas para ferramentas e sistemas internos.',
            context: 'Usado em: FATEC (Inv.Sort, Smart Farming)'
        },
        {
            id: 'typescript',
            name: 'TypeScript & React',
            short: 'TS / React',
            group: 'dev',
            groupLabel: 'Órbita 3 · Sistemas & Dados',
            orbitRadius: 45,
            icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg',
            desc: 'Desenvolvimento colaborativo de painéis web modernos integrados a microsserviços e bancos SQL/NoSQL.',
            context: 'Usado em: FATEC (Checkpoint e Inv.Sort)'
        },
        {
            id: 'mongodb',
            name: 'MongoDB',
            short: 'MongoDB',
            group: 'dev',
            groupLabel: 'Órbita 3 · Sistemas & Dados',
            orbitRadius: 45,
            icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg',
            desc: 'Armazenamento não-relacional para eventos e registros complementares em aplicações distribuídas.',
            context: 'Usado em: FATEC (Projeto Checkpoint)'
        }
    ];

    const stellarStage = document.getElementById('stellar-stage');
    const stellarNodesWrap = document.getElementById('stellar-nodes');
    const dockGrid = document.getElementById('skill-dock-grid');
    const detailIcon = document.getElementById('detail-skill-icon');
    const detailGroup = document.getElementById('detail-skill-group');
    const detailName = document.getElementById('detail-skill-name');
    const detailDesc = document.getElementById('detail-skill-desc');
    const detailContext = document.getElementById('detail-skill-context');

    let selectedSkillId = 'aws';
    let orbitPaused = false;
    const planetObjects = [];

    function selectSkill(skillId) {
        const skill = skillsCatalog.find((s) => s.id === skillId);
        if (!skill) return;
        selectedSkillId = skillId;

        if (detailIcon) {
            detailIcon.src = skill.icon;
            detailIcon.alt = `Logo ${skill.short}`;
        }
        if (detailGroup) detailGroup.textContent = skill.groupLabel;
        if (detailName) detailName.textContent = skill.name;
        if (detailDesc) detailDesc.textContent = skill.desc;
        if (detailContext) detailContext.textContent = skill.context;

        document.querySelectorAll('.planet-node').forEach((btn) => {
            btn.classList.toggle('is-selected', btn.dataset.skillId === skillId);
        });
        document.querySelectorAll('.dock-item').forEach((btn) => {
            btn.classList.toggle('is-selected', btn.dataset.skillId === skillId);
        });
    }

    if (stellarNodesWrap && dockGrid) {
        // Distribui ângulos uniformemente dentro de cada órbita
        const groups = ['infra', 'auto', 'dev'];
        groups.forEach((grp, gIdx) => {
            const list = skillsCatalog.filter((s) => s.group === grp);
            list.forEach((skill, idx) => {
                const baseAngle = (idx / list.length) * Math.PI * 2 + gIdx * 0.6;
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'planet-node';
                btn.dataset.skillId = skill.id;
                btn.dataset.group = skill.group;
                btn.setAttribute('aria-label', `Inspecionar competência: ${skill.name}`);
                btn.title = skill.name;

                const img = document.createElement('img');
                img.src = skill.icon;
                img.alt = '';
                img.width = 24;
                img.height = 24;
                if (skill.id === 'aws') img.className = 'icon-light-bg';

                btn.append(img);
                btn.addEventListener('click', () => selectSkill(skill.id));
                btn.addEventListener('mouseenter', () => selectSkill(skill.id));

                stellarNodesWrap.append(btn);

                planetObjects.push({
                    el: btn,
                    radiusPct: skill.orbitRadius,
                    angle: baseAngle,
                    speed: (0.0018 - gIdx * 0.00038) * (gIdx % 2 === 0 ? 1 : -1)
                });
            });
        });

        // Constrói a grade rápida de ícones ao lado
        skillsCatalog.forEach((skill) => {
            const tile = document.createElement('button');
            tile.type = 'button';
            tile.className = 'dock-item';
            tile.dataset.skillId = skill.id;
            tile.dataset.group = skill.group;

            const img = document.createElement('img');
            img.src = skill.icon;
            img.alt = '';
            img.width = 22;
            img.height = 22;
            img.loading = 'lazy';
            if (skill.id === 'aws') img.className = 'icon-light-bg';

            const span = document.createElement('span');
            span.textContent = skill.short;

            tile.append(img, span);
            tile.addEventListener('click', () => selectSkill(skill.id));
            dockGrid.append(tile);
        });

        selectSkill('aws');

        function updatePlanetPositions(advance) {
            for (let i = 0; i < planetObjects.length; i++) {
                const p = planetObjects[i];
                if (advance && !orbitPaused) {
                    p.angle += p.speed;
                }
                const x = 50 + Math.cos(p.angle) * p.radiusPct;
                const y = 50 + Math.sin(p.angle) * p.radiusPct;
                p.el.style.left = `${x.toFixed(2)}%`;
                p.el.style.top = `${y.toFixed(2)}%`;
            }
        }

        updatePlanetPositions(false);

        if (stellarStage) {
            stellarStage.addEventListener('mouseenter', () => { orbitPaused = true; });
            stellarStage.addEventListener('mouseleave', () => { orbitPaused = false; });
            stellarStage.addEventListener('focusin', () => { orbitPaused = true; });
            stellarStage.addEventListener('focusout', () => { orbitPaused = false; });
        }

        // Animação suave das órbitas apenas quando a seção está visível
        let isStellarVisible = false;
        let stellarRaf = 0;

        function tickStellar() {
            if (!isStellarVisible || reducedMotionQuery.matches) {
                stellarRaf = 0;
                return;
            }
            updatePlanetPositions(true);
            stellarRaf = window.requestAnimationFrame(tickStellar);
        }

        if ('IntersectionObserver' in window && stellarStage) {
            const obs = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    isStellarVisible = entry.isIntersecting;
                    if (isStellarVisible && !stellarRaf && !reducedMotionQuery.matches) {
                        stellarRaf = window.requestAnimationFrame(tickStellar);
                    }
                });
            }, { rootMargin: '120px' });
            obs.observe(stellarStage);
        }

        // Filtro das órbitas
        document.querySelectorAll('.orbit-filter-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.orbitFilter || 'all';
                document.querySelectorAll('.orbit-filter-btn').forEach((b) => {
                    const active = b === btn;
                    b.classList.toggle('is-active', active);
                    b.setAttribute('aria-pressed', String(active));
                });

                document.querySelectorAll('.orbit-track').forEach((track) => {
                    track.classList.toggle('is-dimmed', filter !== 'all' && track.dataset.track !== filter);
                });

                document.querySelectorAll('.planet-node').forEach((node) => {
                    node.classList.toggle('is-dimmed', filter !== 'all' && node.dataset.group !== filter);
                });

                document.querySelectorAll('.dock-item').forEach((item) => {
                    item.hidden = filter !== 'all' && item.dataset.group !== filter;
                });

                const firstMatch = skillsCatalog.find((s) => filter === 'all' || s.group === filter);
                if (firstMatch) selectSkill(firstMatch.id);
            });
        });
    }

    /* ======================================================================
       5. Filtro de Projetos + Modal Nativo (<dialog>) com Galeria de Prints
       ====================================================================== */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    function filterProjects(cat) {
        let count = 0;
        projectCards.forEach((card) => {
            const show = cat === 'all' || card.dataset.category === cat;
            card.hidden = !show;
            if (show) count++;
        });
        announce(`${count} projetos visíveis.`);
    }

    filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const cat = btn.dataset.filter || 'all';
            filterBtns.forEach((b) => {
                const active = b === btn;
                b.classList.toggle('is-active', active);
                b.setAttribute('aria-pressed', String(active));
            });
            if (document.startViewTransition && !reducedMotionQuery.matches) {
                document.startViewTransition(() => filterProjects(cat));
            } else {
                filterProjects(cat);
            }
        });
    });

    const projectsCatalog = {
        'aws-backups': {
            title: 'Automatização de Backups na AWS',
            partner: 'DEEP ESG · Infraestrutura',
            year: '2024',
            images: [
                { src: './mgt/backups.PNG', label: 'Relatório Semanal Automático', alt: 'E-mail/ticket semanal listando backups verificados por cliente' },
                { src: './mgt/aws-backups.png', label: 'Execução no Terminal (S3)', alt: 'Logs no terminal Python verificando 140 empresas no bucket S3' }
            ],
            desc: 'Desenvolvi um script em Python que consulta a API da AWS (boto3) para auditar os arquivos de backup de mais de 140 clientes no S3 e envia automaticamente um relatório semanal por e-mail e webhook no Google Chat, eliminando a conferência manual que tomava horas da equipe.',
            role: 'Criação completa do script e agendamento em nuvem seguindo o direcionamento do time de Infraestrutura, com validação direta junto ao Head de Infraestrutura da DEEP ESG.',
            skills: 'Python (boto3), integração AWS S3 + Google Cloud (Cloud Functions & Cloud Scheduler), GitHub Actions, Mailjet API, autonomia e foco em eficiência operacional.',
            tech: ['Python', 'AWS S3', 'boto3', 'Google Cloud Functions', 'Cloud Scheduler', 'GitHub Actions', 'Mailjet API', 'Google Chat Webhook'],
            repo: null
        },
        offboarding: {
            title: 'Offboarding Automático de Colaboradores',
            partner: 'DEEP ESG · Automação & IAM',
            year: '2024 – 2025',
            images: [
                { src: './mgt/offboarding.PNG', label: 'Painel de Offboarding Processado', alt: 'Resumo do offboarding com status do Google Workspace, GitHub, Jira e gcloud' }
            ],
            desc: 'Programa agendado que automatiza o desligamento de colaboradores: suspende a conta no Google Workspace, remove o acesso da organização no GitHub, verifica pendências no Jira e orienta o arquivamento de backup no Google Cloud Storage via gcloud CLI.',
            role: 'Idealização incremental e desenvolvimento das integrações via API para eliminar esquecimentos e falhas manuais na revogação de acessos.',
            skills: 'Google Apps Script, GitHub API, Jira API, GitHub Actions, Google Workspace Admin, segurança de acessos e autonomia.',
            tech: ['Google Apps Script', 'Google Workspace Admin', 'GitHub API', 'Jira API', 'GitHub Actions', 'gcloud CLI / GCS'],
            repo: null
        },
        'auditoria-acessos': {
            title: 'Programa de Auditoria Automática de Sistemas',
            partner: 'DEEP ESG · Segurança de Acessos',
            year: '2025',
            images: [],
            desc: 'Para resolver o risco de ex-colaboradores ainda manterem credenciais ativas em ferramentas externas fora do Google Workspace, desenvolvi um auditor automático que cruza os usuários ativos do Google Admin com sistemas externos (GitHub, Jira e Hacker Rangers) e alerta a equipe no Google Chat caso encontre qualquer acesso indevido.',
            role: 'Mapeamento do problema de segurança, integração das APIs de cada plataforma e configuração dos alertas automáticos.',
            skills: 'Auditoria de identidade (IAM), integração multi-API, proatividade na prevenção de incidentes e automação de alertas.',
            tech: ['Google Apps Script', 'Google Admin API', 'Jira API', 'GitHub API', 'Hacker Rangers API', 'Google Chat API', 'Git', 'GitHub Actions'],
            repo: null
        },
        'inv-sort': {
            title: 'Inv.Sort — Gerenciamento de Inventário na AWS',
            partner: 'FATEC SJC · Projeto Integrador',
            year: '2024',
            images: [
                { src: './mgt/projeto-2.jpeg', label: 'Tela de Categorias e Estoque', alt: 'Interface web do sistema Inv.Sort' }
            ],
            desc: 'Sistema web para controle de estoque, movimentações de produtos e geração de relatórios, desenvolvido com Node.js, React e banco relacional hospedado na AWS (RDS / EC2).',
            role: 'Desenvolvedor atuando em módulos de back-end (Node.js), integração com a infraestrutura AWS e organização ágil com Scrum.',
            skills: 'Infraestrutura AWS (RDS e EC2), Node.js, React, organização de arquitetura/documentação e trabalho em equipe.',
            tech: ['AWS RDS', 'AWS EC2', 'Node.js', 'React', 'SQL', 'Scrum', 'GitHub'],
            repo: 'https://github.com/BugBustersFatecSJC/inv.sort'
        },
        'smart-farming': {
            title: 'Smart Farming — Monitoramento de Estufa Inteligente',
            partner: 'i9 FATEC · Projeto Integrador',
            year: '2024',
            images: [
                { src: './mgt/smart.PNG', label: 'Painel Diário de Sensores', alt: 'Painel do projeto Smart Farming exibindo métricas de estufa' }
            ],
            desc: 'Aplicação web para leitura, armazenamento e visualização de dados de sensores de umidade do ar, umidade do solo, temperatura e irrigação, gerando médias diárias e gráficos históricos.',
            role: 'Desenvolvedor responsável pelo calendário anual interativo, navegação diária em carrossel e sistema de filtro por datas na área analítica.',
            skills: 'Python (Flask), modelagem MySQL, JavaScript, organização de tarefas (DoR/DoD) no Jira e colaboração.',
            tech: ['Python', 'Flask', 'MySQL', 'JavaScript', 'HTML5 & CSS3', 'Figma', 'Jira'],
            repo: 'https://github.com/BugBustersFatecSJC/Smart-farm'
        },
        checkpoint: {
            title: 'Checkpoint — Gestão de Jornada de Trabalho',
            partner: 'FATEC SJC · Projeto Integrador',
            year: '2025',
            images: [
                { src: './mgt/checkpoint.PNG', label: 'Interface de Marcação de Ponto', alt: 'Tela mobile do aplicativo Checkpoint' }
            ],
            desc: 'Aplicação web/mobile para controle eletrônico de jornada de trabalho, cálculo automático de horas, gestão de ausências e relatórios gerenciais utilizando AWS, Spring Boot e React.',
            role: 'Scrum Master garantindo a qualidade do fluxo ágil, remoção de impedimentos da equipe e alinhamento direto de requisitos junto ao cliente.',
            skills: 'Liderança ágil (Scrum Master), comunicação com cliente, resolução de conflitos de escopo e visão de arquitetura em nuvem AWS.',
            tech: ['AWS', 'Java (Spring Boot)', 'React', 'TypeScript', 'MySQL', 'MongoDB', 'WebSockets (STOMP)'],
            repo: 'https://github.com/FR0M-ZER0/checkpoint'
        },
        'docker-web': {
            title: 'Aplicação Web Conteinerizada com Docker & MySQL',
            partner: 'FATEC SJC · Desenvolvimento Web',
            year: '2024',
            images: [
                { src: './mgt/one_piece.png', label: 'Aplicação Rodando via Container', alt: 'Página inicial do projeto web conteinerizado com Docker' }
            ],
            desc: 'Aplicação web completa com banco de dados MySQL para cadastro de usuários, totalmente conteinerizada com Docker e orquestrada via Docker Compose para deploy rápido e padronizado.',
            role: 'Desenvolvimento da aplicação, modelagem do banco MySQL e criação dos arquivos Dockerfile e docker-compose.yml.',
            skills: 'Criação de imagens Docker, redes entre containers no Docker Compose, persistência em MySQL e entrega ponta a ponta.',
            tech: ['Docker', 'Docker Compose', 'MySQL', 'JavaScript', 'HTML5 & CSS3'],
            repo: 'https://github.com/gabrielbguimaraes/dev_web_JGBG'
        },
        nimbus: {
            title: 'Nimbus — Plataforma Meteorológica IoT & CI/CD',
            partner: 'Fatec SJC · Tecsus',
            year: '2024',
            images: [
                { src: './mgt/nimbus.png', label: 'Modelagem de Dados & Arquitetura', alt: 'Diagrama de modelagem e arquitetura de dados das estações meteorológicas Nimbus' }
            ],
            desc: 'Desenvolvido em parceria com a Tecsus, o Nimbus é uma solução IoT para captura, tratamento e visualização analítica de variáveis climáticas (temperatura, umidade, vento e precipitação) geradas por estações meteorológicas em tempo real.',
            role: 'Responsável pela modelagem do banco de dados relacional voltado à ingestão contínua de telemetria climática e pela implementação de pipelines de Integração Contínua (CI/CD) para automação de testes e builds.',
            skills: 'Pipelines CI/CD, Modelagem de Dados, Docker, AWS, Arquitetura de Software e Visão Sistêmica.',
            tech: ['Python', 'Docker', 'GitHub Actions (CI/CD)', 'PostgreSQL', 'AWS', 'Git'],
            repo: 'https://github.com/FR0M-ZER0/Nimbus'
        },
        precedentia: {
            title: 'PrecedentIA — Infraestrutura Cloud OCI & Kubernetes',
            partner: 'Fatec SJC · Xertica.ai',
            year: '2025',
            images: [
                { src: './mgt/precedentia.png', label: 'Arquitetura OCI + Kubernetes + GitOps', alt: 'Diagrama da arquitetura de nuvem OCI com Kubernetes OKE e ArgoCD' },
                { src: './mgt/precedentia-banner.png', label: 'Identidade & Visão do Projeto', alt: 'Banner e apresentação do projeto PrecedentIA' }
            ],
            desc: 'Assistente inteligente desenvolvido para o parceiro Xertica.ai, com o propósito de acelerar a análise e extração de insights de precedentes jurídicos e sentenças judiciais através de modelos de Inteligência Artificial generativa.',
            role: 'Arquiteto e responsável direto por toda a infraestrutura em nuvem na Oracle Cloud Infrastructure (OCI): provisionamento do cluster Kubernetes gerenciado (OKE), configuração de esteiras GitOps com ArgoCD e conteinerização completa da aplicação.',
            skills: 'Oracle Cloud (OCI), Kubernetes (OKE), ArgoCD (GitOps), Docker, CI/CD, Políticas de Rede/Segurança, Resiliência e Liderança Técnica.',
            tech: ['Oracle Cloud (OCI)', 'Kubernetes (OKE)', 'ArgoCD', 'Docker', 'Python', 'FastAPI', 'React', 'TypeScript'],
            repo: 'https://github.com/FR0M-ZER0/PrecedentIA'
        },
        sidebrain: {
            title: 'SideBrain — Plataforma de Mentoria com IA & CI/CD',
            partner: 'Fatec SJC · Projeto Integrador',
            year: '2025',
            images: [
                { src: './mgt/sidebrain.png', label: 'Interface Principal da Aplicação', alt: 'Tela inicial Desktop do sistema SideBrain' },
                { src: './mgt/sidebrain-cicd.png', label: 'Fluxo Automatizado de CI/CD', alt: 'Fluxo de esteira de Integração Contínua com GitHub Actions' }
            ],
            desc: 'Plataforma web colaborativa voltada à capacitação técnica e mentoria inteligente, gerando diagnósticos de competências e trilhas personalizadas de desenvolvimento profissional com suporte de IA.',
            role: 'Atuação na estruturação da infraestrutura de microsserviços, criação de pipelines de CI/CD via GitHub Actions (com lint, testes e build automático de imagens) e padronização dos ambientes de desenvolvimento e deploy com Docker.',
            skills: 'Automação CI/CD (GitHub Actions), Docker & Docker Compose, Arquitetura de Microsserviços, Trabalho em Equipe e Pensamento Crítico.',
            tech: ['Docker', 'Docker Compose', 'GitHub Actions', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
            repo: 'https://github.com/FR0M-ZER0/Sidebrain'
        }
    };

    const dialog = document.getElementById('project-dialog');
    const dlgTitle = document.getElementById('dialog-title');
    const dlgPartner = document.getElementById('dialog-partner');
    const dlgYear = document.getElementById('dialog-year');
    const dlgGallery = document.getElementById('dialog-gallery');
    const dlgImg = document.getElementById('dialog-img');
    const dlgSwitcher = document.getElementById('dialog-img-switcher');
    const dlgDesc = document.getElementById('dialog-desc');
    const dlgRole = document.getElementById('dialog-role');
    const dlgSkills = document.getElementById('dialog-skills');
    const dlgTechList = document.getElementById('dialog-tech-list');
    const dlgRepo = document.getElementById('dialog-repo');
    const dlgInternal = document.getElementById('dialog-internal-note');

    function openProject(id) {
        const p = projectsCatalog[id];
        if (!dialog || !p) return;

        dlgTitle.textContent = p.title;
        dlgPartner.textContent = p.partner;
        dlgYear.textContent = p.year;
        dlgDesc.textContent = p.desc;
        dlgRole.textContent = p.role;
        dlgSkills.textContent = p.skills;

        if (p.images && p.images.length > 0) {
            dlgGallery.hidden = false;
            dlgImg.src = p.images[0].src;
            dlgImg.alt = p.images[0].alt;

            dlgSwitcher.replaceChildren();
            if (p.images.length > 1) {
                dlgSwitcher.hidden = false;
                p.images.forEach((imgObj, index) => {
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.className = `img-switch-btn${index === 0 ? ' is-active' : ''}`;
                    b.textContent = imgObj.label;
                    b.addEventListener('click', () => {
                        dlgImg.src = imgObj.src;
                        dlgImg.alt = imgObj.alt;
                        dlgSwitcher.querySelectorAll('button').forEach((x) => x.classList.toggle('is-active', x === b));
                    });
                    dlgSwitcher.append(b);
                });
            } else {
                dlgSwitcher.hidden = true;
            }
        } else {
            dlgGallery.hidden = true;
        }

        dlgTechList.replaceChildren();
        p.tech.forEach((t) => {
            const span = document.createElement('span');
            span.className = 'dialog-tech-chip';
            span.textContent = t;
            dlgTechList.append(span);
        });

        if (p.repo) {
            dlgRepo.href = p.repo;
            dlgRepo.hidden = false;
            dlgInternal.hidden = true;
        } else {
            dlgRepo.hidden = true;
            dlgInternal.hidden = false;
        }

        dialog.showModal();
    }

    document.querySelectorAll('[data-open-project]').forEach((el) => {
        el.addEventListener('click', () => openProject(el.dataset.openProject));
    });

    if (dialog) {
        dialog.addEventListener('close', () => {
            dialog.returnValue = '';
        });

        if (!('closedBy' in HTMLDialogElement.prototype)) {
            const outside = (e, d) => {
                const r = d.getBoundingClientRect();
                return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
            };
            let downOutside = false;
            dialog.addEventListener('pointerdown', (e) => { downOutside = outside(e, dialog); });
            dialog.addEventListener('pointerup', (e) => { if (downOutside && outside(e, dialog)) dialog.close(); });
        }
    }

    /* ======================================================================
       6. Linha do Tempo Interativa da Trajetória (100% Fiel ao Currículo)
       ====================================================================== */
    const journeyData = {
        deep: {
            badge: 'Experiência Profissional · 08/2023 – 08/2025 (2 anos)',
            role: 'Estagiário de Infraestrutura',
            org: 'DEEP ESG · São José dos Campos, SP',
            bullets: [
                'Suporte direto a chamados de infraestrutura e gerenciamento completo do parque de máquinas e equipamentos de TI da empresa.',
                'Monitoramento ativo da rede local do escritório utilizando Zabbix em conjunto com Docker e Docker Compose.',
                'Criação da automação semanal de verificação de backups na AWS (Python, boto3, Cloud Functions, Cloud Scheduler, GitHub Actions, Mailjet API e Google Chat Webhook).',
                'Desenvolvimento do programa de Offboarding Automático integrando Google Apps Script, Jira API, GitHub Actions e GitHub API.',
                'Criação do programa de Auditoria Automática de Sistemas (Google Admin API, Jira API, GitHub API, Hacker Rangers API e Google Chat API) para detectar acessos indevidos de ex-colaboradores.'
            ]
        },
        fatec: {
            badge: 'Ensino Superior · 02/2024 – 2027 (Cursando)',
            role: 'Tecnólogo em Desenvolvimento de Software Multiplataforma (DSM)',
            org: 'FATEC Prof. Jessen Vidal · São José dos Campos, SP',
            bullets: [
                'Graduação prática baseada em projetos reais a cada semestre (Aprendizagem por Projetos Integrados).',
                'Checkpoint: Atuação como Scrum Master em plataforma de gestão de jornada hospedada na AWS (Java, Spring Boot, React, TypeScript, MySQL e MongoDB).',
                'Inv.Sort: Desenvolvimento back-end e integração com AWS RDS/EC2 em solução de inventário com Node.js e React.',
                'Smart Farming & Containers: Painel analítico em Python/Flask + MySQL e conteinerização completa de aplicação web com Docker e Docker Compose.'
            ]
        },
        'senac-hw': {
            badge: 'Formação Técnica · 02/2023 – 07/2023 (Concluído)',
            role: 'Formação em Hardware e Redes',
            org: 'SENAC · São José dos Campos, SP',
            bullets: [
                'Implementação prática de redes de computadores utilizando a pilha de protocolos TCP/IP.',
                'Simulação de topologias de rede no Cisco Packet Tracer e criação de rotinas em Shell Script (Bash).',
                'Configuração e uso de LDAP para controle de acesso e gerenciamento de diretório com Active Directory.'
            ]
        },
        cursos: {
            badge: 'Base Complementar & Idiomas',
            role: 'Programação, Desenvolvimento Web & Inglês Avançado (C1)',
            org: 'SENAC Rio Grande do Sul · ON BYTE SJC',
            bullets: [
                'Inglês Avançado (Nível C1): Leitura fluente de documentações técnicas internacionais de cloud/redes e boa comunicação verbal e escrita.',
                'SENAC Rio Grande do Sul — Técnico em Programação de Jogos Digitais: Lógica de programação orientada a objetos com C#, Unity e versionamento com Git.',
                'ON BYTE São José dos Campos — Desenvolvimento Web (GPA 8,6): HTML5, CSS3, JavaScript e PHP com Laravel.',
                'Habilitação: CNH Categoria B · Disponibilidade presencial/híbrida em São José dos Campos ou remoto.'
            ]
        }
    };

    const journeyPanel = document.getElementById('journey-panel');
    const journeyTabs = document.querySelectorAll('.journey-tab');

    function renderJourney(key) {
        const item = journeyData[key];
        if (!journeyPanel || !item) return;

        journeyPanel.replaceChildren();

        const header = document.createElement('div');
        header.className = 'jp-header';

        const badge = document.createElement('span');
        badge.className = 'jp-badge';
        badge.textContent = item.badge;

        const role = document.createElement('h3');
        role.className = 'jp-role';
        role.textContent = item.role;

        const org = document.createElement('p');
        org.className = 'jp-org';
        org.textContent = item.org;

        header.append(badge, role, org);

        const ul = document.createElement('ul');
        ul.className = 'jp-list';

        item.bullets.forEach((bText) => {
            const li = document.createElement('li');
            li.textContent = bText;
            ul.append(li);
        });

        journeyPanel.append(header, ul);
    }

    const journeyTabList = Array.from(journeyTabs);

    function activateJourneyTab(tab, moveFocus = false) {
        journeyTabList.forEach((t) => {
            const active = t === tab;
            t.classList.toggle('is-active', active);
            t.setAttribute('aria-selected', String(active));
            t.setAttribute('tabindex', active ? '0' : '-1');
        });
        if (journeyPanel && tab.id) {
            journeyPanel.setAttribute('aria-labelledby', tab.id);
        }
        renderJourney(tab.dataset.journey);
        if (moveFocus) tab.focus();
    }

    renderJourney('deep');

    journeyTabList.forEach((tab, idx) => {
        tab.addEventListener('click', () => activateJourneyTab(tab, false));
        tab.addEventListener('keydown', (e) => {
            let nextIdx = -1;
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                nextIdx = (idx + 1) % journeyTabList.length;
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                nextIdx = (idx - 1 + journeyTabList.length) % journeyTabList.length;
            } else if (e.key === 'Home') {
                nextIdx = 0;
            } else if (e.key === 'End') {
                nextIdx = journeyTabList.length - 1;
            }
            if (nextIdx >= 0) {
                e.preventDefault();
                activateJourneyTab(journeyTabList[nextIdx], true);
            }
        });
    });

    /* ======================================================================
       7. Cópia Rápida de E-mail
       ====================================================================== */
    const copyEmailBtn = document.getElementById('copy-email-btn');
    if (copyEmailBtn) {
        let timer = 0;
        copyEmailBtn.addEventListener('click', async () => {
            const email = copyEmailBtn.dataset.email || 'biel_google@hotmail.com';
            try {
                await navigator.clipboard.writeText(email);
                copyEmailBtn.textContent = 'Copiado!';
                copyEmailBtn.classList.add('is-copied');
                announce('E-mail copiado para a área de transferência.');
                window.clearTimeout(timer);
                timer = window.setTimeout(() => {
                    copyEmailBtn.textContent = 'Copiar';
                    copyEmailBtn.classList.remove('is-copied');
                }, 2200);
            } catch {
                window.location.href = `mailto:${email}`;
            }
        });
    }

    /* ======================================================================
       8. Canvas Cósmico em Tela Cheia: 5 Corpos Celestes por Seção + GSAP
          1. blackhole  -> Buraco Negro (Gargantua)
          2. neutron    -> Estrela de Nêutrons (Pulsar de Vela)
          3. supergiant -> Supergigante (Stephenson 2-18)
          4. quasar     -> Quasar 3C 273
          5. exoplanet  -> Lua Oceânica / Exoplaneta (Europa)
       ====================================================================== */
    const canvas = document.getElementById('cosmos-canvas');
    const brandSingularityLink = document.getElementById('brand-singularity-link');
    const warpOverlay = document.getElementById('singularity-warp-overlay');
    const mainContent = document.getElementById('main-content');

    const cosmosFX = {
        vortex: 0, // Contração gravitacional ao clicar no Buraco Negro do topo
        flare: 0   // Pulso luminoso ao interagir nos emblemas de cada seção
    };

    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = 0;
        let height = 0;
        let dpr = 1;
        let time = 0;

        // Pesos interpolados suavemente entre os 5 corpos celestes
        const sceneWeights = {
            blackhole: 1,
            neutron: 0,
            supergiant: 0,
            quasar: 0,
            exoplanet: 0
        };

        function setActiveCelestial(type) {
            const target = {
                blackhole: type === 'blackhole' ? 1 : 0,
                neutron: type === 'neutron' ? 1 : 0,
                supergiant: type === 'supergiant' ? 1 : 0,
                quasar: type === 'quasar' ? 1 : 0,
                exoplanet: type === 'exoplanet' ? 1 : 0
            };

            if (window.gsap && !reducedMotionQuery.matches) {
                window.gsap.to(sceneWeights, {
                    ...target,
                    duration: 1.15,
                    ease: 'power2.out',
                    overwrite: true
                });
            } else {
                Object.assign(sceneWeights, target);
                if (reducedMotionQuery.matches) drawCosmos(false);
            }
        }

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        window.addEventListener('resize', () => {
            resize();
            if (reducedMotionQuery.matches) drawCosmos(false);
        }, { passive: true });
        resize();

        // Estrelas de fundo fixas + Partículas orbitais do disco de acreção
        const bgStars = Array.from({ length: 95 }, () => ({
            x: Math.random(),
            y: Math.random(),
            r: Math.random() * 1.15 + 0.3,
            a: Math.random() * 0.45 + 0.12
        }));

        const diskParticles = Array.from({ length: 135 }, () => {
            const radius = 58 + Math.random() * 290;
            const palette = [
                'rgba(245, 158, 11, ',
                'rgba(234, 88, 12, ',
                'rgba(56, 189, 248, ',
                'rgba(255, 255, 255, '
            ];
            return {
                angle: Math.random() * Math.PI * 2,
                radius,
                speed: (0.0005 + Math.random() * 0.0014) * (190 / radius),
                size: Math.random() * 1.65 + 0.45,
                color: palette[Math.floor(Math.random() * palette.length)],
                alpha: Math.random() * 0.58 + 0.18,
                tilt: 0.41
            };
        });

        // 1. Buraco Negro (Gargantua + sucção gravitacional ao clicar no ícone do topo)
        function drawBlackHole(alpha) {
            if (alpha <= 0.01) return;
            ctx.save();
            ctx.globalAlpha = alpha;

            const pull = cosmosFX.vortex;
            const cx = width > 980 ? width * 0.74 : width * 0.5;
            const cy = width > 980 ? height * 0.27 : height * 0.22;
            const haloRadius = 280 + pull * 55;

            // Halo gravitacional âmbar/laranja
            const grad = ctx.createRadialGradient(cx, cy, 36, cx, cy, haloRadius);
            grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
            grad.addColorStop(0.17, `rgba(245, 158, 11, ${(0.22 + pull * 0.24).toFixed(3)})`);
            grad.addColorStop(0.38, `rgba(234, 88, 12, ${(0.09 + pull * 0.14).toFixed(3)})`);
            grad.addColorStop(0.68, `rgba(56, 189, 248, ${(0.03 + pull * 0.09).toFixed(3)})`);
            grad.addColorStop(1, 'rgba(3, 3, 6, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, haloRadius, 0, Math.PI * 2);
            ctx.fill();

            // Disco luminoso inclinado sutil
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(-0.24);
            ctx.strokeStyle = `rgba(245, 158, 11, ${(0.22 + pull * 0.25).toFixed(3)})`;
            ctx.lineWidth = 10 + pull * 4;
            ctx.beginPath();
            ctx.ellipse(0, 0, 128 * (1 - pull * 0.18), 44 * (1 - pull * 0.18), 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            // Singularidade central escura
            ctx.fillStyle = '#020204';
            ctx.beginPath();
            ctx.arc(cx, cy, 44 + pull * 4, 0, Math.PI * 2);
            ctx.fill();

            // Anel de fótons dourado nítido
            ctx.strokeStyle = `rgba(253, 224, 71, ${(0.48 + pull * 0.42).toFixed(3)})`;
            ctx.lineWidth = 1.8 + pull * 1.1;
            ctx.beginPath();
            ctx.arc(cx, cy, 45.5 + pull * 4, 0, Math.PI * 2);
            ctx.stroke();

            // Partículas orbitando ao redor (contraem em espiral durante o efeito de sucção)
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(-0.24);
            for (let i = 0; i < diskParticles.length; i++) {
                const p = diskParticles[i];
                const effectiveRadius = p.radius * (1 - pull * 0.46) + 42 * pull * 0.2;
                const x = Math.cos(p.angle) * effectiveRadius;
                const y = Math.sin(p.angle) * effectiveRadius * p.tilt;
                ctx.beginPath();
                ctx.arc(x, y, p.size * (1 + pull * 0.35), 0, Math.PI * 2);
                ctx.fillStyle = `${p.color}${Math.min(0.95, p.alpha + pull * 0.28)})`;
                ctx.fill();
            }
            ctx.restore();

            ctx.restore();
        }

        // 2. Estrela de Nêutrons / Pulsar (Feixes polares magnéticos ciano)
        function drawNeutronStar(alpha) {
            if (alpha <= 0.01) return;
            ctx.save();
            ctx.globalAlpha = alpha;

            const boost = cosmosFX.flare;
            const cx = width > 900 ? width * 0.82 : width * 0.5;
            const cy = height * 0.28;
            const beamAngle = -0.62 + Math.sin(time * 0.8) * 0.08 + boost * 0.35;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(beamAngle);

            // Feixes polares relativísticos opostos
            const span = 290 + boost * 75;
            const beamGrad = ctx.createLinearGradient(-span, 0, span, 0);
            beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
            beamGrad.addColorStop(0.35, `rgba(56, 189, 248, ${(0.16 + boost * 0.18).toFixed(3)})`);
            beamGrad.addColorStop(0.5, `rgba(224, 242, 254, ${(0.45 + boost * 0.38).toFixed(3)})`);
            beamGrad.addColorStop(0.65, `rgba(56, 189, 248, ${(0.16 + boost * 0.18).toFixed(3)})`);
            beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.moveTo(-span, -26 - boost * 10);
            ctx.lineTo(0, -3);
            ctx.lineTo(span, -26 - boost * 10);
            ctx.lineTo(span, 26 + boost * 10);
            ctx.lineTo(0, 3);
            ctx.lineTo(-span, 26 + boost * 10);
            ctx.closePath();
            ctx.fill();

            // Arcos de campo magnético
            ctx.strokeStyle = `rgba(56, 189, 248, ${(0.16 + boost * 0.22).toFixed(3)})`;
            ctx.lineWidth = 1.2 + boost * 0.8;
            ctx.beginPath();
            ctx.ellipse(0, -48, 42 + boost * 12, 48 + boost * 10, 0, 0, Math.PI * 2);
            ctx.ellipse(0, 48, 42 + boost * 12, 48 + boost * 10, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            // Halo + Núcleo denso azul-branco
            const glowRadius = 130 + boost * 48;
            const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, glowRadius);
            glow.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
            glow.addColorStop(0.14, `rgba(56, 189, 248, ${(0.55 + boost * 0.28).toFixed(3)})`);
            glow.addColorStop(0.45, 'rgba(99, 102, 241, 0.14)');
            glow.addColorStop(1, 'rgba(3, 3, 6, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        // 3. Stephenson 2-18 (Supergigante Vermelha-Âmbar)
        function drawSupergiant(alpha) {
            if (alpha <= 0.01) return;
            ctx.save();
            ctx.globalAlpha = alpha;

            const boost = cosmosFX.flare;
            const cx = width > 980 ? width * 0.24 : width * 0.5;
            const cy = height * 0.52;
            const pulse = 1 + Math.sin(time * 0.6) * 0.025 + boost * 0.22;
            const r = 88 * pulse;

            const corona = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 3.1);
            corona.addColorStop(0, `rgba(253, 224, 71, ${(0.26 + boost * 0.24).toFixed(3)})`);
            corona.addColorStop(0.28, `rgba(234, 88, 12, ${(0.2 + boost * 0.18).toFixed(3)})`);
            corona.addColorStop(0.6, 'rgba(153, 27, 27, 0.09)');
            corona.addColorStop(1, 'rgba(3, 3, 6, 0)');

            ctx.fillStyle = corona;
            ctx.beginPath();
            ctx.arc(cx, cy, r * 3.1, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        // 4. Quasar 3C 273 (Núcleo Galáctico Ativo + Jato Astrofísico)
        function drawQuasar(alpha) {
            if (alpha <= 0.01) return;
            ctx.save();
            ctx.globalAlpha = alpha;

            const boost = cosmosFX.flare;
            const cx = width > 900 ? width * 0.8 : width * 0.55;
            const cy = height * 0.26;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(-0.78);

            // Jato relativístico longo
            const jetLen = 340 + boost * 90;
            const jetHalfW = 5 + boost * 5;
            const jet = ctx.createLinearGradient(0, -jetLen, 0, jetLen);
            jet.addColorStop(0, 'rgba(56, 189, 248, 0)');
            jet.addColorStop(0.42, `rgba(129, 140, 248, ${(0.24 + boost * 0.24).toFixed(3)})`);
            jet.addColorStop(0.5, `rgba(255, 255, 255, ${(0.65 + boost * 0.3).toFixed(3)})`);
            jet.addColorStop(0.58, `rgba(56, 189, 248, ${(0.24 + boost * 0.24).toFixed(3)})`);
            jet.addColorStop(1, 'rgba(56, 189, 248, 0)');

            ctx.fillStyle = jet;
            ctx.fillRect(-jetHalfW, -jetLen, jetHalfW * 2, jetLen * 2);

            // Disco de acreção brilhante
            const diskW = 145 + boost * 28;
            const disk = ctx.createRadialGradient(0, 0, 8, 0, 0, diskW);
            disk.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            disk.addColorStop(0.22, `rgba(245, 158, 11, ${(0.35 + boost * 0.22).toFixed(3)})`);
            disk.addColorStop(0.55, 'rgba(99, 102, 241, 0.16)');
            disk.addColorStop(1, 'rgba(3, 3, 6, 0)');
            ctx.fillStyle = disk;
            ctx.beginPath();
            ctx.ellipse(0, 0, diskW, 48 + boost * 10, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
            ctx.restore();
        }

        // 5. Lua Oceânica Europa / Exoplaneta (Horizonte em Crescente Iluminado)
        function drawExoplanet(alpha) {
            if (alpha <= 0.01) return;
            ctx.save();
            ctx.globalAlpha = alpha;

            const boost = cosmosFX.flare;
            const cx = width > 900 ? width * 0.82 : width * 0.5;
            const cy = height * 0.34;
            const radius = 84 + boost * 6;
            const atmoRadius = radius * (1.9 + boost * 0.42);

            // Atmosfera externa esmeralda/ciano
            const atmo = ctx.createRadialGradient(cx - 22, cy - 22, radius * 0.7, cx, cy, atmoRadius);
            atmo.addColorStop(0, `rgba(56, 189, 248, ${(0.24 + boost * 0.26).toFixed(3)})`);
            atmo.addColorStop(0.45, `rgba(16, 185, 129, ${(0.1 + boost * 0.18).toFixed(3)})`);
            atmo.addColorStop(1, 'rgba(3, 3, 6, 0)');
            ctx.fillStyle = atmo;
            ctx.beginPath();
            ctx.arc(cx, cy, atmoRadius, 0, Math.PI * 2);
            ctx.fill();

            // Corpo do planeta iluminado de um lado
            const surf = ctx.createRadialGradient(cx - 34, cy - 28, 10, cx + 20, cy + 20, radius * 1.15);
            surf.addColorStop(0, 'rgba(125, 211, 252, 0.58)');
            surf.addColorStop(0.38, 'rgba(14, 116, 144, 0.34)');
            surf.addColorStop(0.72, '#05070F');
            surf.addColorStop(1, '#030306');

            ctx.fillStyle = surf;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();

            // Fina borda atmosférica iluminada
            ctx.strokeStyle = `rgba(103, 232, 249, ${(0.35 + boost * 0.35).toFixed(3)})`;
            ctx.lineWidth = 1.4 + boost * 0.9;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, Math.PI * 0.82, Math.PI * 1.68);
            ctx.stroke();

            ctx.restore();
        }

        function drawCosmos(advance) {
            ctx.clearRect(0, 0, width, height);

            // Estrelas sutis de fundo
            for (let i = 0; i < bgStars.length; i++) {
                const s = bgStars[i];
                ctx.beginPath();
                ctx.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(226, 232, 240, ${s.a})`;
                ctx.fill();
            }

            if (advance) {
                const speedBoost = 1 + cosmosFX.vortex * 6.5;
                time += 0.016 * (1 + cosmosFX.flare * 1.8);
                for (let i = 0; i < diskParticles.length; i++) {
                    diskParticles[i].angle += diskParticles[i].speed * speedBoost;
                }
            }

            drawBlackHole(sceneWeights.blackhole);
            drawNeutronStar(sceneWeights.neutron);
            drawSupergiant(sceneWeights.supergiant);
            drawQuasar(sceneWeights.quasar);
            drawExoplanet(sceneWeights.exoplanet);
        }

        let raf = 0;
        function animate() {
            if (document.hidden || reducedMotionQuery.matches) {
                raf = 0;
                return;
            }
            drawCosmos(true);
            raf = window.requestAnimationFrame(animate);
        }

        if (reducedMotionQuery.matches) {
            drawCosmos(false);
        } else {
            raf = window.requestAnimationFrame(animate);
        }

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && !raf && !reducedMotionQuery.matches) {
                raf = window.requestAnimationFrame(animate);
            }
        });

        /* Clique no Buraco Negro ao lado do nome: "sugando de volta" ao início */
        if (brandSingularityLink) {
            let warpTimer = 0;
            brandSingularityLink.addEventListener('click', (e) => {
                e.preventDefault();
                closeMobileNav();
                setActiveCelestial('blackhole');
                setCurrentNavByHref('#inicio');

                if (window.history && window.history.replaceState) {
                    window.history.replaceState(null, '', '#inicio');
                }

                if (reducedMotionQuery.matches) {
                    window.scrollTo({ top: 0, behavior: 'auto' });
                    return;
                }

                if (warpOverlay) {
                    warpOverlay.classList.remove('is-warping');
                    void warpOverlay.offsetWidth;
                    warpOverlay.classList.add('is-warping');
                    window.clearTimeout(warpTimer);
                    warpTimer = window.setTimeout(() => {
                        warpOverlay.classList.remove('is-warping');
                    }, 760);
                }

                if (window.gsap) {
                    window.gsap.killTweensOf(cosmosFX);
                    window.gsap.timeline()
                        .to(cosmosFX, { vortex: 1, duration: 0.28, ease: 'power2.in' })
                        .to(cosmosFX, { vortex: 0, duration: 0.58, ease: 'expo.out' });

                    if (mainContent) {
                        window.gsap.killTweensOf(mainContent);
                        window.gsap.timeline()
                            .to(mainContent, {
                                scale: 0.965,
                                duration: 0.24,
                                ease: 'power2.in',
                                onStart: () => {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            })
                            .to(mainContent, {
                                scale: 1,
                                duration: 0.48,
                                ease: 'expo.out',
                                clearProps: 'transform'
                            });
                    } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }

        /* Emblemas interativos de cada seção: emitem pulso no corpo celeste de fundo */
        document.querySelectorAll('[data-pulse-celestial]').forEach((emblemBtn) => {
            let pulseTimer = 0;
            emblemBtn.addEventListener('click', () => {
                const targetType = emblemBtn.dataset.pulseCelestial;
                if (targetType) {
                    setActiveCelestial(targetType);
                }

                emblemBtn.classList.add('is-pulsing');
                window.clearTimeout(pulseTimer);
                pulseTimer = window.setTimeout(() => {
                    emblemBtn.classList.remove('is-pulsing');
                }, 900);

                if (!reducedMotionQuery.matches && window.gsap) {
                    window.gsap.killTweensOf(cosmosFX);
                    window.gsap.timeline()
                        .to(cosmosFX, { flare: 1, duration: 0.24, ease: 'power2.out' })
                        .to(cosmosFX, { flare: 0, duration: 0.72, ease: 'power2.inOut' });
                }
            });
        });

        /* Monitora qual seção está na tela para sincronizar Corpo Celeste + link ativo */
        const trackedSectionIds = ['inicio', 'sobre', 'competencias', 'projetos', 'trajetoria', 'contato'];
        const trackedSections = trackedSectionIds
            .map((id) => document.getElementById(id))
            .filter(Boolean);

        let currentActiveSecId = '';

        function activateSection(sec) {
            if (!sec || sec.id === currentActiveSecId) return;
            currentActiveSecId = sec.id;

            const celestial = sec.dataset.celestial;
            if (celestial && typeof setActiveCelestial === 'function') {
                setActiveCelestial(celestial);
            }
            setCurrentNavByHref(`#${sec.id}`);
        }

        function updateActiveSectionOnScroll() {
            if (isUserNavClick || trackedSections.length === 0) return;

            const scrollY = window.scrollY || window.pageYOffset;
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;

            // Se o usuário rolou até o rodapé, seleciona Contato
            if (scrollY + windowHeight >= docHeight - 65) {
                const contatoSec = document.getElementById('contato');
                if (contatoSec) {
                    activateSection(contatoSec);
                    return;
                }
            }

            // Ponto de foco na tela: 36% da altura do viewport (logo abaixo da navbar fixa)
            const focusY = windowHeight * 0.36;
            let currentSec = null;

            for (let i = 0; i < trackedSections.length; i++) {
                const sec = trackedSections[i];
                const rect = sec.getBoundingClientRect();

                if (rect.top <= focusY && rect.bottom >= focusY) {
                    currentSec = sec;
                    break;
                }
            }

            // Fallback: se entre seções ou margem, escolhe a mais próxima do ponto de foco
            if (!currentSec) {
                let smallestDist = Infinity;
                for (let i = 0; i < trackedSections.length; i++) {
                    const sec = trackedSections[i];
                    const rect = sec.getBoundingClientRect();
                    const dist = Math.min(Math.abs(rect.top - focusY), Math.abs(rect.bottom - focusY));
                    if (dist < smallestDist) {
                        smallestDist = dist;
                        currentSec = sec;
                    }
                }
            }

            if (currentSec) {
                activateSection(currentSec);
            }
        }

        let scrollRaf = 0;
        function onScrollThrottled() {
            if (scrollRaf) return;
            scrollRaf = window.requestAnimationFrame(() => {
                updateActiveSectionOnScroll();
                scrollRaf = 0;
            });
        }

        window.addEventListener('scroll', onScrollThrottled, { passive: true });
        window.addEventListener('resize', onScrollThrottled, { passive: true });
        window.addEventListener('load', onScrollThrottled, { passive: true });

        // Estado inicial ao carregar a página
        if (window.location.hash) {
            const initSec = document.querySelector(window.location.hash);
            if (initSec) {
                activateSection(initSec);
            }
        } else {
            updateActiveSectionOnScroll();
        }
    }
})();
