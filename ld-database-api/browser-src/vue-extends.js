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
        <li class="page-item" v-if="value > 4">
          <a class="page-link" href="#" @click.prevent="promptPage">...</a>
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
          <a class="fw-bold page-link" href="#" @click.prevent>
            {{ value }}
          </a>
        </li>
        <li v-if="value < totalPage" class="page-item">
          <a class="page-link" href="#" @click.prevent="setPage(value + 1)">
            {{ value + 1 }}
          </a>
        </li>
        <li class="page-item" v-if="value < totalPage - 3">
          <a class="page-link" href="#" @click.prevent="promptPage">...</a>
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
