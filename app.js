const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const loginDialog = document.querySelector("#login-dialog");
const loginTriggers = document.querySelectorAll(".login-trigger");
const dialogClose = document.querySelector(".dialog-close");
const loginForm = document.querySelector("#login-form");
const loginStatus = document.querySelector("#login-status");
const passwordToggle = document.querySelector(".password-toggle");
const passwordInput = document.querySelector("#login-password");
const recoveryLink = document.querySelector(".recovery-link");
const requestAccess = document.querySelector("#request-access");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const startedAt = Date.now();

document.querySelector("#year").textContent = String(new Date().getFullYear());

menuToggle?.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  mainNav.classList.toggle("is-open", !expanded);
  menuToggle.querySelector(".sr-only").textContent = expanded ? "Abrir menú" : "Cerrar menú";
});

mainNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    mainNav.classList.remove("is-open");
  });
});

const openLogin = () => {
  loginStatus.textContent = "";
  loginDialog.showModal();
  body.classList.add("dialog-open");
  requestAnimationFrame(() => document.querySelector("#login-email")?.focus());
};

const closeLogin = () => {
  loginDialog.close();
  body.classList.remove("dialog-open");
};

loginTriggers.forEach((trigger) => trigger.addEventListener("click", openLogin));
dialogClose?.addEventListener("click", closeLogin);

loginDialog?.addEventListener("click", (event) => {
  if (event.target === loginDialog) closeLogin();
});

loginDialog?.addEventListener("close", () => body.classList.remove("dialog-open"));

passwordToggle?.addEventListener("click", () => {
  const hidden = passwordInput.type === "password";
  passwordInput.type = hidden ? "text" : "password";
  passwordToggle.textContent = hidden ? "Ocultar" : "Mostrar";
  passwordToggle.setAttribute("aria-label", hidden ? "Ocultar contraseña" : "Mostrar contraseña");
});

loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!loginForm.reportValidity()) return;

  passwordInput.value = "";
  loginStatus.textContent =
    "El acceso todavía no está habilitado. Esta pantalla muestra cómo funcionará el área de clientes.";
});

recoveryLink?.addEventListener("click", () => {
  loginStatus.textContent =
    "La recuperación se habilitará junto con el área privada. Podés solicitar acceso al equipo comercial.";
});

requestAccess?.addEventListener("click", () => {
  closeLogin();
  document.querySelector("#reason").value = "Solicitud de acceso";
  document.querySelector("#contacto").scrollIntoView({ behavior: "smooth" });
  window.setTimeout(() => document.querySelector("#name")?.focus(), 450);
});

const fields = {
  name: document.querySelector("#name"),
  email: document.querySelector("#email"),
  reason: document.querySelector("#reason"),
  message: document.querySelector("#message"),
};

const messages = {
  name: "Ingresá tu nombre y apellido.",
  email: "Ingresá un email válido.",
  reason: "Seleccioná el motivo de la consulta.",
  message: "Contanos brevemente en qué podemos ayudarte.",
};

const clearErrors = () => {
  Object.entries(fields).forEach(([key, field]) => {
    field.removeAttribute("aria-invalid");
    field.removeAttribute("aria-describedby");
    document.querySelector(`#${key}-error`).textContent = "";
  });
};

const validateForm = () => {
  clearErrors();
  const invalidFields = [];

  Object.entries(fields).forEach(([key, field]) => {
    if (!field.checkValidity()) {
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", `${key}-error`);
      document.querySelector(`#${key}-error`).textContent = messages[key];
      invalidFields.push(field);
    }
  });

  invalidFields[0]?.focus();
  return invalidFields.length === 0;
};

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  formStatus.textContent = "";

  if (document.querySelector("#website").value) return;
  if (Date.now() - startedAt < 1800) {
    formStatus.textContent = "Esperá un momento antes de preparar el mensaje.";
    return;
  }
  if (!validateForm()) {
    formStatus.textContent = "Revisá los campos marcados para continuar.";
    return;
  }

  const data = new FormData(contactForm);
  const subject = `Consulta web · ${data.get("reason")}`;
  const lines = [
    `Nombre: ${data.get("name")}`,
    `Empresa: ${data.get("company") || "No indicada"}`,
    `Email: ${data.get("email")}`,
    `Teléfono: ${data.get("phone") || "No indicado"}`,
    `Provincia: ${data.get("province") || "No indicada"}`,
    `Motivo: ${data.get("reason")}`,
    "",
    String(data.get("message")),
  ];

  const mailto = `mailto:globalrepresentaciones@yahoo.com.ar?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  formStatus.textContent =
    "Abrimos tu aplicación de correo con la consulta preparada. Revisala y enviá el mensaje para completar el contacto.";
  window.location.href = mailto;
});

Object.values(fields).forEach((field) => {
  field?.addEventListener("input", () => {
    if (!field.hasAttribute("aria-invalid")) return;
    if (field.checkValidity()) {
      const key = field.id;
      field.removeAttribute("aria-invalid");
      field.removeAttribute("aria-describedby");
      document.querySelector(`#${key}-error`).textContent = "";
    }
  });
});

const revealItems = document.querySelectorAll(".reveal");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const hero = document.querySelector(".hero");
const heroMedia = document.querySelector(".hero-media");

if (hero && heroMedia && !reduceMotion) {
  let parallaxFrame = 0;

  const updateHeroParallax = () => {
    const heroTop = hero.getBoundingClientRect().top;
    const shift = Math.min(Math.max(-heroTop * 0.11, 0), 48);
    heroMedia.style.setProperty("--hero-parallax", `${shift}px`);
    parallaxFrame = 0;
  };

  window.addEventListener("scroll", () => {
    if (parallaxFrame) return;
    parallaxFrame = window.requestAnimationFrame(updateHeroParallax);
  }, { passive: true });

  updateHeroParallax();
}

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px" },
  );

  revealItems.forEach((item) => observer.observe(item));
}
