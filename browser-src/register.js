require("./vue-extends");

document.addEventListener("DOMContentLoaded", () => {
  const app = new Vue({
    el: "#app",
    data() {
      return {
        loading: false,
        firstName: "",
        lastName: "",
        gender: "male",
        role: "teacher",
        school: "",
        username: "",
        password: "",
        showPassword: false,
        confirmPassword: "",
        showConfirmPassword: false,
        usernameDuplicate: false,
      };
    },
    computed: {
      isValid() {
        return (
          this.isFirstNameValid &&
          this.isLastNameValid &&
          this.isSchoolValid &&
          this.isUsernameValid &&
          this.isPasswordValid &&
          this.isConfirmPasswordValid
        );
      },
      isFirstNameValid() {
        return this.firstName !== "";
      },
      isLastNameValid() {
        return this.lastName !== "";
      },
      isSchoolValid() {
        return this.school !== "";
      },
      isUsernameValid() {
        return this.username !== "";
      },
      isPasswordValid() {
        return this.password.length >= 8;
      },
      isConfirmPasswordValid() {
        return (
          this.confirmPassword !== "" && this.password === this.confirmPassword
        );
      },
    },
    methods: {
      async register() {
        if (!this.isValid || this.loading) {
          return;
        }

        this.loading = true;
        try {
          const response = await fetch("/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              firstName: this.firstName,
              lastName: this.lastName,
              gender: this.gender,
              role: this.role,
              school: this.school,
              username: this.username,
              password: this.password,
            }),
          });
          const data = await response.json();
          if (response.status === 200) {
            this.$refs.successToast.toast.show();
          } else {
            this.usernameDuplicate =
              data.response.error === "Username Duplicate";
            this.$refs.errorToast.toast.show();
          }
        } catch (error) {
          console.error(error);
        } finally {
          this.loading = false;
        }
      },
    },
  });
});
