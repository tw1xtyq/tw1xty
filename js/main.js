/**
 * tw1xty — поведение страницы.
 *
 * Один самодостаточный скрипт без зависимостей. Код идёт сверху вниз по секциям,
 * внутри — общее состояние (var) и функции. Реплики персонажа вынесены в константы
 * в UPPER_CASE (HOVER_LINES, MONOLOGUE_LINES, STAR_LINES и т.д.) — их можно смело править.
 *
 * Оглавление:
 *   0. Состояние и базовые помощники
//   1. Пробуждение: существо просыпается и замечает посетителя
//   2. Взгляд следит за мышью и пальцем
//   3. Сон и пробуждение
//   4. Блуждающий взгляд, когда посетитель замер
//   5. Реакции на наведение на ссылки
//   6. Тычок в глаз: зрачок убегает
//   7. Кнопка «НЕ НАЖИМАЙ»: 5 случайных сцен
//   8. Сцена 1. Самоуничтожение
//   9. Сцена 2. Гравитация
//   10. Сцена 3. Выключили свет
//   11. Сцена 4. Дискотека
//   12. Сцена 5. Кнопка убегает
//   13. Фон: звёзды и падающая звезда
//   14. Искры за курсором
//   15. Эффект «сплющивания» тела
//   16. Буквы имени
//   17. Наклон карточек за курсором
//   18. Бумажный самолётик
//   19. Перетаскивание существа (пружинит обратно)
//   20. Комментарии к падающей звезде
//   21. Долгое нажатие = щекотка
//   22. Чихание
//   23. Таймер в подвале (сбрасывается при каждом заходе)
//   24. Секретные слова на клавиатуре
//   25. Мелкие реакции: уход курсора, возврат на вкладку, ресайз, правый клик
//   26. Комментарии ко времени на сайте
//   27. Оживление: общие помощники
//   28. Микро-жизнь: дрожь зрачка, уши, бормотание
//   29. Тряска мышью → головокружение
//   30. Реакции: прокрутка, имя, таймер, выделение, копирование
//   31. Клик по пустому месту
//   32. Двойной клик: кувырок
//   33. Поглаживание → смущение
//   34. Подталкивание, если долго висеть над ссылкой
//   35. Клавиатура, сеть, поворот экрана
//   36. Заголовок вкладки: «навязчивый бывший»
 */

(function () {

  // ──────────────────────────────────────────────────────────
  // 0. Состояние и базовые помощники: DOM, реплики, настроения, взгляд
  // ──────────────────────────────────────────────────────────
  var byId = function(i) {
    return document.getElementById(i);
  };
  var mascot = byId("ms");
  var eyeEl = byId("ey");
  var pupilWrap = byId("pw");
  var pupil = byId("pu");
  var lastActivityAt = Date.now();
  var isAsleep = 1;
  var pupilEscaped = 0;
  var typingTimer;
  var moodTimer;
  var toastTimer;

  function toast(m) {
    var T = byId("toast");
    T.textContent = m;
    T.classList.add("s");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function() {
      T.classList.remove("s");
    }, 2200);
  }

  function say(t) {
    clearInterval(typingTimer);
    var i = 0;
    var b = byId("bb");
    b.textContent = "";
    b.classList.remove("bp");
    void b.offsetWidth;
    b.classList.add("bp");
    mascot.classList.add("talk");
    typingTimer = setInterval(function() {
      b.textContent = t.slice(0, ++i);
      if (i >= t.length) {
        clearInterval(typingTimer);
        mascot.classList.remove("talk");
      }
    }, 22);
  }

  function mood(m, ms) {
    if (m === "sur" || m === "ang") squash();
    var MOOD_EMOTES = { ang: "💢", sus: "🤨", shy: "💗", sur: "❗" };
    if (MOOD_EMOTES[m] && Date.now() - (lastEmoteAt || 0) > 1800) {
      lastEmoteAt = Date.now();
      emote(MOOD_EMOTES[m]);
    }
    mascot.dataset.m = m || "";
    clearTimeout(moodTimer);
    if (m && m !== "sleep" && ms !== 0) moodTimer = setTimeout(function() {
      if (mascot.dataset.m !== "sleep") mascot.dataset.m = "";
    }, ms || 2600);
  }

  function look(x, y) {
    if (mascot.classList.contains("noeye")) return;
    var r = eyeEl.getBoundingClientRect();
    var dx = x - r.left - r.width / 2;
    var dy = y - r.top - r.height / 2;
    var d = Math.hypot(dx, dy) || 1;
    var m = Math.min(30, d / 6 + 6);
    pupilWrap.style.transform = "translate(" + dx / d * m + "px," + dy / d * m + "px)";
  }

  function lookEl(e) {
    var r = e.getBoundingClientRect();
    look(r.left + r.width / 2, r.top + r.height / 2);
  }

  function lookUser() {
    pupilWrap.style.transform = "translate(0,0)";
    mascot.classList.add("dil");
    setTimeout(function() {
      mascot.classList.remove("dil");
    }, 1800);
  }

  function blink() {
    if (isAsleep || mascot.dataset.m === "sleep") return;
    mascot.style.setProperty("--l", "0%");
    setTimeout(function() {
      mascot.style.removeProperty("--l");
    }, 130);
  }
  (function bl() {
    blink();
    setTimeout(bl, 2e3 + Math.random() * 3e3);
  })();

  // ──────────────────────────────────────────────────────────
  // 1. Пробуждение: существо просыпается и замечает посетителя
  // ──────────────────────────────────────────────────────────
  look(innerWidth / 2, innerHeight / 2);
  setTimeout(function() {
    isAsleep = 0;
    mood("");
    look(0, innerHeight / 2);
  }, 800);
  setTimeout(function() {
    look(innerWidth, innerHeight / 2);
  }, 1500);
  setTimeout(function() {
    lookUser();
    mood("sur");
    var H0 = (/* @__PURE__ */ new Date()).getHours();
    say(H0 < 5 || H0 >= 23 ? "О. Ты чего не спишь? Я вот тоже. Нет, я спал. Было." : "О. Привет. Ты чего тут?");
  }, 2300);

  // ──────────────────────────────────────────────────────────
  // 2. Взгляд следит за мышью и пальцем
  // ──────────────────────────────────────────────────────────
  function trackPointer(e) {
    var p = e.touches ? e.touches[0] : e;
    if (p) look(p.clientX, p.clientY);
  }
  addEventListener("pointermove", trackPointer, { passive: true });
  addEventListener("pointerdown", trackPointer, { passive: true });
  addEventListener("touchmove", trackPointer, { passive: true });

  // ──────────────────────────────────────────────────────────
  // 3. Сон и пробуждение
  // ──────────────────────────────────────────────────────────
  var WAKE_LINES = ["Я НЕ СПАЛ. Я проверял веки изнутри.", "Ой. Я просто моргал. Долго.", "Ты вернулся! А я тут один, с пикселями."];
  var wakeIndex = 0;

  function registerActivity() {
    lastActivityAt = Date.now();
    if (isAsleep) {
      isAsleep = 0;
      wokeAt = Date.now();
      mood("sur");
      lookUser();
      say(WAKE_LINES[wakeIndex++ % WAKE_LINES.length]);
    }
  }
  ["pointermove", "pointerdown", "keydown", "touchstart", "scroll"].forEach(function(e) {
    addEventListener(e, function() {
      if (Date.now() - lastActivityAt > 0) registerActivity();
    }, { passive: true });
  });
  setInterval(function() {
    if (!isAsleep && !pupilEscaped && Date.now() - lastActivityAt > 1e4) {
      isAsleep = 1;
      mood("sleep");
      say("Zzz… (тут ничего не происходит, это нормально)");
    }
  }, 1e3);

  // ──────────────────────────────────────────────────────────
  // 4. Блуждающий взгляд, когда посетитель замер
  // ──────────────────────────────────────────────────────────
  setInterval(function() {
    if (isAsleep || pupilEscaped || Date.now() - lastActivityAt < 3500) return;
    var r = Math.random();
    if (r < 0.25) lookUser();
    else if (r < 0.5) {
      var L = document.querySelectorAll(".lk");
      var e = L[Math.floor(Math.random() * L.length)];
      lookEl(e);
    } else look(Math.random() * innerWidth, Math.random() * innerHeight);
  }, 2300);

  // ──────────────────────────────────────────────────────────
  // 5. Реакции на наведение на ссылки
  // ──────────────────────────────────────────────────────────
  var HOVER_LINES = { tg: ["Телеграм. Пиши. Ожидание бесплатное.", "Опять Телеграм? Он тебя тоже ждёт. Взаимно."], vpn: ["VPN? От кого прячешься: от бывшей или от налоговой?", "Рабочий. Проверено на мне, меня пока не нашли."], dc: ["Дискорд — для тех, кто любит молчать вместе.", "Ник скопируешь, а писать всё равно не будешь."], bt: ["Я бы не нажимал. Но я не на твоём месте, я в интернете.", "Это ловушка. Ты же понимаешь? Ну ладно."] };
  var HOVER_MOODS = { tg: "sur", vpn: "sus", dc: "", bt: "ang" };
  var hoverCounts = {};
  var lastHoverAt = 0;
  Object.keys(HOVER_LINES).forEach(function(k) {
    byId(k).addEventListener("pointerenter", function() {
      if (isAsleep || pupilEscaped) return;
      lookEl(byId(k));
      var n = Date.now();
      if (n - lastHoverAt < 3500) return;
      lastHoverAt = n;
      hoverCounts[k] = (hoverCounts[k] || 0) + 1;
      say(HOVER_LINES[k][(hoverCounts[k] - 1) % HOVER_LINES[k].length]);
      mood(HOVER_MOODS[k]);
      if (k === "dc") {
        pupil.classList.add("roll");
        setTimeout(function() {
          pupil.classList.remove("roll");
        }, 2300);
      }
      if (k === "bt") mascot.classList.add("pin"), setTimeout(function() {
        mascot.classList.remove("pin");
      }, 1800);
    });
  });
  var telegramClicks = 0;
  var TELEGRAM_LINES = ["Письмо улетело. Ответ — см. подвал.", "Второе письмо. Первое ещё летит.", "Ты уже трижды пытался. Он видит. Он молчит."];
  byId("tg").onclick = function() {
    flyEmoji(byId("tg").querySelector(".lg"), "✈️");
    say(TELEGRAM_LINES[Math.min(telegramClicks++, 2)]);
  };
  byId("vpn").onclick = function() {
    mascot.classList.add("cool");
    say("Режим невидимки. Меня не видно. (Тебя тоже.)");
    setTimeout(function() {
      mascot.classList.remove("cool");
    }, 3400);
  };
  byId("dc").onclick = function() {
    var n = "tw1xty";
    function ok() {
      toast("Ник скопирован ✓");
      say("Скопировал. Теперь ты мой друг. Односторонне.");
    }
    function fb() {
      var a = document.createElement("textarea");
      a.value = n;
      document.body.appendChild(a);
      a.select();
      try {
        document.execCommand("copy");
      } catch (e) {
      }
      a.remove();
      ok();
    }
    try {
      navigator.clipboard.writeText(n).then(ok, fb);
    } catch (e) {
      fb();
    }
  };

  // ──────────────────────────────────────────────────────────
  // 6. Тычок в глаз: зрачок убегает
  // ──────────────────────────────────────────────────────────
  var pokeCount = 0;
  var pokeResetTimer;
  var flyingPupil = byId("fp");
  var pupilX;
  var pupilY;
  var pupilVX;
  var pupilVY;
  var pupilReturnTimer;
  mascot.onclick = function() {
    if (isAsleep || isDragging || isTickling) return;
    if (pupilEscaped) {
      say("Нечем смотреть! Лови зрачок!");
      return;
    }
    pokeCount++;
    clearTimeout(pokeResetTimer);
    pokeResetTimer = setTimeout(function() {
      pokeCount = 0;
    }, 4500);
    blink();
    if (pokeCount === 1) {
      mood("sur");
      say("Ай!");
    } else if (pokeCount === 2) {
      mood("ang");
      say("Не тыкай в глаз. Это единственный глаз.");
    } else if (pokeCount === 3) {
      mood("sad");
      say("Хватит! Я щас заплачу.");
    } else if (pokeCount === 4) {
      mood("sad", 4e3);
      say("Всё. Я обиделся.");
    } else {
      pokeCount = 0;
      popPupilOut();
    }
  };

  function pupilHomePosition() {
    var r = eyeEl.getBoundingClientRect();
    return [r.left + r.width / 2 - 28, r.top + r.height / 2 - 28];
  }

  function popPupilOut() {
    pupilEscaped = 1;
    mascot.classList.add("noeye");
    mood("sad", 0);
    var c = pupilHomePosition();
    pupilX = c[0];
    pupilY = c[1];
    pupilVX = (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 1.8);
    pupilVY = -3.5 - Math.random() * 1.5;
    flyingPupil.style.display = "block";
    say("МОЙ ЗРАЧОК!! ЛОВИ ЕГО!!");
    pupilReturnTimer = setTimeout(function() {
      returnPupil(1);
    }, 14e3);
    (function f() {
      if (!pupilEscaped) return;
      pupilX += pupilVX;
      pupilY += pupilVY;
      if (pupilX < 0 || pupilX > innerWidth - 56) {
        pupilVX = -pupilVX;
        pupilX = Math.max(0, Math.min(pupilX, innerWidth - 56));
      }
      if (pupilY < 0 || pupilY > innerHeight - 56) {
        pupilVY = -pupilVY;
        pupilY = Math.max(0, Math.min(pupilY, innerHeight - 56));
      }
      flyingPupil.style.transform = "translate(" + pupilX + "px," + pupilY + "px)";
      requestAnimationFrame(f);
    })();
  }

  function returnPupil(auto) {
    if (!pupilEscaped) return;
    pupilEscaped = 0;
    clearTimeout(pupilReturnTimer);
    var c = pupilHomePosition();
    flyingPupil.style.transition = "transform .5s ease-in";
    flyingPupil.style.transform = "translate(" + c[0] + "px," + c[1] + "px)";
    setTimeout(function() {
      flyingPupil.style.display = "none";
      flyingPupil.style.transition = "";
      mascot.classList.remove("noeye");
      mood("sur");
      lookUser();
      say(auto ? "Ладно, сам вернулся. Гордости нет." : "Спасибо. Больше так не делай. (Делай.)");
    }, 520);
  }
  flyingPupil.addEventListener("pointerdown", function(e) {
    e.stopPropagation();
    returnPupil(0);
  });

  // ──────────────────────────────────────────────────────────
  // 7. Кнопка «НЕ НАЖИМАЙ»: 5 случайных сцен
  // ──────────────────────────────────────────────────────────
  var sceneRunning = 0;
  var chaseActive = 0;
  var chaseCatches = 0;
  var chaseTimer;
  var chaseFailsafe;
  var finishChase;
  var pressCount = 0;
  var sceneQueue = [];
  var dontPressBtn = byId("bt");
  var BUTTON_LABELS = ["🚫 НЕ НАЖИМАЙ", "🙏 СЕРЬЁЗНО, НЕ НАДО", "😈 НУ ЖМИ, РАЗ ТАК", "🧨 ЭТО ТОЧНО ПОСЛЕДНИЙ РАЗ", "🤡 Я ЖЕ ПРОСИЛ"];

  function burst(x, y, L, n) {
    for (var i = 0; i < n; i++) {
      var e = document.createElement("span");
      var a = Math.random() * 6.283;
      var d = 110 + Math.random() * 230;
      e.textContent = L[i % L.length];
      e.style.cssText = "position:fixed;z-index:90;pointer-events:none;font-size:" + (18 + Math.random() * 18) + "px;left:" + x + "px;top:" + y + "px";
      document.body.appendChild(e);
      (function(e2, a2, d2) {
        e2.animate([{ transform: "translate(0,0) scale(.4)", opacity: 1 }, { transform: "translate(" + Math.cos(a2) * d2 + "px," + (Math.sin(a2) * d2 + 80) + "px) rotate(" + (Math.random() * 540 - 270) + "deg) scale(1)", opacity: 0 }], { duration: 900 + Math.random() * 700, easing: "cubic-bezier(.1,.7,.4,1)" }).onfinish = function() {
          e2.remove();
        };
      })(e, a, d);
    }
  }

  function flash() {
    var f = document.createElement("div");
    f.style.cssText = "position:fixed;inset:0;z-index:100;background:#fff;pointer-events:none";
    document.body.appendChild(f);
    f.animate([{ opacity: 0.95 }, { opacity: 0 }], { duration: 600 }).onfinish = function() {
      f.remove();
    };
  }

  function eyeCenter() {
    var r = eyeEl.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  }

  // ──────────────────────────────────────────────────────────
  // 8. Сцена 1. Самоуничтожение
  // ──────────────────────────────────────────────────────────
  function sceneSelfDestruct(done) {
    var n = 5;
    var cd = document.createElement("div");
    cd.className = "cdn";
    document.body.appendChild(cd);
    mascot.classList.add("tk", "hold");
    mood("sur", 0);
    say("Ты запустил самоуничтожение. Поздравляю.");
    var iv = setInterval(function() {
      if (n > 0) {
        cd.textContent = n;
        cd.classList.remove("pp");
        void cd.offsetWidth;
        cd.classList.add("pp");
        if (n === 4) say("Я не хочу взрываться! Я не успел ответить в телеграме!");
        if (n === 2) say("ПРОЩАЙТЕ! ПЕРЕДАЙТЕ УТКАМ, ЧТО Я ИХ ЛЮБИЛ!");
        n--;
      } else {
        clearInterval(iv);
        cd.remove();
        mascot.classList.remove("tk", "hold");
        kaboom();
      }
    }, 900);
    function kaboom() {
      flash();
      var c = eyeCenter();
      burst(c[0], c[1], ["💥", "🔥", "✨", "💨", "🧡"], 38);
      document.querySelector("main").animate([{ transform: "translate(0,0)" }, { transform: "translate(-12px,6px)" }, { transform: "translate(10px,-8px)" }, { transform: "translate(-6px,-4px)" }, { transform: "translate(0,0)" }], { duration: 380, iterations: 2 });
      mascot.classList.add("soot");
      mood("sad", 0);
      say("…");
      var sm = setInterval(function() {
        emote("💨");
      }, 350);
      setTimeout(function() {
        say("Ничего не взорвалось. Я просто нагнетал. Но напугался сам.");
      }, 1e3);
      setTimeout(function() {
        clearInterval(sm);
        mascot.classList.remove("soot");
        mood("shy", 2600);
        wave();
        setTimeout(done, 500);
      }, 3400);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 9. Сцена 2. Гравитация
  // ──────────────────────────────────────────────────────────
  function sceneGravity(done) {
    var els = [].slice.call(document.querySelectorAll(".ch,.lk,.bub,.sub,.ft,.bt"));
    say("Ой. Я случайно включил гравитацию.");
    mood("sur");
    mascot.classList.add("hold");
    emote("🌍");
    var A = els.map(function(e, i) {
      var r = e.getBoundingClientRect();
      var dy = innerHeight - r.bottom - 4 - Math.random() * 30;
      return e.animate([{ transform: "translate(0,0) rotate(0)" }, { transform: "translate(" + (Math.random() - 0.5) * 60 + "px," + dy + "px) rotate(" + (Math.random() - 0.5) * 50 + "deg)" }], { duration: 700 + i * 50 + Math.random() * 300, delay: i * 60, easing: "cubic-bezier(.5,0,1,.6)", fill: "forwards" });
    });
    setTimeout(function() {
      mascot.classList.remove("hold");
      say("Всё упало. А я нет — я левитирую. Мне можно.");
    }, 1900);
    setTimeout(function() {
      say("Ладно-ладно, поднимаю всё обратно!");
      A.forEach(function(a) {
        a.onfinish = function() {
          a.cancel();
        };
        a.reverse();
      });
    }, 3300);
    setTimeout(function() {
      mood("shy", 2200);
      done();
    }, 4900);
  }

  // ──────────────────────────────────────────────────────────
  // 10. Сцена 3. Выключили свет
  // ──────────────────────────────────────────────────────────
  function sceneLightsOut(done) {
    var d = byId("dk");
    document.body.classList.add("dark");
    mascot.classList.add("pin");
    mood("sad", 0);
    say("Ой, свет выключили. Я боюсь темноты. Не уходи.");
    var c = eyeCenter();
    d.style.setProperty("--mx", c[0] + "px");
    d.style.setProperty("--my", c[1] + "px");
    function mv(e) {
      var p = e.touches ? e.touches[0] : e;
      if (p) {
        d.style.setProperty("--mx", p.clientX + "px");
        d.style.setProperty("--my", p.clientY + "px");
      }
    }
    addEventListener("pointermove", mv);
    addEventListener("touchmove", mv);
    setTimeout(function() {
      say("Кто тут? Это ты? Посвети на меня… (води пальцем или мышью)");
    }, 2200);
    setTimeout(function() {
      say("Фух, это ты. Только не уходи.");
      mascot.classList.remove("pin");
      mood("shy", 2500);
    }, 4800);
    setTimeout(function() {
      document.body.classList.remove("dark");
      removeEventListener("pointermove", mv);
      removeEventListener("touchmove", mv);
      say("Свет вернулся. Я не боялся. Это был тактический страх.");
      mood("sur");
      setTimeout(done, 700);
    }, 7e3);
  }

  // ──────────────────────────────────────────────────────────
  // 11. Сцена 4. Дискотека
  // ──────────────────────────────────────────────────────────
  function sceneDisco(done) {
    var o = document.createElement("div");
    var b = document.createElement("div");
    var E = ["🎵", "🎶", "✨", "💃", "🕺"];
    o.className = "dsc";
    b.className = "dball";
    b.textContent = "🪩";
    document.body.appendChild(o);
    document.body.appendChild(b);
    mascot.classList.add("dn");
    mood("lol", 0);
    say("ТАНЦЫ! Это не отменяется!");
    var iv = setInterval(function() {
      emote(E[Math.floor(Math.random() * E.length)]);
    }, 380);
    setTimeout(function() {
      say("Раз-два-три, раз-два-три…");
    }, 2400);
    setTimeout(function() {
      clearInterval(iv);
      o.remove();
      b.remove();
      mascot.classList.remove("dn");
      mood("shy", 2600);
      say("Фух… Я не устал. Я… разогрелся.");
      setTimeout(done, 600);
    }, 5400);
  }

  // ──────────────────────────────────────────────────────────
  // 12. Сцена 5. Кнопка убегает
  // ──────────────────────────────────────────────────────────
  function sceneChase(done) {
    var r0 = dontPressBtn.getBoundingClientRect();
    var sc2 = 0.42;
    var tw = dontPressBtn.offsetWidth * sc2;
    var th = dontPressBtn.offsetHeight * sc2;
    dontPressBtn.style.transformOrigin = "0 0";
    dontPressBtn.style.transition = "transform .32s cubic-bezier(.3,1.4,.5,1)";
    dontPressBtn.style.zIndex = 20;
    chaseActive = 1;
    chaseCatches = 0;
    say("Кнопка убежала! ЛОВИ ЕЁ! Поймай три раза.");
    mood("sur");
    function hop2() {
      var tx2 = 8 + Math.random() * (innerWidth - tw - 16);
      var ty = 8 + Math.random() * (innerHeight - th - 16);
      dontPressBtn.style.transform = "translate(" + (tx2 - r0.left) + "px," + (ty - r0.top) + "px) scale(" + sc2 + ")";
      setTimeout(function() {
        lookEl(dontPressBtn);
      }, 200);
    }
    (function loop() {
      hop2();
      chaseTimer = setTimeout(loop, Math.max(480, 950 - chaseCatches * 190));
    })();
    finishChase = function(auto) {
      chaseActive = 0;
      clearTimeout(chaseTimer);
      clearTimeout(chaseFailsafe);
      var r = dontPressBtn.getBoundingClientRect();
      if (!auto) burst(r.left + r.width / 2, r.top + r.height / 2, ["🍪", "🍪", "✨"], 18);
      dontPressBtn.style.transform = "";
      setTimeout(function() {
        dontPressBtn.style.transformOrigin = "";
        dontPressBtn.style.transition = "";
        dontPressBtn.style.zIndex = "";
      }, 420);
      mood("shy", 2400);
      say(auto ? "Кнопка устала бегать и вернулась сама." : "Поймал(а)! Ты ловкий(ая). Держи печеньки 🍪");
      setTimeout(done, 700);
    };
    chaseFailsafe = setTimeout(function() {
      if (chaseActive) finishChase(1);
    }, 14e3);
  }
  dontPressBtn.onclick = function() {
    if (chaseActive) {
      chaseCatches++;
      if (chaseCatches < 3) {
        say(["Ай! Раз!", "Ай! Два! Не щипайся!"][chaseCatches - 1]);
        emote("💢");
        squash();
      } else finishChase(0);
      return;
    }
    if (sceneRunning || isAsleep || pupilEscaped) return;
    sceneRunning = 1;
    lastActivityAt = Date.now();
    if (!sceneQueue.length) sceneQueue = [sceneSelfDestruct, sceneGravity, sceneLightsOut, sceneDisco, sceneChase].sort(function() {
      return Math.random() - 0.5;
    });
    var f = sceneQueue.pop();
    if (f !== sceneChase) {
      dontPressBtn.classList.remove("shk");
      void dontPressBtn.offsetWidth;
      dontPressBtn.classList.add("shk");
    }
    f(function() {
      sceneRunning = 0;
      lastActivityAt = Date.now();
      pressCount++;
      dontPressBtn.textContent = BUTTON_LABELS[pressCount % BUTTON_LABELS.length];
    });
  };

  // ──────────────────────────────────────────────────────────
  // 13. Фон: звёзды и падающая звезда
  // ──────────────────────────────────────────────────────────
  var starsCanvas = byId("st");
  var starsCtx = starsCanvas.getContext("2d");
  var stars = [];
  var shootingStar = null;

  function resizeStarsCanvas() {
    starsCanvas.width = innerWidth;
    starsCanvas.height = innerHeight;
  }
  resizeStarsCanvas();
  addEventListener("resize", resizeStarsCanvas);
  for (var q = 0; q < 70; q++) stars.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: 0.4 + Math.random() * 1.3, p: Math.random() * 6.28, s: 0.01 + Math.random() * 0.03 });
  (function lp() {
    starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
    starsCtx.fillStyle = "#e6dcff";
    stars.forEach(function(d) {
      d.p += d.s;
      starsCtx.globalAlpha = 0.2 + 0.6 * Math.abs(Math.sin(d.p));
      starsCtx.beginPath();
      starsCtx.arc(d.x, d.y, d.r, 0, 6.283);
      starsCtx.fill();
    });
    if (!shootingStar && Math.random() < 6e-4) {
      shootingStar = { x: Math.random() * innerWidth * 0.7, y: Math.random() * innerHeight * 0.35, l: 0 };
      commentOnStar();
    }
    if (shootingStar) {
      shootingStar.x += 9;
      shootingStar.y += 4.5;
      shootingStar.l++;
      if (!isAsleep && !pupilEscaped) look(shootingStar.x, shootingStar.y);
      starsCtx.globalAlpha = Math.max(0, 1 - shootingStar.l / 40);
      starsCtx.strokeStyle = "#fff";
      starsCtx.lineWidth = 2;
      starsCtx.beginPath();
      starsCtx.moveTo(shootingStar.x, shootingStar.y);
      starsCtx.lineTo(shootingStar.x - 70, shootingStar.y - 35);
      starsCtx.stroke();
      if (shootingStar.l > 40) shootingStar = null;
    }
    requestAnimationFrame(lp);
  })();

  // ──────────────────────────────────────────────────────────
  // 14. Искры за курсором
  // ──────────────────────────────────────────────────────────
  var trailCanvas = byId("tr");
  var trailCtx = trailCanvas.getContext("2d");
  var trailParticles = [];
  var trailLoopActive = 0;
  var TRAIL_COLORS = ["#8b5cff", "#2ee6c8", "#ff5cc8", "#ffe14d", "#fff"];

  function resizeTrailCanvas() {
    trailCanvas.width = innerWidth;
    trailCanvas.height = innerHeight;
  }
  resizeTrailCanvas();
  addEventListener("resize", resizeTrailCanvas);

  function drawTrail() {
    trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    trailParticles = trailParticles.filter(function(p) {
      return p.l > 0;
    });
    trailParticles.forEach(function(p) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.l--;
      trailCtx.globalAlpha = p.l / 28;
      trailCtx.fillStyle = p.c;
      trailCtx.beginPath();
      trailCtx.arc(p.x, p.y, p.r * (p.l / 28), 0, 6.283);
      trailCtx.fill();
    });
    if (trailParticles.length) requestAnimationFrame(drawTrail);
    else trailLoopActive = 0;
  }
  addEventListener("pointermove", function(e) {
    for (var i = 0; i < 2; i++) trailParticles.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - 0.5) * 1.6, vy: (Math.random() - 0.5) * 1.6, r: 2 + Math.random() * 3, c: TRAIL_COLORS[Math.floor(Math.random() * 5)], l: 28 });
    if (!trailLoopActive) {
      trailLoopActive = 1;
      drawTrail();
    }
  }, { passive: true });

  // ──────────────────────────────────────────────────────────
  // 15. Эффект «сплющивания» тела
  // ──────────────────────────────────────────────────────────
  function squash() {
    var b = document.querySelector(".body");
    b.classList.remove("sq");
    void b.offsetWidth;
    b.classList.add("sq");
  }

  // ──────────────────────────────────────────────────────────
  // 16. Буквы имени
  // ──────────────────────────────────────────────────────────
  var nameLetters = document.querySelectorAll(".ch");
  var NAME_LINES = ["Не тыкай в имя, оно нежное.", "Это моя буква. Купи себе свою.", "Щекотно!"];

  function hopLetter(c) {
    c.classList.remove("hop");
    void c.offsetWidth;
    c.classList.add("hop");
  }
  nameLetters.forEach(function(c, i) {
    c.addEventListener("pointerenter", function() {
      hopLetter(c);
    });
    c.onclick = function() {
      hopLetter(c);
      say(i === 2 ? "Это единица. Не L. Все ошибаются." : NAME_LINES[Math.floor(Math.random() * NAME_LINES.length)]);
    };
  });
  setTimeout(function() {
    nameLetters.forEach(function(c, i) {
      setTimeout(function() {
        hopLetter(c);
      }, i * 90);
    });
  }, 1100);

  // ──────────────────────────────────────────────────────────
  // 17. Наклон карточек за курсором
  // ──────────────────────────────────────────────────────────
  document.querySelectorAll(".lk").forEach(function(c) {
    c.addEventListener("pointermove", function(e) {
      if (e.pointerType !== "mouse") return;
      var r = c.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      c.style.transform = "perspective(700px) rotateY(" + x * 7 + "deg) rotateX(" + -y * 7 + "deg) translateY(-3px)";
    });
    c.addEventListener("pointerleave", function() {
      c.style.transform = "";
    });
  });

  // ──────────────────────────────────────────────────────────
  // 18. Бумажный самолётик
  // ──────────────────────────────────────────────────────────
  function flyEmoji(el, em) {
    var r = el.getBoundingClientRect();
    var n = document.createElement("span");
    n.textContent = em;
    n.style.cssText = "position:fixed;z-index:80;font-size:30px;pointer-events:none;left:" + (r.left + 8) + "px;top:" + (r.top + 4) + "px";
    document.body.appendChild(n);
    n.animate([{ transform: "translate(0,0) rotate(0)", opacity: 1 }, { transform: "translate(" + innerWidth * 0.45 + "px," + (-r.top * 0.6 - 70) + "px) rotate(-22deg)", opacity: 1, offset: 0.6 }, { transform: "translate(" + innerWidth + "px," + (-r.top - 220) + "px) rotate(-35deg) scale(.4)", opacity: 0 }], { duration: 1700, easing: "ease-in" }).onfinish = function() {
      n.remove();
    };
  }

  // ──────────────────────────────────────────────────────────
  // 19. Перетаскивание существа (пружинит обратно)
  // ──────────────────────────────────────────────────────────
  var dragArmed = 0;
  var dragStartX;
  var dragStartY;
  var isDragging = 0;
  mascot.addEventListener("pointerdown", function(e) {
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragArmed = 1;
    isDragging = 0;
  });
  addEventListener("pointermove", function(e) {
    if (!dragArmed) return;
    var dx = e.clientX - dragStartX;
    var dy = e.clientY - dragStartY;
    if (!isDragging && Math.hypot(dx, dy) < 10) return;
    if (!isDragging) {
      isDragging = 1;
      mascot.classList.add("hold");
      mascot.style.transition = "none";
      mood("sur", 0);
      say("Отпусти! Меня укачивает!");
    }
    mascot.style.setProperty("--dx", dx + "px");
    mascot.style.setProperty("--dy", dy + "px");
  });

  function endDrag() {
    if (!dragArmed) return;
    dragArmed = 0;
    if (isDragging) {
      mascot.classList.remove("hold");
      mascot.style.transition = "transform .85s cubic-bezier(.2,1.9,.4,1)";
      mascot.style.setProperty("--dx", "0px");
      mascot.style.setProperty("--dy", "0px");
      mood("sur");
      say("Уииии! Ещё раз… нет. Хватит.");
      setTimeout(function() {
        mascot.style.transition = "";
        isDragging = 0;
      }, 150);
    }
  }
  addEventListener("pointerup", endDrag);
  addEventListener("pointercancel", endDrag);

  // ──────────────────────────────────────────────────────────
  // 20. Комментарии к падающей звезде
  // ──────────────────────────────────────────────────────────
  var starCommentCount = 0;
  var STAR_LINES = ["Звезда! Загадывай желание. Я загадал ответить в тг. Не сбылось.", "Опять звезда. Я загадал, чтобы они кончились.", "Ещё одна. Их тут больше, чем моих ответов."];

  function commentOnStar() {
    if (isAsleep || pupilEscaped || starCommentCount >= 3) return;
    mood("sur");
    say(STAR_LINES[starCommentCount++]);
  }

  // ──────────────────────────────────────────────────────────
  // 21. Долгое нажатие = щекотка
  // ──────────────────────────────────────────────────────────
  var holdTimer;
  var isTickling = 0;
  mascot.addEventListener("pointerdown", function() {
    clearTimeout(holdTimer);
    holdTimer = setTimeout(function() {
      if (isDragging || isAsleep || pupilEscaped) return;
      isTickling = 1;
      mascot.classList.add("tk");
      mood("lol", 0);
      say("ХА-ХА-ХА! НЕ НАДО! Я ЩЕКОТЛИВЫЙ!");
    }, 800);
  });

  function endTickle() {
    clearTimeout(holdTimer);
    if (isTickling) {
      mascot.classList.remove("tk");
      mood("sur");
      say("Фух… Это было подло.");
      setTimeout(function() {
        isTickling = 0;
      }, 250);
    }
  }
  addEventListener("pointerup", endTickle);
  addEventListener("pointercancel", endTickle);

  // ──────────────────────────────────────────────────────────
  // 22. Чихание
  // ──────────────────────────────────────────────────────────
  var lastSneezeAt = 0;

  function sneeze() {
    lastSneezeAt = Date.now();
    say("А-а-а… а-а-а…");
    mascot.classList.add("pin");
    setTimeout(function() {
      if (isAsleep) return;
      mascot.classList.remove("pin");
      say("АПЧХИ!");
      mood("sur");
      var c = pupilHomePosition();
      for (var i = 0; i < 6; i++) {
        (function() {
          var n = document.createElement("span");
          n.textContent = "💦";
          n.style.cssText = "position:fixed;z-index:80;font-size:22px;pointer-events:none;left:" + (c[0] + 20) + "px;top:" + (c[1] + 30) + "px";
          document.body.appendChild(n);
          n.animate([{ transform: "translate(0,0) scale(.6)", opacity: 1 }, { transform: "translate(" + (Math.random() * 240 - 120) + "px," + (90 + Math.random() * 140) + "px) rotate(" + (Math.random() * 120 - 60) + "deg) scale(1.1)", opacity: 0 }], { duration: 650 + Math.random() * 450, easing: "ease-out" }).onfinish = function() {
            n.remove();
          };
        })();
      }
    }, 1100);
    setTimeout(function() {
      if (!isAsleep) say("Будь здоров. Это я себе.");
    }, 2600);
  }
  setInterval(function() {
    var i = Date.now() - lastActivityAt;
    if (!isAsleep && !pupilEscaped && !dragArmed && i > 5e3 && i < 9e3 && Date.now() - lastSneezeAt > 4e4 && Math.random() < 0.2) sneeze();
  }, 1e3);

  // ──────────────────────────────────────────────────────────
  // 23. Таймер в подвале (сбрасывается при каждом заходе)
  // ──────────────────────────────────────────────────────────
  var YEAR_MS = 365.25 * 864e5;
  var replyDeadline = Date.now() + 3.9 * YEAR_MS;

  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function updateCountdown() {
    var d = Math.max(0, replyDeadline - Date.now());
    var y = Math.floor(d / YEAR_MS);
    d -= y * YEAR_MS;
    var dd = Math.floor(d / 864e5);
    d -= dd * 864e5;
    var h = Math.floor(d / 36e5);
    d -= h * 36e5;
    var m = Math.floor(d / 6e4);
    d -= m * 6e4;
    byId("cd").textContent = y + " г. " + dd + " д. " + pad2(h) + ":" + pad2(m) + ":" + pad2(Math.floor(d / 1e3));
  }
  updateCountdown();
  setInterval(updateCountdown, 1e3);
  byId("ft").onclick = function() {
    blink();
    say("Таймер сбрасывается каждый раз, когда ты заходишь. Так задумано.");
  };

  // ──────────────────────────────────────────────────────────
  // 24. Секретные слова на клавиатуре
  // ──────────────────────────────────────────────────────────
  var typedBuffer = "";
  var lastTypedWordAt = 0;
  var TYPED_WORDS = { "ответь": ["Нет.", "Шучу. Всё равно нет."], "привет": ["Привет-привет! Это максимум, что я скажу."], "hello": ["Hello. Дальше мой английский кончился."], "пока": ["Уже?! Я только разогрелся."], "tw1xty": ["Это моё имя. Не выговаривай, оно устанет."] };
  addEventListener("keydown", function(e) {
    if (!e.key || e.key.length !== 1) return;
    typedBuffer = (typedBuffer + e.key.toLowerCase()).slice(-10);
    Object.keys(TYPED_WORDS).forEach(function(w) {
      if (typedBuffer.slice(-w.length) === w) {
        typedBuffer = "";
        lastTypedWordAt = Date.now();
        squash();
        mood("sur");
        say(TYPED_WORDS[w][0]);
        if (TYPED_WORDS[w][1]) setTimeout(function() {
          say(TYPED_WORDS[w][1]);
        }, 2400);
      }
    });
  });

  // ──────────────────────────────────────────────────────────
  // 25. Мелкие реакции: уход курсора, возврат на вкладку, ресайз, правый клик
  // ──────────────────────────────────────────────────────────
  var lastExitIntentAt = 0;
  document.documentElement.addEventListener("mouseleave", function(e) {
    if (e.clientY > 0 || isAsleep || pupilEscaped || Date.now() - lastExitIntentAt < 15e3) return;
    lastExitIntentAt = Date.now();
    look(innerWidth / 2, -400);
    mood("sur");
    say("Ты куда?! Я ещё не договорил!");
  });
  document.addEventListener("visibilitychange", function() {
    if (!document.hidden && !isAsleep && !pupilEscaped) {
      squash();
      mood("sur");
      say("О, вернулся! А я не скучал. Совсем. Ни капли.");
    }
  });
  var lastWidth = innerWidth;
  var resizeTimer;
  addEventListener("resize", function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (Math.abs(innerWidth - lastWidth) > 40 && !isAsleep && !pupilEscaped) {
        mood("ang");
        say("Эй, не мни мне дом!");
      }
      lastWidth = innerWidth;
    }, 400);
  });
  addEventListener("contextmenu", function() {
    if (isAsleep || pupilEscaped) return;
    mood("sus");
    say("Правый клик? Смело. Тут нечего смотреть.");
  });

  // ──────────────────────────────────────────────────────────
  // 26. Комментарии ко времени на сайте
  // ──────────────────────────────────────────────────────────
  [[4e4, "Ты тут уже 40 секунд. Либо нравится, либо забыл(а) закрыть."], [1e5, "Ты тут живёшь? Могу сдать комнату 🏠"], [24e4, "Четыре минуты. Это уже отношения."]].forEach(function(a) {
    setTimeout(function() {
      if (!isAsleep && !pupilEscaped && !document.hidden) {
        mood("sur");
        say(a[1]);
      }
    }, a[0]);
  });

  // ──────────────────────────────────────────────────────────
  // 27. Оживление: общие помощники
  // ──────────────────────────────────────────────────────────
  var lastEmoteAt = 0;
  var wokeAt = 0;
  var lastReactionAt = 0;
  var reactionCooldowns = {};
  var reactionCounts = {};

  function isBusy() {
    return sceneRunning || isAsleep || pupilEscaped || isDragging || isTickling || Date.now() - wokeAt < 1800;
  }

  function emote(e) {
    var r = mascot.getBoundingClientRect();
    var n = document.createElement("span");
    n.textContent = e;
    n.style.cssText = "position:fixed;z-index:80;font-size:30px;pointer-events:none;left:" + (r.left + r.width / 2 - 14 + (Math.random() * 40 - 20)) + "px;top:" + (r.top + 4) + "px";
    document.body.appendChild(n);
    n.animate([{ transform: "translateY(0) scale(.3)", opacity: 0 }, { transform: "translateY(-30px) scale(1.15)", opacity: 1, offset: 0.3 }, { transform: "translateY(-75px) scale(1)", opacity: 0 }], { duration: 1300, easing: "ease-out" }).onfinish = function() {
      n.remove();
    };
  }

  function react(k, L, cd, m, em) {
    var n = Date.now();
    if (isBusy() || n - lastReactionAt < 1500 || n - (reactionCooldowns[k] || 0) < (cd || 8e3)) return false;
    lastReactionAt = n;
    reactionCooldowns[k] = n;
    var i = reactionCounts[k] = (reactionCounts[k] || 0) + 1;
    say(L[(i - 1) % L.length]);
    if (m) mood(m);
    if (em) emote(em);
    return true;
  }

  function wave() {
    if (isAsleep || pupilEscaped) return;
    mascot.classList.add("wv");
    setTimeout(function() {
      mascot.classList.remove("wv");
    }, 2e3);
  }

  function rollEyes(ms) {
    pupil.classList.add("roll");
    setTimeout(function() {
      pupil.classList.remove("roll");
    }, ms || 2300);
  }
  ["tg", "vpn", "dc"].forEach(function(k) {
    byId(k).addEventListener("click", wave);
  });
  setTimeout(wave, 2400);

  // ──────────────────────────────────────────────────────────
  // 28. Микро-жизнь: дрожь зрачка, уши, бормотание
  // ──────────────────────────────────────────────────────────
  setInterval(function() {
    pupil.style.translate = (Math.random() * 2 - 1) * 2 + "px " + (Math.random() * 2 - 1) * 2 + "px";
  }, 650);
  (function tw() {
    setTimeout(function() {
      if (!isAsleep && !pupilEscaped) {
        var e = document.querySelector(".ear." + (Math.random() < 0.5 ? "l" : "r"));
        var d = e.classList.contains("l") ? -1 : 1;
        e.animate([{ transform: "rotate(" + d * 18 + "deg)" }, { transform: "rotate(" + d * 40 + "deg)" }, { transform: "rotate(" + d * 12 + "deg)" }, { transform: "rotate(" + d * 18 + "deg)" }], { duration: 420 });
      }
      tw();
    }, 3500 + Math.random() * 4500);
  })();
  var MONOLOGUE_LINES = ["Так… считаю пиксели. Один, два…", "Интересно, как там утки?", "Я бы что-нибудь съел. Но у меня нет рта. Ой, есть.", "Если долго смотреть на экран, экран смотрит в ответ. Я в курсе.", "*напевает* ту-ту-ру…", "Кто-то должен тут работать. Это я. Видишь, работаю?", "Мне кажется, или ссылки сегодня особенно красивые?"];
  var lastMonologueAt = 0;
  setInterval(function() {
    var i = Date.now() - lastActivityAt;
    if (!isBusy() && i > 3500 && i < 9500 && Date.now() - lastMonologueAt > 16e3 && Math.random() < 0.08) {
      lastMonologueAt = Date.now();
      say(MONOLOGUE_LINES[Math.floor(Math.random() * MONOLOGUE_LINES.length)]);
      emote("💭");
      maybeWave();
    }
  }, 1e3);

  function maybeWave() {
    if (Math.random() < 0.4) wave();
  }

  // ──────────────────────────────────────────────────────────
  // 29. Тряска мышью → головокружение
  // ──────────────────────────────────────────────────────────
  var lastMouseX;
  var lastMouseY;
  var lastMouseT;
  var shakeScore = 0;
  var lastDizzyAt = 0;
  addEventListener("pointermove", function(e) {
    var n = performance.now();
    if (lastMouseT && n > lastMouseT) {
      if (Math.hypot(e.clientX - lastMouseX, e.clientY - lastMouseY) / (n - lastMouseT) * 1e3 > 2800) shakeScore++;
    }
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    lastMouseT = n;
    if (shakeScore >= 8) {
      shakeScore = 0;
      if (!isBusy() && Date.now() - lastDizzyAt > 9e3) {
        lastDizzyAt = Date.now();
        rollEyes(2600);
        mascot.classList.add("hold");
        setTimeout(function() {
          mascot.classList.remove("hold");
        }, 1500);
        mood("sur");
        emote("💫");
        say("Ты чего трясёшь?! Голова кружится!");
      }
    }
  }, { passive: true });
  setInterval(function() {
    shakeScore = Math.max(0, shakeScore - 3);
  }, 700);

  // ──────────────────────────────────────────────────────────
  // 30. Реакции: прокрутка, имя, таймер, выделение, копирование
  // ──────────────────────────────────────────────────────────
  addEventListener("scroll", function() {
    if (react("sc", ["Укачивает, когда ты так листаешь.", "Куда ты уезжаешь? Тут всё на месте."], 12e3, "sur", "💫")) rollEyes(1800);
  }, { passive: true });
  byId("nm").addEventListener("pointerenter", function() {
    lookEl(byId("nm"));
    react("nm", ["Это моё имя. Красивое, да?", "Опять смотришь на имя. Оно такое одно."], 15e3, "sur");
  });
  byId("ft").addEventListener("pointerenter", function() {
    lookEl(byId("ft"));
    react("ft", ["Это таймер. Не смотри на него. Он расстраивает."], 2e4, "sad", "💧");
  });
  document.addEventListener("selectionchange", function() {
    if (String(getSelection()).length > 3) react("sel", ["Выделяешь меня? Я не текст. Я существо."], 12e3, "sus");
  });
  addEventListener("copy", function() {
    react("cp", ["Скопировал? Ну-ну. Я всё видел."], 1e4, "sus", "👀");
  });

  // ──────────────────────────────────────────────────────────
  // 31. Клик по пустому месту
  // ──────────────────────────────────────────────────────────
  var emptyClicks = 0;
  var lastEmptyClickAt = 0;
  var EMPTY_CLICK_LINES = ["Ты куда тыкаешь? Там ничего нет.", "Там пусто. Я проверял.", "Кликай по мне, я интереснее.", "Опять мимо. Прицел сбит?"];
  addEventListener("pointerdown", function(e) {
    var t = e.target;
    if (t.closest && t.closest(".lk,.bt,#ms,#fp,#ft,.ch,.toast")) return;
    var n = Date.now();
    if (isBusy() || n - lastEmptyClickAt < 1300) return;
    lastEmptyClickAt = n;
    emptyClicks++;
    emote("❓");
    if (emptyClicks % 5 === 0) say("Ладно, там реально ничего нет. Сдаюсь.");
    else say(EMPTY_CLICK_LINES[(emptyClicks - 1) % EMPTY_CLICK_LINES.length]);
  });

  // ──────────────────────────────────────────────────────────
  // 32. Двойной клик: кувырок
  // ──────────────────────────────────────────────────────────
  mascot.addEventListener("dblclick", function() {
    if (isAsleep || pupilEscaped) return;
    mascot.querySelector(".fl").animate([{ transform: "translateY(0) rotate(0)" }, { transform: "translateY(-70px) rotate(180deg)", offset: 0.5 }, { transform: "translateY(0) rotate(360deg)" }], { duration: 760, easing: "cubic-bezier(.3,1.2,.6,1)" });
    emote("🌀");
    say("Кувырок! Я вообще-то не для этого создан.");
  });

  // ──────────────────────────────────────────────────────────
  // 33. Поглаживание → смущение
  // ──────────────────────────────────────────────────────────
  var shyTimer;
  mascot.addEventListener("pointerenter", function(e) {
    if (e.pointerType !== "mouse") return;
    clearTimeout(shyTimer);
    shyTimer = setTimeout(function() {
      if (!isBusy()) {
        look(0, -400);
        mood("shy", 3500);
        say("Эм… приятно. Не останавливайся. Нет, остановись.");
      }
    }, 1600);
  });
  mascot.addEventListener("pointerleave", function() {
    clearTimeout(shyTimer);
  });

  // ──────────────────────────────────────────────────────────
  // 34. Подталкивание, если долго висеть над ссылкой
  // ──────────────────────────────────────────────────────────
  var NUDGE_LINES = { tg: "Ну нажимай уже. Я тут не вечный.", vpn: "Ты там выбираешь или завис?", dc: "Нажми, он сам себя не скопирует." };
  var nudgeTimer;
  Object.keys(NUDGE_LINES).forEach(function(k) {
    byId(k).addEventListener("pointerenter", function() {
      clearTimeout(nudgeTimer);
      nudgeTimer = setTimeout(function() {
        react("ng" + k, [NUDGE_LINES[k]], 25e3, "sus", "⏳");
      }, 4200);
    });
    byId(k).addEventListener("pointerleave", function() {
      clearTimeout(nudgeTimer);
    });
  });

  // ──────────────────────────────────────────────────────────
  // 35. Клавиатура, сеть, поворот экрана
  // ──────────────────────────────────────────────────────────
  var firstKeyHandled = 0;
  addEventListener("keydown", function(e) {
    if (e.key === "Escape") react("esc", ["Escape не работает. Выйти можно только закрыв вкладку. Ты же не посмеешь."], 2e4, "sus");
    else if (!firstKeyHandled && e.key.length === 1) {
      firstKeyHandled = 1;
      setTimeout(function() {
        if (Date.now() - lastTypedWordAt < 3000) return; // не перебивать реакцию на секретное слово
        react("key", ["Ты печатаешь?! Мне? Я весь внимание."], 1e9, "sur");
      }, 700);
    }
  });
  addEventListener("offline", function() {
    mood("sad", 0);
    emote("😱");
    say("Интернет пропал! Я один во тьме!!");
  });
  addEventListener("online", function() {
    mood("sur");
    say("Интернет вернулся. Я не боялся. Совсем.");
  });
  addEventListener("orientationchange", function() {
    rollEyes(2e3);
    react("or", ["Меня повернули! Голова кружится."], 5e3, "sur", "🌀");
  });

  // ──────────────────────────────────────────────────────────
  // 36. Заголовок вкладки: «навязчивый бывший»
  // ──────────────────────────────────────────────────────────
  var TAB_TITLES = ["Ты куда? 🥺", "Я уже поставил чайник…", "Ладно. Иди. Я не обижаюсь. (обижаюсь)", "Вернись, мне скучно 👁️"];
  var tabTitleIndex = 0;
  var tabTitleTimer;
  var originalTitle = document.title;
  document.addEventListener("visibilitychange", function() {
    clearInterval(tabTitleTimer);
    if (document.hidden) {
      document.title = TAB_TITLES[tabTitleIndex++ % TAB_TITLES.length];
      tabTitleTimer = setInterval(function() {
        document.title = TAB_TITLES[tabTitleIndex++ % TAB_TITLES.length];
      }, 2500);
    } else document.title = originalTitle;
  });
})();
