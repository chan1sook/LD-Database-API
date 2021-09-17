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
              loginFrom: "browser",
              macAddress: "",
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
