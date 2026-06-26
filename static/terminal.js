/**
 * @file Fake interactive shell rendered in the site header, plus the theme
 *   toggle. Pure DOM; no dependencies. Wrapped in an IIFE so nothing leaks to
 *   the global scope. All output is written via {@link print} using
 *   `textContent`, so user input is never interpreted as HTML.
 */

(function () {
  'use strict';

  /** @type {HTMLInputElement | null} The command input in the header. */
  const input = /** @type {HTMLInputElement | null} */ (
    document.getElementById('terminal-input')
  );
  /** @type {HTMLElement | null} Scrollback container for printed lines. */
  const output = document.getElementById('terminal-output');
  if (!input || !output) return;

  /**
   * Command names offered by Tab-completion (the first word).
   * @type {readonly string[]}
   */
  const COMMANDS = ['help','ls','cd','pwd','whoami','man','clear','exit','cmatrix','sl','echo','date','uname'];

  /**
   * Path/target names offered by Tab-completion (the argument word).
   * @type {readonly string[]}
   */
  const PATHS    = ['~','blog','vortraege','about','impressum','github','linkedin','xing'];

  /**
   * Off-site profiles, keyed by the name typed in the terminal. Values are
   * absolute https URLs opened in a new tab.
   * @type {Readonly<Record<string, string>>}
   */
  const EXTERNAL = {
    github:   'https://github.com/dev-loki',
    linkedin: 'https://www.linkedin.com/in/torsten-zielke',
    xing:     'https://www.xing.com/profile/Torsten_Zielke2',
  };

  // skip auto-focus on touch devices — would pop the on-screen keyboard
  if (window.location.pathname === '/' && !window.matchMedia('(pointer: coarse)').matches) {
    input.focus();
  }

  /**
   * Most-recent-first command history, persisted in `sessionStorage`.
   * Reading is guarded: a corrupt stored value must not break terminal init.
   * @type {string[]}
   */
  const history = loadHistory();
  /** @type {number} Cursor into {@link history}; -1 means "not browsing". */
  let histIdx = -1;

  /**
   * Read and parse the persisted command history.
   * @returns {string[]} The stored history, or `[]` if absent or corrupt.
   */
  function loadHistory() {
    try {
      const stored = sessionStorage.getItem('term-history');
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  /**
   * Keyboard handler for the prompt: Enter runs, Tab completes, Up/Down browse
   * history, Ctrl+L clears.
   * @param {KeyboardEvent} e
   * @returns {void}
   */
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = input.value.trim();
      if (!cmd) return;
      history.unshift(cmd);
      sessionStorage.setItem('term-history', JSON.stringify(history.slice(0, 50)));
      histIdx = -1;
      input.value = '';
      run(cmd);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const val = input.value;
      const parts = val.split(/\s+/);
      if (parts.length <= 1) {
        // complete command name
        const partial = (parts[0] || '').toLowerCase();
        const matches = COMMANDS.filter(function (c) { return c.startsWith(partial); });
        if (matches.length === 1) { input.value = matches[0] + ' '; }
        else if (matches.length > 1) { print(matches.join('  ')); }
      } else {
        // complete path argument
        const partial = parts[parts.length - 1].toLowerCase();
        const matches = PATHS.filter(function (p) { return p.startsWith(partial); });
        if (matches.length === 1) { input.value = parts[0] + ' ' + matches[0]; }
        else if (matches.length > 1) { print(matches.join('  ')); }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < history.length - 1) histIdx++;
      input.value = history[histIdx] ?? '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      histIdx > 0 ? histIdx-- : (histIdx = -1);
      input.value = histIdx >= 0 ? history[histIdx] : '';
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      output.innerHTML = '';
    }
  });

  /**
   * Parse and dispatch a command line. Unknown words fall through to an
   * {@link EXTERNAL} lookup before reporting "command not found".
   * @param {string} cmd Raw line as typed (without the trailing newline).
   * @returns {void}
   */
  function run(cmd) {
    const [base, ...args] = cmd.trim().split(/\s+/);
    print('$ ' + cmd, 'cmd-echo');

    switch (base.toLowerCase()) {
      case 'help':    helpCmd(); break;
      case 'ls':      lsCmd(args); break;
      case 'cd':      cdCmd(args); break;
      case 'pwd':     print(window.location.pathname); break;
      case 'whoami':  print('torsten zielke\ntech-lead · software-architect · cloud-solutions-architect\niVivid GmbH, Salzgitter, DE'); break;
      case 'man':     manCmd(args); break;
      case 'clear':   output.innerHTML = ''; return;
      case 'exit':    output.innerHTML = ''; input.blur(); return;
      case 'cmatrix': cmatrix(); break;
      case 'sl':      sl(); break;
      case 'echo':    print(args.join(' ')); break;
      case 'date':    print(new Date().toString()); break;
      case 'uname':   print('loki.dev 1.0.0 static-html amd64'); break;
      default:
        if (EXTERNAL[base.toLowerCase()]) return openExternal(base.toLowerCase());
        print(base + ': command not found\ntype "help" for available commands', 'error');
    }
  }

  /**
   * Append one line of output. Text is set via `textContent`, so it is never
   * parsed as HTML — this is the single rendering sink and the reason the
   * terminal is XSS-safe.
   * @param {string} text Line content; may contain `\n` for multiple rows.
   * @param {string} [cls] Optional extra CSS class (e.g. `'error'`, `'cmd-echo'`).
   * @returns {void}
   */
  function print(text, cls) {
    const el = document.createElement('pre');
    el.className = 'terminal-line' + (cls ? ' ' + cls : '');
    el.textContent = text;
    output.appendChild(el);
    el.scrollIntoView({ block: 'nearest' });
  }

  /**
   * Print the command reference (`help`).
   * @returns {void}
   */
  function helpCmd() {
    print([
      'COMMANDS',
      '  ls [path]       list contents',
      '  cd [path]       navigate  (cd ~, cd blog, cd vortraege)',
      '  github          open github profile  (also: linkedin, xing)',
      '  pwd             print working directory',
      '  man loki        open the man page',
      '  whoami          identify the user',
      '  echo [text]     print text',
      '  date            current date & time',
      '  clear           clear output  (or Ctrl+L)',
      '  exit            close terminal',
      '',
      'TIPS',
      '  Tab             autocomplete command or path',
      '  ↑ / ↓          command history',
      '',
      'EASTER EGGS',
      '  cmatrix         ...',
      '  sl              ...',
    ].join('\n'));
  }

  /**
   * `ls`: list the home directory, or navigate into a known section.
   * @param {string[]} args Argument words; `args[0]` is the optional path.
   * @returns {void}
   */
  function lsCmd(args) {
    const path = (args[0] || window.location.pathname).toLowerCase();
    if (path === '/' || path === '~' || path === '') {
      print('  blog/\n  vortraege/\n  github          github.com/dev-loki\n  linkedin        in/torsten-zielke\n  xing            profile/Torsten_Zielke2');
    } else if (path.includes('blog')) {
      navigate('/blog/');
    } else if (path.includes('vort') || path.includes('talk')) {
      navigate('/vortraege/');
    } else {
      print('ls: ' + path + ': no such directory', 'error');
    }
  }

  /**
   * `cd`: navigate to an internal section, open an {@link EXTERNAL} profile, or
   * report "no such directory".
   * @param {string[]} args Argument words; `args[0]` is the target.
   * @returns {void}
   */
  function cdCmd(args) {
    const arg = (args[0] || '').toLowerCase().replace(/^\//, '');
    if (!arg || arg === '~' || arg === '/') return navigate('/');
    /** @type {Record<string, string>} */
    const map = {
      blog: '/blog/', vortraege: '/vortraege/', talks: '/vortraege/',
      about: '/about/', impressum: '/impressum/',
    };
    const dest = map[arg];
    if (dest) return navigate(dest);
    if (EXTERNAL[arg]) return openExternal(arg);
    print('cd: ' + args[0] + ': no such directory', 'error');
  }

  /**
   * Manual entries keyed by command name, rendered by {@link manCmd}.
   * @type {Readonly<Record<string, string>>}
   */
  var MAN = {
    ls:      'ls [path]\n\n  List directory contents.\n  Known paths: ~  blog  vortraege',
    cd:      'cd [path]\n\n  Change directory and navigate.\n  Known paths: ~  blog  vortraege  about  impressum',
    pwd:     'pwd\n\n  Print the current URL path.',
    whoami:  'whoami\n\n  Display current user identity.',
    echo:    'echo [text]\n\n  Write arguments to output.',
    date:    'date\n\n  Display the current date and time.',
    uname:   'uname\n\n  Print system information.',
    clear:   'clear\n\n  Clear terminal output.\n  Shortcut: Ctrl+L',
    exit:    'exit\n\n  Clear output and blur terminal input.',
    help:    'help\n\n  List available commands.',
    man:     'man [command]\n\n  Display manual entry for command.\n  man loki  — open the home page.',
    cmatrix: 'cmatrix\n\n  "Wake up, Neo..."\n  Press any key or click to exit.',
    sl:      'sl\n\n  You meant ls, didn\'t you?\n  Press Escape to cancel.',
  };

  /**
   * `man`: render a {@link MAN} entry, or navigate home for `man` / `man loki`.
   * @param {string[]} args Argument words; `args[0]` is the topic.
   * @returns {void}
   */
  function manCmd(args) {
    if (!args[0] || args[0] === 'loki') return navigate('/');
    var entry = MAN[args[0].toLowerCase()];
    if (entry) {
      print('LOKI(1)                   loki.dev Manual                   LOKI(1)\n\nNAME\n  ' + args[0].toLowerCase() + '\n\nSYNOPSIS\n  ' + entry);
    } else {
      print('No manual entry for ' + args[0]);
    }
  }

  /**
   * Print an arrow and navigate the current tab to an internal path after a
   * short beat so the user sees where they are going.
   * @param {string} path Same-origin path, e.g. `'/blog/'`.
   * @returns {void}
   */
  function navigate(path) {
    print('→ ' + path);
    setTimeout(function () { window.location.href = path; }, 350);
  }

  /**
   * Open an {@link EXTERNAL} profile in a new tab. `noopener` prevents the
   * opened page from reaching back via `window.opener`.
   * @param {string} name Key into {@link EXTERNAL}; must already be validated.
   * @returns {void}
   */
  function openExternal(name) {
    const url = EXTERNAL[name];
    print('→ ' + url + '  (new tab)');
    window.open(url, '_blank', 'noopener');
  }

  // ── cmatrix ──────────────────────────────────────────────────────────────────

  /**
   * Easter egg: a full-screen Matrix "digital rain" overlay on a `<canvas>`.
   * No-op (with a printed note) when the user prefers reduced motion. Dismissed
   * by any keypress or click.
   * @returns {void}
   */
  function cmatrix() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      print('cmatrix: reduced-motion is enabled — the matrix stayed off');
      return;
    }

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#000;';

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'display:block;width:100%;height:100%;';
    overlay.appendChild(canvas);

    const hint = document.createElement('div');
    hint.textContent = 'press any key or click to exit';
    hint.style.cssText = 'position:absolute;bottom:1rem;left:50%;transform:translateX(-50%);color:#333;font:0.75rem/1 ui-monospace,monospace;pointer-events:none;';
    overlay.appendChild(hint);

    document.body.appendChild(overlay);

    const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
    /** @type {number} Font size / grid cell size in px. */
    const FS = 14;
    /** @type {number} */ let W;
    /** @type {number} */ let H;
    /** @type {number} Number of character columns across the canvas. */
    let cols;
    /** @type {number[]} Per-column y-position (in rows) of each falling head. */
    let drops;

    /**
     * Size the canvas to the overlay and reset the column grid.
     * @returns {void}
     */
    function resize() {
      W = canvas.width = overlay.offsetWidth;
      H = canvas.height = overlay.offsetHeight;
      cols = Math.floor(W / FS);
      drops = Array(cols).fill(1);
    }
    resize();

    const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789ABCDEFloki.dev';
    /** @type {number} requestAnimationFrame handle for the render loop. */
    let raf;

    /**
     * Render one frame and schedule the next.
     * @returns {void}
     */
    function draw() {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = FS + 'px ui-monospace,Menlo,monospace';
      for (let i = 0; i < cols; i++) {
        const v = Math.random() > 0.85 ? 255 : 150;
        ctx.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')';
        ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], i * FS, drops[i] * FS);
        if (drops[i] * FS > H && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    /**
     * Stop the loop and tear down the overlay.
     * @returns {void}
     */
    function close() {
      cancelAnimationFrame(raf);
      overlay.remove();
      document.removeEventListener('keydown', close);
    }

    // small delay so the Enter that launched this doesn't immediately close it
    setTimeout(function () {
      document.addEventListener('keydown', close, { once: true });
      overlay.addEventListener('click', close, { once: true });
    }, 300);
  }

  // ── sl ───────────────────────────────────────────────────────────────────────

  /**
   * Easter egg: the classic `sl` steam locomotive chugging across the screen
   * with smoke puffs. No-op (with a printed note) under reduced motion.
   * Dismissed with Escape, or auto-clears when the train exits.
   * @returns {void}
   */
  function sl() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      print('sl: reduced-motion is enabled — the train passed through quietly');
      return;
    }

    // Authentic D51 locomotive (Toyoda Masashi's `sl`). Faces and travels left.
    const TRAIN = [
      '      ====        ________                ___________',
      '  _D _|  |_______/        \\__I_I_____===__|_________|',
      '   |(_)---  |   H\\________/ |   |        =|___ ___|',
      '   /     |  |   H  |  |     |   |         ||_| |_||',
      '  |      |  |   H  |__--------------------| [___] |',
      '  | ________|___H__/__|_____/[][]~\\_______|       |',
      '  |/ |   |-----------I_____I [][] []  D   |=======|__',
      '__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__',
      ' |/-=|___|=    ||    ||    ||    |_____/~\\___/',
      '  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/',
    ];

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:var(--bg,#0b0b0b);overflow:hidden;';

    const pre = document.createElement('pre');
    pre.style.cssText = 'position:absolute;top:50%;transform:translateY(-50%);white-space:pre;color:var(--fg,#e6e6e6);font:14px/1.5 ui-monospace,Menlo,monospace;margin:0;padding:0;';
    pre.textContent = TRAIN.join('\n');
    overlay.appendChild(pre);

    document.body.appendChild(overlay);

    /** @type {number} Current left edge of the train, in px. */
    let pos = overlay.offsetWidth;
    const trainWidth = pre.offsetWidth + 40;
    /** @type {number} requestAnimationFrame handle for the motion loop. */
    let raf;
    const speed = 3;

    // smoke puffs rising from the funnel (~char 17, over the boiler domes)
    const smokeTimer = setInterval(function () {
      if (!overlay.isConnected) { clearInterval(smokeTimer); return; }
      const puff = document.createElement('span');
      puff.textContent = ['o', 'O', '°', '˚'][Math.floor(Math.random() * 4)];
      const sx = pos + 17 * 8.4;
      const sy = overlay.offsetHeight / 2 - pre.offsetHeight / 2 - 12 - Math.random() * 16;
      puff.style.cssText = 'position:absolute;left:' + sx + 'px;top:' + sy + 'px;color:var(--fg-dim,#9a9a9a);font:' + (10 + Math.random() * 8) + 'px ui-monospace,monospace;transition:top 1.2s ease-out,opacity 1.2s ease-out;pointer-events:none;';
      overlay.appendChild(puff);
      requestAnimationFrame(function () {
        puff.style.top = (sy - 50) + 'px';
        puff.style.opacity = '0';
      });
      setTimeout(function () { puff.remove(); }, 1300);
    }, 160);

    /**
     * Stop animation and smoke, and remove the overlay.
     * @returns {void}
     */
    function cancel() {
      cancelAnimationFrame(raf);
      clearInterval(smokeTimer);
      overlay.remove();
      document.removeEventListener('keydown', onKey);
    }
    /**
     * Dismiss on Escape.
     * @param {KeyboardEvent} e
     * @returns {void}
     */
    function onKey(e) { if (e.key === 'Escape') cancel(); }

    setTimeout(function () {
      document.addEventListener('keydown', onKey);
    }, 200);

    /**
     * Advance the train one frame; stop once it leaves the viewport.
     * @returns {void}
     */
    function animate() {
      pos -= speed;
      pre.style.left = pos + 'px';
      if (pos < -trainWidth) {
        cancel();
      } else {
        raf = requestAnimationFrame(animate);
      }
    }
    raf = requestAnimationFrame(animate);
  }

  // ── theme toggle ─────────────────────────────────────────────────────────────

  /**
   * @typedef {'light' | 'dark'} Theme
   */

  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    /**
     * Resolve the active theme: explicit override on `<html>` if set, otherwise
     * the OS preference.
     * @returns {Theme}
     */
    function activeTheme() {
      return /** @type {Theme} */ (
        document.documentElement.dataset.theme ||
        (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
      );
    }
    /**
     * Update the toggle label and aria-label to offer the *other* theme.
     * @param {Theme} theme The currently active theme.
     * @returns {void}
     */
    function syncBtn(theme) {
      themeBtn.textContent = theme === 'dark' ? '[ light ]' : '[ dark ]';
      themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
    syncBtn(activeTheme());
    themeBtn.addEventListener('click', function () {
      var next = activeTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('theme', next);
      syncBtn(next);
    });
  }

})();
