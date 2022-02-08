const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const Validator = function (formSelector) {
  formElement = $(formSelector);
  let formRules = {};
  function getErrorMessageElement(input) {
    return input.closest(".form-group").querySelector(".form-message");
  }
  function getFormGroupNode(input) {
    return input.closest(".form-group");
  }
  const validatorRules = {
    required(value) {
      return value.trim() ? undefined : "Vui lòng nhập trường này";
    },
    email(value) {
      const regexEmail =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regexEmail.test(value.trim())
        ? undefined
        : "Vui lòng nhập Email chính xác!";
    },
    min(min) {
      return (value) => {
        return value.length >= min
          ? undefined
          : `Vui lòng nhập tối thiểu ${min} kí tự`;
      };
    },
    max(max) {
      return (value) => {
        return value.length <= max
          ? undefined
          : `Vui lòng nhập tối đa ${max} kí tự`;
      };
    },
    confirmed(confirmSelector) {
      return (value) => {
        return value === $(confirmSelector).value
          ? undefined
          : "Giá trị không trùng khớp";
      };
    },
  };
  if (formElement) {
    // get all enable inputs
    const enableInputs = formElement.querySelectorAll("input[rules][name]");
    // lặp qua các input
    for (let input of enableInputs) {
      let rules = input.getAttribute("rules").split("|");

      for (let rule of rules) {
        let ruleFunc = validatorRules[rule];
        if (rule.includes(":")) {
          const ruleInfo = rule.split(":");
          rule = ruleInfo[0];
          ruleFunc = validatorRules[rule](ruleInfo[1]);
        }
        if (Array.isArray(formRules[input.name])) {
          formRules[input.name].push(ruleFunc);
        } else {
          formRules[input.name] = [ruleFunc];
        }
      }
      // lắng nghe, xử lý sự kiện ( onblur, oninput...)
      input.onblur = handleValidate;
      input.oninput = handleClearError;
    }
    formElement.onsubmit = (e) => {
      e.preventDefault();
      let isInValid = false;
      for (let input of enableInputs) {
        if (handleValidate({ target: input })) {
          isInValid = true;
        }
      }

      if (!isInValid) {
        if (typeof this.onSubmit === "function") {
          let formValues = {};
          Array.from(enableInputs).forEach((enableInput) => {
            switch (enableInput.type) {
              case "radio":
                formValues[enableInput.name] = formElement.querySelector(
                  'input[name="' + enableInput.name + '"]:checked',
                ).value;

                break;
              case "checkbox":
                if (!formValues.matches(":checked")) {
                  formValues[enableInput.name] = "";
                  break;
                }
                if (!Array.isArray(formValues[formValues.name])) {
                  values[formValues.name] = [];
                }
                values[enableInput.name].push(enableInput.value);
                break;
              case "file":
                formValues[enableInput.name] = enableInput.files;
                break;
              default:
                formValues[enableInput.name] = enableInput.value;
            }
          });
          this.onSubmit(formValues);
        } else {
          formElement.submit();
        }
      }
    };
  }
  function handleValidate(e) {
    const rules = formRules[e.target.name];
    const errorMessageNode = getErrorMessageElement(e.target);
    const formGroupNode = getFormGroupNode(e.target);
    let errorMessage = "";

    rules.some((rule) => {
      switch (e.target.type) {
        case "radio":
        case "checkbox":
          if ($('input[name="' + e.target.name + '"]:checked')?.value) {
            return (errorMessage = rule("checked"));
          }
          return (errorMessage = rule(""));
        default:
          return (errorMessage = rule(e.target.value));
      }
    });
    if (formGroupNode && errorMessageNode) {
      if (errorMessage) {
        formGroupNode.classList.add("invalid");
        errorMessageNode.innerText = errorMessage;
      } else {
        formGroupNode.classList.remove("invalid");
        errorMessageNode.innerText = "";
      }
    }
    return !!errorMessage;
  }
  function handleClearError(e) {
    const errorMessageNode = getErrorMessageElement(e.target);
    const formGroupNode = getFormGroupNode(e.target);
    if (formGroupNode) {
      if (formGroupNode.classList.contains("invalid")) {
        formGroupNode.classList.remove("invalid");
      }
      if (errorMessageNode) {
        errorMessageNode.innerText = "";
      }
    }
  }
};
