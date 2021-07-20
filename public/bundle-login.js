(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
require("./vue-extends");

document.addEventListener("DOMContentLoaded", () => {
  const app = new Vue({
    el: "#app",
    data() {
      return {
        loading: false,
        username: "",
        password: "",
        showPassword: false,
      };
    },
    computed: {
      isValid() {
        return this.isUsernameValid && this.isPasswordValid;
      },
      isUsernameValid() {
        return this.username !== "";
      },
      isPasswordValid() {
        return this.password !== "";
      },
    },
    methods: {
      async login() {
        if (!this.isValid || this.loading) {
          return;
        }

        try {
          this.loading = true;
          const response = await fetch("/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              username: this.username,
              password: this.password,
            }),
          });
          if (response.status === 200) {
            window.location.href = "/report";
          } else {
            this.$refs.errorToast.toast.show();
          }
        } catch (error) {
          console.error(error);
          this.$refs.errorToast.toast.show();
        } finally {
          this.loading = false;
        }
      },
    },
  });
});

},{"./vue-extends":2}],2:[function(require,module,exports){
function _tooltipParams(binding) {
  let trigger = "hover";
  if (
    binding.modifiers.focus ||
    binding.modifiers.hover ||
    binding.modifiers.click
  ) {
    const t = [];
    if (binding.modifiers.focus) t.push("focus");
    if (binding.modifiers.hover) t.push("hover");
    if (binding.modifiers.click) t.push("click");
    trigger = t.join(" ");
  }
  return {
    title: binding.value || "",
    placement: binding.arg || "top",
    trigger,
    html: !!binding.modifiers.html,
  };
}

Vue.directive("tooltip", {
  bind(el, binding) {
    bootstrap.Tooltip.getOrCreateInstance(el, _tooltipParams(binding));
  },
  update(el, binding) {
    bootstrap.Tooltip.getOrCreateInstance(el, _tooltipParams(binding));
  },
  unbind(el, binding) {
    bootstrap.Tooltip.getOrCreateInstance(el).dispose();
  },
});

Vue.component("b-toast", {
  props: {
    title: {
      type: String,
      default: "LD Admin",
    },
  },
  data() {
    return {
      toast: null,
    };
  },
  mounted() {
    this.toast = new bootstrap.Toast(this.$refs.toast);
  },
  beforeDestroy() {
    this.toast.dispose();
  },
  template: `
    <div ref="toast" class="toast hide mb-2" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <strong class="me-auto">{{ title }}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body"><slot></slot></div>
    </div>
  `,
});

Vue.component("b-pagebar", {
  props: {
    value: {
      type: Number,
      default: 1,
    },
    totalPage: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {};
  },
  template: `
    <nav aria-label="หน้า">
      <ul class="pagination justify-content-center">
        <li class="page-item" v-tooltip="'หน้าแรก'" :class="{disabled: value <= 1 }">
          <a class="page-link" href="#" @click.prevent="setPage(1)">
            <i class="fas fa-angle-double-left"></i>
          </a>
        </li>
        <li class="page-item" v-tooltip="'หน้าที่แล้ว'" :class="{disabled: value <= 1 }">
          <a class="page-link" href="#" @click.prevent="setPage(value - 1)">
            <i class="fas fa-angle-left"></i>
          </a>
        </li>
        <li class="page-item" v-if="value > 2">
          <a class="page-link" href="#" @click.prevent="setPage(1)">1</a>
        </li>
        <li class="page-item disabled" v-if="value > 4">
          <a class="page-link" href="#" @click.prevent>...</a>
        </li>
        <li class="page-item" v-else-if="value > 3">
          <a class="page-link" href="#" @click.prevent="setPage(2)">2</a>
        </li>
        <li v-if="value > 1" class="page-item">
          <a class="page-link" href="#" @click.prevent="setPage(value - 1)">
            {{ value - 1 }}
          </a>
        </li>
        <li class="page-item">
          <a class="fw-bold page-link" href="#" @click.prevent="promptPage">
            {{ value }}
          </a>
        </li>
        <li v-if="value < totalPage" class="page-item">
          <a class="page-link" href="#" @click.prevent="setPage(value + 1)">
            {{ value + 1 }}
          </a>
        </li>
        <li class="page-item disabled" v-if="value < totalPage - 3">
          <a class="page-link" href="#" @click.prevent>...</a>
        </li>
        <li class="page-item" v-else-if="value < totalPage - 2">
          <a class="page-link" href="#" @click.prevent="setPage(totalPage - 1)">
            {{ totalPage - 1 }}
          </a>
        </li>
        <li class="page-item" v-if="value < totalPage - 1">
          <a class="page-link" href="#" @click.prevent="setPage(totalPage)">
            {{ totalPage }}
          </a>
        </li>
        <li class="page-item" v-tooltip="'หน้าถัดไป'" :class="{disabled:value >= totalPage}">
          <a class="page-link" href="#" @click.prevent="setPage(value + 1)">
            <i class="fas fa-angle-right"></i>
          </a>
        </li>
        <li class="page-item" v-tooltip="'หน้าสุดท้าย'" :class="{disabled:value >= totalPage}" >
          <a class="page-link" href="#" @click.prevent="setPage(totalPage)">
            <i class="fas fa-angle-double-right"></i>
          </a>
        </li>
      </ul>
    </nav>
  `,
  methods: {
    setPage(p) {
      if (p < 1 || p > this.totalPage) {
        return;
      }

      this.$emit("input", p);
    },
    promptPage() {
      const r = prompt("ระบุหน้า");
      if (typeof r === "string") {
        const pageNum = Number(r);
        if (
          isNaN(pageNum) ||
          !isFinite(pageNum) ||
          !Number.isInteger(pageNum) ||
          pageNum < 1 ||
          pageNum > this.totalPage
        ) {
          return;
        }
        this.setPage(pageNum);
      }
    },
  },
});

},{}]},{},[1]);
