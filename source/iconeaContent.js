function injectAddressFiller() {
  const lastnameInput = document.querySelector("[name='NOM']");
  const firstnameInput = document.querySelector("[name='PRENOM']");
  const addressLine1Input = document.querySelector("[name='ADRESSE1']");
  const addressLine2Input = document.querySelector("[name='ADRESSE2']");
  const zipCodeInput = document.querySelector("[name='CP']");
  const cityInput = document.querySelector("[name='VILLE']");
  const phoneInput = document.querySelector("[name='TEL']");
  const emailInput = document.querySelector("[name='EMAIL']");

  const d = document.querySelector(
    "#zone_contenu_maxilarge2 > form > table:nth-child(3) > tbody > tr"
  );

  console.log("d", d);

  d.insertAdjacentHTML(
    "afterend",
    '<tr><td colspan="2"><textarea id="addressFiller" style="width: 610px;  height: 200px;" placeholder="Copiez/collez l\'adresse de la facture telle quelle."></textarea></td></tr>'
  );

  const addressFillerTextareaEl = document.querySelector("#addressFiller");

  addressFillerTextareaEl.addEventListener(
    "input",
    function () {
      if (addressFillerTextareaEl.value === "") {
        lastnameInput.value = "";
        firstnameInput.value = "";
        emailInput.value = "";
        addressLine1Input.value = "";
        addressLine2Input.value = "";
        zipCodeInput.value = "";
        cityInput.value = "";
        phoneInput.value = "";
        emailInput.value = "";

        return;
      }

      const lines = addressFillerTextareaEl.value.split("\n");

      const [firstname, lastname] = lines[0].split(" ");

      if (lastname) {
        lastnameInput.value = lastname;
      }

      firstnameInput.value = firstname;

      if (lines[1]) {
        addressLine1Input.value = lines[1];
      }

      if (lines[2] && !lines[2].match(/^(\d{5}) (.+)/)) {
        addressLine2Input.value = lines[2];
      }

      lines.forEach((l) => {
        const matchedEmail = l.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
        const matchedZipCity = l.match(/^(\d{5}) (.+)/);
        const matchedPhone = l.match(/^((\+)33|0|0033)[1-9](\d{2}){4}$/g);

        if (matchedEmail) {
          emailInput.value = matchedEmail[0];
        }

        if (matchedZipCity) {
          zipCodeInput.value = matchedZipCity[1];
          cityInput.value = matchedZipCity[2];
        }

        if (matchedPhone) {
          phoneInput.value = matchedPhone[0];
        }
      });
    },
    false
  );
}

let previousUrl = "";
const observer = new MutationObserver(function (mutations) {
  console.log(mutations, location.href, previousUrl);
  if (location.href !== previousUrl) {
    previousUrl = location.href;
    console.log(`URL changed to ${location.href}`);

    if (location.href.match(/\/compte\/tirages.php\?section=valider/)) {
      injectAddressFiller();
    }
  }
});

observer.observe(window.document, {
  subtree: true,
  childList: true,
});
